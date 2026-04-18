"""Media billing integration stub"""
async def deduct_media_cost(account_id: str, amount: float, description: str) -> dict:
    return {"success": True, "amount": amount}

async def get_media_spending(account_id: str, period_days: int = 30) -> float:
    return 0.0

class MediaBilling:
    async def deduct_cost(self, account_id: str, amount: float, description: str) -> dict:
        return {"success": True, "amount": amount}
    
    async def get_spending(self, account_id: str, period_days: int = 30) -> float:
        return 0.0

media_billing = MediaBilling()
