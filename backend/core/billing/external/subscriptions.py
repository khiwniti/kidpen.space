"""External subscriptions stub"""
async def sync_subscriptions() -> dict:
    return {"synced": 0, "errors": []}

async def verify_subscription(account_id: str) -> dict:
    return {"active": True, "tier": "free"}
