const API_BASE = "http://127.0.0.1:8000";

export async function fetchZones() {
  const res = await fetch(`${API_BASE}/zones/`);
  if (!res.ok) throw new Error("Failed to fetch zones");
  return res.json();
}

export async function createRider(phoneNumber: string, zoneId: number) {
  const res = await fetch(`${API_BASE}/riders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone_number: phoneNumber,
      platform_id: `platform_${Date.now()}`,
      zone_id: zoneId,
      upi_id: `${phoneNumber}@upi`
    })
  });
  if (!res.ok) throw new Error("Failed to create rider");
  return res.json();
}

export async function createPolicy(riderId: number) {
  const res = await fetch(`${API_BASE}/policies/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rider_id: riderId, duration_days: 7 })
  });
  if (!res.ok) throw new Error("Failed to create policy");
  return res.json();
}

export async function fetchClaims(riderId: number) {
  const res = await fetch(`${API_BASE}/claims/rider/${riderId}`);
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function fetchPolicies(riderId: number) {
  const res = await fetch(`${API_BASE}/policies/rider/${riderId}`);
  if (!res.ok) throw new Error("Failed to fetch policies");
  return res.json();
}
