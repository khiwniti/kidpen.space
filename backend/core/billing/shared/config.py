"""Billing configuration stub"""
TOKEN_PRICE_MULTIPLIER = 1.0
DEFAULT_TOKENS_PER_CREDIT = 1000
FREE_TIER_TOKENS = 50000

CREDITS_PER_DOLLAR = 1000
CREDITS_PER_REFERRAL = 500
MIN_WITHDRAWAL_AMOUNT = 50

def get_memory_config():
    return {"enabled": True, "max_vectors": 1000}

def is_memory_enabled() -> bool:
    return True
