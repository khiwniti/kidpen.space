"""
PDPA consent service — helpers for consent state validation.

Thai PDPA (Personal Data Protection Act) requires explicit consent
for minors' data processing. This service provides:
  - Consent state checking for students
  - Guardian relationship verification
  - Consent scope validation for data access
"""

from enum import Enum
from typing import Optional


class ConsentState(str, Enum):
    ACTIVE = "active"
    MISSING = "missing"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class ConsentScope(str, Enum):
    DATA_COLLECTION = "data_collection"
    AI_TUTORING = "ai_tutoring"
    ANALYTICS = "analytics"


async def get_consent_state(learner_id: str) -> ConsentState:
    """Get the current consent state for a learner.

    TODO: Query consent_records + parental_consents tables after migration T013.
    """
    return ConsentState.MISSING


async def has_required_consent(
    learner_id: str,
    scope: ConsentScope,
) -> bool:
    """Check if required consent is active for a given scope."""
    state = await get_consent_state(learner_id)
    return state == ConsentState.ACTIVE


async def require_consent_or_raise(
    learner_id: str,
    scope: ConsentScope,
) -> None:
    """Raise if required consent is not active. Placeholder for middleware usage."""
    if not await has_required_consent(learner_id, scope):
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail=f"Consent required for scope: {scope.value}",
        )