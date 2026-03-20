import os

def initiate_payout(rider_upi: str, amount: int, claim_id: int):
    """
    Mock payout handler for Razorpay.
    """
    # In a real scenario, this would call Razorpay Payouts API.
    # We will just print/log it for the prototype.
    print(f"[PAYOUT] Initiating payout of Rs. {amount} to {rider_upi} for Claim #{claim_id}")
    return {"status": "success", "transaction_id": f"txn_mock_{claim_id}"}
