"""Subscription tier handlers stub"""
FREE_TIER = "free"
PRO_TIER = "pro"
ENTERPRISE_TIER = "enterprise"

async def get_tier_handler(tier: str):
    class TierHandler:
        async def handle_upgrade(self, account_id: str) -> dict:
            return {"success": True}
        async def handle_downgrade(self, account_id: str) -> dict:
            return {"success": True}
    return TierHandler()
