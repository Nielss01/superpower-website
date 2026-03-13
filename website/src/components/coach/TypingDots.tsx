"use client";

import { motion } from "framer-motion";
import { C, GRAD } from "@/lib/tokens";

export function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: "12px", background: GRAD.flow,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0,
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: C.white, border: `1px solid ${C.sand}`, borderRadius: "4px 16px 16px 16px",
          padding: "14px 20px", display: "flex", gap: "5px", alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: C.greenBr }}
          />
        ))}
      </div>
    </div>
  );
}
