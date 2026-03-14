"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { C, FONT } from "@/lib/tokens";

interface Profile {
  id:               string;
  user_id:          string;
  business_name:    string;
  tagline:          string | null;
  description:      string | null;
  category:         string | null;
  locations:        string[];
  whatsapp_number:  string | null;
  website:          string | null;
  response_time:    string | null;
  is_published:     boolean;
  is_verified:      boolean;
  profile_photo_url: string | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{ display: "block", fontFamily: FONT.sans, fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: C.muted, marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT = {
  width: "100%", padding: "10px 12px", borderRadius: "10px",
  border: "1px solid #E4E4E7", fontFamily: FONT.sans,
  fontSize: "13px", color: C.ink, outline: "none",
  background: "#fff", boxSizing: "border-box" as const,
};

const TEXTAREA = { ...INPUT, resize: "vertical" as const };

export default function CrmProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [categories, setCategories] = useState<{ key: string; name: string }[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);

  // Form state (mirrors profile fields)
  const [form, setForm] = useState({
    business_name: "",
    tagline: "",
    description: "",
    category: "",
    locations: [] as string[],
    whatsapp_number: "",
    website: "",
    response_time: "",
    is_published: false,
    is_verified: false,
  });

  useEffect(() => {
    async function load() {
      const [profileRes, catsRes, locsRes] = await Promise.all([
        fetch(`/api/crm/profiles/${id}`),
        fetch("/api/crm/categories"),
        fetch("/api/crm/locations"),
      ]);

      if (profileRes.status === 401) { router.replace("/crm/login"); return; }
      if (!profileRes.ok) { setError("Profile not found."); setLoading(false); return; }

      const p: Profile = await profileRes.json();
      setProfile(p);
      setForm({
        business_name:  p.business_name,
        tagline:        p.tagline ?? "",
        description:    p.description ?? "",
        category:       p.category ?? "",
        locations:      p.locations ?? [],
        whatsapp_number: p.whatsapp_number ?? "",
        website:        p.website ?? "",
        response_time:  p.response_time ?? "",
        is_published:   p.is_published,
        is_verified:    p.is_verified,
      });

      if (catsRes.ok) setCategories(await catsRes.json());
      if (locsRes.ok) {
        const locs = await locsRes.json();
        setAllLocations(locs.map((l: { name: string }) => l.name));
      }

      setLoading(false);
    }
    load();
  }, [id, router]);

  function toggleLocation(loc: string) {
    setForm((f) => ({
      ...f,
      locations: f.locations.includes(loc)
        ? f.locations.filter((l) => l !== loc)
        : [...f.locations, loc],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/crm/profiles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tagline:        form.tagline.trim() || null,
        description:    form.description.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        website:        form.website.trim() || null,
        response_time:  form.response_time.trim() || null,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Save failed.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) return <div style={{ padding: "40px", fontFamily: FONT.sans, color: C.muted }}>Loading…</div>;
  if (error && !profile) return (
    <div style={{ padding: "40px", fontFamily: FONT.sans }}>
      <div style={{ color: "#EF4444", marginBottom: "12px" }}>{error}</div>
      <Link href="/crm/users" style={{ color: C.green, fontSize: "13px" }}>← Back to Profiles</Link>
    </div>
  );

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans, maxWidth: "720px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Link href="/crm/users" style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
          ← Profiles
        </Link>
        <h1 style={{ fontFamily: FONT.serif, fontSize: "clamp(20px, 3vw, 26px)", color: C.ink, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {profile?.business_name}
        </h1>
        <div style={{ fontSize: "12px", color: "#bbb", fontFamily: "monospace" }}>{id}</div>
      </div>

      <form onSubmit={handleSave}>
        {/* Status toggles */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", padding: "16px 20px", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #E4E4E7" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.ink }}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: C.green, cursor: "pointer" }}
            />
            Published (Live)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 500, color: C.ink }}>
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: "#2563EB", cursor: "pointer" }}
            />
            Verified
          </label>
        </div>

        {/* Core fields */}
        <Field label="Business name">
          <input style={INPUT} value={form.business_name} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} required />
        </Field>

        <Field label="Tagline">
          <input style={INPUT} value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Short punchy line" />
        </Field>

        <Field label="Description">
          <textarea style={TEXTAREA} rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="About the business…" />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="WhatsApp number">
            <input style={INPUT} value={form.whatsapp_number} onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))} placeholder="0XX XXX XXXX" />
          </Field>
          <Field label="Website">
            <input style={INPUT} value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://…" />
          </Field>
        </div>

        <Field label="Response time">
          <select
            value={form.response_time}
            onChange={(e) => setForm((f) => ({ ...f, response_time: e.target.value }))}
            style={{ ...INPUT, appearance: "auto" }}
          >
            <option value="">— not set —</option>
            <option>Usually replies within 1 hour</option>
            <option>Usually replies within a few hours</option>
            <option>Usually replies within 1 day</option>
            <option>Usually replies within 2–3 days</option>
          </select>
        </Field>

        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            style={{ ...INPUT, appearance: "auto" }}
          >
            <option value="">— select —</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Locations">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {allLocations.map((loc) => {
              const active = form.locations.includes(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  style={{
                    padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 500,
                    cursor: "pointer", fontFamily: FONT.sans,
                    border: active ? "none" : "1px solid #E4E4E7",
                    background: active ? C.ink : "#fff",
                    color: active ? "#fff" : C.muted,
                  }}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </Field>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FFF5F5", border: "1px solid #FECACA", color: "#EF4444", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "11px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
              border: "none", cursor: saving ? "default" : "pointer", fontFamily: FONT.sans,
              background: saving ? "#E4E4E7" : C.ink,
              color: saving ? C.muted : "#fff",
              transition: "background 150ms",
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && (
            <span style={{ fontFamily: FONT.sans, fontSize: "13px", color: "#059669", fontWeight: 500 }}>
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
