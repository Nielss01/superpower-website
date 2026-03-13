import { C, FONT } from "@/lib/tokens";
import { MARKETPLACE_CATEGORY_META } from "@/lib/marketplace-data";

export default function CrmCategoriesPage() {
  const categories = Object.entries(MARKETPLACE_CATEGORY_META);

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
            Categories
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
            Marketplace listing categories — emoji, colour, and display name.
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
          + New category
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid #E4E4E7", overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "40px 1fr 120px 120px 80px 80px",
            padding: "10px 20px",
            borderBottom: "1px solid #F0F0F0",
            fontSize: "10px", fontWeight: 700, color: "#888",
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
          }}
        >
          <span />
          <span>Name</span>
          <span>Colour</span>
          <span>Wash</span>
          <span>Sort</span>
          <span />
        </div>

        {categories.map(([name, meta], i) => (
          <div
            key={name}
            style={{
              display: "grid", gridTemplateColumns: "40px 1fr 120px 120px 80px 80px",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: i < categories.length - 1 ? "1px solid #F4F4F5" : "none",
              fontSize: "14px", color: C.ink,
            }}
          >
            {/* Emoji */}
            <span style={{ fontSize: "20px" }}>{meta.emoji}</span>

            {/* Name + badge preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: 500 }}>{name}</span>
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "2px 8px", borderRadius: "6px",
                  background: `${meta.color}15`,
                  color: meta.color,
                  fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase" as const,
                }}
              >
                {meta.emoji} {name}
              </span>
            </div>

            {/* Colour swatch */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18, height: 18, borderRadius: "4px",
                  background: meta.color, flexShrink: 0,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                }}
              />
              <code style={{ fontSize: "11px", color: "#666" }}>{meta.color}</code>
            </div>

            {/* Wash swatch */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18, height: 18, borderRadius: "4px",
                  background: meta.wash, flexShrink: 0,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                }}
              />
              <code style={{ fontSize: "11px", color: "#666" }}>{meta.wash}</code>
            </div>

            {/* Sort order placeholder */}
            <span style={{ color: "#aaa", fontSize: "13px" }}>{i + 1}</span>

            {/* Actions */}
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
        Once the <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px" }}>marketplace_categories</code> table
        is wired up, edits made here will be live immediately.
      </p>
    </div>
  );
}
