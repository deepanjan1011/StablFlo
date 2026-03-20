"use client";

import { useState, useEffect } from "react";
import { fetchZones, createRider, createPolicy, fetchClaims, fetchPolicies } from "@/lib/api";
import { PoliciesView } from "@/lib/PoliciesView";
import { ProfileDrawer } from "@/lib/ProfileDrawer";
import { SettingsView } from "@/lib/SettingsView";

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  function getMonogram(phoneStr: string): string {
    const digits = phoneStr.replace(/\D/g, "").slice(-10);
    if (digits.length < 6) return (digits.slice(0, 2) || "??").toUpperCase();
    return (digits[0] + digits[5]).toUpperCase();
  }

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

  const monogram = getMonogram(phone);
  const digits10 = phone.replace(/\D/g, "").slice(-10);
  const upiId = digits10.length === 10
    ? `${digits10.slice(0, 5)}@upi`
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
                aria-label="Open profile"
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
