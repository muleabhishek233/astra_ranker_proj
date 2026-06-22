/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface GradientTextProps {
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const GradientText: React.FC<GradientTextProps> = ({
  colors = ["#5227FF", "#FF9FFC", "#B497CF", "#5227FF"], // Default starts and ends with same color
  animationSpeed = 8,
  showBorder = false,
  className = "",
  children,
}) => {
  const gradientString = colors.join(", ");

  return (
    <span
      className={`relative inline-flex items-center justify-center font-bold overflow-hidden ${className}`}
      style={{
        display: "inline-flex",
      }}
    >
      {/* Inject styling safely for animating background gradient position */}
      <style>
        {`
          @keyframes gradient-text-flow {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient-text-flow {
            background-size: 200% auto;
            animation: gradient-text-flow var(--speed, 8s) linear infinite;
          }
        `}
      </style>

      {/* Border structure if showBorder is true */}
      {showBorder && (
        <span
          className="absolute inset-0 rounded-full p-[1px] pointer-events-none animate-gradient-text-flow"
          style={{
            background: `linear-gradient(to right, ${gradientString})`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0.8,
            style: { "--speed": `${animationSpeed}s` } as React.CSSProperties,
          } as any}
        />
      )}

      {/* Main Gradient Text */}
      <span
        className="animate-gradient-text-flow bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradientString})`,
          textShadow: "0 0 40px rgba(255,255,255,0.1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          "--speed": `${animationSpeed}s`,
        } as React.CSSProperties}
      >
        {children}
      </span>
    </span>
  );
};

export default GradientText;
