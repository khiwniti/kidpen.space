"""Billing module stubs for development"""
from typing import Dict

class SubscriptionService:
    async def get_subscription(self, account_id: str) -> Dict:
        return {"tier": "free", "status": "active"}
    
    async def create_subscription(self, account_id: str, tier: str) -> Dict:
        return {"id": "sub_stub", "tier": tier}
    
    async def cancel_subscription(self, account_id: str) -> Dict:
        return {"success": True}

subscription_service = SubscriptionService()
