"""Billing cache utilities stub"""
from typing import Optional

async def get_cached_value(key: str) -> Optional[any]:
    return None

async def set_cached_value(key: str, value: any, ttl: int = 3600) -> bool:
    return True
