"""Billing subscriptions module"""
from typing import Dict

class FreeTierService:
    name = "free_tier"
    
    @staticmethod
    async def get_tier_info(account_id: str) -> Dict:
        return {"tier": "free", "features": [], "limits": {}}
    
    @staticmethod
    async def check_access(account_id: str, feature: str) -> bool:
        return True

free_tier_service = FreeTierService()
