"use client";

import { useState } from "react";

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
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function PoliciesView({ activePolicy, allPolicies, zones, currentZone }: PoliciesViewProps) {
  const [selectedNewZone, setSelectedNewZone] = useState<string>("");
  const [zoneChangeScheduled, setZoneChangeScheduled] = useState<string | null>(null);

  const expiredPolicies = allPolicies
    .filter((p) => !p.is_active)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const availableZones = zones.filter((z) => z.id !== currentZone?.id);

  const nextCycleDate = activePolicy ? formatDate(activePolicy.end_date) : "next cycle";

  function handleScheduleZoneChange() {
    if (!selectedNewZone) return;
    const zone = zones.find((z) => z.id.toString() === selectedNewZone);
    if (zone) setZoneChangeScheduled(zone.name);
  }

  return (
    <div className="flex flex-col pb-6">
      {/* Page header */}
      <header className="flex items-baseline justify-between mb-7 pt-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Policies</h1>
          <p className="text-zinc-500 text-xs mt-0.5 tracking-wide uppercase">Coverage Ledger</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-600 tracking-widest">
          #{new Date().getFullYear()}
        </span>
      </header>

      {/* ── ACTIVE POLICY CARD ─────────────────────────────── */}
      {activePolicy ? (
        <section
          className="relative overflow-hidden rounded-2xl mb-7 z-10"
          style={{
            background:
              "linear-gradient(145deg, rgba(22,163,74,0.18) 0%, rgba(22,163,74,0.06) 60%, rgba(0,0,0,0) 100%)",
            border: "1px solid rgba(22,163,74,0.35)",
            boxShadow: "0 0 40px rgba(22,163,74,0.12), inset 0 1px 0 rgba(22,163,74,0.2)",
          }}
        >
          {/* Ambient glow blobs */}
          <div
            className="absolute -top-6 -right-6 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)" }}
          />

          <div className="relative p-5">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: "#16a34a" }}
                />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80">
                  Active Policy
                </span>
              </div>

              {/* Locked badge */}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{
                  background: "rgba(22,163,74,0.12)",
                  border: "1px solid rgba(22,163,74,0.4)",
                  color: "#4ade80",
                }}
              >
                <LockIcon />
                Locked · UPI Autopay
              </span>
            </div>

            {/* Coverage amount — the hero number */}
            <div className="mb-6">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.15em] mb-1">Max Coverage</p>
              <h2
                className="text-5xl font-bold tracking-tight"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 30px rgba(22,163,74,0.3)",
                }}
              >
                ₹{activePolicy.max_coverage.toLocaleString("en-IN")}
              </h2>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] mb-1.5">
                  Weekly Premium
                </p>
                <p className="text-white font-bold text-base">
                  ₹{activePolicy.premium_paid}
                  <span className="text-zinc-500 text-xs font-normal"> /wk</span>
                </p>
              </div>

              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] mb-1.5">
                  Cycle Start
                </p>
                <p className="text-white font-semibold text-sm">{formatDate(activePolicy.start_date)}</p>
              </div>

              <div
                className="rounded-xl p-3 col-span-2"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-zinc-600 text-[9px] uppercase tracking-[0.15em] mb-1.5">
                  Next Renewal
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">
                    {formatDate(activePolicy.end_date)}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#4ade80" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "#16a34a" }}
                    />
                    Auto-renews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section
          className="rounded-2xl p-6 mb-7 z-10 flex items-center justify-center"
          style={{ border: "1px dashed rgba(255,255,255,0.08)" }}
        >
          <p className="text-zinc-600 text-sm animate-pulse">Loading active policy…</p>
        </section>
      )}

      {/* ── HISTORICAL LEDGER ──────────────────────────────── */}
      <section className="z-10 mb-7">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em]">
            Coverage History
          </h3>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          {expiredPolicies.length > 0 && (
            <span className="text-[10px] text-zinc-600 font-mono">
              {expiredPolicies.length} cycle{expiredPolicies.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {expiredPolicies.length === 0 ? (
          <div
            className="text-center py-10 rounded-2xl"
            style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
          >
            <p className="text-zinc-500 text-sm">No previous cycles yet.</p>
            <p className="text-zinc-600 text-xs mt-1.5 leading-relaxed">
              Your history will build here with every renewal.
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Vertical timeline thread */}
            <div
              className="absolute left-[9px] top-3 bottom-3 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(22,163,74,0.3) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)",
              }}
            />

            <div className="space-y-2.5">
              {expiredPolicies.map((policy) => (
                <div key={policy.id} className="relative flex items-start gap-3.5">
                  {/* Timeline node */}
                  <div
                    className="absolute -left-6 mt-[14px] w-[9px] h-[9px] rounded-full flex-shrink-0"
                    style={{
                      background: "#27272a",
                      border: "1.5px solid #3f3f46",
                    }}
                  />

                  {/* Entry card */}
                  <div
                    className="flex-1 rounded-xl p-3.5 flex items-center justify-between transition-opacity"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      opacity: 0.65,
                    }}
                  >
                    <div>
                      <p className="text-zinc-300 text-sm font-medium leading-snug">
                        {formatDate(policy.start_date)}
                        <span className="text-zinc-600 mx-1.5">→</span>
                        {formatDate(policy.end_date)}
                      </p>
                      <p className="text-zinc-600 text-[11px] mt-0.5">
                        Up to ₹{policy.max_coverage.toLocaleString("en-IN")} coverage
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-zinc-300 font-bold">₹{policy.premium_paid}</p>
                      <p
                        className="text-[9px] uppercase tracking-[0.15em] mt-0.5 font-semibold"
                        style={{ color: "#52525b" }}
                      >
                        Expired
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── ZONE CHANGE ────────────────────────────────────── */}
      <section className="z-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.18em]">
            Delivery Zone
          </h3>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Current zone strip */}
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 text-zinc-400">
              <MapIcon />
              <span className="text-xs font-medium">Current Zone</span>
            </div>
            <span className="text-white text-sm font-semibold">{currentZone?.name ?? "—"}</span>
          </div>

          <div className="p-5">
            {zoneChangeScheduled ? (
              /* Scheduled state */
              <div
                className="rounded-xl p-4 flex gap-3"
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-amber-300 text-sm font-bold mb-1">Change Scheduled</p>
                  <p className="text-amber-400/70 text-xs leading-relaxed">
                    Switch to{" "}
                    <span className="text-amber-300 font-semibold">{zoneChangeScheduled}</span> will
                    take effect on{" "}
                    <span className="text-amber-300 font-semibold">{nextCycleDate}</span>, the start
                    of your next billing cycle.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Warning notice */}
                <div
                  className="rounded-xl p-3.5 mb-4 flex gap-2.5 items-start"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.15)",
                  }}
                >
                  <span className="text-amber-500 text-sm flex-shrink-0 mt-px">⚠</span>
                  <p className="text-amber-400/75 text-xs leading-relaxed">
                    Zone changes take effect at the{" "}
                    <span className="text-amber-300 font-semibold">start of your next billing cycle</span>
                    , not immediately. Your current coverage continues unchanged.
                  </p>
                </div>

                {/* Zone selector */}
                <select
                  value={selectedNewZone}
                  onChange={(e) => setSelectedNewZone(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all mb-3"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${selectedNewZone ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <option value="" style={{ background: "#18181b" }}>
                    Select new zone…
                  </option>
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id} style={{ background: "#18181b" }}>
                      {z.name} — ₹{z.base_premium}/wk base
                    </option>
                  ))}
                </select>

                {/* Schedule button */}
                <button
                  onClick={handleScheduleZoneChange}
                  disabled={!selectedNewZone}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selectedNewZone
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedNewZone ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}`,
                    color: selectedNewZone ? "#fbbf24" : "#52525b",
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
