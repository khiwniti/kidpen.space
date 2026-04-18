"""Tier handler implementation stub"""
FREE_TIER = "free"
PRO_TIER = "pro"

async def handle_tier_change(account_id: str, old_tier: str, new_tier: str) -> dict:
    return {"success": True}

async def apply_tier_limits(account_id: str, tier: str) -> dict:
    return {"success": True}
