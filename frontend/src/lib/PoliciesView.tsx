"use client";

import { useState } from "react";
import { requestZoneChange } from "@/lib/api";

type Zone = { id: number; name: string; city: string; base_premium: number; status: string };
type Policy = {
  id: number;
  max_coverage: number;
  premium_paid: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

interface PoliciesViewProps {
  activePolicy: Policy | null;
  allPolicies: Policy[];
  zones: Zone[];
  currentZone: Zone | null;
  riderId: number;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function PoliciesView({ activePolicy, allPolicies, zones, currentZone, riderId }: PoliciesViewProps) {
  const [selectedNewZone, setSelectedNewZone] = useState<string>("");
  const [zoneChangeScheduled, setZoneChangeScheduled] = useState<string | null>(null);

  const expiredPolicies = allPolicies
    .filter(p => !p.is_active)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const availableZones = zones.filter(z => z.id !== currentZone?.id);
  const nextCycleDate = activePolicy ? fmt(activePolicy.end_date) : "next cycle";

  async function handleScheduleZoneChange() {
    if (!selectedNewZone) return;
    const zone = zones.find(z => z.id.toString() === selectedNewZone);
    if (zone) {
      try { await requestZoneChange(riderId, zone.id); } catch { /* best-effort */ }
      setZoneChangeScheduled(zone.name);
    }
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <header className="flex items-baseline justify-between pt-5 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: "-0.5px" }}>Policies</h1>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: "#444", letterSpacing: "2px" }}>COVERAGE LEDGER</p>
        </div>
        <span className="font-mono text-xs" style={{ color: "#333" }}>#{new Date().getFullYear()}</span>
      </header>

      {/* Active policy card */}
      {activePolicy ? (
        <section
          className="rounded-2xl mb-6 relative overflow-hidden"
          style={{
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.28)",
          }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(22,163,74,0.2), transparent)" }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(22,163,74,0.12), transparent)" }} />

          <div className="relative p-5">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
                <span className="text-xs font-bold" style={{ color: "rgba(22,163,74,0.8)", letterSpacing: "2px" }}>
                  ACTIVE POLICY
                </span>
              </div>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(22,163,74,0.1)",
                  border: "1px solid rgba(22,163,74,0.35)",
                  color: "#4ade80",
                }}
              >
                🔒 UPI Autopay
              </span>
            </div>

            {/* Hero amount */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-1" style={{ color: "#555", letterSpacing: "2px" }}>MAX COVERAGE</p>
              <h2 className="font-black text-white" style={{ fontSize: 44, letterSpacing: "-2px", lineHeight: 1 }}>
                ₹{activePolicy.max_coverage.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "WEEKLY PREMIUM", value: `₹${activePolicy.premium_paid}`, sub: "/wk" },
                { label: "CYCLE START", value: fmt(activePolicy.start_date), sub: "" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="font-semibold mb-1.5" style={{ color: "#555", letterSpacing: "2px", fontSize: 9 }}>{label}</p>
                  <p className="font-bold text-white text-sm">{value}<span className="font-normal text-xs" style={{ color: "#555" }}>{sub}</span></p>
                </div>
              ))}
              <div className="rounded-xl p-3 col-span-2" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="font-semibold mb-1.5" style={{ color: "#555", letterSpacing: "2px", fontSize: 9 }}>NEXT RENEWAL</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white text-sm">{fmt(activePolicy.end_date)}</p>
                  <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#4ade80" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
                    Auto-renews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl p-6 mb-6 flex items-center justify-center" style={{ border: "1px dashed #1f1f1f" }}>
          <p className="text-sm animate-pulse" style={{ color: "#555" }}>Loading active policy…</p>
        </section>
      )}

      {/* Coverage history */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-bold" style={{ color: "#444", letterSpacing: "2px" }}>COVERAGE HISTORY</h2>
          <div className="flex-1 h-px" style={{ background: "#1a1a1a" }} />
          {expiredPolicies.length > 0 && (
            <span className="text-xs font-mono" style={{ color: "#333" }}>
              {expiredPolicies.length} cycle{expiredPolicies.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {expiredPolicies.length === 0 ? (
          <div className="text-center py-10 rounded-2xl" style={{ border: "1px dashed #1a1a1a" }}>
            <p className="text-sm" style={{ color: "#555" }}>No previous cycles yet.</p>
            <p className="text-xs mt-1.5" style={{ color: "#333" }}>Your history builds here with every renewal.</p>
          </div>
        ) : (
          <div className="relative pl-5">
            {/* Timeline thread */}
            <div
              className="absolute left-[8px] top-2 bottom-2 w-px"
              style={{ background: "linear-gradient(to bottom, rgba(22,163,74,0.3), rgba(255,255,255,0.05) 70%, transparent)" }}
            />
            <div className="space-y-2">
              {expiredPolicies.map(policy => (
                <div key={policy.id} className="relative flex items-start gap-3">
                  {/* Node */}
                  <div
                    className="absolute -left-5 mt-3.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "#1f1f1f", border: "1.5px solid #2a2a2a" }}
                  />
                  <div
                    className="flex-1 rounded-xl p-3.5 flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid #1a1a1a",
                      opacity: 0.65,
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#666" }}>
                        {fmt(policy.start_date)}<span style={{ color: "#333", margin: "0 6px" }}>→</span>{fmt(policy.end_date)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#444" }}>
                        Up to ₹{policy.max_coverage.toLocaleString("en-IN")} coverage
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-sm" style={{ color: "#555" }}>₹{policy.premium_paid}</p>
                      <p className="font-bold uppercase mt-0.5" style={{ color: "#333", letterSpacing: "1.5px", fontSize: 9 }}>Expired</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Zone change */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-bold" style={{ color: "#444", letterSpacing: "2px" }}>DELIVERY ZONE</h2>
          <div className="flex-1 h-px" style={{ background: "#1a1a1a" }} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1f1f1f" }}>
          {/* Current zone strip */}
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #1a1a1a" }}
          >
            <div className="flex items-center gap-2" style={{ color: "#555" }}>
              <span className="text-sm">📍</span>
              <span className="text-xs font-medium">Current Zone</span>
            </div>
            <span className="text-sm font-bold text-white">{currentZone?.name ?? "—"}</span>
          </div>

          <div className="p-5">
            {zoneChangeScheduled ? (
              <div className="rounded-xl p-4 flex gap-3" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
                <span className="text-sm flex-shrink-0 mt-0.5">🕐</span>
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: "#fbbf24" }}>Change Scheduled</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,158,11,0.65)" }}>
                    Switch to <span style={{ color: "#fbbf24", fontWeight: 600 }}>{zoneChangeScheduled}</span> takes
                    effect on <span style={{ color: "#fbbf24", fontWeight: 600 }}>{nextCycleDate}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="rounded-xl p-3.5 mb-4 flex gap-2.5 items-start"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}
                >
                  <span className="text-sm flex-shrink-0 mt-px" style={{ color: "#f59e0b" }}>⚠</span>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(245,158,11,0.65)" }}>
                    Zone changes take effect at the{" "}
                    <span style={{ color: "#fbbf24", fontWeight: 600 }}>start of your next billing cycle</span>,
                    not immediately.
                  </p>
                </div>

                <select
                  value={selectedNewZone}
                  onChange={e => setSelectedNewZone(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none mb-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedNewZone ? "rgba(245,158,11,0.4)" : "#1f1f1f"}`,
                  }}
                >
                  <option value="" style={{ background: "#111" }}>Select new zone…</option>
                  {availableZones.map(z => (
                    <option key={z.id} value={z.id} style={{ background: "#111" }}>
                      {z.name} — ₹{z.base_premium}/wk base
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleScheduleZoneChange}
                  disabled={!selectedNewZone}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-30"
                  style={{
                    background: selectedNewZone ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedNewZone ? "rgba(245,158,11,0.3)" : "#1a1a1a"}`,
                    color: selectedNewZone ? "#fbbf24" : "#444",
                  }}
                >
                  Schedule Zone Change for Next Cycle →
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
