/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  Cell 
} from "recharts";
import { ScoreBreakdown } from "../types";

interface RadarChartProps {
  score: ScoreBreakdown;
}

export const CandidateScoreRadar: React.FC<RadarChartProps> = ({ score }) => {
  const data = [
    { subject: "Skills (35%)", value: score.skill_score, fullMark: 100 },
    { subject: "Experience (20%)", value: score.experience_score, fullMark: 100 },
    { subject: "Semantic similarity (20%)", value: score.semantic_score, fullMark: 100 },
    { subject: "Profile Quality (15%)", value: score.quality_score, fullMark: 100 },
    { subject: "Availability (10%)", value: score.availability_score, fullMark: 100 },
  ];

  return (
    <div id="radar-container" className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e4e4e7" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#a1a1aa', fontSize: 8 }}
          />
          <Radar
            name="Score Breakdown"
            dataKey="value"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CompareScoresProps {
  scores: { name: string; value: number; fill: string }[];
}

export const ScoreBarComparison: React.FC<CompareScoresProps> = ({ scores }) => {
  return (
    <div id="comparison-container" className="w-full h-48 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scores} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: '#a1a1aa', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff',
              fontSize: '11px'
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={30}>
            {scores.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
