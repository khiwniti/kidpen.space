"""Stripe integration stub"""
async def get_subscription_status(account_id: str) -> dict:
    return {"status": "free", "plan": "free"}

async def create_checkout_session(account_id: str, price_id: str) -> str:
    return "checkout_session_stub"

async def cancel_subscription(account_id: str) -> bool:
    return True

class StripeAPIWrapper:
    def __init__(self):
        pass
    
    async def get_customer(self, account_id: str) -> dict:
        return {"id": "cus_stub", "email": "stub@example.com"}
    
    async def create_customer(self, account_id: str, email: str) -> dict:
        return {"id": "cus_stub", "email": email}
    
    async def get_subscription(self, subscription_id: str) -> dict:
        return {"status": "active", "items": {"data": []}}
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        return True
    
    async def create_checkout_session(self, price_id: str, customer_id: str) -> str:
        return "cs_stub"
    
    async def create_portal_session(self, customer_id: str) -> str:
        return "bps_stub"

stripe_api_wrapper = StripeAPIWrapper()
