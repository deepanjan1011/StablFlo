# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual overhaul of StablFlo's Next.js PWA to a cohesive Fintech Dark aesthetic — new ProfileDrawer, full Settings page, redesigned onboarding and dashboard, and restyled Policies tab.

**Architecture:** Pure frontend work — no backend changes. Two new components (`ProfileDrawer.tsx`, `SettingsView.tsx`) are created as isolated files; existing `page.tsx` and `PoliciesView.tsx` are restyled. All state stays in `page.tsx` and flows down as props.

**Tech Stack:** Next.js 16.2 App Router, TypeScript, Tailwind CSS v4 (inline styles used for one-off values not in the theme). `"use client"` directive required on all components using hooks.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/lib/ProfileDrawer.tsx` | **Create** | Slide-up drawer overlay showing rider identity + stats |
| `frontend/src/lib/SettingsView.tsx` | **Create** | Full settings page: UPI, notifications, language, thresholds, about, danger zone |
| `frontend/src/app/page.tsx` | **Modify** | Onboarding redesign + home tab redesign + new state + import new components |
| `frontend/src/lib/PoliciesView.tsx` | **Modify** | Restyle to fintech dark — no logic changes |

---

## Context for All Tasks

**Design tokens** (use inline styles for these — they are not in the Tailwind theme):
- Base bg: `#080808`
- Card bg: `#111`
- Drawer bg: `#0f0f0f`
- Row bg: `#141414`
- Border default: `#1a1a1a`
- Border active: `#16a34a30` (cards with green tint)
- Primary green: `#16a34a`
- Success text: `#4ade80`
- Muted text: `#555`
- Section labels: `#444`

**Tailwind classes available** (from `globals.css`): `glass`, `glass-card`, `animate-pulse-glow`.

**AGENTS.md warning:** This is Next.js 16.2 with breaking changes. Follow existing patterns in `page.tsx` exactly — `"use client"`, `useState`, `useEffect`. Do not use `getServerSideProps` or `getStaticProps`. All components are client components.

**Verification:** Each task ends with a visual check. Run `cd frontend && npm run dev` from the project root. The app runs on `http://localhost:3000`.

**Monogram rule:** From the phone number stored in state (`phone`), take the last 10 digits, then take `digits[0]` and `digits[5]`. E.g., `"919876543210"` → last 10: `"9876543210"` → `"9"` + `"4"` = `"94"`. The spec example `"93"` is a minor typo — implement the rule (index 0 + 5), not the example.

---

## Task 1: Create ProfileDrawer Component

**Files:**
- Create: `frontend/src/lib/ProfileDrawer.tsx`

This is a self-contained component. No tests exist in this project for UI components — verify visually.

- [ ] **Step 1: Create the file with the component**

```tsx
"use client";

import { useEffect } from "react";

type Zone = { id: number; name: string; city: string; base_premium: number; status: string };
type Policy = { id: number; max_coverage: number; premium_paid: number; start_date: string; end_date: string; is_active: boolean };
type Claim = { id: number; trigger_type: string; amount: number; timestamp: string; status: string };

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  upiId: string;
  zone: Zone | null;
  activePolicy: Policy | null;
  claims: Claim[];
}

function formatMonogram(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length < 6) return digits.slice(0, 2).toUpperCase() || "??";
  return (digits[0] + digits[5]).toUpperCase();
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatWeeksActive(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(1, Math.floor(ms / 604800000));
}

export function ProfileDrawer({ isOpen, onClose, phone, upiId, zone, activePolicy, claims }: ProfileDrawerProps) {
  const monogram = formatMonogram(phone);
  const paidClaims = claims.filter(c => c.status === "paid");
  const totalPaid = paidClaims.reduce((sum, c) => sum + c.amount, 0);
  const weeksActive = activePolicy ? formatWeeksActive(activePolicy.start_date) : 1;
  const memberSince = activePolicy ? formatMemberSince(activePolicy.start_date) : "—";

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative z-10 px-5 pb-8 pt-4"
        style={{
          background: "#0f0f0f",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: "1px solid #1f1f1f",
        }}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-5"
          style={{ width: 36, height: 3, background: "#2a2a2a", borderRadius: 2 }}
        />

        {/* Rider identity */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex-shrink-0 flex items-center justify-center font-black text-white"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              fontSize: 20,
              boxShadow: "0 0 0 3px rgba(22,163,74,0.25)",
            }}
          >
            {monogram}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate" style={{ fontSize: 17 }}>{phone}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "#555" }}>
              {upiId || "UPI not set"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#555" }}>
              {zone?.name ?? "—"}
            </p>
          </div>
          <span
            className="flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: "rgba(22,163,74,0.12)",
              border: "1px solid rgba(22,163,74,0.3)",
              color: "#16a34a",
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "CLAIMS", value: paidClaims.length.toString(), color: "#4ade80" },
            { label: "PAID OUT", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "#fff" },
            { label: "WEEKS", value: weeksActive.toString(), color: "#fff" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: "#141414", border: "1px solid #1f1f1f" }}
            >
              <p className="text-xs mb-1 font-semibold" style={{ color: "#555", letterSpacing: "1.5px", fontSize: 9 }}>
                {label}
              </p>
              <p className="font-black text-xl" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <p className="text-xs" style={{ color: "#444" }}>
            Member since <span style={{ color: "#777" }}>{memberSince}</span>
          </p>
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg"
            style={{ background: "#141414", border: "1px solid #1f1f1f", color: "#555" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls frontend/src/lib/ProfileDrawer.tsx
```
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/ProfileDrawer.tsx
git commit -m "feat: add ProfileDrawer slide-up component"
```

---

## Task 2: Create SettingsView Component

**Files:**
- Create: `frontend/src/lib/SettingsView.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";

interface SettingsViewProps {
  riderId: number;
}

const LANGUAGES = ["English", "Hindi", "Kannada", "Telugu"];

type Dialog = "cancel-policy" | "delete-account" | null;

export function SettingsView({ riderId: _riderId }: SettingsViewProps) {
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
            right={<span style={{ color: "#16a34a", fontSize: 12, fontWeight: 600 }} onClick={startEditUpi}>Edit →</span>}
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
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setLangIndex(i => (i + 1) % LANGUAGES.length)}>▾</span>}
        />
      </SettingsCard>

      {/* GROUP: Coverage */}
      <SectionLabel>Coverage</SectionLabel>
      <SettingsCard className="mb-4">
        <SettingsRow
          icon="📍"
          iconBg="rgba(139,92,246,0.1)"
          title="Zone & Thresholds"
          subtitle="Rain 40mm · Heat 42°C · AQI 350"
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setThresholdsExpanded(v => !v)}>→</span>}
        />
        {thresholdsExpanded && (
          <div className="px-4 pb-4">
            <div className="rounded-xl p-3" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}>
              {[
                { icon: "🌧️", label: "Heavy Rain", rule: "Rain &gt; 40mm/hr triggers a payout" },
                { icon: "☀️", label: "Extreme Heat", rule: "Temperature &gt; 42°C triggers a payout" },
                { icon: "🏭", label: "Poor Air Quality", rule: "AQI &gt; 350 triggers a payout" },
              ].map(({ icon, label, rule }) => (
                <div key={label} className="flex gap-3 py-2" style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <span>{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#555" }} dangerouslySetInnerHTML={{ __html: rule }} />
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
          right={<span style={{ color: "#555", fontSize: 13 }} onClick={() => setAboutExpanded(v => !v)}>→</span>}
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
          right={<span style={{ color: "rgba(239,68,68,0.4)", fontSize: 13 }} onClick={() => setDialog("cancel-policy")}>→</span>}
        />
        <SettingsRow
          icon="🗑️"
          iconBg="rgba(239,68,68,0.1)"
          title="Delete Account"
          titleColor="#ef4444"
          right={<span style={{ color: "rgba(239,68,68,0.4)", fontSize: 13 }} onClick={() => setDialog("delete-account")}>→</span>}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold mb-2" style={{ color: "#444", letterSpacing: "2px" }}>
      {(children as string).toUpperCase()}
    </p>
  );
}

function SettingsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
  right?: React.ReactNode;
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
```

- [ ] **Step 2: Verify file created**

```bash
ls frontend/src/lib/SettingsView.tsx
```
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/SettingsView.tsx
git commit -m "feat: add SettingsView component with all 5 sections"
```

---

## Task 3: Redesign Onboarding Screen

**Files:**
- Modify: `frontend/src/app/page.tsx` (the `if (step === 0)` return block only)

The onboarding is the `if (step === 0) { return (...) }` block starting around line 95. Replace only that block — everything else in the file stays.

- [ ] **Step 1: Replace the `if (step === 0)` return block**

Find this block in `page.tsx`:
```tsx
  if (step === 0) {
    const sZone = zones.find(z => z.id.toString() === zoneId);

    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
        ...
      </main>
    );
  }
```

Replace it entirely with:
```tsx
  if (step === 0) {
    const sZone = zones.find(z => z.id.toString() === zoneId);

    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: "#080808" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="font-black text-white" style={{ fontSize: 30, letterSpacing: "-1px" }}>
              Stabl<span style={{ color: "#16a34a" }}>Flo</span>
            </h1>
            <p className="text-xs mt-1 font-semibold" style={{ color: "#555", letterSpacing: "2px" }}>
              PARAMETRIC INSURANCE · DELIVERY RIDERS
            </p>
          </div>

          {/* Phone input */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "#555", letterSpacing: "2px" }}>MOBILE NUMBER</p>
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{ background: "#111", border: "1px solid #1f1f1f" }}
            >
              <span
                className="px-4 py-3.5 text-sm font-semibold flex-shrink-0"
                style={{ color: "#444", borderRight: "1px solid #1f1f1f" }}
              >
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFormError(null); }}
                className="flex-1 bg-transparent px-4 py-3.5 text-white text-sm focus:outline-none"
                placeholder="98765 43210"
              />
            </div>
          </div>

          {/* Zone select */}
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: "#555", letterSpacing: "2px" }}>DELIVERY ZONE</p>
            <div className="relative">
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full appearance-none rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none"
                style={{ background: "#111", border: "1px solid #1f1f1f" }}
              >
                {zones.length === 0 && <option value="">Loading zones...</option>}
                {zones.map(z => (
                  <option key={z.id} value={z.id} style={{ background: "#111" }}>{z.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "#555" }}>▾</span>
            </div>
          </div>

          {/* Premium preview */}
          {sZone && (
            <div
              className="rounded-xl px-4 py-3.5 mb-4 flex justify-between items-center"
              style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)" }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: "#16a34a", letterSpacing: "2px" }}>EST. WEEKLY PREMIUM</p>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>Scales with AI risk forecast</p>
              </div>
              <p className="font-black text-2xl" style={{ color: "#16a34a" }}>₹{sZone.base_premium}</p>
            </div>
          )}

          {/* Error banner */}
          {formError && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-4"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <span className="text-sm flex-shrink-0 mt-px" style={{ color: "#ef4444" }}>⚠</span>
              <p className="text-sm leading-snug" style={{ color: "#ef4444" }}>{formError}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading || zones.length === 0 || !phone}
            className="w-full rounded-xl py-4 font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            style={{ background: "#16a34a", letterSpacing: "0.3px" }}
          >
            {loading ? "Processing..." : "Subscribe via UPI Autopay"}
          </button>
        </div>
      </main>
    );
  }
```

- [ ] **Step 2: Run the dev server and verify onboarding visually**

```bash
cd frontend && npm run dev
```

Open `http://localhost:3000`. Expected: dark `#080808` background, split +91 prefix input, dropdown with `▾` chevron, green premium preview, green CTA button.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: redesign onboarding screen to fintech dark"
```

---

## Task 4: Redesign Home Tab + Wire ProfileDrawer + SettingsView

**Files:**
- Modify: `frontend/src/app/page.tsx` (imports, new state, dashboard return block)

This task has the most changes. Work in three sub-steps: add imports + state, replace the dashboard `return`, verify.

- [ ] **Step 1: Add imports at the top of `page.tsx`**

Find the existing import block at the top:
```tsx
import { fetchZones, createRider, createPolicy, fetchClaims, fetchPolicies } from "@/lib/api";
import { PoliciesView } from "@/lib/PoliciesView";
```

Replace with:
```tsx
import { fetchZones, createRider, createPolicy, fetchClaims, fetchPolicies } from "@/lib/api";
import { PoliciesView } from "@/lib/PoliciesView";
import { ProfileDrawer } from "@/lib/ProfileDrawer";
import { SettingsView } from "@/lib/SettingsView";
```

- [ ] **Step 2: Add `isProfileOpen` state**

Find the existing state declarations block (after `const [formError, setFormError] = useState<string | null>(null);`):
```tsx
  const [formError, setFormError] = useState<string | null>(null);
```

Add after it:
```tsx
  const [isProfileOpen, setIsProfileOpen] = useState(false);
```

Also add a monogram helper after the state declarations (before the `useEffect` hooks):
```tsx
  function getMonogram(phoneStr: string): string {
    const digits = phoneStr.replace(/\D/g, "").slice(-10);
    if (digits.length < 6) return digits.slice(0, 2) || "??";
    return digits[0] + digits[5];
  }
```

- [ ] **Step 3: Replace the dashboard return block**

Find the entire dashboard `return (...)` — it starts with:
```tsx
  const navItems: { tab: Tab; icon: string; label: string }[] = [
```

And ends with the final `);` of the component. Replace everything from `const navItems` to the end of the file with:

```tsx
  const monogram = getMonogram(phone);
  const upiId = phone.replace(/\D/g, "").slice(-10)
    ? `${phone.replace(/\D/g, "").slice(-10).slice(0, 5)}@upi`
    : "";
  const paidClaimsTotal = claims.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const paidClaimsCount = claims.filter(c => c.status === "paid").length;

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: "home", icon: "🏠", label: "Home" },
    { tab: "policies", icon: "🛡️", label: "Policies" },
    { tab: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden" style={{ background: "#080808" }}>
      {/* Profile drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        phone={phone}
        upiId={upiId}
        zone={selectedZone}
        activePolicy={activePolicy}
        claims={claims}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {activeTab === "home" && (
          <>
            {/* Header */}
            <header className="flex justify-between items-center pt-5 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white" style={{ letterSpacing: "-0.5px" }}>Dashboard</h1>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>{selectedZone?.name ?? "Active Zone"}</p>
              </div>
              {/* Monogram avatar */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center justify-center font-black text-white flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  fontSize: 13,
                  boxShadow: "0 0 0 2px rgba(22,163,74,0.3)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {monogram}
              </button>
            </header>

            {/* Coverage card */}
            {activePolicy ? (
              <section
                className="rounded-2xl p-5 mb-4 relative overflow-hidden"
                style={{
                  background: "rgba(22,163,74,0.09)",
                  border: "1px solid rgba(22,163,74,0.28)",
                }}
              >
                {/* Glow blob */}
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(22,163,74,0.3), transparent)" }}
                />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#16a34a", letterSpacing: "2px" }}>ACTIVE COVERAGE</p>
                    <h2 className="text-4xl font-black text-white" style={{ letterSpacing: "-1.5px" }}>
                      ₹{activePolicy.max_coverage.toLocaleString("en-IN")}
                    </h2>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(22,163,74,0.15)",
                      border: "1px solid rgba(22,163,74,0.35)",
                      color: "#16a34a",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#16a34a" }}
                    />
                    ACTIVE
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#555" }}>Premium ₹{activePolicy.premium_paid}/wk</span>
                  <span style={{ color: "#777" }}>
                    Renews {new Date(activePolicy.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} →
                  </span>
                </div>
              </section>
            ) : (
              <section
                className="rounded-2xl p-5 mb-4 flex items-center justify-center"
                style={{ border: "1px dashed #1f1f1f" }}
              >
                <p className="text-sm animate-pulse" style={{ color: "#555" }}>Loading active policy...</p>
              </section>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#555", letterSpacing: "1.5px", fontSize: 9 }}>CLAIMS PAID</p>
                <p className="text-2xl font-black" style={{ color: "#4ade80" }}>
                  ₹{paidClaimsTotal.toLocaleString("en-IN")}
                </p>
                <p className="text-xs mt-1" style={{ color: "#333" }}>{paidClaimsCount} payout{paidClaimsCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#555", letterSpacing: "1.5px", fontSize: 9 }}>MONITORING</p>
                <p className="text-sm font-bold mt-1" style={{ color: "#ef4444" }}>● Live</p>
                <p className="text-xs mt-1" style={{ color: "#333" }}>Weather + AQI</p>
              </div>
            </div>

            {/* Recent payouts */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold" style={{ color: "#444", letterSpacing: "2px" }}>RECENT PAYOUTS</p>
                {claims.length > 0 && (
                  <button
                    onClick={() => setActiveTab("policies")}
                    className="text-xs font-semibold"
                    style={{ color: "#16a34a" }}
                  >
                    View all
                  </button>
                )}
              </div>
              {claims.length === 0 ? (
                <div
                  className="text-center py-10 rounded-2xl"
                  style={{ border: "1px dashed #1f1f1f" }}
                >
                  <p className="text-sm" style={{ color: "#555" }}>No payouts yet.</p>
                  <p className="text-xs mt-1" style={{ color: "#333" }}>
                    If weather breaches the threshold, a payout appears here instantly.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {claims.map(claim => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ background: "#111", border: "1px solid #1a1a1a" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-xl text-lg flex-shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            background: "rgba(22,163,74,0.1)",
                            border: "1px solid rgba(22,163,74,0.2)",
                          }}
                        >
                          {claim.trigger_type === "rain" ? "🌧️" : claim.trigger_type === "heat" ? "☀️" : "🏭"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white capitalize">{claim.trigger_type} Alert</p>
                          <p className="text-xs mt-0.5" style={{ color: "#555" }}>
                            {new Date(claim.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black" style={{ color: "#4ade80" }}>₹{claim.amount}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: claim.status === "paid" ? "#16a34a" : "#f59e0b" }}
                          />
                          <p className="text-xs font-bold uppercase" style={{ color: "#555", letterSpacing: "1px", fontSize: 9 }}>
                            {claim.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "policies" && (
          <PoliciesView
            activePolicy={activePolicy}
            allPolicies={allPolicies}
            zones={zones}
            currentZone={selectedZone}
            riderId={riderId ?? 0}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView riderId={riderId ?? 0} />
        )}
      </div>

      {/* Bottom nav */}
      <nav
        className="flex-shrink-0 px-6 py-3"
        style={{ background: "rgba(8,8,8,0.95)", borderTop: "1px solid #111", backdropFilter: "blur(20px)" }}
      >
        <ul className="flex justify-around">
          {navItems.map(({ tab, icon, label }) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-1 transition-colors"
                style={{ color: activeTab === tab ? "#16a34a" : "#444" }}
              >
                <span className="text-lg">{icon}</span>
                <span className="font-bold" style={{ fontSize: 10, letterSpacing: "0.5px" }}>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
```

- [ ] **Step 4: Verify visually in the browser**

Navigate to `http://localhost:3000`, subscribe with a phone number. Expected:
- Dark `#080808` home tab
- Monogram avatar top-right (tap → drawer slides up)
- Coverage card with green glow and "ACTIVE" pill
- Stats grid (Claims Paid / Monitoring)
- Settings tab shows all 5 sections (not "Coming soon")

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: redesign home tab, wire ProfileDrawer and SettingsView"
```

---

## Task 5: Restyle PoliciesView

**Files:**
- Modify: `frontend/src/lib/PoliciesView.tsx`

No logic changes — only visual restyling. Replace the entire file content with the fintech dark version below. The props interface and all handler logic remain identical.

- [ ] **Step 1: Replace the full file content**

```tsx
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
          <p className="text-xs font-bold" style={{ color: "#444", letterSpacing: "2px" }}>COVERAGE HISTORY</p>
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
                      <p className="text-xs font-bold uppercase mt-0.5" style={{ color: "#333", letterSpacing: "1.5px", fontSize: 9 }}>Expired</p>
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
          <p className="text-xs font-bold" style={{ color: "#444", letterSpacing: "2px" }}>DELIVERY ZONE</p>
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
```

- [ ] **Step 2: Verify the Policies tab visually**

Navigate to the Policies tab. Expected: dark cards with green glow on active policy, faded history rows, amber zone-change section — all matching fintech dark language.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/PoliciesView.tsx
git commit -m "feat: restyle PoliciesView to fintech dark language"
```

---

## Final Verification

- [ ] Subscribe with a fresh phone number → onboarding screen looks fintech dark
- [ ] Dashboard loads → monogram avatar visible, coverage card with glow, stats grid, payout rows
- [ ] Tap monogram → profile drawer slides up with stats + close button
- [ ] Policies tab → green-glowing active card, history timeline, zone change section
- [ ] Settings tab → all 5 groups (Payments, Preferences, Coverage, About, Danger Zone), UPI edit works, toggles work, confirmation dialogs work
- [ ] No TypeScript errors in the terminal

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors.
