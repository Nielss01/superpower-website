"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import type { Lang } from "@/lib/i18n";
import { LANG } from "@/lib/i18n";

interface AvailabilityChipsProps {
  lang: Lang;
  onSelect: (value: string) => void;
}

export function AvailabilityChips({ lang, onSelect }: AvailabilityChipsProps) {
  const [selected, setSelected] = useState("");
  const t = LANG[lang];
  const chips = t.bou_q7_chips.split("|");

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
            onClick={() => setSelected(chip)}
            style={{
              padding: "8px 14px", borderRadius: "999px",
              border: `1px solid ${selected === chip ? C.green : C.sand}`,
              background: selected === chip ? C.greenWash : C.white,
              fontFamily: FONT.sans, fontSize: "12px", fontWeight: 500,
              color: selected === chip ? C.green : C.body,
              cursor: "pointer", transition: "all 200ms",
            }}
          >
            {chip}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        style={{
          width: "100%", padding: "10px", borderRadius: "12px", border: "none",
          background: selected ? C.green : C.sand,
          color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
          cursor: selected ? "pointer" : "default", transition: "background 200ms",
        }}
      >
        {t.bou_next}
      </motion.button>
    </motion.div>
  );
}
