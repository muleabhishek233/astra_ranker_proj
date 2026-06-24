/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { RankedCandidate } from "../types";

interface RowProps {
  ranked: RankedCandidate;
  rankIndex: number;
  onSelect: () => void;
}

export const CandidateRow: React.FC<RowProps> = ({ ranked, rankIndex, onSelect }) => {
  const { candidate, score } = ranked;
  const { profile, redrob_signals } = candidate;

  const getScoreBg = (val: number) => {
    if (val >= 85) return { bg: "#f0fff4", border: "#bbf7d0", text: "#166534" };
    if (val >= 68) return { bg: "#ebf2ff", border: "#bfdbfe", text: "#0066cc" };
    if (val >= 50) return { bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
    return { bg: "#f5f5f7", border: "#e0e0e0", text: "#7a7a7a" };
  };

  const badge = getScoreBg(score.final_score);

  return (
    <div
      onClick={onSelect}
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 18,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.1s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Rank badge */}
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: "#f5f5f7",
            border: "1px solid #e0e0e0",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#7a7a7a",
          }}>
            #{rankIndex + 1}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.3px" }}>
                {profile.anonymized_name}
              </h3>
              <span style={{ fontSize: 11, color: "#7a7a7a", fontFamily: "monospace" }}>
                {candidate.candidate_id}
              </span>
              {redrob_signals.open_to_work_flag && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "3px 8px", borderRadius: 9999,
                  background: "#f0fff4", color: "#166534", border: "1px solid #bbf7d0",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34c759", display: "inline-block" }} />
                  Active
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: "#7a7a7a", marginTop: 3, letterSpacing: "-0.2px" }}>
              {profile.current_title} at{" "}
              <span style={{ color: "#1d1d1f", fontWeight: 600 }}>{profile.current_company}</span>
            </p>
            <p style={{ fontSize: 12, color: "#7a7a7a", marginTop: 2 }}>
              {profile.years_of_experience} years · {profile.location}
            </p>
          </div>
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
          <div style={{ textAlign: "right", display: "none" }} className="md:block">
            <p style={{ fontSize: 10, color: "#7a7a7a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Match Quality</p>
            <p style={{ fontSize: 12, color: "#7a7a7a", marginTop: 4 }}>
              Skills: {score.skill_score} · Exp: {score.experience_score}
            </p>
          </div>
          <div style={{
            width: 72, height: 72,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            borderRadius: 14,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace", lineHeight: 1, color: badge.text }}>
              {score.final_score}
            </span>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: badge.text, opacity: 0.7, marginTop: 3 }}>
              Score
            </span>
          </div>
        </div>
      </div>

      {/* Skill tags + meta */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "70%" }}>
          {candidate.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              style={{
                fontSize: 12, color: "#1d1d1f",
                background: "#f5f5f7", border: "1px solid #e0e0e0",
                borderRadius: 9999, padding: "4px 10px",
              }}
            >
              {skill.name} <span style={{ color: "#7a7a7a" }}>({skill.proficiency})</span>
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span style={{ fontSize: 12, color: "#7a7a7a", alignSelf: "center" }}>
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#7a7a7a", fontFamily: "monospace" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar style={{ width: 12, height: 12 }} />
            {redrob_signals.notice_period_days === 0 ? "Immediate" : `${redrob_signals.notice_period_days}d notice`}
          </span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MessageSquare style={{ width: 12, height: 12 }} />
            {Math.round(redrob_signals.recruiter_response_rate * 100)}% active
          </span>
        </div>
      </div>

      {/* Hover indicator */}
      <div style={{ position: "absolute", top: 16, right: 16, opacity: 0, transition: "opacity 0.15s", color: "#0066cc" }}
        className="group-hover:opacity-100"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <ExternalLink style={{ width: 14, height: 14 }} />
      </div>
    </div>
  );
};
