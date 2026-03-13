"use client";

import { motion } from "framer-motion";
import { C, FONT } from "@/lib/tokens";

const ease = [0.22, 1, 0.36, 1] as const;

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease }}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          background: C.green,
          borderRadius: "16px 4px 16px 16px",
          padding: "12px 18px",
          maxWidth: "75%",
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: C.white,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
