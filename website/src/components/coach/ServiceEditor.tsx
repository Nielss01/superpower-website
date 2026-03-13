"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";
import type { Service } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { LANG } from "@/lib/i18n";

interface ServiceEditorProps {
  lang: Lang;
  initialServices?: Service[];
  onSubmit: (services: Service[]) => void;
}

export function ServiceEditor({ lang, initialServices, onSubmit }: ServiceEditorProps) {
  const [services, setServices] = useState<Service[]>(
    initialServices && initialServices.length > 0
      ? initialServices
      : [{ name: "", price: "" }, { name: "", price: "" }, { name: "", price: "" }]
  );
  const t = LANG[lang];

  const hasValid = services.some(s => s.name.trim() && s.price.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: "16px", paddingLeft: "46px" }}
    >
      {services.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input
            type="text"
            value={s.name}
            onChange={(e) => {
              const next = [...services];
              next[i] = { ...next[i], name: e.target.value };
              setServices(next);
            }}
            placeholder={`Service ${i + 1}`}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: "10px",
              border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
              color: C.ink, outline: "none", background: C.creamLt,
            }}
          />
          <input
            type="text"
            value={s.price}
            onChange={(e) => {
              const next = [...services];
              next[i] = { ...next[i], price: e.target.value };
              setServices(next);
            }}
            placeholder={t.bou_q4_price}
            style={{
              width: "80px", padding: "8px 10px", borderRadius: "10px",
              border: `1px solid ${C.sand}`, fontFamily: FONT.sans, fontSize: "13px",
              color: C.green, fontWeight: 600, outline: "none", background: C.creamLt,
              textAlign: "right",
            }}
          />
        </div>
      ))}
      <button
        onClick={() => setServices([...services, { name: "", price: "" }])}
        style={{
          padding: "6px 12px", borderRadius: "8px",
          border: `1px dashed ${C.sand}`, background: "transparent",
          fontFamily: FONT.sans, fontSize: "12px", color: C.muted,
          cursor: "pointer", marginBottom: "12px",
        }}
      >
        + {t.bou_q4_add}
      </button>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          const valid = services.filter(s => s.name.trim() && s.price.trim());
          if (valid.length > 0) onSubmit(valid);
        }}
        disabled={!hasValid}
        style={{
          width: "100%", padding: "10px", borderRadius: "12px", border: "none",
          background: hasValid ? C.green : C.sand,
          color: C.white, fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500,
          cursor: hasValid ? "pointer" : "default", transition: "background 200ms",
        }}
      >
        {t.bou_next}
      </motion.button>
    </motion.div>
  );
}
