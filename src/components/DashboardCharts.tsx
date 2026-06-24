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
  Cell,
} from "recharts";
import { ScoreBreakdown } from "../types";

interface RadarChartProps {
  score: ScoreBreakdown;
}

export const CandidateScoreRadar: React.FC<RadarChartProps> = ({ score }) => {
  const data = [
    { subject: "Skills", value: score.skill_score, fullMark: 100 },
    { subject: "Experience", value: score.experience_score, fullMark: 100 },
    { subject: "Semantic", value: score.semantic_score, fullMark: 100 },
    { subject: "Quality", value: score.quality_score, fullMark: 100 },
    { subject: "Availability", value: score.availability_score, fullMark: 100 },
  ];

  return (
    <div style={{
      width: "100%", height: 220,
      background: "#f5f5f7",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#7a7a7a", fontSize: 10, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#cccccc", fontSize: 8 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#0066cc"
            fill="#0066cc"
            fillOpacity={0.15}
            strokeWidth={1.5}
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
    <div style={{
      width: "100%", height: 192,
      background: "#f5f5f7",
      border: "1px solid #f0f0f0",
      borderRadius: 12,
      padding: 8,
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scores} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#7a7a7a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#cccccc", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1d1d1f",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 11,
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {scores.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
