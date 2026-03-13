"use client";

import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import type { CoachSuggestion } from "@/lib/types";

interface SuggestionChipsProps {
  suggestions: CoachSuggestion[];
  onSelect: (prompt: string) => void;
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "16px",
        paddingLeft: "46px",
      }}
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(s.prompt)}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: `1px solid ${C.greenPale}`,
            background: C.greenWash,
            fontFamily: FONT.sans,
            fontSize: "12px",
            fontWeight: 500,
            color: C.green,
            cursor: "pointer",
            transition: "all 200ms",
          }}
        >
          {s.label} →
        </motion.button>
      ))}
    </motion.div>
  );
}
