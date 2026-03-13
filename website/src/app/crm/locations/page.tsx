import { C, FONT } from "@/lib/tokens";
import { CAPE_TOWN_TOWNSHIPS } from "@/lib/marketplace-data";

export default function CrmLocationsPage() {
  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1
            style={{
              fontFamily: FONT.serif, fontSize: "clamp(22px, 3vw, 28px)",
              color: C.ink, fontWeight: 400, margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Locations
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
            Cape Town townships shown on listing forms and search filters.
          </p>
        </div>
        <button
          style={{
            padding: "10px 20px", borderRadius: "10px",
            background: C.green, border: "none", color: "#fff",
            fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add location
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid #E4E4E7", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "48px 1fr 80px 80px",
            padding: "10px 20px",
            borderBottom: "1px solid #F0F0F0",
            fontSize: "10px", fontWeight: 700, color: "#888",
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
          }}
        >
          <span>#</span>
          <span>Name</span>
          <span>Active</span>
          <span />
        </div>

        {CAPE_TOWN_TOWNSHIPS.map((name, i) => (
          <div
            key={name}
            style={{
              display: "grid", gridTemplateColumns: "48px 1fr 80px 80px",
              alignItems: "center",
              padding: "13px 20px",
              borderBottom: i < CAPE_TOWN_TOWNSHIPS.length - 1 ? "1px solid #F4F4F5" : "none",
            }}
          >
            <span style={{ fontSize: "12px", color: "#aaa" }}>{i + 1}</span>
            <span style={{ fontSize: "14px", color: C.ink, fontWeight: 500 }}>{name}</span>
            <span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "3px 8px", borderRadius: "6px",
                  background: "#ECFDF5", color: "#059669",
                  fontSize: "11px", fontWeight: 600,
                }}
              >
                ✓ Active
              </span>
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                style={{
                  padding: "5px 10px", borderRadius: "7px",
                  border: "1px solid #E4E4E7", background: "#fff",
                  fontSize: "12px", color: C.muted, cursor: "pointer",
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "16px", fontSize: "12px", color: "#aaa", lineHeight: 1.6 }}>
        Currently reading from <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px" }}>marketplace-data.ts</code>.
        Once the <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px" }}>marketplace_locations</code> table
        is wired up, edits made here will be live immediately.
      </p>
    </div>
  );
}
