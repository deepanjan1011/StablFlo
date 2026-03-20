<div align="center">

<br/>

```
███████╗████████╗ █████╗ ██████╗ ██╗     ███████╗██╗      ██████╗ 
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝██║     ██╔═══██╗
███████╗   ██║   ███████║██████╔╝██║     █████╗  ██║     ██║   ██║
╚════██║   ██║   ██╔══██║██╔══██╗██║     ██╔══╝  ██║     ██║   ██║
███████║   ██║   ██║  ██║██████╔╝███████╗██║     ███████╗╚██████╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝ 
```

### **Stable Income Flow — AI-Powered Parametric Insurance for India's Gig Economy**

<br/>

[![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-0A2540?style=for-the-badge)](https://developer.guidewire.com/)
<br/>
[![Platform](https://img.shields.io/badge/Platform-Android%20PWA-3DDC84?style=for-the-badge&logo=android&logoColor=white)](.)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made for India](https://img.shields.io/badge/Made%20for-India's%20Delivery%20Heroes-FF6B35?style=for-the-badge)](.)

<br/>

> *Rain, Heat or Flood — Your Earnings Keep Flowing.*

<br/>

**[🎥 2-Minute Demo](#)** · **[📖 Documentation](#)** · **[🚀 Live Demo](#)** · **[🐛 Report Bug](#)**

<br/>

</div>

---

## 📌 The Problem

India has over **10 million food delivery riders** on platforms like Swiggy, Zomato, and ONDC. They earn ₹30–50 per order and depend entirely on dispatches to survive.

But when the city shuts down — they earn nothing.

| Disruption | Impact | Current Protection |
|---|---|---|
| 🌧️ Heavy monsoon rain | Dispatch halted, orders drop 80% | ❌ None |
| 🌡️ Heatwave (42°C+) | Riders can't operate safely | ❌ None |
| 🏭 AQI > 350 | Health alerts, reduced ridership | ❌ None |
| 🌊 Flood Alert | City-wide disruption | ❌ None |
| 📵 Platform Outage | Zero orders, zero income | ❌ None |

**Riders lose 20–30% of monthly earnings** to disruptions they can't control. Traditional insurance is too slow, too complex, and not designed for weekly gig cycles.

**StablFlo fixes this.**

---

## 💡 Solution

StablFlo is a **mobile-first, AI-powered parametric insurance platform** that:

- 🔍 **Monitors** real-time weather and city disruption data 24×7
- ⚡ **Triggers** automatically — no forms, no calls, no waiting
- 🧠 **Calculates** exact income loss using ML regression models
- 💸 **Pays out** instantly via UPI — before riders even ask

No paperwork. No approval delays. No fine print.

```
Disruption Detected → Loss Estimated → Claim Approved → UPI Payout
       ↑                   ↑                 ↑               ↑
   Real-time APIs      ML Model          Zero-touch      < 60 seconds
```

---

## 📱 Mobile Platform — Why PWA, Not a Native App

> **This is a deliberate, well-reasoned decision — not a shortcut.**

StablFlo is built as a **Progressive Web App (PWA)** optimized for Android. Here's why this is the right call for delivery riders:

### The Rider Reality

| Factor | Native Android App | StablFlo PWA |
|---|---|---|
| Installation | Download from Play Store (needs storage + data) | ✅ Tap a link → Add to Home Screen — done |
| Updates | Rider must manually update | ✅ Always current, silently in background |
| Low-end phones | May lag or fail on 2GB RAM devices | ✅ Lightweight, runs on any Android browser |
| Offline support | Yes | ✅ Yes — via Service Workers |
| Push notifications | Yes | ✅ Yes — Web Push API |
| GPS / Location | Yes | ✅ Yes — Browser Geolocation API |
| UPI payment | Deeplink to GPay/PhonePe | ✅ Same deeplink — identical experience |
| Trust / familiarity | Play Store badge | ✅ Works like WhatsApp links riders use daily |

### Why This Works for StablFlo Specifically

StablFlo's heavy lifting — **ML risk scoring, trigger monitoring, fraud detection, payout processing** — all runs **server-side**. The rider app is a lightweight interface to:
- View coverage status
- Receive payout notifications
- Check claim history

There is no on-device ML, no background GPS tracking, no camera — nothing that requires native Android APIs. A PWA delivers 100% of the required functionality with zero additional friction for the rider.

> Swiggy, Zomato, and PhonePe all use web-based flows for their partner-facing and payment interfaces. StablFlo follows the same proven pattern.

**Future-proof:** If adoption demands it, the PWA can be wrapped into a Play Store APK using **Trusted Web Activity (TWA)** with zero code changes — giving us the best of both worlds.

---

## 🎯 Who It's For

**Primary:** Food delivery riders in metro & Tier-1 Indian cities

| Trait | Detail |
|---|---|
| 💵 Earnings model | Per-delivery (₹30–50/order) |
| 📅 Settlement cycle | Weekly payouts from platforms |
| 🌦️ Vulnerability | Fully outdoor-dependent |
| 📱 Tech comfort | Mobile-first, WhatsApp-native users |
| 📶 Connectivity | Mid-range Android, 4G |

### Real Scenarios

```
🌧️  Chennai rider · Monsoon season
    3 days of heavy rain → Dispatch halted
    Estimated loss: ₹1,200 → AUTO PAYOUT ✅

🌡️  Delhi heatwave · 44°C recorded
    Sharp order drop detected → Trigger fired
    Compensation: ₹800 → INSTANT TRANSFER ✅

🏭  Mumbai AQI · Pollution spike to 380
    Health alert issued → Rider cannot operate
    Protected earnings: ₹600 → PAYOUT SENT ✅
```

---

## ⚡ Parametric Triggers

Triggers are **objective, verifiable, and fully automated** — no human approval needed.

| Trigger | Threshold | Data Source |
|---|---|---|
| 🌧️ Rainfall | > 40 mm/day | OpenWeatherMap API |
| 🌡️ Heatwave | > 42°C | OpenWeatherMap API |
| 🏭 Air Quality | AQI > 350 | AQI public APIs |
| 🌊 Flood Alert | Official alert issued | Government APIs |
| 📵 Platform Outage | Platform-wide suspension | Webhook / API simulation |

---

## 💰 Weekly Premium Model

Pricing is aligned with gig workers' **weekly settlement cycle** — not monthly, not annual.

| Risk Zone | Weekly Premium | Max Coverage | Example Cities |
|---|---|---|---|
| 🟢 Low Risk | ₹20 | ₹1,000 | Bangalore (clear zones) |
| 🟡 Moderate Risk | ₹30 | ₹1,500 | Hyderabad |
| 🔴 High Risk | ₹40 | ₹2,000 | Mumbai, Chennai |

> **AI dynamically adjusts premiums every week** based on hyper-local risk scores, historical weather patterns, and real-time platform data.

---

## 🔄 How It Works

```
  ┌──────────────────┐     ┌──────────────┐     ┌─────────────────┐
  │  Rider           │     │  StablFlo    │     │  External APIs  │
  │  Android PWA     │────▶│  Backend     │◀────│  Weather / AQI  │
  │  (any browser)   │     │  (FastAPI)   │     │  Gov Alerts     │
  └──────────────────┘     └──────┬───────┘     └─────────────────┘
                                  │
                         ┌────────▼────────┐
                         │  AI Risk Score  │
                         │  + Weekly Plan  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  24×7 Trigger   │
                         │  Monitoring     │
                         └────────┬────────┘
                                  │ Trigger Met
                         ┌────────▼────────┐
                         │  ML Income Loss │
                         │  Calculation    │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │  Push Alert +   │
                         │  UPI Payout ✅  │
                         └─────────────────┘
```

**Step-by-step:**

1. 📱 Rider opens StablFlo link in Chrome → taps "Add to Home Screen"
2. 🔐 Signs up with mobile number + delivery platform ID
3. 📍 Selects usual delivery zone (one-tap GPS prompt)
4. 🤖 AI calculates risk score → recommends weekly plan
5. ✅ Subscribes via UPI autopay (weekly auto-renew)
6. 👁️ System monitors disruption triggers 24×7 server-side
7. ⚡ Trigger met → ML model estimates exact income loss
8. 💸 Claim auto-approved → Push notification + instant UPI payout

---

## 🧠 AI/ML Components

| Module | Description | Stack |
|---|---|---|
| **Risk Profiler** | Hyper-local weekly risk scoring per zone | Scikit-learn + historical weather |
| **Dynamic Pricing** | Premium adjustment based on forecast | Regression model + weather APIs |
| **Income Loss Engine** | Estimates actual earnings lost per trigger | ML regression on order/weather correlation |
| **Fraud Detection** | Detects GPS spoofing, duplicate claims, suspicious patterns | Anomaly detection (Isolation Forest) |
| **Phase 2 Forecasting** | Hyper-local predictive disruption alerts | TensorFlow LSTM |

> All ML runs **server-side** on the FastAPI backend. The rider's phone only needs a browser.

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│               MOBILE FRONTEND (Android PWA)                 │
│         React.js · Next.js · Tailwind CSS                   │
│   Service Workers · Web Push · Geolocation API · TWA-ready  │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
│              Python · FastAPI · PostgreSQL                  │
├─────────────────────────────────────────────────────────────┤
│                         AI / ML                             │
│          Scikit-learn · TensorFlow · Pandas · NumPy         │
├─────────────────────────────────────────────────────────────┤
│                   EXTERNAL SERVICES                         │
│   OpenWeatherMap API · AQI APIs · Razorpay Test Mode (UPI)  │
├─────────────────────────────────────────────────────────────┤
│                      DEPLOYMENT                             │
│            Vercel (PWA Frontend) · Render (Backend)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboards

### 🏍️ Rider Dashboard (Mobile PWA)
- ✅ Active weekly coverage status
- 📈 Protected earnings this week
- 📋 Claim & payout history
- ⚠️ Upcoming risk alerts for their zone
- 🔔 Push notifications for triggers & payouts

### 🖥️ Admin Dashboard (Web)
- 🗺️ Zone-wise disruption trends
- 📊 Loss ratio & payout analytics
- 🚨 Real-time fraud signals
- 🔮 Predictive claims for next week

---

## 🚀 Roadmap

```
Phase 1 ✅ — Completed
├── Problem definition & persona research
├── Parametric trigger model
├── Pricing & risk zone framework
├── PWA mobile platform decision & rationale
└── Workflow & AI architecture design

Phase 2 🔧 — In Progress
├── Rider onboarding & mobile-optimized UX
├── Policy engine & UPI autopay subscription
├── Dynamic pricing engine (live)
├── Automated claims processing pipeline
└── Push notification system (Web Push API)

Phase 3 🔜 — Planned
├── Advanced fraud detection (GPS spoofing, anomaly models)
├── Instant UPI payouts (production Razorpay)
├── Full rider + admin dashboards
├── Optional TWA wrapper for Play Store listing
└── 5-minute demo video + public launch
```

---

## 🌟 Why StablFlo Is Different

| Feature | Traditional Insurance | StablFlo |
|---|---|---|
| Claims process | Manual forms, weeks of waiting | ✅ Zero-touch, automatic |
| Payout timeline | Days to weeks | ✅ Under 60 seconds |
| Premium cycle | Monthly / annual | ✅ Weekly (matches gig cycle) |
| Pricing model | Fixed, one-size-fits-all | ✅ AI-adjusted, hyper-local |
| Coverage scope | Broad health/vehicle policies | ✅ Focused: income loss only |
| Target audience | General population | ✅ Built for delivery riders |
| App friction | Download, install, update | ✅ One link, works instantly |

---

## 🗂️ Project Structure

```
stableflo/
├── frontend/                   # Android PWA (React + Next.js)
│   ├── components/             # Reusable mobile UI components
│   ├── pages/                  # Next.js routes
│   ├── public/
│   │   └── manifest.json       # PWA manifest (installable on Android)
│   ├── service-worker.js       # Offline support + push notifications
│   └── styles/                 # Tailwind config
├── backend/
│   ├── api/                    # FastAPI route handlers
│   ├── models/
│   │   ├── risk_profiler.py    # Zone risk scoring
│   │   ├── income_loss.py      # Loss estimation model
│   │   └── fraud_detection.py  # Anomaly detection
│   ├── services/               # Weather, AQI, payment integrations
│   └── db/                     # PostgreSQL schemas & migrations
├── docs/                       # Architecture diagrams, API specs
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

```bash
node >= 18.x
python >= 3.10
postgresql >= 14
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stableflo.git
cd stableflo

# Frontend (PWA)
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt

# Environment setup
cp .env.example .env
# Fill in your API keys (see below)
```

### Running Locally

```bash
# Start backend
cd backend
uvicorn main:app --reload --port 8000

# Start PWA frontend (new terminal)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your Android device or Chrome DevTools mobile emulator.

To test the installable PWA experience:
```bash
npm run build && npm start
# Then open on your Android device and tap "Add to Home Screen"
```

---

## 🔑 Environment Variables

```env
# Weather & AQI
OPENWEATHER_API_KEY=your_key_here
AQI_API_KEY=your_key_here

# Payments (Test Mode)
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stableflo

# App
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ for India's 10 million delivery heroes**

*StablFlo — Because your dispatch should never stop earning.*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?style=flat-square&logo=github)](https://github.com)
[![Demo](https://img.shields.io/badge/Live-Demo-00C896?style=flat-square)](.)
[![Video](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?style=flat-square&logo=youtube)](.)

</div>
