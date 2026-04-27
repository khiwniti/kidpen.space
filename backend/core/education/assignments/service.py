"""
Assignment service (US4).

Handles:
  - Create/list/publish assignments
  - Assignment-level tool policy configuration
  - Teacher class progress summary
"""

from typing import Optional

from backend.core.services.supabase import DBConnection
from backend.core.education.mastery.service import get_student_mastery

db = DBConnection()


async def create_assignment(
    teacher_id: str,
    tenant_id: str,
    subject_id: Optional[str],
    title: str,
    instructions: Optional[str] = None,
    due_at: Optional[str] = None,
    homework_policy: str = "strict_no_answer",
    knowledge_component_ids: Optional[list[str]] = None,
) -> dict:
    """Create a new assignment (initially draft)."""
    result = await db.execute(
        """
        INSERT INTO assignments (
            teacher_id, tenant_id, subject_id, title, instructions,
            due_at, homework_solution_policy, knowledge_component_ids, status
        ) VALUES (
            :teacher_id, :tenant_id, :subject_id, :title, :instructions,
            :due_at, :homework_policy, :kc_ids, 'draft'
        )
        RETURNING id, title, status, created_at
        """,
        {
            "teacher_id": teacher_id,
            "tenant_id": tenant_id,
            "subject_id": subject_id,
            "title": title,
            "instructions": instructions,
            "due_at": due_at,
            "homework_policy": homework_policy,
            "kc_ids": knowledge_component_ids or [],
        },
    )
    return result[0]


async def publish_assignment(assignment_id: str, teacher_id: str) -> dict:
    """Publish a draft assignment."""
    result = await db.execute(
        """
        UPDATE assignments SET status = 'published', updated_at = now()
        WHERE id = :id AND teacher_id = :teacher_id
        RETURNING id, status
        """,
        {"id": assignment_id, "teacher_id": teacher_id},
    )
    if not result:
        raise ValueError("Assignment not found or not owned by teacher")
    return result[0]


async def list_teacher_assignments(teacher_id: str) -> list[dict]:
    """List all assignments created by a teacher."""
    result = await db.execute(
        """
        SELECT a.*, s.key AS subject_key, s.name_th AS subject_name
        FROM assignments a
        LEFT JOIN subjects s ON a.subject_id = s.id
        WHERE a.teacher_id = :teacher_id
        ORDER BY a.created_at DESC
        """,
        {"teacher_id": teacher_id},
    )
    return result or []


async def close_assignment(assignment_id: str, teacher_id: str) -> dict:
    """Close an assignment (prevent further submissions)."""
    result = await db.execute(
        """
        UPDATE assignments SET status = 'closed', updated_at = now()
        WHERE id = :id AND teacher_id = :teacher_id
        RETURNING id, status
        """,
        {"id": assignment_id, "teacher_id": teacher_id},
    )
    if not result:
        raise ValueError("Assignment not found")
    return result[0]


async def get_class_mastery_summary(
    tenant_id: str,
    subject_id: Optional[str] = None,
) -> list[dict]:
    """Get aggregated mastery summary for all students in a school.

    TODO: Batch query student_kc_mastery across all students in tenant.
    """
    students = await db.execute(
        """
        SELECT id FROM user_profiles
        WHERE school_id = :tenant_id
        """,
        {"tenant_id": tenant_id},
    )

    if not students:
        return []

    summaries = []
    for student in students:
        mastery = await get_student_mastery(str(student["id"]), None)
        summaries.append({
            "student_id": str(student["id"]),
            "mastery_count": len(mastery),
            "mastery_states": mastery,
        })

    return summaries


async def get_kc_misconception_summary(
    tenant_id: str,
    subject: Optional[str] = None,
) -> list[dict]:
    """Get KCs with the lowest16m mastery across the school.

    TODO: Query student_kc_mastery aggregated across all students in tenant.
    """
    if subject:
        result = await db.execute(
            """
            SELECT kc.id, kc.name, kc.subject,
                   AVG(skm.p_mastery) AS avg_mastery,
                   COUNT(DISTINCT skm.student_id) AS student_count
            FROM student_kc_mastery skm
            JOIN knowledge_components kc ON skm.kc_id = kc.id
            WHERE EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = skm.student_id AND up.school_id = :tenant_id
            )
            AND kc.subject = :subject
            GROUP BY kc.id, kc.name, kc.subject
            ORDER BY avg_mastery ASC
            LIMIT 10
            """,
            {"tenant_id": tenant_id, "subject": subject},
        )
    else:
        result = await db.execute(
            """
            SELECT kc.id, kc.name, kc.subject,
                   AVG(skm.p_mastery) AS avg_mastery,
                   COUNT(DISTINCT skm.student_id) AS student_count
            FROM student_kc_mastery skm
            JOIN knowledge_components kc ON skm.kc_id = kc.id
            WHERE EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = skm.student_id AND up.school_id = :tenant_id
            )
            GROUP BY kc.id, kc.name, kc.subject
            ORDER BY avg_mastery ASC
            LIMIT 10
            """,
            {"tenant_id": tenant_id},
        )

    return result or []