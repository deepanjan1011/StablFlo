"use client";

import { useState, type ReactNode } from "react";

interface SettingsViewProps {
  riderId: number;
  onLogout: () => void;
}

const LANGUAGES = ["English", "Hindi", "Kannada", "Telugu"];

type Dialog = "cancel-policy" | "delete-account" | null;

export function SettingsView({ riderId: _riderId, onLogout }: SettingsViewProps) {
  const [upiId, setUpiId] = useState("");
  const [editingUpi, setEditingUpi] = useState(false);
  const [upiDraft, setUpiDraft] = useState("");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [langIndex, setLangIndex] = useState(0);
  const [thresholdsExpanded, setThresholdsExpanded] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);

  function startEditUpi() {
    setUpiDraft(upiId);
    setEditingUpi(true);
  }

  function saveUpi() {
    setUpiId(upiDraft.trim());
    setEditingUpi(false);
  }

  return (
    <div className="pt-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: "-0.5px" }}>Settings</h1>
        <p className="text-xs mt-1" style={{ color: "#555" }}>Manage your account</p>
      </div>

      {/* GROUP: Payments */}
      <SectionLabel>Payments</SectionLabel>
      <SettingsCard className="mb-4">
        {editingUpi ? (
          <div className="p-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "#555", letterSpacing: "1.5px" }}>EDIT UPI ID</p>
            <input
              value={upiDraft}
              onChange={e => setUpiDraft(e.target.value)}
              placeholder="yourname@upi"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white mb-3 focus:outline-none"
              style={{ background: "#0a0a0a", border: "1px solid #333" }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={saveUpi} className="flex-1 py-2 rounded-lg text-sm font-bold" style={{ background: "#16a34a", color: "#fff" }}>
                Save
              </button>
              <button onClick={() => setEditingUpi(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#555" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <SettingsRow
            icon="💳"
            iconBg="rgba(22,163,74,0.1)"
            title="UPI ID"
            subtitle={upiId || "Not set"}
            right={<span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }} onClick={startEditUpi} role="button" tabIndex={0}>Edit →</span>}
          />
        )}
      </SettingsCard>

      {/* GROUP: Preferences */}
      <SectionLabel>Preferences</SectionLabel>
      <SettingsCard className="mb-4">
        <SettingsRow
          icon="🔔"
          iconBg="rgba(245,158,11,0.1)"
          title="Notifications"
          subtitle="Payouts, weather alerts, renewals"
          right={
            <button
              onClick={() => setNotificationsOn(v => !v)}
              className="flex-shrink-0"
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: notificationsOn ? "#16a34a" : "#2a2a2a",
                position: "relative",
                transition: "background 0.2s",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: notificationsOn ? 20 : 3,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
          }
          divider
        />
        <SettingsRow
          icon="🌐"
          iconBg="rgba(59,130,246,0.1)"
          title="Language"
          subtitle={LANGUAGES[langIndex]}
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setLangIndex(i => (i + 1) % LANGUAGES.length)} role="button" tabIndex={0}>▾</span>}
        />
      </SettingsCard>

      {/* GROUP: Coverage */}
      <SectionLabel>Coverage</SectionLabel>
      <SettingsCard className="mb-4">
        <SettingsRow
          icon="📍"
          iconBg="rgba(139,92,246,0.1)"
          title="Zone & Thresholds"
          subtitle="Rain 60mm · Heat 44°C · AQI 400"
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setThresholdsExpanded(v => !v)} role="button" tabIndex={0}>→</span>}
        />
        {thresholdsExpanded && (
          <div className="px-4 pb-4">
            <div className="rounded-xl p-3" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
              {[
                { icon: "🌧️", label: "Severe Rain", rule: "Rain > 60mm/hr triggers a payout" },
                { icon: "☀️", label: "Extreme Heat", rule: "Temperature > 44°C triggers a payout" },
                { icon: "🏭", label: "Hazardous AQI", rule: "AQI > 400 triggers a payout" },
              ].map(({ icon, label, rule }) => (
                <div key={label} className="flex gap-3 py-2" style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <span>{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#555" }}>{rule}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SettingsCard>

      {/* GROUP: About */}
      <SectionLabel>About</SectionLabel>
      <SettingsCard className="mb-4">
        <SettingsRow
          icon="ℹ️"
          iconBg="rgba(107,114,128,0.1)"
          title="About StablFlo"
          subtitle="How it works · FAQ · v1.0.0"
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setAboutExpanded(v => !v)} role="button" tabIndex={0}>→</span>}
        />
        {aboutExpanded && (
          <div className="px-4 pb-4">
            <div className="rounded-xl p-3 space-y-3" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
              <div>
                <p className="text-xs font-bold text-white mb-1">How it works</p>
                <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
                  StablFlo is parametric insurance — payouts trigger automatically when weather or AQI crosses a preset threshold in your zone. No claims forms, no waiting.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-white mb-1">FAQ</p>
                {[
                  ["When do I get paid?", "Within seconds of a trigger event being detected."],
                  ["Can I change zones?", "Yes — go to Policies tab and schedule a zone change for next cycle."],
                  ["Is this real money?", "In production yes, via Razorpay X UPI payouts."],
                ].map(([q, a]) => (
                  <div key={q} className="mb-2">
                    <p className="text-xs font-semibold" style={{ color: "#777" }}>{q}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#555" }}>{a}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono" style={{ color: "#333" }}>v1.0.0 · StablFlo · DEVTrails 2026</p>
            </div>
          </div>
        )}
      </SettingsCard>



      {/* GROUP: Danger Zone */}
      <p className="text-xs font-bold mb-2" style={{ color: "rgba(239,68,68,0.5)", letterSpacing: "2px" }}>DANGER ZONE</p>
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <SettingsRow
          icon="🚫"
          iconBg="rgba(239,68,68,0.1)"
          title="Cancel Policy"
          titleColor="#ef4444"
          divider
          right={<span style={{ color: "rgba(239,68,68,0.4)", fontSize: 13 }} onClick={() => setDialog("cancel-policy")} role="button" tabIndex={0}>→</span>}
        />
        <SettingsRow
          icon="🗑️"
          iconBg="rgba(239,68,68,0.1)"
          title="Delete Account"
          titleColor="#ef4444"
          right={<span style={{ color: "rgba(239,68,68,0.4)", fontSize: 13 }} onClick={() => setDialog("delete-account")} role="button" tabIndex={0}>→</span>}
        />
      </div>

      {/* Confirmation dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-xs rounded-2xl p-6" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
            <p className="font-bold text-white mb-2" style={{ fontSize: 16 }}>
              {dialog === "cancel-policy" ? "Cancel Policy?" : "Delete Account?"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#555" }}>
              {dialog === "cancel-policy"
                ? "This will cancel your active coverage. Payouts will stop immediately."
                : "This will permanently delete your account and all data."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDialog(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#1a1a1a", color: "#777" }}>
                Cancel
              </button>
              <button onClick={() => setDialog(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Internal helpers ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold mb-2" style={{ color: "#444", letterSpacing: "2px" }}>
      {children.toUpperCase()}
    </p>
  );
}

function SettingsCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ background: "#111", border: "1px solid #1a1a1a" }}>
      {children}
    </div>
  );
}

interface SettingsRowProps {
  icon: string;
  iconBg: string;
  title: string;
  titleColor?: string;
  subtitle?: string;
  right?: ReactNode;
  divider?: boolean;
}

function SettingsRow({ icon, iconBg, title, titleColor = "#fff", subtitle, right, divider }: SettingsRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: divider ? "1px solid #1a1a1a" : undefined }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: titleColor }}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: "#555" }}>{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0 cursor-pointer">{right}</div>}
    </div>
  );
}
