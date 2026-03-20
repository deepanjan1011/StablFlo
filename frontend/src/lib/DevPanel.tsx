"use client";

import { useState, useEffect } from "react";

type Zone = { id: number; name: string; city: string; base_premium: number; status: string };
type Policy = { id: number; max_coverage: number; premium_paid: number; start_date: string; end_date: string; is_active: boolean };
type Claim = { id: number; trigger_type: string; amount: number; timestamp: string; status: string };

interface DevPanelProps {
  zones: Zone[];
  activePolicy: Policy | null;
  riderId: number | null;
  onSkipOnboarding: (zone: Zone) => void;
  onSimulateEvent: (triggerType: string, severity: number) => void;
  onSetCoverage: (amount: number) => void;
  onReset: () => void;
}

export function DevPanel({ zones, activePolicy, riderId, onSkipOnboarding, onSimulateEvent, onSetCoverage, onReset }: DevPanelProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [coverage, setCoverage] = useState(activePolicy?.max_coverage ?? 32000);

  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsPanelOpen(false); };
      document.addEventListener("keydown", onKey);
      return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isPanelOpen]);

  useEffect(() => {
    if (activePolicy?.max_coverage !== undefined) {
      setCoverage(activePolicy.max_coverage);
    }
  }, [activePolicy?.max_coverage]);

  function adjustCoverage(delta: number) {
    const next = Math.min(100000, Math.max(5000, coverage + delta));
    setCoverage(next);
    onSetCoverage(next);
  }

  function dispatchEvent(triggerType: string, severity: number) {
    if (riderId) {
      onSimulateEvent(triggerType, severity);
    } else {
      alert("Please complete onboarding first so the AI knows your specific income & zone!");
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsPanelOpen(true)}
        aria-label="Open dev panel"
        className="fixed flex items-center justify-center"
        style={{
          bottom: 80,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#1a1a1a",
          border: "1px solid #333",
          fontSize: 16,
          zIndex: 40,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        ⚙
      </button>

      {/* Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setIsPanelOpen(false)}
          />
          {/* Sheet */}
          <div
            className="relative z-10 px-5 pb-8 pt-4"
            style={{
              background: "#0f0f0f",
              borderTop: "1px solid #222",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* Handle */}
            <div className="mx-auto mb-4" style={{ width: 32, height: 3, background: "#2a2a2a", borderRadius: 2 }} />

            {/* Title */}
            <p className="text-xs font-black mb-4" style={{ color: "#555", letterSpacing: "2px" }}>⚙ DEV PANEL</p>

            {/* Skip Onboarding */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Skip Onboarding</p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>Jump to dashboard instantly</p>
              </div>
              <button
                onClick={() => { if (zones[0]) { onSkipOnboarding(zones[0]); setIsPanelOpen(false); } }}
                disabled={zones.length === 0}
                className="text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                style={{ background: "#16a34a", color: "#fff" }}
              >
                GO
              </button>
            </div>

            {/* Inject Claims */}
            <div
              className="rounded-xl px-4 py-3 mb-3"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <p className="text-sm font-semibold text-white mb-3">Inject Claim</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "🌧️ Rain", type: "rain", severity: 1.0 },
                  { label: "☀️ Heat", type: "heat", severity: 1.0 },
                  { label: "🏭 AQI", type: "aqi", severity: 1.0 },
                ].map(({ label, type, severity }) => (
                  <button
                    key={type}
                    onClick={() => dispatchEvent(type, severity)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "#222", border: "1px solid #444", color: "#ccc" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage ± */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
              style={{ background: "#111", border: "1px solid #1a1a1a" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Coverage</p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>Max payout amount</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustCoverage(-5000)}
                  className="text-sm font-bold px-3 py-1 rounded-lg"
                  style={{ background: "#1a1a1a", border: "1px solid #333", color: "#555" }}
                >
                  −
                </button>
                <span className="text-sm font-bold text-white" style={{ minWidth: 60, textAlign: "center" }}>
                  ₹{coverage.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => adjustCoverage(5000)}
                  className="text-sm font-bold px-3 py-1 rounded-lg"
                  style={{ background: "#1a1a1a", border: "1px solid #333", color: "#555" }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Reset */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>Reset to Onboarding</p>
              <button
                onClick={() => { onReset(); setIsPanelOpen(false); }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
