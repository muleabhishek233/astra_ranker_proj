/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Brain,
  FileText,
  CheckCircle,
  Briefcase,
  ArrowRight,
  GraduationCap,
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
  BookOpen,
} from "lucide-react";
import {
  Candidate,
  ParsedJobDescription,
  RankedCandidate,
  ScoreBreakdown,
  CandidateExplanation,
} from "./types";
import { CandidateRow } from "./components/CandidateRow";
import { CandidateScoreRadar } from "./components/DashboardCharts";

// --- TEMPLATE JOB DESCRIPTIONS ---
const TEMPLATE_JDS = [
  {
    title: "Senior AI & RAG Engineer",
    text: `Position: Senior AI Research & RAG Systems Architect\nRequired Skills: Python, PyTorch, RAG, LangChain, Vector Search\nPreferred Skills: Qdrant, PostgreSQL, Docker\nExperience: 5+ years of overall machine learning and NLP engineering.\nIndustry: Information Technology and Artificial Intelligence.\nWork Mode: Remote.\nSalary: 25 - 35 LPA.\nDescription: We are seeking an elite AI Architect to lead our semantic data discovery products. You will design advanced query flows using vector indexing systems like Qdrant and construct custom retrieval layers.`,
  },
  {
    title: "Senior React Specialist",
    text: `Position: Senior Frontend UI Specialist\nRequired Skills: React, TypeScript, Tailwind CSS, JavaScript\nPreferred Skills: Next.js, Vite, Redux Toolkit\nExperience: 4+ years of building robust modular user interfaces.\nIndustry: Design & Software development.\nWork Mode: Hybrid.\nSalary: 14 - 18 LPA.\nDescription: Looking for a craft-oriented Senior Frontend developer to construct micro-interaction components. Must have an obsession for responsive styling guides, clean tracking structures, and modular design.`,
  },
  {
    title: "SRE & Cloud DevOps Lead",
    text: `Position: Senior DevOps & Cloud Infrastructure Leader\nRequired Skills: AWS, Terraform, Docker, CI/CD, Python\nPreferred Skills: Kubernetes, Prometheus, PostgreSQL\nExperience: 5+ years in SRE nodes and secure infrastructure as code.\nIndustry: Computer & Network Security.\nWork Mode: Remote.\nSalary: 100 - 130 LPA.\nDescription: Seeking a cloud architect to construct automated build systems and enforce strict firewalls.`,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"jd" | "ranking" | "copilot">("jd");

  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedJd, setParsedJd] = useState<ParsedJobDescription | null>(null);

  const [isRanking, setIsRanking] = useState(false);
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<RankedCandidate[]>([]);

  const [minScore, setMinScore] = useState(0);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRanked, setSelectedRanked] = useState<RankedCandidate | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [customDetail, setCustomDetail] = useState<{
    explanation: CandidateExplanation;
    questions: string[];
  } | null>(null);

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
      text: "Hello! I'm your Recruiter Copilot. Describe the profiles you need naturally — for example, 'Show me remote developers with Python and 3+ years experience' — and I'll translate your request into precise candidate filters.",
    },
  ]);

  const handleSelectTemplate = (text: string) => setJdText(text);

  const handleExtractAndRank = async () => {
    if (!jdText.trim()) return;
    setIsParsing(true);
    setIsRanking(true);
    setActiveTab("ranking");
    try {
      const parseResponse = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const parsedData = await parseResponse.json();
      setParsedJd(parsedData);
      setIsParsing(false);
      const rankResponse = await fetch("/api/rank-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, parsedJd: parsedData }),
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

  useEffect(() => {
    let result = [...rankedCandidates];
    if (minScore > 0) result = result.filter((c) => c.score.final_score >= minScore);
    if (selectedWorkMode !== "all")
      result = result.filter(
        (c) => c.candidate.redrob_signals.preferred_work_mode === selectedWorkMode
      );
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.candidate.profile.anonymized_name.toLowerCase().includes(q) ||
          r.candidate.skills.some((s) => s.name.toLowerCase().includes(q))
      );
    }
    setFilteredCandidates(result);
  }, [rankedCandidates, minScore, selectedWorkMode, searchQuery]);

  const handleFetchCandidateDetail = async (ranked: RankedCandidate) => {
    setSelectedRanked(ranked);
    setIsFetchingDetail(true);
    setCustomDetail(null);
    const dummyJd: ParsedJobDescription = parsedJd || {
      role: ranked.candidate.profile.current_title,
      required_skills: ranked.candidate.skills.slice(0, 3).map((s) => s.name),
      preferred_skills: [],
      experience_required: `${ranked.candidate.profile.years_of_experience} years`,
      industry: ranked.candidate.profile.current_industry,
      education_requirements: [],
      work_mode: ranked.candidate.redrob_signals.preferred_work_mode,
      salary_range: "Unspecified",
    };
    try {
      const detailRes = await fetch("/api/candidate-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: ranked.candidate.candidate_id,
          parsedJd: dummyJd,
          scoreBreakdown: ranked.score,
        }),
      });
      const details = await detailRes.json();
      setCustomDetail({ explanation: details.explanation, questions: details.interview_questions });
      setIsFetchingDetail(false);
    } catch (err) {
      console.error("Detail fetching error:", err);
      setIsFetchingDetail(false);
    }
  };

  const handleCopilotSend = async () => {
    if (!copilotQuery.trim()) return;
    const userMsg = copilotQuery;
    setCopilotQuery("");
    setCopilotChat((prev) => [...prev, { sender: "recruiter", text: userMsg }]);
    setIsCopilotSearching(true);
    try {
      const copilotResponse = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, jobDescriptionContext: parsedJd || undefined }),
      });
      const data = await copilotResponse.json();
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.natural_interpretation,
          candidates: data.ranked_candidates,
          filters: data.filters_applied,
        },
      ]);
      setIsCopilotSearching(false);
    } catch (err) {
      console.error("Copilot api failure:", err);
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I encountered an issue translating your search. Please try again.",
        },
      ]);
      setIsCopilotSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f5f7", color: "#1d1d1f" }}>

      {/* ── GLOBAL NAV (Apple black bar, 44px) ── */}
      <header
        className="apple-global-nav sticky top-0 z-50 flex items-center justify-between px-6"
        style={{ minHeight: 44 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5227FF 0%, #B497CF 100%)" }}>
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="apple-nav-link font-semibold" style={{ color: "#fff", fontSize: 13 }}>
            Astra
          </span>
          <span className="apple-nav-link" style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
            Talent Intelligence
          </span>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1">
          {[
            { key: "jd", label: "JD Parser", icon: <FileText className="w-3 h-3" /> },
            { key: "ranking", label: `Rankings${rankedCandidates.length > 0 ? ` (${rankedCandidates.length})` : ""}`, icon: <Sliders className="w-3 h-3" /> },
            { key: "copilot", label: "Copilot", icon: <Sparkles className="w-3 h-3" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="apple-nav-link flex items-center gap-1.5 px-3 py-1 rounded-md transition-all"
              style={{
                color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.65)",
                background: activeTab === tab.key ? "rgba(255,255,255,0.12)" : "transparent",
                fontSize: 12,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right util */}
        <div className="w-28 flex justify-end">
          {activeTab === "copilot" && (
            <span className="flex items-center gap-1.5" style={{ color: "#2997ff", fontSize: 11 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Active
            </span>
          )}
        </div>
      </header>

      {/* ── SUB-NAV (frosted, Apple style) ── */}
      <div className="apple-sub-nav sticky z-40 flex items-center justify-between px-6"
        style={{ top: 44, height: 52 }}>
        <span className="apple-tagline" style={{ color: "#1d1d1f", fontSize: 17 }}>
          {activeTab === "jd" && "Requirement Parser"}
          {activeTab === "ranking" && "Candidate Rankings"}
          {activeTab === "copilot" && "Recruiter Copilot"}
        </span>
        {activeTab === "jd" && (
          <button
            onClick={handleExtractAndRank}
            disabled={!jdText.trim() || isParsing}
            className="btn-apple-primary"
            style={{ fontSize: 14, padding: "8px 18px" }}
          >
            {isParsing ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Parsing…</>
            ) : (
              <>Extract & Match <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">

        {/* ══ TAB 1: JD PARSER ══ */}
        {activeTab === "jd" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: editor */}
            <div className="lg:col-span-7 apple-utility-card flex flex-col gap-6">
              <div>
                <p className="apple-caption" style={{ color: "#0066cc", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Requirement Extraction Pipeline
                </p>
                <h2 className="apple-display-md mt-1" style={{ fontSize: 24 }}>
                  Define Target Role Requirements
                </h2>
                <p className="apple-body mt-2" style={{ color: "#7a7a7a", fontSize: 15 }}>
                  Paste a raw job description. The extraction model will parse role attributes, experience goals, and skill definitions.
                </p>
              </div>

              {/* Template buttons */}
              <div style={{ background: "#f5f5f7", borderRadius: 12, padding: "14px 16px" }}>
                <p className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Template Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_JDS.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectTemplate(tpl.text)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 9999,
                        padding: "7px 16px",
                        fontSize: 13,
                        fontWeight: 400,
                        color: "#0066cc",
                        cursor: "pointer",
                        letterSpacing: "-0.2px",
                        transition: "transform 0.1s",
                      }}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-2">
                <label className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Job Description
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste raw JD or select a template above…"
                  style={{
                    width: "100%",
                    minHeight: 240,
                    background: "#f5f5f7",
                    border: "1px solid #e0e0e0",
                    borderRadius: 12,
                    padding: "14px 16px",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#1d1d1f",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#0066cc"; e.target.style.boxShadow = "0 0 0 3px rgba(0,102,204,0.08)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="apple-caption">{jdText.length} characters</span>
                <button
                  onClick={handleExtractAndRank}
                  disabled={!jdText.trim() || isParsing}
                  className="btn-apple-primary"
                >
                  {isParsing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Parsing…</>
                  ) : (
                    <>Extract & Match Candidates <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Right: status + formula */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="apple-utility-card">
                <div className="flex items-center justify-between pb-4 mb-5"
                  style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <span className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                    <Activity className="w-3.5 h-3.5" style={{ color: "#0066cc" }} />
                    Extraction Output
                  </span>
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: parsedJd ? "#34c759" : "#e0e0e0",
                      display: "inline-block",
                    }}
                  />
                </div>

                {parsedJd ? (
                  <div className="flex flex-col gap-4">
                    <div style={{ background: "#f5f5f7", borderRadius: 10, padding: "12px 14px" }}>
                      <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Role</p>
                      <h4 className="apple-body-strong mt-1">{parsedJd.role}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Experience", value: parsedJd.experience_required },
                        { label: "Work Mode", value: parsedJd.work_mode },
                        { label: "Compensation", value: parsedJd.salary_range },
                        { label: "Industry", value: parsedJd.industry },
                      ].map((item) => (
                        <div key={item.label} style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: "10px 12px" }}>
                          <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em" }}>{item.label}</p>
                          <p className="apple-body-strong mt-0.5" style={{ fontSize: 14 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedJd.required_skills.map((s, i) => (
                          <span key={i} style={{ background: "#ebf2ff", color: "#0066cc", borderRadius: 9999, padding: "5px 12px", fontSize: 13, fontWeight: 500 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    {parsedJd.preferred_skills?.length > 0 && (
                      <div>
                        <p className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Preferred Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {parsedJd.preferred_skills.map((s, i) => (
                            <span key={i} style={{ background: "#f5f5f7", color: "#333", borderRadius: 9999, padding: "5px 12px", fontSize: 13 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div style={{ width: 44, height: 44, background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Workflow className="w-5 h-5" style={{ color: "#7a7a7a" }} />
                    </div>
                    <p className="apple-body-strong" style={{ fontSize: 15 }}>Awaiting Job Specifications</p>
                    <p className="apple-caption mt-2 px-6" style={{ maxWidth: 260 }}>
                      Select a template or paste a job description and trigger extraction.
                    </p>
                  </div>
                )}
              </div>

              {/* Matching formula card (dark tile) */}
              <div className="apple-tile-dark" style={{ borderRadius: 18, padding: "28px 28px", position: "relative", overflow: "hidden" }}>
                <p className="apple-caption" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  Hybrid Matching Formula
                </p>
                <p className="apple-body mt-3" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                  Scores are weighted across <strong style={{ color: "#fff" }}>Skills (35%)</strong>, <strong style={{ color: "#fff" }}>Experience (20%)</strong>, <strong style={{ color: "#fff" }}>Semantic Relevance (20%)</strong>, <strong style={{ color: "#fff" }}>Profile Quality (15%)</strong>, and <strong style={{ color: "#fff" }}>Availability (10%)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2: RANKINGS ══ */}
        {activeTab === "ranking" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Filter sidebar */}
            <div className="lg:col-span-4 apple-utility-card flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <span className="apple-caption" style={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sliders className="w-3.5 h-3.5" style={{ color: "#0066cc" }} />
                  Filters
                </span>
                <button
                  onClick={() => { setMinScore(0); setSelectedWorkMode("all"); setSearchQuery(""); }}
                  className="apple-link"
                  style={{ fontSize: 13 }}
                >
                  Clear all
                </button>
              </div>

              {/* Score range */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="apple-body" style={{ fontSize: 15 }}>Minimum Match Score</span>
                  <span style={{ background: "#ebf2ff", color: "#0066cc", borderRadius: 9999, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>{minScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="apple-range"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Work mode */}
              <div className="flex flex-col gap-3">
                <span className="apple-body" style={{ fontSize: 15 }}>Work Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  {["all", "remote", "hybrid", "onsite"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedWorkMode(mode)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 9999,
                        fontSize: 13,
                        fontWeight: 400,
                        textAlign: "center",
                        textTransform: "capitalize",
                        cursor: "pointer",
                        transition: "all 0.1s",
                        border: selectedWorkMode === mode ? "none" : "1px solid #e0e0e0",
                        background: selectedWorkMode === mode ? "#0066cc" : "#f5f5f7",
                        color: selectedWorkMode === mode ? "#fff" : "#1d1d1f",
                      }}
                    >
                      {mode === "all" ? "Any" : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text search */}
              <div className="flex flex-col gap-3">
                <span className="apple-body" style={{ fontSize: 15 }}>Search by Skill or Name</span>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#7a7a7a" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Python, React, RAG…"
                    style={{
                      width: "100%",
                      background: "#f5f5f7",
                      border: "1px solid #e0e0e0",
                      borderRadius: 9999,
                      padding: "10px 16px 10px 34px",
                      fontSize: 14,
                      color: "#1d1d1f",
                      outline: "none",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#0066cc"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div style={{ background: "#f5f5f7", borderRadius: 12, padding: "16px" }}>
                <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 12 }}>Pool Analytics</p>
                <div className="flex items-center justify-between" style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #e0e0e0" }}>
                  <span className="apple-caption">Total profiles</span>
                  <span className="apple-body-strong" style={{ fontSize: 14 }}>{rankedCandidates.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="apple-caption">Top score</span>
                  <span className="apple-body-strong" style={{ fontSize: 14, color: "#34c759" }}>
                    {rankedCandidates[0]?.score.final_score || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate list */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div>
                <h2 className="apple-display-md" style={{ fontSize: 24 }}>Candidate Rankings</h2>
                <p className="apple-caption mt-1">
                  {filteredCandidates.length} of {rankedCandidates.length} profiles match your filters. Select a candidate to view details.
                </p>
              </div>

              {isRanking ? (
                <div className="apple-utility-card flex flex-col items-center justify-center py-20 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin" style={{ color: "#0066cc", marginBottom: 16 }} />
                  <p className="apple-body" style={{ color: "#7a7a7a" }}>Running hybrid scoring models…</p>
                </div>
              ) : filteredCandidates.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredCandidates.map((cand, index) => (
                    <CandidateRow
                      key={cand.candidate.candidate_id}
                      ranked={cand}
                      rankIndex={index}
                      onSelect={() => handleFetchCandidateDetail(cand)}
                    />
                  ))}
                </div>
              ) : (
                <div className="apple-utility-card flex flex-col items-center justify-center py-16 text-center"
                  style={{ border: "1px dashed #e0e0e0", background: "transparent" }}>
                  <UserCheck className="w-10 h-10" style={{ color: "#e0e0e0", marginBottom: 12 }} />
                  <p className="apple-body-strong">No Matching Candidates</p>
                  <p className="apple-caption mt-1">Adjust your filter parameters to widen the search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 3: COPILOT ══ */}
        {activeTab === "copilot" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Chat window */}
            <div className="lg:col-span-7 flex flex-col apple-utility-card p-0 overflow-hidden" style={{ height: 580 }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafc" }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, background: "#ebf2ff", border: "1px solid #d0e3ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles className="w-4 h-4" style={{ color: "#0066cc" }} />
                  </div>
                  <div>
                    <p className="apple-body-strong" style={{ fontSize: 14 }}>Recruiter Copilot</p>
                    <p className="apple-caption" style={{ fontSize: 11 }}>Natural language candidate search</p>
                  </div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#34c759" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34c759", display: "inline-block" }} />
                  Ready
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {copilotChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === "recruiter" ? "items-end" : "items-start"}`}
                    style={{ maxWidth: "84%", alignSelf: msg.sender === "recruiter" ? "flex-end" : "flex-start" }}
                  >
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: msg.sender === "recruiter" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      fontSize: 14,
                      lineHeight: 1.55,
                      background: msg.sender === "recruiter" ? "#0066cc" : "#f5f5f7",
                      color: msg.sender === "recruiter" ? "#fff" : "#1d1d1f",
                      letterSpacing: "-0.2px",
                    }}>
                      {msg.text}
                      {msg.filters && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "monospace", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                          {msg.filters.skills && <span>Skills: <strong>{msg.filters.skills.join(", ")}</strong></span>}
                          {msg.filters.min_experience !== undefined && <span>Min exp: <strong>{msg.filters.min_experience}yr</strong></span>}
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: 10, color: "#7a7a7a", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {msg.sender === "recruiter" ? "You" : "Copilot"}
                    </span>

                    {msg.candidates && msg.candidates.length > 0 && (
                      <div className="apple-utility-card mt-2" style={{ width: "min(420px, 100%)", padding: 16 }}>
                        <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", paddingBottom: 10, borderBottom: "1px solid #f0f0f0", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                          <span>Search Results</span>
                          <span>{msg.candidates.length} matched</span>
                        </p>
                        <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                          {msg.candidates.slice(0, 3).map((r, i) => (
                            <div
                              key={r.candidate.candidate_id}
                              onClick={() => handleFetchCandidateDetail(r)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, border: "1px solid #f0f0f0", cursor: "pointer" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "monospace", color: "#7a7a7a" }}>#{i + 1}</span>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0066cc" }}>{r.candidate.profile.anonymized_name}</p>
                                  <p style={{ fontSize: 11, color: "#7a7a7a" }}>{r.candidate.profile.current_title}</p>
                                </div>
                              </div>
                              <span style={{ background: "#ebf2ff", color: "#0066cc", borderRadius: 9999, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                                {r.score.final_score}%
                              </span>
                            </div>
                          ))}
                        </div>
                        {msg.candidates.length > 3 && (
                          <button
                            onClick={() => { setRankedCandidates(msg.candidates || []); setActiveTab("ranking"); }}
                            className="apple-link"
                            style={{ fontSize: 13, marginTop: 10, display: "block", textAlign: "center" }}
                          >
                            View all {msg.candidates.length} in Rankings →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isCopilotSearching && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7a7a7a", fontSize: 13 }}>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: "#0066cc" }} />
                    Analyzing your request…
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ borderTop: "1px solid #f0f0f0", padding: "12px 16px", display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCopilotSend(); }}
                  placeholder="e.g. 'Show remote React developers with 4+ years experience'"
                  style={{
                    flex: 1,
                    background: "#f5f5f7",
                    border: "1px solid #e0e0e0",
                    borderRadius: 9999,
                    padding: "10px 18px",
                    fontSize: 14,
                    color: "#1d1d1f",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#0066cc"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e0e0e0"; }}
                />
                <button
                  onClick={handleCopilotSend}
                  disabled={!copilotQuery.trim() || isCopilotSearching}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 9999,
                    background: !copilotQuery.trim() ? "#e0e0e0" : "#0066cc",
                    border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: !copilotQuery.trim() ? "not-allowed" : "pointer",
                    transition: "transform 0.1s",
                    flexShrink: 0,
                  }}
                >
                  <Send className="w-4 h-4" style={{ color: !copilotQuery.trim() ? "#7a7a7a" : "#fff" }} />
                </button>
              </div>
            </div>

            {/* Hints panel */}
            <div className="lg:col-span-5 apple-utility-card flex flex-col gap-6">
              <div>
                <p className="apple-caption" style={{ color: "#0066cc", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Search Hints</p>
                <h3 className="apple-display-md mt-1" style={{ fontSize: 20 }}>Effective Copilot Queries</h3>
                <p className="apple-body mt-2" style={{ color: "#7a7a7a", fontSize: 14 }}>
                  The copilot parses natural language into precise candidate filters. Try these:
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { icon: <Code className="w-4 h-4" />, title: "Skill overlap check", query: "Show candidates with Python, RAG, and 3+ years experience." },
                  { icon: <UserCheck className="w-4 h-4" />, title: "Work mode filter", query: "Show React developers with preferred hybrid mode." },
                ].map((hint) => (
                  <div
                    key={hint.query}
                    onClick={() => setCopilotQuery(hint.query)}
                    style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 12, transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f7")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <div style={{ width: 32, height: 32, background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0066cc" }}>
                      {hint.icon}
                    </div>
                    <div>
                      <p className="apple-body-strong" style={{ fontSize: 14 }}>{hint.title}</p>
                      <p className="apple-caption mt-1" style={{ fontStyle: "italic" }}>"{hint.query}"</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
                <BookOpen className="w-4 h-4" style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                <p className="apple-body" style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                  Semantic vectors are generated server-side using Google GenAI embedding standards. Matched filters are applied deterministically.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER (Apple parchment style) ── */}
      <footer style={{ background: "#f5f5f7", borderTop: "1px solid #e0e0e0", padding: "32px 24px" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <p style={{ fontSize: 12, color: "#7a7a7a", letterSpacing: "-0.1px" }}>
            Copyright © 2025 Astra. Talent intelligence platform.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Use", "Contact"].map((link) => (
              <a key={link} href="#" className="apple-link" style={{ fontSize: 12, color: "#7a7a7a" }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── CANDIDATE DETAIL DRAWER ── */}
      {selectedRanked && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedRanked(null); }}
        >
          <div
            className="animate-slide-in"
            style={{ width: "100%", maxWidth: 680, background: "#fff", height: "100%", overflowY: "auto", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)" }}
          >
            {/* Drawer header */}
            <div
              style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f0f0f0", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#7a7a7a" }}>
                  #{rankedCandidates.indexOf(selectedRanked) + 1}
                </div>
                <div>
                  <h3 className="apple-body-strong">{selectedRanked.candidate.profile.anonymized_name}</h3>
                  <p className="apple-caption">{selectedRanked.candidate.candidate_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRanked(null)}
                style={{ width: 32, height: 32, borderRadius: 9999, border: "1px solid #e0e0e0", background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7a7a7a" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Headline */}
              <div style={{ background: "#f5f5f7", borderRadius: 12, padding: "16px 18px" }}>
                <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em" }}>Headline</p>
                <p className="apple-body-strong mt-2" style={{ fontSize: 15 }}>{selectedRanked.candidate.profile.headline}</p>
                <p className="apple-body mt-2" style={{ fontSize: 14, color: "#7a7a7a" }}>{selectedRanked.candidate.profile.summary}</p>
              </div>

              {/* Score radar + breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>Score Distribution</p>
                  <CandidateScoreRadar score={selectedRanked.score} />
                </div>
                <div>
                  <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>Score Breakdown</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { name: "Skills", score: selectedRanked.score.skill_score, weight: "35%", color: "#0066cc" },
                      { name: "Experience", score: selectedRanked.score.experience_score, weight: "20%", color: "#34c759" },
                      { name: "Semantic", score: selectedRanked.score.semantic_score, weight: "20%", color: "#5e5ce6" },
                      { name: "Quality", score: selectedRanked.score.quality_score, weight: "15%", color: "#ff9f0a" },
                      { name: "Availability", score: selectedRanked.score.availability_score, weight: "10%", color: "#ff3b30" },
                    ].map((item) => (
                      <div key={item.name} style={{ border: "1px solid #f0f0f0", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <p className="apple-body" style={{ fontSize: 13 }}>{item.name}</p>
                          <p className="apple-caption" style={{ fontSize: 10 }}>Weight: {item.weight}</p>
                        </div>
                        <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 16, color: item.color }}>{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI explanations */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>
                <p className="apple-caption" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#0066cc" }} />
                  AI Analysis
                </p>

                {isFetchingDetail ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7a7a7a", fontSize: 14 }}>
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "#0066cc" }} />
                    Generating insights…
                  </div>
                ) : customDetail ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div style={{ background: "#f0fff4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#166534", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Strengths
                        </p>
                        <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                          {customDetail.explanation.strengths.map((s, i) => (
                            <li key={i} style={{ fontSize: 13, color: "#166534" }}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, padding: "14px 16px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9f1239", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                          <X className="w-3.5 h-3.5" /> Gaps
                        </p>
                        <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                          {customDetail.explanation.weaknesses.map((w, i) => (
                            <li key={i} style={{ fontSize: 13, color: "#9f1239" }}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {customDetail.explanation.missing_skills.length > 0 && (
                      <div style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: "14px 16px" }}>
                        <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8 }}>Missing Skills</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {customDetail.explanation.missing_skills.map((s, i) => (
                            <span key={i} style={{ background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 9999, padding: "4px 12px", fontSize: 12, color: "#333" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ background: "#f5f5f7", border: "1px solid #f0f0f0", borderRadius: 12, padding: "14px 16px" }}>
                      <p className="apple-caption" style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6 }}>Recommendation</p>
                      <p className="apple-body" style={{ fontSize: 14 }}>{customDetail.explanation.hiring_recommendation}</p>
                    </div>

                    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1d1d1f", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                        <Brain className="w-3.5 h-3.5" style={{ color: "#0066cc" }} /> Interview Questions
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {customDetail.questions.map((q, i) => (
                          <div key={i} style={{ background: "#f5f5f7", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11, color: "#0066cc", flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                            <p className="apple-body" style={{ fontSize: 13 }}>{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="apple-caption">Analysis not yet loaded.</p>
                )}
              </div>

              {/* Career history */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>
                <p className="apple-caption" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                  <Briefcase className="w-3.5 h-3.5" /> Career History
                </p>
                <div style={{ borderLeft: "2px solid #f0f0f0", marginLeft: 10, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                  {selectedRanked.candidate.career_history.map((hist, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: -28, top: 4, width: 10, height: 10, borderRadius: "50%", background: "#0066cc", border: "2px solid #fff", boxShadow: "0 0 0 3px #f5f5f7" }} />
                      <p className="apple-body-strong" style={{ fontSize: 15 }}>{hist.title}</p>
                      <p className="apple-body" style={{ fontSize: 13, color: "#7a7a7a", marginTop: 2 }}>{hist.company} · {hist.industry}</p>
                      <p className="apple-caption" style={{ fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>{hist.start_date} – {hist.end_date || "Present"}</p>
                      <p className="apple-body" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{hist.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 24 }}>
                <p className="apple-caption" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRanked.candidate.education.map((edu, i) => (
                    <div key={i} style={{ background: "#f5f5f7", border: "1px solid #f0f0f0", borderRadius: 12, padding: "12px 14px" }}>
                      <p className="apple-body-strong" style={{ fontSize: 13 }}>{edu.degree} in {edu.field_of_study}</p>
                      <p className="apple-caption" style={{ marginTop: 3 }}>{edu.institution}</p>
                      <p className="apple-caption" style={{ fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>{edu.start_year}–{edu.end_year} · Tier {edu.tier}</p>
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
