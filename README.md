<div align="center">

<pre>
███████╗████████╗ █████╗ ██████╗ ██╗     ███████╗██╗      ██████╗ 
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝██║     ██╔═══██╗
███████╗   ██║   ███████║██████╔╝██║     █████╗  ██║     ██║   ██║
╚════██║   ██║   ██╔══██║██╔══██╗██║     ██╔══╝  ██║     ██║   ██║
███████║   ██║   ██║  ██║██████╔╝███████╗██║     ███████╗╚██████╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝ 
</pre>

**Stable Income Flow — AI-Powered Parametric Insurance for India's Gig Economy**

*Rain, Heat or Flood — Your Earnings Keep Flowing.*

<br/>

[![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-0A2540?style=for-the-badge&logo=buffer&logoColor=white)](https://developer.guidewire.com/)
[![Phase 1](https://img.shields.io/badge/Phase-1%20Submission-00C896?style=for-the-badge&logo=checkmarx&logoColor=white)](.)
[![Android PWA](https://img.shields.io/badge/Android-PWA-3DDC84?style=for-the-badge&logo=android&logoColor=white)](.)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)](.)
[![License MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=open-source-initiative&logoColor=black)](LICENSE)
[![Made for India](https://img.shields.io/badge/Made%20for-India-FF6B35?style=for-the-badge)](.)

<br/>

[🎥 Watch Demo](#) &nbsp;·&nbsp; [ Live App](#) &nbsp;·&nbsp; [ Docs](#) &nbsp;·&nbsp; [ Report Bug](#)

</div>

---

##  Table of Contents

1. [The Problem](#-the-problem)
2. [What Is StablFlo?](#-what-is-stablfo)
3. [Persona & Scenarios](#-persona--scenarios)
4. [Application Workflow](#-application-workflow)
5. [Parametric Triggers](#-parametric-triggers)
6. [Weekly Premium Model](#-weekly-premium-model)
7. [Platform Choice — Why PWA](#-platform-choice--why-pwa-not-native-android)
8. [AI & ML Integration Plan](#-ai--ml-integration-plan)
9. [Tech Stack](#️-tech-stack)
10. [System Architecture](#️-system-architecture)
11. [Development Plan](#-development-plan)
12. [Dashboards](#-dashboards)
13. [Constraints & Scope](#-constraints--scope)
14. [StablFlo vs. Traditional Insurance](#-stablfo-vs-traditional-insurance)
15. [Project Structure](#️-project-structure)
16. [Getting Started](#️-getting-started)

---

##  The Problem

India has over **10 million food delivery riders** on Swiggy, Zomato, and ONDC. They earn ₹30–50 per delivery and have zero income protection against external disruptions.

|  Disruption |  Impact |  Current Protection |
|---|---|---|
|  Heavy monsoon rain | Dispatch halted, orders drop 80% |  None |
|  Heatwave (42°C+) | Unsafe to ride, orders dry up |  None |
|  AQI spike > 350 | Health alerts, platforms slow down |  None |
|  Flood alert | City-wide movement restricted |  None |
|  Platform outage | Zero orders generated |  None |

> Riders lose **20–30% of monthly income** to events entirely outside their control. Traditional insurance requires manual claims and runs on monthly cycles — completely misaligned with weekly gig payouts.

---

##  What Is StablFlo?

StablFlo is a **mobile-first, AI-powered parametric insurance platform** for food delivery riders. When a verified disruption occurs, it automatically estimates income loss and triggers a UPI payout — no forms, no agent, no waiting. StablFlo incorporates intelligent fraud detection, leveraging location validation, behavioral analysis, and anomaly detection models to identify suspicious claims in real time.

**Coverage scope (strictly enforced):** Income loss only. No health, no vehicle, no liability.

---

##  Persona & Scenarios

### Primary Persona — Meet Ravi

> **Ravi Kumar, 27 · Swiggy delivery partner · Chennai**
> Ravi has been riding for Swiggy for 3 years. He earns ₹800–1,000/day on good days,
> settled weekly every Friday. He owns a second-hand Honda Activa, has no savings buffer,
> and supports his wife and one child. During the northeast monsoon (Oct–Dec), he loses
> 8–12 working days a year to heavy rain — around ₹9,000–14,000 in lost income annually.
> He uses WhatsApp and GPay daily but has never downloaded an insurance app.

### Secondary Persona — Meet Priya

> **Priya Devi, 31 · Zomato delivery partner · Delhi**
> Priya rides during peak hours (lunch + dinner). Every May–June, Delhi heatwaves above
> 42°C force her to stop riding by 11am. She loses ₹300–500/day for 15–20 days a year.
> She's aware of insurance but assumes it's "too complicated" and "not for people like her."

---

###  Persona-Based Scenarios

**Scenario 1 — Ravi · Chennai Monsoon**
```
Day 1:  IMD issues heavy rainfall warning for Chennai
        OpenWeatherMap records 47 mm rain — threshold crossed (>40 mm)
        StablFlo trigger fires at 06:00 AM

Day 1:  ML Income Loss Estimator calculates:
        Ravi's zone avg daily earnings = ₹900
        Disruption severity multiplier = 0.85
        Estimated loss = ₹765

Day 1:  Claim auto-approved (no action from Ravi)
        UPI payout of ₹765 sent to Ravi's linked account
        Push notification: "Heavy rain detected in your zone.
        ₹765 credited to your account. Stay safe. "

Result: Ravi receives compensation before he even decides
        whether to go out. Zero friction. Zero forms.
```

**Scenario 2 — Priya · Delhi Heatwave**
```
May 15: Delhi records 44.2°C — threshold crossed (>42°C)
        Trigger fires; Priya's zone flagged as affected

        ML model checks Priya's last 4-week order history
        Calculates average orders between 10am–2pm = 6 orders
        Estimated loss for the heat window = ₹280

        Auto payout: ₹280
        Notification: "Heatwave alert in Delhi. ₹280 protected
        earnings credited. Keep hydrated. "
```

**Scenario 3 — Ravi · Platform Outage**
```
        Swiggy reports platform-wide order suspension (webhook received)
        Duration: 4 hours during dinner peak

        System calculates dinner peak proportion of Ravi's daily earnings
        Estimated loss: ₹340

        Payout: ₹340 — sent within 60 seconds of outage confirmation
```

---

##  Application Workflow

### End-to-End Flow

```
  ┌─────────────────────────────────────────────────────────┐
  │                   ONBOARDING                            │
  │                                                         │
  │  1. Rider opens PWA link in Chrome                      │
  │  2. Enters mobile number → OTP verification             │
  │  3. Links Swiggy / Zomato platform ID                   │
  │  4. GPS prompt → selects primary delivery zone          │
  │  5. AI generates risk score for their zone              │
  │  6. Recommended weekly plan displayed                   │
  │  7. Rider subscribes via UPI autopay                    │
  └────────────────────────┬────────────────────────────────┘
                           │  Active subscription
  ┌────────────────────────▼────────────────────────────────┐
  │                 24×7 MONITORING LOOP                    │
  │                                                         │
  │  Every 15 min: Poll OpenWeatherMap + AQI APIs           │
  │  Every 1 hr:   Check government flood alert feeds       │
  │  Real-time:    Listen for platform outage webhooks      │
  └────────────────────────┬────────────────────────────────┘
                           │  Threshold crossed
  ┌────────────────────────▼────────────────────────────────┐
  │                  CLAIMS ENGINE                          │
  │                                                         │
  │  1. Log trigger event with timestamp + source data      │
  │  2. Identify all riders in affected zone                │
  │  3. ML model estimates income loss per rider            │
  │  4. Fraud check — GPS, claim history, anomaly score     │
  │  5. If clean → auto-approve                             │
  │  6. If flagged → queue for manual review                │
  └────────────────────────┬────────────────────────────────┘
                           │  Approved
  ┌────────────────────────▼────────────────────────────────┐
  │                   PAYOUT ENGINE                         │
  │                                                         │
  │  Razorpay UPI transfer initiated                        │
  │  Push notification sent via Web Push API                │
  │  Claim record written to PostgreSQL                     │
  │  Admin dashboard updated in real time                   │
  └─────────────────────────────────────────────────────────┘
```

---

##  Parametric Triggers

Triggers are **objective, external, and verifiable** — no rider input required.

|  Trigger |  Threshold |  Data Source |  Check Frequency |
|---|---|---|---|
|  Rainfall | > 40 mm / day | OpenWeatherMap API | Every 15 min |
|  Heatwave | > 42 °C | OpenWeatherMap API | Every 15 min |
|  Air Quality | AQI > 350 | CPCB / AQI public APIs | Every 30 min |
|  Flood Alert | Official alert issued | Government disaster APIs | Every 1 hr |
|  Platform Outage | Confirmed platform-wide suspension | Webhook / simulated API | Real-time |

**Why parametric?** Traditional insurance requires riders to file claims, submit proof, and wait for approval. Parametric insurance removes all of that — the trigger IS the proof. This is the only model that works for gig workers with no time, low digital literacy, and weekly income cycles.

---

##  Weekly Premium Model

### Pricing Table

|  Risk Zone |  Weekly Premium |  Max Weekly Coverage |  Implied Loss Ratio |  Example Cities |
|---|---|---|---|---|
| 🟢 Low Risk | ₹20 | ₹1,000 | ~60% | Bangalore (clear zones) |
| 🟡 Moderate Risk | ₹30 | ₹1,500 | ~62% | Hyderabad |
| 🔴 High Risk | ₹40 | ₹2,000 | ~65% | Mumbai, Chennai |

### How the Math Works

```
Weekly Premium Calculation Logic:

  Base premium = Expected weekly payout × (1 + expense_ratio)

  Expected weekly payout =
      P(trigger fires this week) × Average income loss per trigger

  Example — Chennai (High Risk):
      P(rain trigger) in monsoon weeks   = ~35%
      Average loss per rain event        = ₹700
      Expected payout                    = 0.35 × ₹700 = ₹245/week (annualised avg)

      Averaged across all 52 weeks:
      Non-monsoon weeks P(trigger) ≈ 5%
      Blended annual expected payout ≈ ₹780/year = ₹15/week

      Add expense ratio (operations + fraud buffer) ≈ 60%
      Final premium                      ≈ ₹15 × 1.6 ≈ ₹24 → rounded to ₹40
      (High-risk premium covers worst-case weeks, not average)

  Max coverage cap (₹2,000) = ~2.2× average weekly earnings
  This ensures riders are protected, not incentivised to stay home.
```

### Dynamic AI Adjustment

Every Monday, the AI pricing engine recalculates each rider's premium using:
- 7-day weather forecast for their specific zone
- Historical trigger frequency for that zone (last 52 weeks)
- Rider's own claim history (frequency, amounts)
- Platform-level order data trends

Premiums can shift ±₹10 week-to-week but are capped to prevent shock increases.

---

##  Platform Choice — Why PWA, Not Native Android

This was a deliberate technical decision. Here is the full justification:

### Requirement Analysis

StablFlo's rider-facing app needs to:
- Display coverage status and payout history
- Send push notifications when a trigger fires
- Collect GPS zone during onboarding (one-time)
- Accept UPI payment via autopay

That's it. **Nothing in this list requires native Android APIs.**

All heavy computation — ML scoring, trigger monitoring, fraud detection, payout processing — runs **server-side on FastAPI**. The app is a thin display + notification layer.

### Comparison

|  Factor |  Native Android App |  StablFlo PWA |
|---|---|---|
| Installation | Play Store download (storage + mobile data) | Tap a link → Add to Home Screen |
| Updates | Manual approval required | Silent, automatic |
| Low-end devices (2 GB RAM) | Can lag or fail | Lightweight, browser-native |
| Offline support | Yes | Yes — Service Workers |
| Push notifications | Yes | Yes — Web Push API |
| GPS / Location | Yes | Yes — Browser Geolocation API |
| UPI payments | Deeplink to GPay / PhonePe | Same deeplink, identical experience |
| Rider familiarity | Play Store badge | Same as WhatsApp links they use daily |
| Time to first use | 5–10 min (download + install) | < 30 seconds (open link, add to home) |

### The Decisive Factor

Ravi (our primary persona) uses a Redmi 9A with 2 GB RAM. He has 4 GB of storage left. He will not download another app. But he **will** tap a WhatsApp link from his delivery group and add it to his home screen in 20 seconds — because that's exactly how he uses Paytm and GPay shortcuts already.

**Future path:** The PWA can be wrapped into a Play Store APK via **Trusted Web Activity (TWA)** with zero code changes when adoption justifies it.

---

##  AI & ML Integration Plan

### Overview of the ML Pipeline

```
  DATA INPUTS                ML MODELS               OUTPUTS
  ──────────────────────────────────────────────────────────
  Historical weather    ──▶  Risk Profiler      ──▶  Zone risk score (0–1)
  Zone claim history         (Scikit-learn            Weekly premium (₹)
  Rider profile              Random Forest)

  Real-time weather     ──▶  Dynamic Pricing    ──▶  Monday premium update
  7-day forecast             (Regression model)       per rider per zone
  Prior week triggers

  Trigger event data    ──▶  Income Loss        ──▶  Estimated ₹ loss
  Rider order history        Estimator               per rider per event
  Time of day / week         (Gradient Boost)
  Zone severity score

  Rider GPS logs        ──▶  Fraud Detector     ──▶  Fraud score (0–1)
  Claim timestamps           (Isolation Forest)       Block / flag / pass
  Device fingerprint
  Historical patterns

  Zone weather history  ──▶  Forecast Engine    ──▶  72-hr disruption
  IMD seasonal data          (TensorFlow LSTM)        probability per zone
  [Phase 2]                                           Proactive alerts
```

### Model Details

**1. Risk Profiler** *(Scikit-learn — Random Forest)*
- Runs every Sunday night to score the coming week
- Features: lat/lng zone, historical rainfall frequency, historical heatwave days, historical AQI exceedance, platform outage history
- Output: risk score per zone → maps to Low / Moderate / High premium tier

**2. Income Loss Estimator** *(Gradient Boosting Regressor)*
- Fires when a trigger event is confirmed
- Features: rider's 4-week avg daily earnings, hour of day, day of week, trigger type, trigger severity (e.g. 47mm vs 60mm rain), zone penetration
- Output: estimated ₹ income loss for that rider for that event
- Trained on: synthetic order-weather correlation data (Phase 1), real platform data (Phase 2+)

**3. Dynamic Pricing Engine** *(Linear Regression + Rule Engine)*
- Runs every Monday 5:00 AM
- Adjusts premium ±₹10 from base tier based on 7-day forecast
- Hard cap: premium cannot exceed ₹50 or fall below ₹15

**4. Fraud Detector** *(Isolation Forest — Anomaly Detection)*
- Runs on every claim before payout approval
- Flags: GPS coordinates inconsistent with declared zone, claim immediately after subscription (< 48 hrs), same device filing claims on multiple accounts, claim pattern matching known fraud signatures
- Output: fraud score 0–1. Score > 0.7 → hold for manual review. Score > 0.9 → auto-reject.

**5. Forecast Engine — Phase 2** *(TensorFlow LSTM)*
- Predicts disruption probability per zone for next 72 hours
- Enables proactive rider alerts ("High rain risk tomorrow — your coverage is active")
- Training data: IMD historical rainfall, CPCB AQI time series, seasonal patterns

---

## 🛠️ Tech Stack

```
 ┌──────────────────────────────────────────────────────────────┐
 │                MOBILE FRONTEND  (Android PWA)                │ 
 │          React.js  ·  Next.js  ·  Tailwind CSS               │
 │   Service Workers · Web Push API · Geolocation · TWA-ready   │
 ├──────────────────────────────────────────────────────────────┤
 │                        BACKEND                               │
 │            Python  ·  FastAPI  ·  PostgreSQL                 │
 ├──────────────────────────────────────────────────────────────┤
 │                        AI / ML                               │
 │     Scikit-learn  ·  TensorFlow  ·  Pandas  ·  NumPy         │
 ├──────────────────────────────────────────────────────────────┤
 │                    EXTERNAL SERVICES                         │
 │   OpenWeatherMap  ·  CPCB AQI API  ·  Razorpay Test UPI      │
 ├──────────────────────────────────────────────────────────────┤
 │                      DEPLOYMENT                              │
 │         Vercel (PWA Frontend)  ·  Render (Backend)           │
 └──────────────────────────────────────────────────────────────┘
```

### Key Technology Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js | SSR for fast first load on slow 4G; PWA support built-in |
| Backend | FastAPI | Async Python; ideal for polling loops + ML model serving |
| Database | PostgreSQL | Relational structure suits policies, claims, payout records |
| ML framework | Scikit-learn | Sufficient for tabular models; fast inference; easy to deploy |
| Deep learning | TensorFlow | LSTM for time-series forecasting in Phase 2 |
| Payments | Razorpay | Best-in-class UPI autopay API for Indian market |
| Deployment | Vercel + Render | Free tier sufficient for hackathon; production-scalable |

---

##  System Architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    RIDER  (Android)                         │
 │              Chrome PWA  ·  UPI Autopay                     │
 └───────────────────────────┬─────────────────────────────────┘
                             │  HTTPS / REST
 ┌───────────────────────────▼─────────────────────────────────┐
 │                   FastAPI  BACKEND                          │
 │                                                             │
 │   ┌─────────────────┐         ┌─────────────────┐           │
 │   │  Policy Engine  │         │  Claims Engine  │           │
 │   │  · Onboarding   │         │  · Auto-approve │           │
 │   │  · Subscriptions│         │  · Payout trigger│          │
 │   └────────┬────────┘         └────────┬────────┘           │
 │            └─────────────┬─────────────┘                    │
 │   ┌─────────────────────▼───────────────────────┐           │
 │   │                  ML  LAYER                  │           │ 
 │   │   Risk Profiler · Loss Estimator · Fraud    │           │
 │   └────────────────────────┬────────────────────┘           │
 │   ┌────────────────────────▼────────────────────┐           │
 │   │              PostgreSQL  DATABASE            │          │
 │   │      Riders · Policies · Claims · Payouts   │           │
 │   └─────────────────────────────────────────────┘           │
 └───────────────────────────┬─────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
 ┌────────▼────────┐ ┌───────▼───────┐ ┌────────▼────────┐
 │  OpenWeatherMap │ │  CPCB AQI API │ │  Razorpay  UPI  │
 │  Rain · Heat    │ │  Air Quality  │ │  Instant Payout │
 └─────────────────┘ └───────────────┘ └─────────────────┘
```

---

## 🗓️ Development Plan

### Phase 1 — Foundation ✅ COMPLETED *(Week 1–2)*

| Task | Status |
|---|---|
| Problem definition & rider persona research | ✅ Done |
| Parametric trigger model design | ✅ Done |
| Weekly pricing & risk zone framework | ✅ Done |
| AI / ML architecture & pipeline planning | ✅ Done |
| PWA platform decision & justification | ✅ Done |
| System architecture design | ✅ Done |

### Phase 2 — Core Build 🔧 IN PROGRESS *(Week 3–5)*

| Task | Target |
|---|---|
| Rider onboarding flow (mobile PWA) | Week 3 |
| Policy engine — subscription + UPI autopay | Week 3 |
| Trigger monitoring loop (weather + AQI polling) | Week 4 |
| Income Loss Estimator model (v1, synthetic data) | Week 4 |
| Risk Profiler model (v1) | Week 4 |
| Automated claims processing pipeline | Week 5 |
| Push notification system (Web Push API) | Week 5 |

### Phase 3 — Polish & Demo 🔜 PLANNED *(Week 6–7)*

| Task | Target |
|---|---|
| Fraud Detector model integration | Week 6 |
| Production UPI payout flow (Razorpay) | Week 6 |
| Rider dashboard (coverage, claims, alerts) | Week 6 |
| Admin dashboard (zone heatmap, analytics) | Week 7 |
| Play Store TWA wrapper (optional) | Week 7 |
| 5-minute demo video | Week 7 |

---

##  Dashboards

###  Rider Dashboard *(Mobile PWA)*

|  Widget |  Details |
|---|---|
|  Coverage Status | Active plan, zone, renewal date |
|  Protected This Week | Estimated earnings covered so far |
|  Claim History | Past triggers, payout amounts, timestamps |
|  Zone Risk Forecast | 7-day disruption risk for their area |
|  Notifications | Push alerts for triggers and payouts |

### 🖥️ Admin Dashboard *(Web)*

|  Widget |  Details |
|---|---|
|  Zone Heatmap | City-wide disruption trends in real time |
|  Loss Ratio | Payout vs. premium by zone and week |
|  Fraud Signal Feed | Flagged claims with anomaly scores |
|  Predictive Claims | Next-week payout forecast by zone |

---

##  Constraints & Scope

This product is deliberately scoped to avoid regulatory complexity and ensure focus:

| Constraint | Detail |
|---|---|
| ✅ Income loss only | Covers lost earnings during verified disruptions only |
| ❌ No health coverage | Rider injuries, illness — out of scope |
| ❌ No vehicle coverage | Bike damage, theft — out of scope |
| ❌ No liability coverage | Third-party claims — out of scope |
| ✅ Gig workers only | Food delivery riders on Swiggy, Zomato, ONDC |
| ✅ India only (Phase 1) | Metro + Tier-1 cities with reliable weather API coverage |
| ✅ Weekly cycle only | No monthly or annual policies in Phase 1 |

**Why these constraints matter:** Staying within income loss protection keeps StablFlo out of IRDAI's complex health/vehicle insurance licensing requirements for Phase 1, while still delivering real value to riders.

---

##  StablFlo vs. Traditional Insurance

|  Feature |  Traditional Insurance |  StablFlo |
|---|---|---|
| Claims process | Manual forms, agent approval | ✅ Zero-touch, fully automatic |
| Payout speed | Days to weeks | ✅ Under 60 seconds |
| Premium cycle | Monthly or annual | ✅ Weekly — matches gig payouts |
| Pricing model | Fixed, one-size-fits-all | ✅ AI-adjusted, hyper-local |
| Coverage scope | Broad health / vehicle bundles | ✅ Income loss only |
| Target user | General salaried population | ✅ Built for delivery riders |
| Onboarding | Branch visit / lengthy KYC | ✅ Mobile number + platform ID |
| App friction | Desktop portal or heavy app | ✅ One link, installs in 20 seconds |

---

##  Project Structure

```
 stableflo/
 │
 ├──  frontend/                   # Android PWA — React + Next.js
 │   ├── components/                # Reusable mobile UI components
 │   ├── pages/                     # Next.js page routes
 │   ├── public/
 │   │   └── manifest.json          # PWA manifest (Add to Home Screen)
 │   ├── service-worker.js          # Offline support + Web Push
 │   └── styles/                    # Tailwind CSS config
 │
 ├──   backend/
 │   ├── api/                       # FastAPI route handlers
 │   ├── models/
 │   │   ├── risk_profiler.py       # Zone risk scoring
 │   │   ├── income_loss.py         # ML loss estimation
 │   │   └── fraud_detection.py     # Isolation Forest anomaly detection
 │   ├── services/
 │   │   ├── weather.py             # OpenWeatherMap integration
 │   │   ├── aqi.py                 # AQI API integration
 │   │   └── payments.py            # Razorpay UPI handler
 │   └── db/                        # PostgreSQL schemas & migrations
 │
 ├──  docs/                       # Architecture diagrams, API specs
 └── README.md
```

---

##  Getting Started

### Prerequisites

```bash
node     >= 18.x
python   >= 3.10
postgres >= 14
```

### Clone & Install

```bash
# Clone
git clone https://github.com/your-username/stableflo.git
cd stableflo

# Frontend
cd frontend && npm install

# Backend
cd ../backend && pip install -r requirements.txt

# Environment
cp .env.example .env
```

### Run Locally

```bash
# Terminal 1 — Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:3000** in Chrome → DevTools → Toggle Device Toolbar for mobile preview.

```bash
# Test PWA install
npm run build && npm start
# Open on Android Chrome → ⋮ → "Add to Home Screen"
```

---

##  Environment Variables

```env
# ── Weather & Air Quality ──────────────────────────
OPENWEATHER_API_KEY=your_openweather_key
AQI_API_KEY=your_aqi_key

# ── Payments (Razorpay Test Mode) ──────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here

# ── Database ───────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/stableflo

# ── App Config ─────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

##  Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# → Open a Pull Request
```

---

##  License

MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ for India's 10 million delivery heroes

**StablFlo — Because your dispatch should never stop earning.**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github)](https://github.com)
[![Demo](https://img.shields.io/badge/Try-Live%20Demo-00C896?style=flat-square&logo=vercel)](.)
[![Video](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?style=flat-square&logo=youtube)](.)

</div>
