"use client";

import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState(0); // 0: Onboarding, 1: Dashboard

  // Mock data for UI
  const [phone, setPhone] = useState("");
  const [zone, setZone] = useState("Chennai High-Risk");

  if (step === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10 w-full max-w-md glass-card p-8 rounded-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Stabl<span className="text-primary">Flo</span></h1>
            <p className="text-zinc-400 text-sm">Parametric Insurance for Delivery Riders</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Mobile Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Delivery Zone</label>
              <select 
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="Bangalore Low-Risk">Bangalore (Low Risk)</option>
                <option value="Hyderabad Moderate-Risk">Hyderabad (Moderate Risk)</option>
                <option value="Chennai High-Risk">Chennai (High Risk)</option>
              </select>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300 text-sm font-medium">Weekly Premium</span>
                <span className="text-primary font-bold text-lg">₹40</span>
              </div>
              <p className="text-zinc-500 text-xs text-right">Max Coverage: ₹2,000 / week</p>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-4 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(22,163,74,0.3)] mt-4"
            >
              Subscribe via UPI Autopay
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-primary/5 rounded-b-[100%] blur-[80px] pointer-events-none" />
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 z-10 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 text-sm">{zone}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shadow-inner">
          👤
        </div>
      </header>

      {/* Coverage Card */}
      <section className="glass-card p-6 mb-6 z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Active Coverage</p>
            <h2 className="text-3xl font-bold text-white">Up to ₹2,000</h2>
          </div>
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Renews in 5 days</span>
          <span className="text-zinc-300 font-medium">₹40 / week</span>
        </div>
      </section>

      {/* Risk Alert */}
      <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 z-10 flex gap-4 items-center shadow-lg">
        <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 text-xl">
          🌧️
        </div>
        <div>
          <h3 className="text-red-400 font-semibold mb-0.5 text-sm">High Expected Rain Risk</h3>
          <p className="text-red-400/80 text-xs leading-relaxed">Heavy northeast monsoon probability in next 48 hours for your zone.</p>
        </div>
      </section>

      {/* Recent Claims */}
      <section className="z-10 flex-1">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Payouts</h3>
          <button className="text-primary text-xs font-medium hover:underline">View all</button>
        </div>
        
        <div className="space-y-3">
          {[
             { id: 1, type: "Rainfall Disturbance", amount: 765, date: "Oct 12, 08:30 AM", status: "Paid via UPI", icon: "🌧️", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
             { id: 2, type: "Heatwave Alert", amount: 280, date: "May 15, 02:15 PM", status: "Paid via UPI", icon: "☀️", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
          ].map(claim => (
            <div key={claim.id} className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-colors hover:bg-zinc-800/80">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl text-lg flex items-center justify-center border ${claim.bg}`}>
                  <span className="filter drop-shadow-md">{claim.icon}</span>
                </div>
                <div>
                  <h4 className="text-zinc-200 font-medium text-[15px]">{claim.type}</h4>
                  <p className="text-zinc-500 text-xs mt-1 font-medium">{claim.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold tracking-tight">₹{claim.amount}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-1 h-1 rounded-full bg-green-500"></div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">{claim.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer Nav Mock */}
      <nav className="z-10 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/80 p-4 -mx-6 mt-6 mt-auto">
        <ul className="flex justify-around text-zinc-500 text-sm">
          <li className="flex flex-col items-center gap-1 text-primary">
            <span>🏠</span>
            <span className="text-[10px] font-semibold">Home</span>
          </li>
          <li className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <span>🛡️</span>
            <span className="text-[10px] font-medium">Policies</span>
          </li>
          <li className="flex flex-col items-center gap-1 hover:text-white transition-colors">
            <span>⚙️</span>
            <span className="text-[10px] font-medium">Settings</span>
          </li>
        </ul>
      </nav>
    </main>
  );
}
