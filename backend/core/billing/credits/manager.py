"""Credit manager stub"""
from typing import Optional

class CreditManager:
    async def deduct_credits(self, account_id: str, amount: float, description: str) -> dict:
        return {"success": True, "amount": amount, "remaining": 1000.0}
    
    async def get_balance(self, account_id: str) -> float:
        return 1000.0
    
    async def add_credits(self, account_id: str, amount: float, description: str) -> dict:
        return {"success": True, "amount": amount, "new_balance": 1000.0 + amount}
    
    async def reset(self, account_id: str) -> dict:
        return {"success": True}

credit_manager = CreditManager()
