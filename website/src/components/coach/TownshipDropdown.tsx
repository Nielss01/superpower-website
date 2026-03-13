"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import { WIJK_GROUPS } from "@/lib/wijk";
import type { Lang } from "@/lib/i18n";
import { LANG } from "@/lib/i18n";

interface TownshipDropdownProps {
  lang: Lang;
  onSelect: (township: string) => void;
}

export function TownshipDropdown({ lang, onSelect }: TownshipDropdownProps) {
  const [value, setValue] = useState("");
  const t = LANG[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: "16px", paddingLeft: "46px" }}
    >
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "12px",
          border: `1px solid ${C.sand}`,
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: value ? C.ink : C.muted,
          background: C.creamLt,
          outline: "none",
          cursor: "pointer",
          marginBottom: "8px",
        }}
      >
        <option value="">{t.bou_q3_placeholder}</option>
        {WIJK_GROUPS.map((g) => (
          <optgroup key={g.region} label={lang === "sa" ? g.regionSA : g.region}>
            {g.townships.map((tw) => (
              <option key={tw} value={tw}>{tw}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => value && onSelect(value)}
        disabled={!value}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "12px",
          border: "none",
          background: value ? C.green : C.sand,
          color: C.white,
          fontFamily: FONT.sans,
          fontSize: "13px",
          fontWeight: 500,
          cursor: value ? "pointer" : "default",
          transition: "background 200ms",
        }}
      >
        {t.bou_next}
      </motion.button>
    </motion.div>
  );
}
