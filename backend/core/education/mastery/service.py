"""
Mastery update service — updates student mastery state from interactions.

Implements a simplified BKT (Bayesian Knowledge Tracing) update:
  - p_mastery: probability student has mastered the KC
  - Updated after each interaction using correctness evidence
  - Returns new mastery state for frontend display
"""

from typing import Optional

from core.services.supabase import DBConnection

db = DBConnection()


async def update_mastery(
    student_id: str,
    kc_id: str,
    subject: str,
    is_correct: bool,
    interaction_id: str,
) -> dict:
    """Update mastery state for a student-KC pair after an interaction.

    Simple exponential moving average update + opportunity tracking.
    Production should use pyBKT or an IRT model for accurate estimates.
    """
    existing = await db.execute(
        """
        SELECT * FROM student_kc_mastery
        WHERE student_id = :student_id AND kc_id = :kc_id
        """,
        {"student_id": student_id, "kc_id": kc_id},
    )

    if existing:
        record = existing[0]
        old_p = record["p_mastery"]
        opp = record["opportunity_count"] + 1
        correct = record["correct_count"] + (1 if is_correct else 0)

        # EMA update: weight new evidence at 0.1, old at 0.9
        evidence = 1.0 if is_correct else 0.0
        new_p = round(0.9 * old_p + 0.1 * evidence, 4)
        new_p = max(0.0, min(1.0, new_p))

        # Confidence: increases with more opportunities
        confidence = min(0.95, opp / (opp + 5))

        await db.execute(
            """
            UPDATE student_kc_mastery
            SET p_mastery = :p_mastery,
                opportunity_count = :opportunity_count,
                correct_count = :correct_count,
                confidence = :confidence,
                last_evidence_interaction_id = :interaction_id,
                last_practiced = now(),
                updated_at = now()
            WHERE student_id = :student_id AND kc_id = :kc_id
            """,
            {
                "student_id": student_id,
                "kc_id": kc_id,
                "p_mastery": new_p,
                "opportunity_count": opp,
                "correct_count": correct,
                "confidence": confidence,
                "interaction_id": interaction_id,
            },
        )

        return {
            "student_id": student_id,
            "kc_id": kc_id,
            "p_mastery": new_p,
            "confidence": confidence,
            "opportunity_count": opp,
            "correct_count": correct,
            "updated": True,
        }
    else:
        # Create initial mastery record
        initial_p = 0.7 if is_correct else 0.3
        await db.execute(
            """
            INSERT INTO student_kc_mastery (
                student_id, kc_id, p_mastery, opportunity_count,
                correct_count, confidence, last_evidence_interaction_id
            ) VALUES (
                :student_id, :kc_id, :p_mastery, 1,
                :correct_count, 0.2, :interaction_id
            )
            """,
            {
                "student_id": student_id,
                "kc_id": kc_id,
                "p_mastery": initial_p,
                "correct_count": 1 if is_correct else 0,
                "interaction_id": interaction_id,
            },
        )

        return {
            "student_id": student_id,
            "kc_id": kc_id,
            "p_mastery": initial_p,
            "confidence": 0.2,
            "opportunity_count": 1,
            "correct_count": 1 if is_correct else 0,
            "updated": False,
        }


async def get_student_mastery(
    student_id: str,
    subject: Optional[str] = None,
) -> list[dict]:
    """Get all mastery states for a student, optionally filtered by subject.

    TODO: Join with knowledge_components and subjects for rich display.
    """
    if subject:
        result = await db.execute(
            """
            SELECT * FROM student_kc_mastery skm
            JOIN knowledge_components kc ON skm.kc_id = kc.id
            WHERE skm.student_id = :student_id AND kc.subject = :subject
            ORDER BY skm.updated_at DESC
            """,
            {"student_id": student_id, "subject": subject},
        )
    else:
        result = await db.execute(
            """
            SELECT * FROM student_kc_mastery
            WHERE student_id = :student_id
            ORDER BY updated_at DESC
            """,
            {"student_id": student_id},
        )

    return result or []


async def award_xp(student_id: str, amount: int = 10) -> int:
    """Award XP to a student and return new total.

    TODO: Update user_profiles or students table.
    """
    # MVP: Return placeholder. Production will update user_profiles.xp
    return amount