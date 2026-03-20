# Frontend Redesign Spec

**Goal:** Full visual overhaul of StablFlo's Next.js PWA to a cohesive Fintech Dark aesthetic, replacing the current mismatched design with a polished, hackathon-ready interface.

**Approach:** Option 2 — full redesign across all screens. Single visual language throughout: dark backgrounds (`#080808`/`#111`), green primary (`#16a34a`), tight typography, data-forward layouts.

---

## Design Language

- **Background:** `#080808` base, `#111` for cards, `#0f0f0f` for drawers
- **Borders:** `#1a1a1a` for cards, `#16a34a30` for active/highlighted cards
- **Primary:** `#16a34a` (green) — active states, CTAs, accents
- **Success text:** `#4ade80`
- **Muted text:** `#555`, section labels `#444`
- **Typography:** System UI, tight letter-spacing (`-0.5px`) on headings, ALL-CAPS labels with `2px` letter-spacing
- **Radii:** `14px` cards, `10px` inputs/rows, `24px` drawer top corners
- **Avatar:** Monogram initials derived from phone number (e.g. first two digits → "RK" placeholder until name is stored)

---

## Screens

### 1. Onboarding Screen

**File:** `frontend/src/app/page.tsx` (step === 0 branch)

- Dark background `#080808`, full-height centered form
- Logo: `Stabl` + `Flo` in green, subtitle in uppercase muted text
- **Phone input:** Split `+91` prefix (muted, right-bordered) from the digits field
- **Zone select:** Same dark input style, `▾` chevron right-aligned
- **Premium preview card:** Right-aligned ₹ amount in green, "Scales with AI risk forecast" subtitle
- **CTA button:** Full-width, solid `#16a34a`, "Subscribe via UPI Autopay"
- Error banner: red tinted, same style as existing

### 2. Home Tab (Dashboard)

**File:** `frontend/src/app/page.tsx` (activeTab === "home" branch)

- **Header:** Left — "Dashboard" bold + zone name muted. Right — monogram avatar (36px circle, green gradient, white initials, 2px green ring). Avatar is tappable → opens profile drawer.
- **Coverage card:** Green-tinted `#16a34a18` background, `#16a34a35` border, glow blob top-right. Hero: "Active Coverage" label + ₹ amount. Right: animated green dot + "ACTIVE" pill. Footer row: premium/wk + renewal date.
- **Stats grid (2-col):** "Claims Paid" (green ₹ amount + payout count) | "Monitoring" (red dot "● Live" + "Weather + AQI").
- **Recent Payouts section:** Section label + "View all" link. Each row: icon badge (🌧️/☀️/🏭 on green-tinted bg), trigger type + timestamp, ₹ amount in green + status pill. Empty state: dashed border box.

### 3. Profile Drawer

**File:** `frontend/src/lib/ProfileDrawer.tsx` (new component)

Triggered by avatar tap in the home header. Rendered as an absolutely-positioned bottom sheet over the page.

- **Backdrop:** `rgba(0,0,0,0.6)` overlay, tap to dismiss
- **Sheet:** `#0f0f0f`, `border-top-left-radius: 24px`, `border-top-right-radius: 24px`, `border-top: 1px solid #1f1f1f`
- **Handle:** 36px × 3px `#2a2a2a` pill, centered at top
- **Rider identity row:** 52px monogram avatar (green gradient, white initials, 3px green ring) + name (bold 17px) + phone + UPI ID + zone. "ACTIVE" badge right-aligned (green).
- **Stats grid (3-col):** Claims count (green) | Total paid out (₹) | Weeks active. Dark `#141414` cells.
- **Footer row:** "Member since [date]" muted left, "Close" button right.
- **State:** `isProfileOpen: boolean` in `page.tsx`, passed as prop.

### 4. Policies Tab

**File:** `frontend/src/lib/PoliciesView.tsx`

Align existing component to fintech dark language:

- **Active policy card:** Background `#111`, border `#16a34a30`. Animated dot + "Active Policy" label. Hero ₹ number (32px bold). Details grid: Premium/wk | Renews date. "🔒 UPI Autopay" badge.
- **Coverage History section:** Section label + horizontal rule + cycle count. Faded rows (`opacity: 0.6`) — date range → date range, coverage amount, premium, "EXPIRED" label.
- **Zone change section:** Amber-tinted warning, zone selector, "Schedule Zone Change" button. Scheduled state shows amber confirmation card.

### 5. Settings Tab

**File:** `frontend/src/lib/SettingsView.tsx` (new component)

Replaces the "Coming soon" placeholder. Five grouped sections, each as a dark card (`#111`, `border: 1px solid #1a1a1a`, `border-radius: 12px`).

**Group: Payments**
- UPI ID row: 💳 icon, current UPI ID as subtitle, "Edit →" right. Tapping opens an inline edit field with Save/Cancel.

**Group: Preferences**
- Notifications row: 🔔 icon, description, toggle switch (green when on, `#2a2a2a` when off).
- Language row: 🌐 icon, current language as subtitle, `▾` chevron. Tapping cycles: English → Hindi → Kannada → Telugu.

**Group: Coverage**
- Zone & Thresholds row: 📍 icon, "Rain 40mm · Heat 42°C · AQI 350" subtitle, `→` chevron. Tapping expands an inline detail card showing all three thresholds with descriptions.

**Group: About**
- About StablFlo row: ℹ️ icon, "How it works · FAQ · v1.0.0" subtitle, `→` chevron. Tapping expands inline: parametric insurance explainer, 3-item FAQ, version + build info.

**Group: Danger Zone**
- Red-tinted card (`#ef44440a`, `border: 1px solid #ef444420`), red section label.
- Cancel Policy row: 🚫 icon, red label. Tapping shows confirmation dialog: "This will cancel your active coverage. Payouts will stop immediately." — Cancel / Confirm buttons.
- Delete Account row: 🗑️ icon, red label. Tapping shows same confirmation pattern.

---

## Component Map

| Component | File | Status |
|---|---|---|
| Onboarding screen | `frontend/src/app/page.tsx` | Modify |
| Home tab | `frontend/src/app/page.tsx` | Modify |
| Profile drawer | `frontend/src/lib/ProfileDrawer.tsx` | Create |
| Policies view | `frontend/src/lib/PoliciesView.tsx` | Modify |
| Settings view | `frontend/src/lib/SettingsView.tsx` | Create |

---

## State Changes in `page.tsx`

- Add `isProfileOpen: boolean` state (default `false`)
- Avatar `onClick` → `setIsProfileOpen(true)`
- Pass `isProfileOpen`, `onClose`, rider data to `<ProfileDrawer>`
- Import and render `<SettingsView riderId={riderId} />` in the `activeTab === "settings"` branch
- Derive monogram from phone number: last 10 digits, initials = first char of first 5 digits + first char of last 5 digits, uppercased (e.g. `9876543210` → `"98"`)

---

## Out of Scope

- Backend API changes (no new endpoints needed)
- Actual cancel-policy or delete-account backend logic (UI shows confirmation, no destructive API call wired up — stub is acceptable for hackathon)
- Language translation (Language setting stores preference, no i18n implementation)
- Push notification infrastructure (toggle stored in local state only)
