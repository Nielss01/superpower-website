import { C, FONT } from "@/lib/tokens";
import { fetchListingsServer, fetchCategoriesServer } from "@/lib/supabase/queries-server";
import { avgRating } from "@/lib/marketplace-data";

export default async function CrmListingsPage() {
  const [listings, categoryMeta] = await Promise.all([
    fetchListingsServer(),
    fetchCategoriesServer(),
  ]);

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
            Listings
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
            {listings.length} business{listings.length !== 1 ? "es" : ""} in Supabase
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: "14px",
          border: "1px solid #E4E4E7", padding: "48px",
          textAlign: "center", color: "#aaa", fontFamily: FONT.sans, fontSize: "14px",
        }}>
          No listings yet. They will appear here once businesses publish their profiles.
        </div>
      ) : (
        <div
          style={{
            background: "#fff", borderRadius: "14px",
            border: "1px solid #E4E4E7", overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 140px 130px 80px 80px 80px 80px",
              padding: "10px 20px",
              borderBottom: "1px solid #F0F0F0",
              fontSize: "10px", fontWeight: 700, color: "#888",
              letterSpacing: "0.08em", textTransform: "uppercase" as const,
            }}
          >
            <span>Business</span>
            <span>Category</span>
            <span>Location</span>
            <span>Reviews</span>
            <span>Rating</span>
            <span>Status</span>
            <span />
          </div>

          {listings.map((listing, i) => {
            const meta = categoryMeta[listing.category];
            const avg = avgRating(listing.reviews);
            const score = avg !== null ? (avg * 2).toFixed(1) : null;

            return (
              <div
                key={listing.id}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 130px 80px 80px 80px 80px",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: i < listings.length - 1 ? "1px solid #F4F4F5" : "none",
                }}
              >
                {/* Business name + tagline */}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.ink }}>{listing.businessName}</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "260px" }}>
                    {listing.tagline}
                  </div>
                </div>

                {/* Category badge */}
                <div>
                  {meta ? (
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 8px", borderRadius: "6px",
                        background: `${meta.color}15`, color: meta.color,
                        fontSize: "10px", fontWeight: 600,
                        textTransform: "uppercase" as const, letterSpacing: "0.05em",
                      }}
                    >
                      {meta.emoji} {meta.name}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#aaa" }}>{listing.category}</span>
                  )}
                </div>

                {/* Location */}
                <div style={{ fontSize: "12px", color: C.muted }}>
                  {listing.location.join(", ")}
                </div>

                {/* Reviews count */}
                <div style={{ fontSize: "13px", color: C.muted }}>
                  {listing.reviews.length}
                </div>

                {/* Rating */}
                <div style={{ fontSize: "13px", fontWeight: 600, color: score ? C.green : "#aaa" }}>
                  {score ? `${score}/10` : "—"}
                </div>

                {/* Published status */}
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "3px 8px", borderRadius: "6px",
                    background: listing.isPublished ? "#ECFDF5" : "#F9FAFB",
                    color: listing.isPublished ? "#059669" : "#aaa",
                    fontSize: "10px", fontWeight: 600,
                  }}>
                    {listing.isPublished ? "Live" : "Draft"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <a
                    href={`/marketplace/${listing.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "5px 10px", borderRadius: "7px",
                      border: "1px solid #E4E4E7", background: "#fff",
                      fontSize: "12px", color: C.muted,
                      textDecoration: "none", display: "inline-block",
                    }}
                  >
                    View ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
