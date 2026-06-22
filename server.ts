/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { CANDIDATES_DB, candidate_to_text } from "./src/db/candidates.js";
import { 
  Candidate, 
  ParsedJobDescription, 
  ScoreBreakdown, 
  CandidateExplanation, 
  RankedCandidate,
  CopilotFilter
} from "./src/types.js";

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// --- LAZY-INITIALIZED GEMINI CLIENT ---
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("⚠️ GEMINI_API_KEY environment variable is missing or placeholder. Falling back to fuzzy-matching simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// --- EMBEDDING CACHE ---
const EMBEDDING_CACHE = new Map<string, number[]>();

/**
 * Computes dot product of two vectors
 */
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Computes magnitude of a vector
 */
function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Computes cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

/**
 * Pre-computes or retrieves embedding from cache using 'gemini-embedding-2-preview'
 */
async function getEmbedding(text: string): Promise<number[] | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  if (EMBEDDING_CACHE.has(text)) {
    return EMBEDDING_CACHE.get(text) || null;
  }

  try {
    const response = (await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: text,
    })) as any;
    const embedding = response.embedding?.values || response.embeddings?.values;
    if (embedding) {
      EMBEDDING_CACHE.set(text, embedding);
      return embedding;
    }
  } catch (error) {
    console.error("Embedding generation error:", error);
  }
  return null;
}

/**
 * Simple Token Jaccard overlap similarity used as robust fallback
 */
function JaccardSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(textA.toLowerCase().split(/[\s,.\-()]+/));
  const tokensB = new Set(textB.toLowerCase().split(/[\s,.\-()]+/));
  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// --- MODULE 4: HYBRID CO-SCORING ENGINE ---

function calculateSkillScore(candidate: Candidate, jd: ParsedJobDescription): number {
  const reqSkills = jd.required_skills || [];
  const prefSkills = jd.preferred_skills || [];
  
  if (reqSkills.length === 0) {
    return 75; // Baseline if no required skills listed in JD
  }

  let matchedSum = 0;
  let matchesCount = 0;

  const proficiencyMap: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  };

  reqSkills.forEach(req => {
    const candSkill = candidate.skills.find(s => s.name.toLowerCase() === req.toLowerCase());
    if (candSkill) {
      const proficiencyVal = proficiencyMap[candSkill.proficiency] || 50;
      // Add slight endorsement/duration scaling
      const endorsementBonus = Math.min(1.15, 1 + (candSkill.endorsements / 200));
      const durationBonus = Math.min(1.1, 1 + (candSkill.duration_months / 120));
      matchedSum += Math.min(100, proficiencyVal * endorsementBonus * durationBonus);
      matchesCount++;
    }
  });

  const baseRequiredScore = matchesCount > 0 ? (matchedSum / reqSkills.length) : 0;

  // Preferred skills bonus (up to +15% total)
  let prefBonus = 0;
  prefSkills.forEach(pref => {
    const hasPref = candidate.skills.some(s => s.name.toLowerCase() === pref.toLowerCase());
    if (hasPref) {
      prefBonus += 5;
    }
  });

  return Math.min(100, baseRequiredScore + prefBonus);
}

function calculateExperienceScore(candidate: Candidate, jd: ParsedJobDescription): number {
  const candidateYears = candidate.profile.years_of_experience;
  
  // Extract target years from requirement string (e.g. "5+ years", "3 years")
  let targetYears = 0;
  const match = jd.experience_required?.match(/(\d+)/);
  if (match) {
    targetYears = parseInt(match[1], 10);
  }

  let expMatchScore = 100;
  if (targetYears > 0) {
    if (candidateYears >= targetYears) {
      // Small bonus for exceeding experience safely up to 100
      expMatchScore = Math.min(100, 85 + ((candidateYears - targetYears) * 3));
    } else {
      expMatchScore = (candidateYears / targetYears) * 85; 
    }
  } else {
    // If unspecified, scale based on overall experience depth
    expMatchScore = Math.min(100, 50 + (candidateYears * 5));
  }

  // Career and industry relevance checks
  let relevanceBonus = 0;
  
  // Industry relevance
  if (jd.industry && candidate.profile.current_industry?.toLowerCase() === jd.industry.toLowerCase()) {
    relevanceBonus += 10;
  }

  // Role title similarity
  const titleWords = jd.role?.toLowerCase().split(/\s+/) || [];
  const candTitle = candidate.profile.current_title?.toLowerCase() || "";
  let titleMatch = false;
  titleWords.forEach(word => {
    if (word.length > 3 && candTitle.includes(word)) {
      titleMatch = true;
    }
  });

  if (titleMatch) relevanceBonus += 15;

  return Math.max(0, Math.min(100, expMatchScore + relevanceBonus));
}

function calculateQualityScore(candidate: Candidate): number {
  const sigs = candidate.redrob_signals;
  
  // GitHub activity score (default to 65 if not linked or -1)
  const gh = sigs.github_activity_score === -1 ? 65 : sigs.github_activity_score;
  
  // Assessment scores average
  const assessments = Object.values(sigs.skill_assessment_scores);
  const avgAssessment = assessments.length > 0 
    ? assessments.reduce((a, b) => a + b, 0) / assessments.length
    : 75;

  // Recruiter saves normalized (max 25 saves implies 100%)
  const savesScore = Math.min(100, (sigs.saved_by_recruiters_30d || 0) * 4);

  // Interview completion rate (fraction to 100 index)
  const ivRateType = (sigs.interview_completion_rate || 0) * 100;

  // Offer acceptance rate
  const offerRate = sigs.offer_acceptance_rate === -1 
    ? 80 
    : (sigs.offer_acceptance_rate * 100);

  // Weighted formulation: GitHub 20%, Assessments 35%, Saves 15%, Intv 15%, Offer 15%
  const quality = (0.20 * gh) + (0.35 * avgAssessment) + (0.15 * savesScore) + (0.15 * ivRateType) + (0.15 * offerRate);

  return Math.max(0, Math.min(100, quality));
}

function calculateAvailabilityScore(candidate: Candidate): number {
  const sigs = candidate.redrob_signals;

  // Open to Work
  const openScore = sigs.open_to_work_flag ? 100 : 50;

  // Notice Period (lower days is optimal)
  let noticeScore = 40;
  if (sigs.notice_period_days === 0) noticeScore = 100;
  else if (sigs.notice_period_days <= 15) noticeScore = 90;
  else if (sigs.notice_period_days <= 30) noticeScore = 80;
  else if (sigs.notice_period_days <= 60) noticeScore = 60;

  // Recruiter response rate representation
  const respRate = (sigs.recruiter_response_rate || 0) * 100;

  // Avg response hours (lower is optimal)
  let timeScore = 40;
  if (sigs.avg_response_time_hours <= 1) timeScore = 100;
  else if (sigs.avg_response_time_hours <= 4) timeScore = 90;
  else if (sigs.avg_response_time_hours <= 12) timeScore = 80;
  else if (sigs.avg_response_time_hours <= 24) timeScore = 60;

  // Weight formulation: Open 30%, Notice 30%, Response Rate 20%, Response Time 20%
  const avail = (0.30 * openScore) + (0.30 * noticeScore) + (0.20 * respRate) + (0.20 * timeScore);

  return Math.max(0, Math.min(100, avail));
}

// --- API IMPLEMENTATION ENDPOINTS ---

/**
 * POST /api/parse-jd
 * Parses job description text using Gemini 3.5 Flash inside config structured JSON
 */
app.post("/api/parse-jd", async (req, res) => {
  const { jdText } = req.body;
  if (!jdText || jdText.trim() === "") {
    return res.status(400).json({ error: "Job description text is empty." });
  }

  const ai = getGeminiClient();
  
  if (!ai) {
    // Elegant simulation parsing logic if API key is not bound
    console.log("Simulating JD parsing because Gemini client is not configured.");
    const simulatedResponse: ParsedJobDescription = {
      role: jdText.match(/(architect|engineer|developer|manager|specialist|designer)/i) 
          ? (jdText.match(/\b([A-Za-z\s]+(engineer|developer|architect|manager))\b/i)?.[1] || "Software Architect")
          : "AI Software Engineer",
      required_skills: ["Python", "React", "RAG", "TypeScript"].filter(s => jdText.toLowerCase().includes(s.toLowerCase())),
      preferred_skills: ["Qdrant", "PostgreSQL", "Docker", "Go", "AWS"].filter(s => jdText.toLowerCase().includes(s.toLowerCase())),
      experience_required: jdText.match(/(\d+\+?\s*(years|yr))/i)?.[0] || "3+ years",
      industry: jdText.match(/(financial|health|finance|cloud|internet|security|tech)/i)?.[0] || "Information Technology",
      education_requirements: ["Bachelor", "Master", "B.Tech", "Computer Science"].filter(s => jdText.toLowerCase().includes(s.toLowerCase())),
      work_mode: jdText.toLowerCase().includes("remote") ? "remote" : jdText.toLowerCase().includes("hybrid") ? "hybrid" : "onsite",
      salary_range: jdText.match(/(\d+\s*-\s*\d+)\s*(LPA|k)/i)?.[0] || "15 - 25 LPA"
    };
    if (simulatedResponse.required_skills.length === 0) {
      simulatedResponse.required_skills = ["Python", "RAG", "LangChain"];
    }
    return res.json(simulatedResponse);
  }

  try {
    const prompt = `You are an expert recruitment ATS requirement extractor. Parse this job description and return a perfectly formatted JSON schema.
JD TEXT:
"${jdText}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["role", "required_skills", "preferred_skills", "experience_required", "industry", "education_requirements", "work_mode", "salary_range"],
          properties: {
            role: { type: Type.STRING, description: "Professional job title extracted" },
            required_skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of essential skills requested explicitly" 
            },
            preferred_skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of secondary, bonus or optional technologies mentioned" 
            },
            experience_required: { type: Type.STRING, description: "Experience string requested" },
            industry: { type: Type.STRING, description: "Core domain or market vertical" },
            education_requirements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Degrees or disciplines specified" 
            },
            work_mode: { 
              type: Type.STRING, 
              enum: ["remote", "hybrid", "onsite", "flexible", "any"],
              description: "Extracted default workplace setup" 
            },
            salary_range: { type: Type.STRING, description: "Indicated compensation brackets" }
          }
        },
        temperature: 0.1
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json(parsedJson);
  } catch (error) {
    console.error("Gemini JD parsing API call failed, falling back gracefully:", error);
    return res.status(500).json({ error: "Parser breakdown. Check Gemini integration settings." });
  }
});

/**
 * POST /api/rank-candidates
 * Performs hybrid calculations on candidates list based on job requirements, computes actual vector alignments when possible
 */
app.post("/api/rank-candidates", async (req, res) => {
  const { jdText, parsedJd } = req.body;
  if (!parsedJd) {
    return res.status(400).json({ error: "Parsed job details is missing." });
  }

  const jdInput: ParsedJobDescription = parsedJd;
  let jdEmbedding: number[] | null = null;

  // Generate embedding for raw Job Description or structured role if we have Gemini configured
  const ai = getGeminiClient();
  if (ai) {
    const embedText = jdText || `Role: ${jdInput.role}. Industry: ${jdInput.industry}. Experience: ${jdInput.experience_required}. Required skills: ${jdInput.required_skills.join(", ")}.`;
    jdEmbedding = await getEmbedding(embedText);
  }

  const rankedCandidatesList: RankedCandidate[] = [];

  for (const candidate of CANDIDATES_DB) {
    const skillScore = calculateSkillScore(candidate, jdInput);
    const expScore = calculateExperienceScore(candidate, jdInput);
    const qualScore = calculateQualityScore(candidate);
    const availScore = calculateAvailabilityScore(candidate);

    // Compute semantic match score using true cosine similarity of candidate texts, falling back to clean Jaccard index
    let semanticScore = 50;
    if (jdEmbedding) {
      const candText = candidate_to_text(candidate);
      const candEmbedding = await getEmbedding(candText);
      if (candEmbedding) {
        const sim = cosineSimilarity(jdEmbedding, candEmbedding);
        // Normalize cosine score typically ranging 0.4 - 0.9 into 0 to 100 range elegantly
        semanticScore = Math.max(0, Math.min(100, Math.round(((sim - 0.3) / 0.5) * 100)));
      }
    } else {
      // Fallback Overlap
      const candText = candidate_to_text(candidate);
      const jdQueryText = JSON.stringify(jdInput);
      const sim = JaccardSimilarity(jdQueryText, candText);
      semanticScore = Math.min(100, Math.round(30 + (sim * 130)));
    }

    // Hybrid Formulation
    const finalScore = Math.round(
      0.35 * skillScore +
      0.20 * expScore +
      0.20 * semanticScore +
      0.15 * qualScore +
      0.10 * availScore
    );

    // Placeholder static brief matching summaries (will generate exhaustively on Details request for speed and quota limits)
    const mockStrengths = [
      `Has relevant ${candidate.skills[0]?.name || "Core"} skill matched`,
      `Possesses ${candidate.profile.years_of_experience} years of overall experience`,
      candidate.redrob_signals.open_to_work_flag ? "Actively Open to Work" : "Verified professional background"
    ];
    
    const mockWeaknesses = candidate.skills.length < 6 ? ["Limited stack exposure listed"] : ["No significant concerns"];
    const mockRecommend = `${candidate.profile.anonymized_name} is a high-ranking matches for this position with ${finalScore}% match score.`;

    rankedCandidatesList.push({
      candidate,
      score: {
        skill_score: Math.round(skillScore),
        experience_score: Math.round(expScore),
        semantic_score: Math.round(semanticScore),
        quality_score: Math.round(qualScore),
        availability_score: Math.round(availScore),
        final_score: finalScore
      },
      explanation: {
        match_score: finalScore,
        strengths: mockStrengths,
        weaknesses: mockWeaknesses,
        missing_skills: jdInput.required_skills.filter(req => !candidate.skills.some(s => s.name.toLowerCase() === req.toLowerCase())),
        hiring_recommendation: mockRecommend
      },
      // Generate dynamically inside details call
      interview_questions: []
    });
  }

  // Sort candidates by final_score descending
  rankedCandidatesList.sort((a, b) => b.score.final_score - a.score.final_score);

  return res.json(rankedCandidatesList);
});

/**
 * POST /api/candidate-detail
 * Module 5: Explainability Engine & Module 6: AI Interview Questions
 * Calls Gemini live on target candidate matching the parsed JD parameters to produce rich strengths/weaknesses and 5 highly specialized questions.
 */
app.post("/api/candidate-detail", async (req, res) => {
  const { candidate_id, parsedJd, scoreBreakdown } = req.body;
  
  if (!candidate_id || !parsedJd) {
    return res.status(400).json({ error: "ID and requirements payload are required." });
  }

  const candidate = CANDIDATES_DB.find(c => c.candidate_id === candidate_id);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  const ai = getGeminiClient();
  const missingSkills = (parsedJd.required_skills || []).filter(
    (req: string) => !candidate.skills.some(s => s.name.toLowerCase() === req.toLowerCase())
  );

  if (!ai) {
    // Elegant fallback simulator
    const fallbackExplain: CandidateExplanation = {
      match_score: scoreBreakdown?.final_score || 85,
      strengths: [
        `Demonstrated depth in ${candidate.skills.slice(0, 3).map(s => s.name).join(", ")}`,
        `Offers ${candidate.profile.years_of_experience} years of domain-focused history`,
        `Current status is ${candidate.redrob_signals.open_to_work_flag ? "immediately executable" : "highly sought-after"}`
      ],
      weaknesses: missingSkills.length > 0 
        ? [`Absence of explicit proof for ${missingSkills.join(", ")}`]
        : ["No critical technical gaps detected compared to standard requirements"],
      missing_skills: missingSkills,
      hiring_recommendation: `Recommended for technical screening. Candidate has strong overlapping experience in ${candidate.profile.current_industry} and is graded with a high quality index (${Math.round(scoreBreakdown?.quality_score || 80)}).`
    };

    const fallbackQuestions = [
      `Given your experience with ${candidate.skills[0]?.name || "your main technologies"}, describe a time you optimized a system's performance.`,
      `How would you go about acquiring and proving proficiency in ${missingSkills[0] || "modern engineering architectures"}?`,
      `Walk us through your current responsibilities at ${candidate.profile.current_company} and why you are looking to take on a ${parsedJd.role} role.`,
      `Your profile indicates an excellent assessments rating. Describe a complex technical scenario that tested your knowledge.`,
      `What is your preferred development paradigm, and how do you align with a team's work mode (${parsedJd.work_mode})?`
    ];

    return res.json({
      explanation: fallbackExplain,
      interview_questions: fallbackQuestions
    });
  }

  try {
    const jdSummary = `Role: ${parsedJd.role}. Required skills: ${parsedJd.required_skills.join(", ")}. Preferred skills: ${parsedJd.preferred_skills.join(", ")}`;
    const candSummary = candidate_to_text(candidate);

    const prompt = `You are a professional executive recruiting expert working on an Intelligent Hiring Platform.
Evaluate this candidate profile relative to the Job Description below.

CANDIDATE:
${candSummary}

JOB DESCRIPTION REQUIREMENTS:
${jdSummary}

We computed these matching scores for context:
- Overall Score: ${scoreBreakdown?.final_score || 85}/100
- Skill Score: ${scoreBreakdown?.skill_score || 85}/100
- Experience Score: ${scoreBreakdown?.experience_score || 80}/100
- Semantic Gap Score: ${scoreBreakdown?.semantic_score || 80}/100

Draft a recruiter-friendly matching explanation and 5 personalized interview questions focusing on skill validation, experience validation, and bridging missing competencies.

Return a JSON with this exact structure:
{
  "explanation": {
    "match_score": number, // must match overall score Context
    "strengths": string[], // 3 detailed strengths matching profile relative to JD
    "weaknesses": string[], // 1-2 constructive gaps or concerns
    "missing_skills": string[], // Missing skills list
    "hiring_recommendation": string // 1 scannable paragraph summary
  },
  "interview_questions": string[] // list of exactly 5 custom, high-caliber personalized interview questions
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const bodyObj = JSON.parse(response.text || "{}");
    return res.json(bodyObj);
  } catch (err) {
    console.error("Explainability generator failed:", err);
    return res.status(500).json({ error: "AI Explainability breakdown." });
  }
});

/**
 * POST /api/copilot
 * Module 7: Recruiter Copilot Chat
 * Generates structured database filters from natural recruiter speak, and returns ranked, filtered candidates along with Gemini's friendly chat.
 */
app.post("/api/copilot", async (req, res) => {
  const { query, jobDescriptionContext } = req.body;
  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query cannot be blank." });
  }

  const ai = getGeminiClient();

  // Basic interpreter logic if key not configured
  const simulatedFilters: CopilotFilter = {
    roles: [],
    skills: [],
    min_experience: undefined,
    work_mode: undefined,
    industry: undefined
  };

  // Extract explicit numbers / skills with simple logic
  const expMatch = query.match(/(\d+)\s*(years|yr|years\s*exp|experience)/i);
  if (expMatch) {
    simulatedFilters.min_experience = parseInt(expMatch[1], 10);
  }

  // Common keywords parsing
  const techKeywords = ["python", "react", "rag", "golang", "go", "typescript", "kubernetes", "aws", "terraform", "django", "fastapi", "cypress"];
  techKeywords.forEach(k => {
    if (query.toLowerCase().includes(k)) {
      if (!simulatedFilters.skills) simulatedFilters.skills = [];
      simulatedFilters.skills.push(k);
    }
  });

  const rolesList = ["ai", "frontend", "backend", "devops", "ml", "product", "qa"];
  rolesList.forEach(r => {
    if (query.toLowerCase().includes(r)) {
      if (!simulatedFilters.roles) simulatedFilters.roles = [];
      simulatedFilters.roles.push(r);
    }
  });

  if (query.toLowerCase().includes("remote")) {
    simulatedFilters.work_mode = "remote";
  }

  let filters = simulatedFilters;
  let interpreterText = `Applying standard filters extracted from search: looking for candidates with experience/skills referencing ${query}.`;

  if (ai) {
    try {
      const systemPrompt = `You are the backend parser for a recruiter copilot conversational engine.
Your task is to take a natural language search query from a recruiter, extract explicit filter constraints, and compile a warm summary back to the recruiter explaining what filters you are applying.

Example:
Input: "Show candidates with Python, RAG, and 3+ years experience"
Output JSON:
{
  "natural_interpretation": "I have set filters to capture candidates matching specialized 'Python' and 'RAG' keywords with at least 3 years of overall professional experience.",
  "filters": {
    "roles": [],
    "skills": ["Python", "RAG"],
    "min_experience": 3,
    "work_mode": "any"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: query,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const extracted = JSON.parse(response.text || "{}");
      if (extracted.filters) {
        filters = extracted.filters;
      }
      if (extracted.natural_interpretation) {
        interpreterText = extracted.natural_interpretation;
      }
    } catch (e) {
      console.warn("Copilot prompt extraction failed, falling back to regex matchers:", e);
    }
  }

  // Apply filters onto our candidates database
  let matchedSubset = [...CANDIDATES_DB];

  if (filters.min_experience && filters.min_experience > 0) {
    matchedSubset = matchedSubset.filter(c => c.profile.years_of_experience >= (filters.min_experience || 0));
  }

  if (filters.skills && filters.skills.length > 0) {
    const skillListLower = filters.skills.map(s => s.toLowerCase());
    matchedSubset = matchedSubset.filter(c => 
      skillListLower.some(reqSkill => c.skills.some(cs => cs.name.toLowerCase() === reqSkill))
    );
  }

  if (filters.work_mode && filters.work_mode !== "any" && filters.work_mode !== "flexible") {
    matchedSubset = matchedSubset.filter(c => 
      c.redrob_signals.preferred_work_mode === filters.work_mode
    );
  }

  // Rank the filtered list
  const mockJd: ParsedJobDescription = jobDescriptionContext || {
    role: filters.roles?.[0] || "Custom Query Match",
    required_skills: filters.skills || [],
    preferred_skills: [],
    experience_required: filters.min_experience ? `${filters.min_experience}+ years` : "0+ years",
    industry: filters.industry || "Information Technology",
    education_requirements: [],
    work_mode: filters.work_mode || "any",
    salary_range: "any"
  };

  const rankedCandidatesList: RankedCandidate[] = [];

  for (const candidate of matchedSubset) {
    const skillScore = calculateSkillScore(candidate, mockJd);
    const expScore = calculateExperienceScore(candidate, mockJd);
    const qualScore = calculateQualityScore(candidate);
    const availScore = calculateAvailabilityScore(candidate);

    const candText = candidate_to_text(candidate);
    const overlapSim = JaccardSimilarity(query, candText);
    const semanticScore = Math.min(100, Math.round(35 + (overlapSim * 125)));

    const finalScore = Math.round(
      0.35 * skillScore +
      0.20 * expScore +
      0.20 * semanticScore +
      0.15 * qualScore +
      0.10 * availScore
    );

    const mockStrengths = [
      `Matched skill keywords outlined: ${candidate.skills.slice(0,2).map(s => s.name).join(", ")}`,
      `Demonstrates strong years of experience profile (${candidate.profile.years_of_experience} years)`
    ];

    rankedCandidatesList.push({
      candidate,
      score: {
        skill_score: Math.round(skillScore),
        experience_score: Math.round(expScore),
        semantic_score: Math.round(semanticScore),
        quality_score: Math.round(qualScore),
        availability_score: Math.round(availScore),
        final_score: finalScore
      },
      explanation: {
        match_score: finalScore,
        strengths: mockStrengths,
        weaknesses: ["No major discrepancies discovered"],
        missing_skills: mockJd.required_skills.filter(req => !candidate.skills.some(s => s.name.toLowerCase() === req.toLowerCase())),
        hiring_recommendation: `Matched through Copilot conversational filter list. Top capability elements verify a ${finalScore}% overall matching standard.`
      },
      interview_questions: []
    });
  }

  rankedCandidatesList.sort((a, b) => b.score.final_score - a.score.final_score);

  return res.json({
    natural_interpretation: interpreterText,
    filters_applied: filters,
    ranked_candidates: rankedCandidatesList
  });
});

// --- ENHANCED BUNDLER DEV/PROD ROUTING FALLBACK ---

async function startServer() {
  // Vite server injection for UI serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Master Candidate Ranking Engine running on http://localhost:${PORT}`);
  });
}

startServer();
