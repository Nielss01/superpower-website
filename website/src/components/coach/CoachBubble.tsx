"use client";

import { motion } from "framer-motion";
import { C, GRAD, FONT } from "@/lib/tokens";

const ease = [0.22, 1, 0.36, 1] as const;

export function CoachBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          background: GRAD.flow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(34,160,107,0.2)",
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.sand}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "14px 18px",
          maxWidth: "85%",
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: C.body,
          lineHeight: 1.65,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
