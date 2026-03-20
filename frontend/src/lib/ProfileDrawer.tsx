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
