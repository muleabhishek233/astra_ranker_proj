/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  FileText, 
  CheckCircle, 
  Briefcase, 
  Clock, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  Languages, 
  Send, 
  RefreshCw, 
  Sliders, 
  X, 
  UserCheck, 
  Compass, 
  Activity, 
  Code, 
  Workflow,
  Search,
  BookOpen
} from "lucide-react";
import { 
  Candidate, 
  ParsedJobDescription, 
  RankedCandidate, 
  ScoreBreakdown,
  CandidateExplanation
} from "./types";
import { CandidateRow } from "./components/CandidateRow";
import { CandidateScoreRadar, ScoreBarComparison } from "./components/DashboardCharts";
import { FloatingLines } from "./components/FloatingLines";
import { GradientText } from "./components/GradientText";
import { VariableProximity } from "./components/VariableProximity";

// --- TEMPLATE JOB DESCRIPTIONS ---
const TEMPLATE_JDS = [
  {
    title: "Senior AI & RAG Engineer",
    text: `Position: Senior AI Research & RAG Systems Architect
Required Skills: Python, PyTorch, RAG, LangChain, Vector Search
Preferred Skills: Qdrant, PostgreSQL, Docker
Experience: 5+ years of overall machine learning and NLP engineering.
Industry: Information Technology and Artificial Intelligence.
Work Mode: Remote.
Salary: 25 - 35 LPA.
Description: We are seeking an elite AI Architect to lead our semantic data discovery products. You will design advanced query flows using vector indexing systems like Qdrant and construct custom retrieval layers.`
  },
  {
    title: "Senior React Specialist",
    text: `Position: Senior Frontend UI Specialist
Required Skills: React, TypeScript, Tailwind CSS, JavaScript
Preferred Skills: Next.js, Vite, Redux Toolkit
Experience: 4+ years of building robust modular user interfaces.
Industry: Design & Software development.
Work Mode: Hybrid.
Salary: 14 - 18 LPA.
Description: Looking for a craft-oriented Senior Frontend developer to construct micro-interaction components. Must have an obsession for responsive styling guides, clean tracking structures, and modular design.`
  },
  {
    title: "SRE & Cloud DevOps Lead",
    text: `Position: Senior DevOps & Cloud Infrastructure Leader
Required Skills: AWS, Terraform, Docker, CI/CD, Python
Preferred Skills: Kubernetes, Prometheus, PostgreSQL
Experience: 5+ years in SRE nodes and secure infrastructure as code.
Industry: Computer & Network Security.
Work Mode: Remote.
Salary: 100 - 130 LPA.
Description: Seeking a cloud architect to construct automated build systems and enforce strict firewalls.`
  }
];

export default function App() {
  // Navigation State: 'jd' | 'ranking' | 'copilot'
  const [activeTab, setActiveTab] = useState<"jd" | "ranking" | "copilot">("jd");

  // References for variable proximity text animation
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const jdHeadingContainerRef = useRef<HTMLDivElement>(null);
  const candidatesHeadingContainerRef = useRef<HTMLDivElement>(null);
  const copilotHeadingContainerRef = useRef<HTMLDivElement>(null);

  // Input state
  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedJd, setParsedJd] = useState<ParsedJobDescription | null>(null);

  // Search Results State
  const [isRanking, setIsRanking] = useState(false);
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<RankedCandidate[]>([]);

  // Search filter options
  const [minScore, setMinScore] = useState(0);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Candidate details modal/view
  const [selectedRanked, setSelectedRanked] = useState<RankedCandidate | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [customDetail, setCustomDetail] = useState<{
    explanation: CandidateExplanation;
    questions: string[];
  } | null>(null);

  // Copilot conversational state
  const [copilotQuery, setCopilotQuery] = useState("");
  const [isCopilotSearching, setIsCopilotSearching] = useState(false);
  const [copilotChat, setCopilotChat] = useState<{
    sender: "recruiter" | "ai";
    text: string;
    candidates?: RankedCandidate[];
    filters?: any;
  }[]>([
    {
      sender: "ai",
      text: "Hello! I am your Recruiter Copilot. Describe the profiles you need naturally (e.g. 'Show me remote developers with Python and 3+ years experience') and I will translate your request into strict vector-similarity filters against the candidate pool."
    }
  ]);

  // Handle template selection
  const handleSelectTemplate = (text: string) => {
    setJdText(text);
  };

  // Main Pipeline Trigger: Extract & Match JDs
  const handleExtractAndRank = async () => {
    if (!jdText.trim()) return;

    setIsParsing(true);
    setIsRanking(true);
    setActiveTab("ranking");

    try {
      // Step 1: Parse the JD
      const parseResponse = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText })
      });
      const parsedData = await parseResponse.json();
      setParsedJd(parsedData);
      setIsParsing(false);

      // Step 2: Rank the database candidates
      const rankResponse = await fetch("/api/rank-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, parsedJd: parsedData })
      });
      const rankedData = await rankResponse.json();
      setRankedCandidates(rankedData);
      setIsRanking(false);
    } catch (error) {
      console.error("Pipeline failure:", error);
      setIsParsing(false);
      setIsRanking(false);
    }
  };

  // Apply listing filters
  useEffect(() => {
    let result = [...rankedCandidates];

    // Score Filter
    if (minScore > 0) {
      result = result.filter(c => c.score.final_score >= minScore);
    }

    // Work Mode Filter
    if (selectedWorkMode !== "all") {
      result = result.filter(c => c.candidate.redrob_signals.preferred_work_mode === selectedWorkMode);
    }

    // Search query match (anonymized name or skills)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.candidate.profile.anonymized_name.toLowerCase().includes(q) ||
        r.candidate.skills.some(s => s.name.toLowerCase().includes(q))
      );
    }

    setFilteredCandidates(result);
  }, [rankedCandidates, minScore, selectedWorkMode, searchQuery]);

  // Load detailed explainability & interview questions for candidate details
  const handleFetchCandidateDetail = async (ranked: RankedCandidate) => {
    setSelectedRanked(ranked);
    setIsFetchingDetail(true);
    setCustomDetail(null);

    // Fallback context if parser hasn't run yet
    const dummyJd: ParsedJobDescription = parsedJd || {
      role: ranked.candidate.profile.current_title,
      required_skills: ranked.candidate.skills.slice(0, 3).map(s => s.name),
      preferred_skills: [],
      experience_required: `${ranked.candidate.profile.years_of_experience} years`,
      industry: ranked.candidate.profile.current_industry,
      education_requirements: [],
      work_mode: ranked.candidate.redrob_signals.preferred_work_mode,
      salary_range: "Unspecified"
    };

    try {
      const detailRes = await fetch("/api/candidate-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: ranked.candidate.candidate_id,
          parsedJd: dummyJd,
          scoreBreakdown: ranked.score
        })
      });
      const details = await detailRes.json();
      setCustomDetail({
        explanation: details.explanation,
        questions: details.interview_questions
      });
      setIsFetchingDetail(false);
    } catch (err) {
      console.error("Detail fetching error:", err);
      setIsFetchingDetail(false);
    }
  };

  // Conversational Search API: Recruiter Copilot
  const handleCopilotSend = async () => {
    if (!copilotQuery.trim()) return;

    const userMsg = copilotQuery;
    setCopilotQuery("");
    setCopilotChat(prev => [...prev, { sender: "recruiter", text: userMsg }]);
    setIsCopilotSearching(true);

    try {
      const copilotResponse = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userMsg,
          jobDescriptionContext: parsedJd || undefined 
        })
      });
      const data = await copilotResponse.json();
      
      setCopilotChat(prev => [...prev, {
        sender: "ai",
        text: data.natural_interpretation,
        candidates: data.ranked_candidates,
        filters: data.filters_applied
      }]);
      setIsCopilotSearching(false);
    } catch (err) {
      console.error("Copilot api failure:", err);
      setCopilotChat(prev => [...prev, {
        sender: "ai",
        text: "Apologies, I encountered an issue translating your search parameters. Please try again or rephrase."
      }]);
      setIsCopilotSearching(false);
    }
  };

  return (
    <div className="min-h-screen text-zinc-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 relative z-0">
      {/* IMMERSIVE FLOATING LINES BACKGROUND */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          linesGradient={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
          mixBlendMode="normal"
        />
      </div>

      {/* HEADER BAR */}
      <header id="app-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <div ref={headerContainerRef} className="flex items-center gap-3 select-none">
          <div className="relative group cursor-pointer flex items-center justify-center w-10 h-10">
            {/* Navigating Talent With Intelligence: Cosmic branded aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-500 to-pink-500 rounded-xl opacity-85 blur-[4px] group-hover:opacity-100 transition-opacity duration-500"></div>
            {/* Inner dark container */}
            <div className="relative w-[38px] h-[38px] rounded-xl bg-zinc-950 flex items-center justify-center border border-white/20 shadow-inner">
              <Compass className="w-5 h-5 text-indigo-300 group-hover:text-pink-300 group-hover:rotate-45 transition-all duration-500 ease-out" />
            </div>
          </div>
          <div>
            <h1 className="text-zinc-900 font-extrabold text-lg tracking-tight leading-tight">
              <GradientText
                colors={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
                animationSpeed={8}
                showBorder={false}
                className="font-extrabold"
              >
                <VariableProximity
                  label="Astra"
                  className="font-extrabold cursor-default"
                  fromFontVariationSettings="'wght' 600, 'opsz' 10"
                  toFontVariationSettings="'wght' 900, 'opsz' 40"
                  containerRef={headerContainerRef}
                  radius={120}
                  falloff="linear"
                />
              </GradientText>
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider font-bold">
              Navigating talent with intelligence.
            </p>
          </div>
        </div>

        {/* TOP LEVEL ROUTER SWITCH */}
        <nav className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200/50">
          <button
            onClick={() => setActiveTab("jd")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 ${activeTab === "jd" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/20" : "text-zinc-500 hover:text-zinc-900"}`}
          >
            <FileText className="w-4 h-4" />
            Requirement Parser
          </button>
          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 ${activeTab === "ranking" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/20" : "text-zinc-500 hover:text-zinc-900"}`}
          >
            <Sliders className="w-4 h-4" />
            Match Ranks {rankedCandidates.length > 0 && `(${rankedCandidates.length})`}
          </button>
          <button
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all duration-150 relative ${activeTab === "copilot" ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/20" : "text-zinc-500 hover:text-zinc-900"}`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            Copilot Chat
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </nav>
      </header>

      {/* VIEWPORT AREA */}
      <main className="flex-1 flex flex-col p-6 max-w-7xl w-full mx-auto gap-6">

        {/* TAB 1: REQUIREMENT EXTRACTOR */}
        {activeTab === "jd" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Parser left: Editor */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-950 border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div ref={jdHeadingContainerRef} className="select-none">
                <span className="text-[10px] font-mono tracking-wider text-blue-600 font-bold uppercase">Requirement Extraction Pipeline</span>
                <h2 className="text-zinc-900 dark:text-white font-extrabold text-xl mt-1 tracking-tight">
                  <GradientText
                    colors={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
                    animationSpeed={8}
                    showBorder={false}
                    className="font-extrabold"
                  >
                    <VariableProximity
                      label="Define Target Role Requirements"
                      className="font-extrabold cursor-default"
                      fromFontVariationSettings="'wght' 600, 'opsz' 10"
                      toFontVariationSettings="'wght' 900, 'opsz' 40"
                      containerRef={jdHeadingContainerRef}
                      radius={160}
                      falloff="linear"
                    />
                  </GradientText>
                </h2>
                <p className="text-zinc-500 text-xs mt-1">
                  Drop a raw job description (JD) below. The Gemini extraction model will parse role attributes, experience goals, and expected skill definitions.
                </p>
              </div>

              {/* JD Template Selectors */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3">
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold mb-2">Select Template Job Profile</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_JDS.map((tpl, i) => (
                    <button
                      key={`tpl-${i}`}
                      onClick={() => handleSelectTemplate(tpl.text)}
                      className="text-xs border border-zinc-200/80 bg-white hover:bg-zinc-50 px-3 py-1.5 rounded-lg text-zinc-700 font-medium tracking-tight transition-all"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* JD Textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider font-mono">
                  Job Description Specifications
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste raw JD or select one of our premium pre-configured recruiter template roles above..."
                  className="w-full min-h-[250px] bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 resize-y font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {jdText.length} characters in specification
                </span>
                <button
                  onClick={handleExtractAndRank}
                  disabled={!jdText.trim() || isParsing}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing & Structuring Requirements...
                    </>
                  ) : (
                    <>
                      Extract & Match Candidates
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Parser right: Status Output */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                  <span className="text-zinc-500 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Extraction Parameters
                  </span>
                  <span className={`h-2 w-2 rounded-full ${parsedJd ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
                </div>

                {parsedJd ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Identified Role title</p>
                      <h4 className="text-zinc-800 font-bold text-base">{parsedJd.role}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-zinc-100 rounded-xl p-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Exp Range</span>
                        <p className="text-sm text-zinc-700 font-bold mt-0.5">{parsedJd.experience_required}</p>
                      </div>
                      <div className="border border-zinc-100 rounded-xl p-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Work Mode</span>
                        <p className="text-sm text-zinc-700 font-bold mt-0.5 capitalize">{parsedJd.work_mode}</p>
                      </div>
                      <div className="border border-zinc-100 rounded-xl p-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Compensation</span>
                        <p className="text-sm text-zinc-700 font-bold mt-0.5">{parsedJd.salary_range}</p>
                      </div>
                      <div className="border border-zinc-100 rounded-xl p-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Domain Domain</span>
                        <p className="text-sm text-zinc-700 font-bold mt-0.5">{parsedJd.industry}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider font-mono">Required Core Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {parsedJd.required_skills.map((s, index) => (
                          <span key={`reqSkill-${index}`} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {parsedJd.preferred_skills && parsedJd.preferred_skills.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider font-mono mr-1">Preferred Skills</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {parsedJd.preferred_skills.map((s, index) => (
                            <span key={`prefSkill-${index}`} className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100/80 flex items-center justify-center text-zinc-400 border border-zinc-200/50 mb-3">
                      <Workflow className="w-5 h-5 animate-pulse" />
                    </div>
                    <h4 className="text-zinc-700 font-bold text-sm tracking-tight">Awaiting Job Specifications</h4>
                    <p className="text-zinc-400 text-xs px-6 mt-1 max-w-[280px]">
                      Select or paste a job requirement sheet and trigger extraction to launch calculations.
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic educational guidelines bento-box */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-mono font-bold">Hybrid Matching Formula</span>
                <p className="text-white text-sm leading-relaxed max-w-[85%] font-medium">
                  We verify core alignment ratios by scaling <b>Skills (35%)</b>, overall <b>Experience (20%)</b>, neural <b>Semantic relevance (20%)</b>, platform <b>Quality (15%)</b>, and recruiter response-sync times <b>Availability (10%)</b>.
                </p>
                <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-blue-100/10 border-4 border-white/5" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RANKED LISTINGS */}
        {activeTab === "ranking" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Filters side-column */}
            <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-zinc-700 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  Filter parameters
                </span>
                <button 
                  onClick={() => {
                    setMinScore(0);
                    setSelectedWorkMode("all");
                    setSearchQuery("");
                  }}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Filtering Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-600">
                  <span>Minimum Match Score</span>
                  <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{minScore}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Work Mode filter buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-600">Preferred Workplace Mode</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["all", "remote", "hybrid", "onsite"].map(mode => (
                    <button
                      key={`modeKey-${mode}`}
                      onClick={() => setSelectedWorkMode(mode)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold tracking-tight transition-all text-center capitalize ${selectedWorkMode === mode ? "bg-blue-600 border-blue-500 text-white shadow-sm" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
                    >
                      {mode === "all" ? "Any Setup" : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Search filter */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-600">Search by Name or Tech skill</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Python, React, RAG..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Recruiter stats metrics */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">Index Analytics</span>
                
                <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2">
                  <span className="text-[11px] text-zinc-600 font-medium">Ranked Pool size:</span>
                  <span className="text-xs font-bold text-zinc-850 font-mono">{rankedCandidates.length} profiles</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600 font-medium">Top Match Score:</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {rankedCandidates[0]?.score.final_score || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* List candidate items side-view */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div ref={candidatesHeadingContainerRef} className="select-none">
                  <h2 className="text-zinc-950 font-extrabold text-xl tracking-tight leading-tight">
                    <GradientText
                      colors={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
                      animationSpeed={8}
                      showBorder={false}
                      className="font-extrabold"
                    >
                      <VariableProximity
                        label="Candidates Alignment Rankings"
                        className="font-extrabold cursor-default"
                        fromFontVariationSettings="'wght' 600, 'opsz' 10"
                        toFontVariationSettings="'wght' 900, 'opsz' 40"
                        containerRef={candidatesHeadingContainerRef}
                        radius={160}
                        falloff="linear"
                      />
                    </GradientText>
                  </h2>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {filteredCandidates.length} of {rankedCandidates.length} candidate profiles matched target filters. Click row to check diagnostic explanations.
                  </p>
                </div>
              </div>

              {isRanking ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-200 rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-zinc-500 font-semibold text-sm mt-3 animate-pulse">Running hybrid co-scoring models on candidates collection...</p>
                </div>
              ) : filteredCandidates.length > 0 ? (
                <div className="space-y-3.5" id="candidates-index-grid">
                  {filteredCandidates.map((cand, index) => (
                    <CandidateRow
                      key={`candidate-${cand.candidate.candidate_id}`}
                      ranked={cand}
                      rankIndex={index}
                      onSelect={() => handleFetchCandidateDetail(cand)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-zinc-200/80 rounded-2xl text-center">
                  <UserCheck className="w-10 h-10 text-zinc-300 mb-2" />
                  <h4 className="text-zinc-700 font-bold text-sm tracking-tight">No Matching Candidates Found</h4>
                  <span className="text-zinc-400 text-xs mt-0.5">Adjust filter parameter bars or parser specification rules to widen search indexing range.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CO-CHATS CONVERSATION PANEL / RECRUITER COPILOT */}
        {activeTab === "copilot" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-[500px]">
            {/* Conversation list column */}
            <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl shadow-sm flex flex-col h-[550px]" id="copilot-chat-element">
              
              {/* Copilot Head */}
              <div className="border-b border-zinc-100 p-4 flex items-center justify-between bg-zinc-50 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-zinc-800 font-bold text-sm leading-none">Interactions AI Copilot</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">Ready • Natural Language Filter Compiler</p>
                  </div>
                </div>
                <Compass className="w-4 h-4 text-zinc-400" />
              </div>

              {/* Chat Dialog scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
                {copilotChat.map((msg, index) => (
                  <div 
                    key={`chatMsg-${index}`}
                    className={`flex flex-col max-w-[85%] ${msg.sender === "recruiter" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${msg.sender === "recruiter" ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-100 text-zinc-800 rounded-tl-none"}`}>
                      {msg.text}

                      {/* Display applied filters extracted inside chat block */}
                      {msg.filters && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-200/40 text-[10px] grid grid-cols-2 gap-2 text-zinc-650 font-mono">
                          {msg.filters.skills && (
                            <p>Skills: <span className="font-bold">{msg.filters.skills.join(", ")}</span></p>
                          )}
                          {msg.filters.min_experience !== undefined && (
                            <p>Min Exp: <span className="font-bold">{msg.filters.min_experience} yrs</span></p>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">
                      {msg.sender === "recruiter" ? "You" : "Copilot"}
                    </span>

                    {/* Display ranked results card index directly inside the bubble response! */}
                    {msg.candidates && msg.candidates.length > 0 && (
                      <div className="w-[320px] sm:w-[450px] bg-white border border-zinc-200/80 rounded-xl p-3.5 mt-2 shadow-sm space-y-2">
                        <p className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-bold border-b border-zinc-100 pb-1.5 mb-2 flex items-center justify-between">
                          <span>Conversational Search Outputs</span>
                          <span className="text-zinc-500">{msg.candidates.length} matched</span>
                        </p>
                        <div className="max-h-[160px] overflow-y-auto space-y-1.5">
                          {msg.candidates.slice(0,3).map((r, itemIdx) => (
                            <div 
                              key={`chatResult-${r.candidate.candidate_id}`}
                              onClick={() => handleFetchCandidateDetail(r)}
                              className="group cursor-pointer flex items-center justify-between p-2 rounded-lg border border-zinc-100 hover:bg-zinc-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-zinc-400">#{itemIdx + 1}</span>
                                <div>
                                  <p className="text-xs font-bold text-zinc-800 group-hover:text-blue-600 transition-colors">{r.candidate.profile.anonymized_name}</p>
                                  <p className="text-[10px] text-zinc-400">{r.candidate.profile.current_title}</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {r.score.final_score}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {msg.candidates.length > 3 && (
                          <p onClick={() => {
                            setRankedCandidates(msg.candidates || []);
                            setActiveTab("ranking");
                          }} className="text-[11px] text-blue-600 font-bold text-center pt-1 block hover:underline cursor-pointer">
                            Click to review complete list inside match results table →
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isCopilotSearching && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium font-mono animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Parsing language metrics and preparing match vectors...
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <div className="border-t border-zinc-100 p-3.5 flex gap-2">
                <input
                  type="text"
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCopilotSend();
                  }}
                  placeholder="Ask'em: 'Show React developers with 4+ years of experience'..."
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-850 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50"
                />
                <button
                  onClick={handleCopilotSend}
                  disabled={!copilotQuery.trim() || isCopilotSearching}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recruiter instructions guide box */}
            <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div ref={copilotHeadingContainerRef} className="select-none">
                <span className="text-[10px] font-mono tracking-wider text-blue-600 font-bold uppercase">recruiter search hints</span>
                <h3 className="text-zinc-900 font-extrabold text-lg tracking-tight mt-1">
                  <GradientText
                    colors={["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"]}
                    animationSpeed={8}
                    showBorder={false}
                    className="font-extrabold"
                  >
                    <VariableProximity
                      label="Structured copilot inputs"
                      className="font-extrabold cursor-default"
                      fromFontVariationSettings="'wght' 600, 'opsz' 10"
                      toFontVariationSettings="'wght' 900, 'opsz' 40"
                      containerRef={copilotHeadingContainerRef}
                      radius={160}
                      falloff="linear"
                    />
                  </GradientText>
                </h3>
                <p className="text-zinc-500 text-xs mt-1">Our copilot uses advanced prompt-parsing to compile natural requests into strict filtering boundaries. Try typing these:</p>
              </div>

              <div className="space-y-3.5">
                <div onClick={() => setCopilotQuery("Show candidates with Python, RAG, and 3+ years experience.")} className="cursor-pointer border border-zinc-100 hover:bg-zinc-50 rounded-xl p-3 flex gap-3 text-left transition-all">
                  <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800">Verify skill overlaps</h5>
                    <p className="text-[11px] text-zinc-500 font-medium font-serif mt-1">"Show candidates with Python, RAG and 3+ years experience"</p>
                  </div>
                </div>

                <div onClick={() => setCopilotQuery("Show React developers with preferred hybrid mode.")} className="cursor-pointer border border-zinc-100 hover:bg-zinc-50 rounded-xl p-3 flex gap-3 text-left transition-all">
                  <div className="w-7 h-7 rounded bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800">Filter workspace preferences</h5>
                    <p className="text-[11px] text-zinc-500 font-medium font-serif mt-1">"Show React developers with preferred hybrid mode"</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 flex gap-3 text-zinc-700">
                <BookOpen className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  The semantic vectors are generated server-side using the Google GenAI embedding standards. If the chat filter finds a match, it calculates all metrics deterministically.
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL VIEW / PAGE 3: CANDIDATE DETAIL DRAWER */}
      {selectedRanked && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex justify-end" id="details-overlay">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 h-full flex flex-col shadow-2xl relative animate-slide-in p-0 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold font-mono">
                  #{rankedCandidates.indexOf(selectedRanked) + 1}
                </div>
                <div>
                  <h3 className="text-zinc-900 font-extrabold text-base leading-none">
                    {selectedRanked.candidate.profile.anonymized_name}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block">ID: {selectedRanked.candidate.candidate_id}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedRanked(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Highlight Headline */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Headline</span>
                <p className="text-sm font-semibold text-zinc-800 mt-1 leading-relaxed">
                  {selectedRanked.candidate.profile.headline}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  {selectedRanked.candidate.profile.summary}
                </p>
              </div>

              {/* Dynamic Radar and bar scorecard columns wrapper */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase block mb-2">Metrics distribution chart</span>
                  <CandidateScoreRadar score={selectedRanked.score} />
                </div>
                
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase block mb-1">Co-scores checklist</span>
                  <div className="space-y-2">
                    {[
                      { name: "Skills Alignments", score: selectedRanked.score.skill_score, weight: "35%", color: "#3b82f6" },
                      { name: "Experience Match", score: selectedRanked.score.experience_score, weight: "20%", color: "#059669" },
                      { name: "Neural Semantic Overlap", score: selectedRanked.score.semantic_score, weight: "20%", color: "#8b5cf6" },
                      { name: "Platform Quality Signals", score: selectedRanked.score.quality_score, weight: "15%", color: "#f59e0b" },
                      { name: "Availability Priority", score: selectedRanked.score.availability_score, weight: "10%", color: "#ef4444" }
                    ].map((idx, itemI) => (
                      <div key={`paramBreakdown-${itemI}`} className="text-xs border border-zinc-100 rounded-xl p-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-700">{idx.name}</p>
                          <p className="text-[9px] text-zinc-400 font-mono">Formula weight: {idx.weight}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-zinc-850" style={{ color: idx.color }}>{idx.score}/100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Gemini diagnostic explanation section */}
              <div className="border-t border-zinc-100 pt-5 space-y-4">
                <span className="text-zinc-600 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  Gemini explainability breakdowns
                </span>

                {isFetchingDetail ? (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    Querying Gemini models for customized insights and screening questions...
                  </div>
                ) : customDetail ? (
                  <div className="space-y-4 text-xs leading-relaxed text-zinc-700">
                    
                    {/* Strengths / Weaknesses column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div id="candidate-strengths-card" className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-4">
                        <h4 className="text-emerald-800 font-bold uppercase font-mono text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-1.5 list-disc pl-4 text-emerald-800 font-medium">
                          {customDetail.explanation.strengths.map((str, idx) => (
                            <li key={`strength-${idx}`}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      <div id="candidate-weaknesses-card" className="bg-rose-50/50 border border-rose-100/80 rounded-xl p-4">
                        <h4 className="text-rose-800 font-bold uppercase font-mono text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                          <X className="w-4 h-4 text-rose-500" />
                          Target Gaps / Gaps
                        </h4>
                        <ul className="space-y-1.5 list-disc pl-4 text-rose-800 font-medium">
                          {customDetail.explanation.weaknesses.map((weak, idx) => (
                            <li key={`weakness-${idx}`}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {customDetail.explanation.missing_skills.length > 0 && (
                      <div className="border border-zinc-100 rounded-xl p-3">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Unrecognized Tech requirements</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {customDetail.explanation.missing_skills.map((s, idx) => (
                            <span key={`missing-${idx}`} className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendation box */}
                    <div className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/70">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold block mb-1">Recruiter recommendation</span>
                      <p className="text-zinc-650 font-medium">
                        {customDetail.explanation.hiring_recommendation}
                      </p>
                    </div>

                    {/* Personalized AI screening questions */}
                    <div className="border-t border-zinc-100 pt-5 space-y-3" id="candidate-questions-card">
                      <h4 className="text-zinc-800 font-bold uppercase font-mono text-[10px] tracking-wider flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-blue-500" />
                        5 Personalized Screening Interview Questions
                      </h4>
                      <p className="text-zinc-400 text-[10px] uppercase font-mono leading-none">Tailored to evaluate overlapping skill discrepancies</p>
                      
                      <div className="space-y-2 mt-2">
                        {customDetail.questions.map((q, idx) => (
                          <div key={`question-${idx}`} className="flex gap-3 bg-zinc-50 border border-zinc-100 rounded-xl p-3">
                            <span className="text-[10px] font-mono font-bold text-blue-600 shrink-0 self-start mt-0.5">Q{idx + 1}</span>
                            <p className="text-xs text-zinc-700 font-medium leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs font-medium">Explainability metrics haven't loaded correctly yet.</p>
                )}
              </div>

              {/* Chronological career records lists */}
              <div className="border-t border-zinc-100 pt-5 space-y-4">
                <span className="text-zinc-650 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-zinc-400" />
                  Career history
                </span>
                
                <div className="relative border-l-2 border-zinc-100/85 ml-3 pl-5 space-y-5">
                  {selectedRanked.candidate.career_history.map((hist, histIdx) => (
                    <div key={`histItem-${histIdx}`} className="relative">
                      <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-4 ring-zinc-50" />
                      <div>
                        <h4 className="text-zinc-800 font-bold text-sm leading-tight">{hist.title}</h4>
                        <p className="text-zinc-500 text-xs mt-0.5">{hist.company} • {hist.industry} industry • Size: {hist.company_size}</p>
                        <p className="text-zinc-400 text-[10px] font-mono mt-0.5">{hist.start_date} to {hist.end_date || "Current"}</p>
                        <p className="text-zinc-600 text-xs mt-1.5 leading-relaxed font-serif">{hist.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education list section */}
              <div className="border-t border-zinc-100 pt-5 flex flex-col gap-4">
                <span className="text-zinc-650 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4.5 h-4.5 text-zinc-400" />
                  Education records
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRanked.candidate.education.map((edu, eduIdx) => (
                    <div key={`eduItem-${eduIdx}`} className="border border-zinc-100 rounded-xl p-3 bg-zinc-50">
                      <p className="text-zinc-800 font-bold text-xs">{edu.degree} inside {edu.field_of_study}</p>
                      <p className="text-zinc-500 text-[10px] mt-0.5">{edu.institution}</p>
                      <p className="text-zinc-400 text-[9px] font-mono mt-0.5">{edu.start_year} - {edu.end_year} • Tier index: {edu.tier}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
