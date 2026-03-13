"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import type { Lang } from "@/lib/i18n";
import { LANG } from "@/lib/i18n";

interface PromiseChipsProps {
  lang: Lang;
  onSelect: (value: string) => void;
}

export function PromiseChips({ lang, onSelect }: PromiseChipsProps) {
  const [input, setInput] = useState("");
  const t = LANG[lang];
  const chips = t.bou_q8_chips.split("|");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: "16px", paddingLeft: "46px" }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
        {chips.map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setInput(prev => prev ? prev + ", " + chip : chip)}
            style={{
              padding: "8px 14px", borderRadius: "999px",
              border: `1px solid ${input.includes(chip) ? C.green : C.sand}`,
              background: input.includes(chip) ? C.greenWash : C.white,
              fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
              color: input.includes(chip) ? C.green : C.body,
              cursor: "pointer", transition: "all 200ms",
            }}
          >
            {chip}
          </motion.button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.bou_q8_placeholder}
        rows={2}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "12px",
          border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
          color: C.ink, outline: "none", background: C.creamLt,
          resize: "none", lineHeight: 1.6, marginBottom: "8px",
        }}
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => input.trim() && onSelect(input.trim())}
        disabled={!input.trim()}
        style={{
          width: "100%", padding: "10px", borderRadius: "12px", border: "none",
          background: input.trim() ? C.green : C.sand,
          color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
          cursor: input.trim() ? "pointer" : "default", transition: "background 200ms",
        }}
      >
        {t.bou_next}
      </motion.button>
    </motion.div>
  );
}
