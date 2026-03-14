"use client";

import { useState, useEffect } from "react";
import { C, FONT } from "@/lib/tokens";

interface Category {
  id: string;
  key: string;
  name: string;
  emoji: string;
  color: string;
  wash: string;
  sort_order: number;
  active: boolean;
}

const EMPTY_FORM = { key: "", name: "", emoji: "✦", color: "#22A06B", wash: "#F0FDF4", sort_order: 0, active: true };

export default function CrmCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/crm/categories");
    if (!res.ok) {
      const text = await res.text();
      setError(text || `Error ${res.status}`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal({ open: true, editing: null });
    setError(null);
  }

  function openEdit(cat: Category) {
    setForm({ key: cat.key, name: cat.name, emoji: cat.emoji, color: cat.color, wash: cat.wash, sort_order: cat.sort_order, active: cat.active });
    setModal({ open: true, editing: cat });
    setError(null);
  }

  function closeModal() {
    setModal({ open: false, editing: null });
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const url = modal.editing ? `/api/crm/categories/${modal.editing.id}` : "/api/crm/categories";
    const method = modal.editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong");
      return;
    }
    closeModal();
    load();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    await fetch(`/api/crm/categories/${cat.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  const field = (label: string, key: keyof typeof form, type: "text" | "number" | "checkbox" = "text") => (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: "#666", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "6px" }}>
        {label}
      </label>
      {type === "checkbox" ? (
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form[key] as boolean}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
          />
          <span style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.ink }}>Active (visible in public UI)</span>
        </label>
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
          readOnly={key === "key" && !!modal.editing}
          style={{
            width: "100%", padding: "9px 12px", borderRadius: "8px",
            border: "1px solid #E4E4E7", fontFamily: FONT.sans, fontSize: "13px",
            color: C.ink, outline: "none", boxSizing: "border-box" as const,
            background: key === "key" && modal.editing ? "#F9FAFB" : "#fff",
          }}
        />
      )}
      {(key === "color" || key === "wash") && (
        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 20, height: 20, borderRadius: "4px", background: form[key] as string, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }} />
          <span style={{ fontFamily: FONT.sans, fontSize: "11px", color: "#aaa" }}>preview</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Categories
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"} — <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>marketplace_categories</code>
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: "10px 20px", borderRadius: "10px", background: C.green, border: "none", color: "#fff", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          + New category
        </button>
      </div>

      {loading ? (
        <div style={{ color: C.muted, fontFamily: FONT.sans, fontSize: "14px" }}>Loading…</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 120px 60px 60px 100px", padding: "10px 20px", borderBottom: "1px solid #F0F0F0", fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            <span />
            <span>Name</span>
            <span>Colour</span>
            <span>Wash</span>
            <span>Sort</span>
            <span>Active</span>
            <span />
          </div>

          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 120px 60px 60px 100px", alignItems: "center", padding: "14px 20px", borderBottom: i < categories.length - 1 ? "1px solid #F4F4F5" : "none", fontSize: "14px", color: C.ink }}
            >
              <span style={{ fontSize: "20px" }}>{cat.emoji}</span>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: 500 }}>{cat.name}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "6px", background: `${cat.color}15`, color: cat.color, fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                  {cat.emoji} {cat.name}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 18, height: 18, borderRadius: "4px", background: cat.color, flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }} />
                <code style={{ fontSize: "11px", color: "#666" }}>{cat.color}</code>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: 18, height: 18, borderRadius: "4px", background: cat.wash, flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }} />
                <code style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60px" }}>{cat.wash}</code>
              </div>

              <span style={{ color: "#aaa", fontSize: "13px" }}>{cat.sort_order}</span>

              <span style={{ fontSize: "11px", fontWeight: 600, color: cat.active ? "#059669" : "#aaa" }}>
                {cat.active ? "✓" : "✗"}
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(cat)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid #E4E4E7", background: "#fff", fontSize: "12px", color: C.muted, cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(cat)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid #FECACA", background: "#FFF5F5", fontSize: "12px", color: "#EF4444", cursor: "pointer" }}>
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: C.ink, margin: "0 0 24px" }}>
              {modal.editing ? "Edit category" : "New category"}
            </h2>

            {!modal.editing && field("Key (unique, immutable)", "key")}
            {field("Name", "name")}
            {field("Emoji", "emoji")}
            {field("Colour (hex)", "color")}
            {field("Wash (background, hex or gradient)", "wash")}
            {field("Sort order", "sort_order", "number")}
            {field("Active", "active", "checkbox")}

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FFF5F5", border: "1px solid #FECACA", color: "#EF4444", fontFamily: FONT.sans, fontSize: "13px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #E4E4E7", background: "#fff", fontFamily: FONT.sans, fontSize: "13px", color: C.muted, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: "10px 20px", borderRadius: "10px", background: saving ? "#aaa" : C.green, border: "none", color: "#fff", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, cursor: saving ? "wait" : "pointer" }}
              >
                {saving ? "Saving…" : modal.editing ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
