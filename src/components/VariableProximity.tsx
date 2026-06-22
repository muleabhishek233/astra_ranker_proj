/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";

interface VariableProximityProps {
  label: string;
  className?: string;
  fromFontVariationSettings?: string; // e.g. "'wght' 400, 'opsz' 9"
  toFontVariationSettings?: string;   // e.g. "'wght' 1000, 'opsz' 40"
  containerRef: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "cosine";
}

interface ParsedSetting {
  axis: string;
  fromNum: number;
  toNum: number;
}

export const VariableProximity: React.FC<VariableProximityProps> = ({
  label,
  className = "",
  fromFontVariationSettings = "'wght' 400, 'opsz' 9",
  toFontVariationSettings = "'wght' 1000, 'opsz' 40",
  containerRef,
  radius = 120,
  falloff = "linear",
}) => {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [parsedSettings, setParsedSettings] = useState<ParsedSetting[]>([]);

  // Parse font variation strings to capture interpolation values
  useEffect(() => {
    const parseSettings = (str: string) => {
      const regex = /'([a-zA-Z]{4})'\s+([\d.]+)/g;
      const results: { axis: string; val: number }[] = [];
      let match;
      while ((match = regex.exec(str)) !== null) {
        results.push({ axis: match[1], val: parseFloat(match[2]) });
      }
      return results;
    };

    const fromArr = parseSettings(fromFontVariationSettings);
    const toArr = parseSettings(toFontVariationSettings);

    const consolidated: ParsedSetting[] = [];
    fromArr.forEach((fromItem) => {
      const matchTo = toArr.find((t) => t.axis === fromItem.axis);
      if (matchTo) {
        consolidated.push({
          axis: fromItem.axis,
          fromNum: fromItem.val,
          toNum: matchTo.val,
        });
      }
    });

    setParsedSettings(consolidated);
  }, [fromFontVariationSettings, toFontVariationSettings]);

  // Keep references array clean
  const registerLetter = (el: HTMLSpanElement | null, index: number) => {
    lettersRef.current[index] = el;
  };

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      lettersRef.current.forEach((letter) => {
        if (!letter) return;

        const rect = letter.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;

        const dx = clientX - letterX;
        const dy = clientY - letterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let factor = 0; // 0 is base fromFontVariationSettings, 1 is maximal toFontVariationSettings

        if (distance < radius) {
          const ratio = distance / radius; // 0 to 1
          if (falloff === "linear") {
            factor = 1 - ratio;
          } else if (falloff === "exponential") {
            factor = Math.pow(1 - ratio, 2);
          } else if (falloff === "cosine") {
            factor = 0.5 * (1 + Math.cos(ratio * Math.PI));
          }
        }

        // Apply interpolated font-variation-settings inline
        if (parsedSettings.length > 0) {
          const settingsStr = parsedSettings
            .map((s) => {
              const currentVal = s.fromNum + (s.toNum - s.fromNum) * factor;
              return `'${s.axis}' ${currentVal}`;
            })
            .join(", ");
          letter.style.fontVariationSettings = settingsStr;
        }
      });
    };

    const handleMouseLeave = () => {
      // Reset all letters to base setting smoothly
      lettersRef.current.forEach((letter) => {
        if (!letter) return;
        letter.style.fontVariationSettings = fromFontVariationSettings;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, radius, falloff, parsedSettings, fromFontVariationSettings]);

  return (
    <span className={`inline-flex flex-wrap ${className}`} style={{ transition: "font-variation-settings 0.15s ease-out" }}>
      {label.split(" ").map((word, wordIndex, wordsArray) => (
        <span key={`word-${wordIndex}`} className="inline-flex whitespace-nowrap">
          {word.split("").map((char, charIndex) => {
            const absoluteIdx =
              label.substring(0, label.indexOf(word)).length + charIndex;
            return (
              <span
                key={`char-${charIndex}`}
                ref={(el) => registerLetter(el, absoluteIdx)}
                style={{
                  fontVariationSettings: fromFontVariationSettings,
                  transition: "font-variation-settings 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
                  display: "inline-block",
                }}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < wordsArray.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
    </span>
  );
};

export default VariableProximity;
