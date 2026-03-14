"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { C, FONT } from "@/lib/tokens";

interface Location {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

const EMPTY_FORM = { name: "", sort_order: 0, active: true };

export default function CrmLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Location | null }>({ open: false, editing: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/crm/locations");
    if (res.status === 401) { router.replace("/crm/login"); return; }
    if (!res.ok) {
      const text = await res.text();
      setError(text || `Error ${res.status}`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLocations(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    const nextOrder = locations.length > 0 ? Math.max(...locations.map((l) => l.sort_order)) + 1 : 1;
    setForm({ name: "", sort_order: nextOrder, active: true });
    setModal({ open: true, editing: null });
    setError(null);
  }

  function openEdit(loc: Location) {
    setForm({ name: loc.name, sort_order: loc.sort_order, active: loc.active });
    setModal({ open: true, editing: loc });
    setError(null);
  }

  function closeModal() {
    setModal({ open: false, editing: null });
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const url = modal.editing ? `/api/crm/locations/${modal.editing.id}` : "/api/crm/locations";
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

  async function toggleActive(loc: Location) {
    const res = await fetch(`/api/crm/locations/${loc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: loc.name, sort_order: loc.sort_order, active: !loc.active }),
    });
    if (res.ok) {
      setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, active: !loc.active } : l));
    }
  }

  async function handleDelete(loc: Location) {
    if (!confirm(`Delete location "${loc.name}"? This cannot be undone.`)) return;
    await fetch(`/api/crm/locations/${loc.id}`, { method: "DELETE" });
    setLocations((prev) => prev.filter((l) => l.id !== loc.id));
  }

  return (
    <div style={{ padding: "40px clamp(24px, 4vw, 56px)", fontFamily: FONT.sans }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px, 3vw, 28px)", color: C.ink, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Locations
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0 }}>
            {locations.length} location{locations.length !== 1 ? "s" : ""} — <code style={{ background: "#F4F4F5", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>marketplace_locations</code>
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: "10px 20px", borderRadius: "10px", background: C.green, border: "none", color: "#fff", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          + Add location
        </button>
      </div>

      {loading ? (
        <div style={{ color: C.muted, fontFamily: FONT.sans, fontSize: "14px" }}>Loading…</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #E4E4E7", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 100px", padding: "10px 20px", borderBottom: "1px solid #F0F0F0", fontSize: "10px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            <span>#</span>
            <span>Name</span>
            <span>Sort</span>
            <span>Active</span>
            <span />
          </div>

          {locations.map((loc, i) => (
            <div
              key={loc.id}
              style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 100px", alignItems: "center", padding: "13px 20px", borderBottom: i < locations.length - 1 ? "1px solid #F4F4F5" : "none" }}
            >
              <span style={{ fontSize: "12px", color: "#aaa" }}>{i + 1}</span>
              <span style={{ fontSize: "14px", color: C.ink, fontWeight: 500 }}>{loc.name}</span>
              <span style={{ fontSize: "13px", color: "#aaa" }}>{loc.sort_order}</span>

              <button
                onClick={() => toggleActive(loc)}
                title="Toggle active"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "3px 8px", borderRadius: "6px",
                  background: loc.active ? "#ECFDF5" : "#F9FAFB",
                  color: loc.active ? "#059669" : "#aaa",
                  border: "none", fontSize: "11px", fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT.sans,
                }}
              >
                {loc.active ? "✓ Active" : "Inactive"}
              </button>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(loc)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid #E4E4E7", background: "#fff", fontSize: "12px", color: C.muted, cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(loc)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid #FECACA", background: "#FFF5F5", fontSize: "12px", color: "#EF4444", cursor: "pointer" }}>
                  Del
                </button>
              </div>
            </div>
          ))}

          {locations.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
              No locations yet. Click "+ Add location" to create one.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "400px", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 400, color: C.ink, margin: "0 0 24px" }}>
              {modal.editing ? "Edit location" : "Add location"}
            </h2>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: "#666", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "6px" }}>Name</label>
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Khayelitsha"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E4E4E7", fontFamily: FONT.sans, fontSize: "13px", color: C.ink, outline: "none", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontFamily: FONT.sans, fontSize: "11px", fontWeight: 600, color: "#666", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "6px" }}>Sort order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E4E4E7", fontFamily: FONT.sans, fontSize: "13px", color: C.ink, outline: "none", boxSizing: "border-box" as const }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                <span style={{ fontFamily: FONT.sans, fontSize: "13px", color: C.ink }}>Active (visible in public UI)</span>
              </label>
            </div>

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
                disabled={saving || !form.name.trim()}
                style={{ padding: "10px 20px", borderRadius: "10px", background: saving || !form.name.trim() ? "#aaa" : C.green, border: "none", color: "#fff", fontFamily: FONT.sans, fontSize: "13px", fontWeight: 600, cursor: saving || !form.name.trim() ? "default" : "pointer" }}
              >
                {saving ? "Saving…" : modal.editing ? "Save changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
