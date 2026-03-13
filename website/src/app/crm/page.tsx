import Link from "next/link";
import { C, FONT } from "@/lib/tokens";

const SECTIONS = [
  {
    href: "/crm/listings",
    icon: "🏪",
    title: "Listings",
    description: "View, search, and manage all marketplace business profiles.",
    stat: null,
  },
  {
    href: "/crm/categories",
    icon: "🏷",
    title: "Categories",
    description: "Edit the category names, colours, and emoji used in the marketplace.",
    stat: null,
  },
  {
    href: "/crm/locations",
    icon: "📍",
    title: "Locations",
    description: "Manage the Cape Town township list shown on listings and filters.",
    stat: null,
  },
];

export default function CrmDashboard() {
  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>

      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontFamily: FONT.serif, fontSize: "clamp(24px, 3vw, 32px)",
            color: C.ink, fontWeight: 400, margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
          Superpower Hub — admin panel
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {SECTIONS.map(({ href, icon, title, description }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              textDecoration: "none",
              background: "#fff",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid #E4E4E7",
              transition: "box-shadow 200ms, transform 200ms",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
            <div
              style={{
                fontFamily: FONT.sans, fontSize: "15px", fontWeight: 600,
                color: C.ink, marginBottom: "6px",
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>
              {description}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: "48px", padding: "16px 20px", borderRadius: "12px",
          background: "#fff", border: "1px solid #E4E4E7",
          fontSize: "13px", color: C.muted, lineHeight: 1.6,
        }}
      >
        <strong style={{ color: C.ink }}>Note:</strong> Changes to categories and locations made here
        will be saved to the database. The front-end will need to be updated to read from the database
        instead of the hardcoded values in{" "}
        <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>
          src/lib/marketplace-data.ts
        </code>
        .
      </div>
    </div>
  );
}
