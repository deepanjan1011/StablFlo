"""
Razorpay Payouts integration.
Uses Razorpay X (current account) to initiate UPI payouts.
In test mode, uses Razorpay's sandbox — no real money moves.
Falls back to simulation when placeholder credentials are detected.
"""
import os
import requests
from requests.auth import HTTPBasicAuth

_BASE = "https://api.razorpay.com/v1"
_PLACEHOLDER_KEYS = {"", "rzp_test_testkey", "secret"}


def _credentials() -> tuple[str, str, str]:
    """Read credentials live so env var changes at runtime take effect."""
    return (
        os.getenv("RAZORPAY_KEY_ID", ""),
        os.getenv("RAZORPAY_KEY_SECRET", ""),
        os.getenv("RAZORPAY_ACCOUNT_NUMBER", ""),
    )


def _is_placeholder() -> bool:
    key_id, key_secret, _ = _credentials()
    return key_id in _PLACEHOLDER_KEYS or key_secret in _PLACEHOLDER_KEYS


def _auth() -> HTTPBasicAuth:
    key_id, key_secret, _ = _credentials()
    return HTTPBasicAuth(key_id, key_secret)


def _create_contact(upi_id: str, claim_id: int) -> str | None:
    """Create a Razorpay Contact and return the contact_id."""
    payload = {
        "name": f"Rider {upi_id}",
        "type": "vendor",
        "reference_id": f"stablflo_rider_{claim_id}",
        "email": "rider@stablflo.in",
        "contact": "9999999999",
    }
    try:
        r = requests.post(f"{_BASE}/contacts", json=payload, auth=_auth(), timeout=10)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        print(f"[PAYOUT] Contact creation failed: {e}")
        return None


def _create_fund_account(contact_id: str, upi_id: str) -> str | None:
    """Create a Fund Account for the contact and return fund_account_id."""
    payload = {
        "contact_id": contact_id,
        "account_type": "vpa",
        "vpa": {"address": upi_id},
    }
    try:
        r = requests.post(f"{_BASE}/fund_accounts", json=payload, auth=_auth(), timeout=10)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        print(f"[PAYOUT] Fund account creation failed: {e}")
        return None


def initiate_payout(rider_upi: str, amount: int, claim_id: int) -> dict:
    """
    Initiates a UPI payout via Razorpay X.
    amount is in INR (converted to paise internally).
    Returns dict with status and transaction_id.
    """
    _, _, account_number = _credentials()
    if _is_placeholder() or not account_number:
        print(f"[PAYOUT] SIMULATED (No RazorpayX Account Configured) — ₹{amount} to {rider_upi} for Claim #{claim_id}")
        return {"status": "simulated", "transaction_id": f"txn_sim_{claim_id}"}

    contact_id = _create_contact(rider_upi, claim_id)
    if not contact_id:
        return {"status": "failed", "error": "contact_creation_failed"}

    fund_account_id = _create_fund_account(contact_id, rider_upi)
    if not fund_account_id:
        return {"status": "failed", "error": "fund_account_creation_failed"}

    _, _, account_number = _credentials()
    if not account_number:
        print(f"[PAYOUT] FAILED — RAZORPAY_ACCOUNT_NUMBER not configured")
        return {"status": "failed", "error": "account_number_not_configured"}

    payload = {
        "account_number": account_number,
        "fund_account_id": fund_account_id,
        "amount": amount * 100,           # paise
        "currency": "INR",
        "mode": "UPI",
        "purpose": "payout",
        "queue_if_low_balance": True,
        "reference_id": f"stablflo_claim_{claim_id}",
        "narration": f"StablFlo payout Claim#{claim_id}",
    }
    try:
        r = requests.post(f"{_BASE}/payouts", json=payload, auth=_auth(), timeout=15)
        r.raise_for_status()
        data = r.json()
        txn_id = data.get("id", f"txn_{claim_id}")
        print(f"[PAYOUT] SUCCESS — ₹{amount} to {rider_upi}, txn: {txn_id}")
        return {"status": "success", "transaction_id": txn_id}
    except requests.HTTPError as e:
        try:
            error_body = e.response.json() if e.response else {}
        except Exception:
            error_body = {"raw": e.response.text if e.response else ""}
        print(f"[PAYOUT] FAILED — {error_body}")
        return {"status": "failed", "error": str(error_body)}
    except Exception as e:
        print(f"[PAYOUT] EXCEPTION — {e}")
        return {"status": "failed", "error": str(e)}

def _get_razorpay_client():
    import razorpay
    key_id, key_secret, _ = _credentials()
    if not key_id or not key_secret:
        return None
    return razorpay.Client(auth=(key_id, key_secret))

def create_subscription(amount_paise: int, plan_name: str) -> dict:
    """
    Creates a weekly plan and a subscription.
    """
    if _is_placeholder():
        # simulate returning a fake subscription
        return {"subscription_id": "sub_fake_12345", "plan_id": "plan_fake_67890"}

    client = _get_razorpay_client()
    if not client:
        raise ValueError("Razorpay credentials not set.")
    
    # 1. Create a Plan
    plan_data = {
        "period": "weekly",
        "interval": 1,
        "item": {
            "name": plan_name,
            "amount": amount_paise,
            "currency": "INR",
            "description": "StablFlo Weekly Premium"
        }
    }
    plan = client.plan.create(plan_data)
    plan_id = plan["id"]

    # 2. Create a Subscription
    sub_data = {
        "plan_id": plan_id,
        "total_count": 52,     # Valid for 1 year (52 weeks) 
        "customer_notify": 1
    }
    subscription = client.subscription.create(sub_data)
    return {"subscription_id": subscription["id"], "plan_id": plan_id}

def charge_subscription(subscription_id: str, amount_paise: int, reference: str) -> dict:
    """
    Charge a rider's existing Razorpay subscription mandate for renewal.
    In test / placeholder mode this is fully simulated — no real charge occurs.
    """
    if _is_placeholder() or not subscription_id:
        print(f"[RENEWAL] SIMULATED charge — ₹{amount_paise // 100} for sub {subscription_id} ref={reference}")
        return {"status": "simulated", "reference": reference}

    client = _get_razorpay_client()
    if not client:
        return {"status": "failed", "error": "razorpay_client_unavailable"}

    try:
        result = client.subscription.pending_update(subscription_id, {"quantity": 1})
        print(f"[RENEWAL] SUCCESS — sub {subscription_id}, ref={reference}")
        return {"status": "success", "result": result}
    except Exception as e:
        print(f"[RENEWAL] CHARGE FAILED — {e}")
        return {"status": "failed", "error": str(e)}


def verify_subscription_signature(payment_id: str, subscription_id: str, signature: str) -> bool:
    """Verifies the Razorpay mandate creation signature."""
    if _is_placeholder():
        return True # Simulate always successful verification

    client = _get_razorpay_client()
    if not client:
        return False

    try:
        client.utility.verify_subscription_payment_signature({
            'razorpay_subscription_id': subscription_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
        return True
    except Exception as e:
        print(f"[SIGNATURE] Verification failed: {e}")
        return False
