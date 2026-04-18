"""RevenueCat utilities stub"""
async def get_subscription_status(account_id: str) -> dict:
    return {"status": "free", "expiration_date_ms": None}

async def restore_purchases(account_id: str, receipt: str) -> dict:
    return {"success": True}
