"""
Learning interaction writer — records evidence from tutoring activity.

Logs each student interaction for:
  - Mastery tracking (BKT parameter updates)
  - Teacher/parent dashboards
  - Safety auditing
  - Analytics & intervention insights
"""

from datetime import datetime, timezone
from typing import Optional

from core.services.supabase import DBConnection

db = DBConnection()


async def write_interaction(
    student_id: str,
    thread_id: Optional[str] = None,
    kc_id: Optional[str] = None,
    subject: Optional[str] = None,
    is_correct: Optional[bool] = None,
    interaction_type: str = "chat",
    response_type: str = "chat",
    scaffolding_level: int = 1,
    response_time_ms: Optional[int] = None,
    hint_count: int = 0,
    evidence_summary: Optional[str] = None,
    lesson_id: Optional[str] = None,
    assignment_id: Optional[str] = None,
    safety_flag: Optional[str] = None,
) -> str:
    """Record a learning interaction and return the interaction ID."""
    result = await db.execute(
        """
        INSERT INTO student_interactions (
            student_id, thread_id, kc_id, subject,
            is_correct, interaction_type, response_type,
            scaffolding_level, response_time_ms, hint_count,
            evidence_summary, lesson_id, assignment_id, safety_flag
        ) VALUES (
            :student_id, :thread_id, :kc_id, :subject,
            :is_correct, :interaction_type, :response_type,
            :scaffolding_level, :response_time_ms, :hint_count,
            :evidence_summary, :lesson_id, :assignment_id, :safety_flag
        )
        RETURNING id
        """,
        {
            "student_id": student_id,
            "thread_id": thread_id,
            "kc_id": kc_id,
            "subject": subject,
            "is_correct": is_correct,
            "interaction_type": interaction_type,
            "response_type": response_type,
            "scaffolding_level": scaffolding_level,
            "response_time_ms": response_time_ms,
            "hint_count": hint_count,
            "evidence_summary": evidence_summary,
            "lesson_id": lesson_id,
            "assignment_id": assignment_id,
            "safety_flag": safety_flag,
        },
    )
    if result:
        return result[0]["id"]
    raise Exception("Failed to write interaction")


async def write_audit_event(
    actor_user_id: str,
    action: str,
    target_type: str,
    target_id: str,
    result: str = "allowed",
    reason_code: Optional[str] = None,
    trace_id: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> str:
    """Record an audit event for compliance and safety tracking."""
    audit_result = await db.execute(
        """
        INSERT INTO audit_events (
            actor_user_id, action, target_type, target_id,
            result, reason_code, trace_id, metadata
        ) VALUES (
            :actor_user_id, :action, :target_type, :target_id,
            :result, :reason_code, :trace_id, :metadata
        )
        RETURNING id
        """,
        {
            "actor_user_id": actor_user_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "result": result,
            "reason_code": reason_code,
            "trace_id": trace_id,
            "metadata": metadata or {},
        },
    )
    if audit_result:
        return audit_result[0]["id"]
    raise Exception("Failed to write audit event")