import { cacheSet, cacheGet } from "./offline-cache";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE
  ?? (typeof window !== "undefined"
    ? `http://${window.location.hostname}:8000`
    : "http://127.0.0.1:8000");

async function getAuthHeaders(): Promise<HeadersInit> {
  const { auth } = await import("./firebase");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function getAdminHeaders(): Promise<HeadersInit> {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ?? "";
  return { "X-Admin-Key": adminKey };
}

export async function fetchZones() {
  const res = await fetch(`${API_BASE}/zones/`);
  if (!res.ok) throw new Error("Failed to fetch zones");
  const data = await res.json();
  cacheSet("zones", data);
  return data;
}

export async function fetchZoneRisk(zoneId: number) {
  const res = await fetch(`${API_BASE}/zones/${zoneId}/risk`);
  if (!res.ok) throw new Error("Failed to fetch risk multiplier");
  return res.json();
}

export async function createRider(phoneNumber: string, zoneId: number, averageDailyIncome: number = 900, upiId: string) {
  const res = await fetch(`${API_BASE}/riders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
    body: JSON.stringify({
      phone_number: phoneNumber,
      platform_id: `platform_${Date.now()}`,
      zone_id: zoneId,
      upi_id: upiId,
      average_daily_income: averageDailyIncome
    })
  });
  if (!res.ok) throw new Error("Failed to create rider");
  return res.json();
}

export async function createSubscription(riderId: number) {
  const res = await fetch(`${API_BASE}/payment/create-subscription?rider_id=${riderId}`, {
    method: 'POST',
    headers: { ...await getAuthHeaders() },
  });
  if (!res.ok) throw new Error("Failed to create subscription");
  return res.json();
}

export async function verifySubscription(data: any) {
  const res = await fetch(`${API_BASE}/payment/verify-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to verify subscription");
  return res.json();
}

export async function fetchClaims(riderId: number) {
  try {
    const res = await fetch(`${API_BASE}/claims/rider/${riderId}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", ...await getAuthHeaders() }
    });
    if (!res.ok) throw new Error(`Failed to fetch claims (${res.status})`);
    const data = await res.json();
    cacheSet(`claims_${riderId}`, data);
    return data;
  } catch (err) {
    const cached = cacheGet(`claims_${riderId}`);
    if (cached) return cached.data;
    throw err;
  }
}

export async function fetchPolicies(riderId: number) {
  try {
    const res = await fetch(`${API_BASE}/policies/rider/${riderId}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", ...await getAuthHeaders() }
    });
    if (!res.ok) throw new Error(`Failed to fetch policies (${res.status})`);
    const data = await res.json();
    cacheSet(`policies_${riderId}`, data);
    return data;
  } catch (err) {
    const cached = cacheGet(`policies_${riderId}`);
    if (cached) return cached.data;
    throw err;
  }
}

export async function requestZoneChange(riderId: number, zoneId: number) {
  const res = await fetch(`${API_BASE}/riders/${riderId}/zone`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...await getAuthHeaders() },
    body: JSON.stringify({ zone_id: zoneId }),
  });
  if (!res.ok) throw new Error("Failed to request zone change");
  return res.json();
}

export async function simulateAdminEvent(riderId: number, triggerType: string, severity: number) {
  const res = await fetch(`${API_BASE}/admin/simulate_event/${riderId}?trigger_event=${triggerType}&severity=${severity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await getAdminHeaders() }
  });
  if (!res.ok) throw new Error("Failed to simulate event");
  return res.json();
}
