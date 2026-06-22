/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, ShieldAlert, CheckCircle, Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { RankedCandidate } from "../types";

interface RowProps {
  ranked: RankedCandidate;
  rankIndex: number;
  onSelect: () => void;
}

export const CandidateRow: React.FC<RowProps> = ({ ranked, rankIndex, onSelect }) => {
  const { candidate, score } = ranked;
  const { profile, redrob_signals } = candidate;

  // Color code matching score indicators
  const getScoreColor = (val: number) => {
    if (val >= 85) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", fill: "bg-emerald-500" };
    if (val >= 68) return { bg: "bg-blue-50 text-blue-700 border-blue-200", fill: "bg-blue-500" };
    if (val >= 50) return { bg: "bg-amber-50 text-amber-700 border-amber-200", fill: "bg-amber-500" };
    return { bg: "bg-zinc-50 text-zinc-600 border-zinc-200", fill: "bg-zinc-400" };
  };

  const badge = getScoreColor(score.final_score);

  return (
    <div 
      id={`cand-card-${candidate.candidate_id}`}
      className="group relative bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
      onClick={onSelect}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile Info */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-mono text-sm text-zinc-600 dark:text-zinc-400 font-bold group-hover:scale-105 transition-transform duration-150">
            #{rankIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base group-hover:text-blue-600 transition-colors duration-150">
                {profile.anonymized_name}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {candidate.candidate_id}
              </span>
              {redrob_signals.open_to_work_flag && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mt-1">
              {profile.current_title} at <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{profile.current_company}</span>
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">
              {profile.years_of_experience} years exp • {profile.location}
            </p>
          </div>
        </div>

        {/* Scoring metrics */}
        <div className="flex items-center gap-4 ml-14 sm:ml-0">
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Match Quality</span>
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium justify-end mt-1">
              <span>Skills: {score.skill_score}</span>
              <span className="text-zinc-300">•</span>
              <span>Exp: {score.experience_score}</span>
            </div>
          </div>
          
          <div className={`flex items-center justify-center flex-col w-20 h-20 rounded-xl border ${badge.bg} text-center`}>
            <span className="text-2xl font-black font-mono tracking-tighter leading-none">
              {score.final_score}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-bold mt-1 opacity-80">
              Score
            </span>
          </div>
        </div>
      </div>

      {/* Core verified tags */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {candidate.skills.slice(0, 4).map((skill, index) => (
            <span 
              key={`${candidate.candidate_id}-skill-${index}`}
              className="text-xs bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 px-2 py-1 rounded-md border border-zinc-200/60 dark:border-zinc-800/60"
            >
              {skill.name} ({skill.proficiency})
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <p className="text-zinc-400 dark:text-zinc-500 text-xs self-center ml-1">
              +{candidate.skills.length - 4} more
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            {redrob_signals.notice_period_days === 0 ? "Immediate" : `${redrob_signals.notice_period_days}d notice`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            {Math.round(redrob_signals.recruiter_response_rate * 100)}% active
          </span>
        </div>
      </div>
      
      {/* Absolute detail hover link indicator */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-blue-600 dark:text-blue-400">
        <ExternalLink className="w-4 h-4" />
      </div>
    </div>
  );
};
