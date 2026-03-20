"use client";

import { useState, useEffect } from "react";
import { fetchZones, createRider, createPolicy, fetchClaims, fetchPolicies } from "@/lib/api";
import { PoliciesView } from "@/lib/PoliciesView";

type Zone = { id: number; name: string; city: string; base_premium: number; status: string };
type Policy = { id: number; max_coverage: number; premium_paid: number; start_date: string; end_date: string; is_active: boolean };
type Claim = { id: number; trigger_type: string; amount: number; timestamp: string; status: string };
type Tab = "home" | "policies" | "settings";

export default function Home() {
  const [step, setStep] = useState(0); // 0: Onboarding, 1: Dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Data State
  const [zones, setZones] = useState<Zone[]>([]);
  const [riderId, setRiderId] = useState<number | null>(null);

  // Dashboard State
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Form State
  const [phone, setPhone] = useState("");
  const [zoneId, setZoneId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchZones().then(data => {
      setZones(data);
      if (data.length > 0) setZoneId(data[0].id.toString());
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (step === 1 && riderId) {
      const loadDashboard = async () => {
        try {
          const fetchedPolicies = await fetchPolicies(riderId);
          setAllPolicies(fetchedPolicies);
          const active = fetchedPolicies.find((p: Policy) => p.is_active);
          if (active) setActivePolicy(active);

          const fetchedClaims = await fetchClaims(riderId);
          setClaims(fetchedClaims.reverse());
        } catch (e) {
          console.error(e);
        }
      };

      loadDashboard();
      const interval = setInterval(loadDashboard, 3000); // 3 seconds poll
      return () => clearInterval(interval);
    }
  }, [step, riderId]);

  const handleSubscribe = async () => {
    setFormError(null);
    const digits = phone.replace(/\D/g, "");
    const normalized = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
    if (normalized.length !== 10) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!zoneId) return;
    setLoading(true);
    try {
      const rider = await createRider(phone, parseInt(zoneId));
      setRiderId(rider.id);

      const policy = await createPolicy(rider.id);
      setActivePolicy(policy);

      const zone = zones.find(z => z.id.toString() === zoneId);
      if (zone) setSelectedZone(zone);

      setStep(1);
    } catch (e) {
      console.error(e);
      const isNetwork = e instanceof TypeError;
      setFormError(
        isNetwork
          ? "Cannot reach the server. Make sure the backend is running on port 8000."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    const sZone = zones.find(z => z.id.toString() === zoneId);
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
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
                onChange={(e) => { setPhone(e.target.value); setFormError(null); }}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Delivery Zone</label>
              <select 
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {zones.length === 0 && <option value="">Loading zones...</option>}
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            
            {sZone && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-300 text-sm font-medium">Est. Base Premium</span>
                  <span className="text-primary font-bold text-lg">₹{sZone.base_premium} / wk</span>
                </div>
                <p className="text-zinc-500 text-xs text-right">Final premium scales with AI forecast</p>
              </div>
            )}

            {formError && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                <span className="text-red-400 text-sm flex-shrink-0 mt-px">⚠</span>
                <p className="text-red-400 text-sm leading-snug">{formError}</p>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading || zones.length === 0 || !phone}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-4 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(22,163,74,0.3)] mt-4 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Processing..." : "Subscribe via UPI Autopay"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const navItems: { tab: Tab; icon: string; label: string }[] = [
    { tab: "home", icon: "🏠", label: "Home" },
    { tab: "policies", icon: "🛡️", label: "Policies" },
    { tab: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-primary/5 rounded-b-[100%] blur-[80px] pointer-events-none" />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-6 pb-2">
        {activeTab === "home" && (
          <>
            <header className="flex justify-between items-center mb-8 z-10 pt-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-zinc-400 text-sm">{selectedZone?.name || "Active Zone"}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shadow-inner">
                👤
              </div>
            </header>

            {activePolicy ? (
              <section className="glass-card p-6 mb-6 z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium mb-1">Active Coverage</p>
                    <h2 className="text-3xl font-bold text-white">Up to ₹{activePolicy.max_coverage}</h2>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Premium Paid</span>
                  <span className="text-zinc-300 font-medium">₹{activePolicy.premium_paid} / week</span>
                </div>
              </section>
            ) : (
              <section className="glass-card p-6 mb-6 z-10 flex items-center justify-center">
                <p className="text-zinc-400 animate-pulse">Loading active policy...</p>
              </section>
            )}

            <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 z-10 flex gap-4 items-center shadow-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 text-xl">
                📡
              </div>
              <div>
                <h3 className="text-red-400 font-semibold mb-0.5 text-sm">Live Monitoring Active</h3>
                <p className="text-red-400/80 text-xs leading-relaxed">The AI is tracking {selectedZone?.city || "your city"}'s live weather and AQI dynamically.</p>
              </div>
            </section>

            <section className="z-10">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Payouts</h3>
                {claims.length > 0 && (
                  <button
                    onClick={() => setActiveTab("policies")}
                    className="text-primary text-xs font-medium hover:underline"
                  >
                    View all
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {claims.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-zinc-500 text-sm">No claims triggered yet.</p>
                    <p className="text-zinc-600 text-xs mt-1">If weather breaches the threshold, a payout will appear here instantly.</p>
                  </div>
                ) : (
                  claims.map(claim => (
                    <div key={claim.id} className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-colors hover:bg-zinc-800/80">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl text-lg flex items-center justify-center border bg-primary/10 border-primary/20 text-primary">
                          <span className="filter drop-shadow-md">
                            {claim.trigger_type === 'rain' ? '🌧️' : claim.trigger_type === 'heat' ? '☀️' : '🏭'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-zinc-200 font-medium text-[15px] capitalize">{claim.trigger_type} Alert</h4>
                          <p className="text-zinc-500 text-xs mt-1 font-medium">{new Date(claim.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold tracking-tight">₹{claim.amount}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <div className={`w-1 h-1 rounded-full ${claim.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">{claim.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "policies" && (
          <PoliciesView
            activePolicy={activePolicy}
            allPolicies={allPolicies}
            zones={zones}
            currentZone={selectedZone}
          />
        )}

        {activeTab === "settings" && (
          <div className="pt-4 z-10">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Settings</h1>
            <p className="text-zinc-500 text-sm">Coming soon.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="z-10 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800/80 px-6 py-3 flex-shrink-0">
        <ul className="flex justify-around">
          {navItems.map(({ tab, icon, label }) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-1 transition-colors"
                style={{ color: activeTab === tab ? "#16a34a" : "#71717a" }}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
