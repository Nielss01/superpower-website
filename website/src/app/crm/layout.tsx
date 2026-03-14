"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { C, FONT } from "@/lib/tokens";

const NAV = [
  { href: "/crm",            label: "Dashboard",  icon: "▤" },
  { href: "/crm/categories", label: "Categories", icon: "🏷" },
  { href: "/crm/locations",  label: "Locations",  icon: "📍" },
  { href: "/crm/users",      label: "Profiles",   icon: "👤" },
  { href: "/crm/reviews",    label: "Reviews",    icon: "⭐" },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  // Login page renders without the shell
  if (pathname === "/crm/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/crm/logout", { method: "POST" });
    router.push("/crm/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT.sans, background: "#F4F4F5" }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: 220,
          background: C.ink,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Branding */}
        <div style={{ padding: "24px 20px 20px" }}>
          <div style={{ fontFamily: FONT.serif, fontSize: "17px", color: "#fff", lineHeight: 1.2 }}>
            Superpower
          </div>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#666", textTransform: "uppercase" as const, marginTop: "2px" }}>
            CRM
          </div>
        </div>

        <div style={{ height: "1px", background: "#2a2a2a", margin: "0 16px" }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(({ href, label, icon }) => {
            const exact  = href === "/crm";
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  background: active ? "#2a2a2a" : "transparent",
                  color: active ? "#fff" : "#888",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  transition: "background 150ms, color 150ms",
                }}
              >
                <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 8px 20px" }}>
          <div style={{ height: "1px", background: "#2a2a2a", marginBottom: "12px" }} />
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "9px 12px", borderRadius: "8px",
              background: "transparent", border: "none",
              color: "#666", fontSize: "13px", cursor: "pointer",
              textAlign: "left", transition: "color 150ms",
            }}
          >
            <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>↩</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
