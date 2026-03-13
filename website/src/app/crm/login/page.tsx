"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";

export default function CrmLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/crm/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.replace("/crm");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      setPassword("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.sans,
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "#1C1C1E",
          borderRadius: "16px",
          padding: "40px 36px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: FONT.serif, fontSize: "22px", color: "#fff", marginBottom: "4px" }}>
            Superpower CRM
          </div>
          <div style={{ fontSize: "13px", color: "#888" }}>
            Admin access only
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="crm-password"
              style={{ fontSize: "11px", fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}
            >
              Password
            </label>
            <input
              id="crm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: `1px solid ${error ? "#e55" : "#333"}`,
                background: "#111",
                color: "#fff",
                fontFamily: FONT.sans,
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: "13px", color: "#f87171", background: "#2a1515", padding: "10px 12px", borderRadius: "8px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              padding: "13px",
              borderRadius: "10px",
              border: "none",
              background: loading || !password ? "#333" : C.green,
              color: loading || !password ? "#666" : "#fff",
              fontFamily: FONT.sans,
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading || !password ? "default" : "pointer",
              transition: "background 200ms",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
