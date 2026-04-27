"""
Interactive Lesson service (US2).

Handles:
  - Listing published lessons by subject
  - Retrieving full lesson content + checkpoints
  - Processing checkpoint submissions with hint escalation
  - Computing lesson progress
  - Marking lesson completion
"""

from typing import Optional

from core.services.supabase import DBConnection
from core.education.lessons.models import (
    ContentBlock,
    ContentBlockType,
    CheckpointItem,
    CheckpointResult,
    PracticeItem,
    Lesson,
    LessonProgress,
    LessonStatus,
    UserCheckpointState,
)
from core.education.mastery.service import update_mastery
from core.education.mastery.interactions import write_interaction

db = DBConnection()


async def list_published_lessons(
    subject_id: Optional[str] = None,
) -> list[dict]:
    """List published lessons, optionally filtered by subject."""
    if subject_id:
        result = await db.execute(
            """
            SELECT l.*, s.key AS subject_key, s.name_th AS subject_name
            FROM lessons l
            LEFT JOIN subjects s ON l.subject_id = s.id
            WHERE l.review_status = 'published'
              AND (l.subject_id = :subject_id)
            ORDER BY l.created_at DESC
            """,
            {"subject_id": subject_id},
        )
    else:
        result = await db.execute(
            """
            SELECT l.*, s.key AS subject_key, s.name_th AS subject_name
            FROM lessons l
            LEFT JOIN subjects s ON l.subject_id = s.id
            WHERE l.review_status = 'published'
            ORDER BY l.created_at DESC
            """,
        )

    return result or []


async def get_lesson(lesson_id: str) -> Optional[Lesson]:
    """Get a full lesson by ID including content blocks and checkpoints."""
    result = await db.execute(
        """
        SELECT * FROM lessons WHERE id = :lesson_id
        """,
        {"lesson_id": lesson_id},
    )

    if not result:
        return None

    row = result[0]
    content_blocks = [
        ContentBlock(
            type=ContentBlockType(b.get("type", "text")),
            content=b.get("content", ""),
            media_url=b.get("media_url"),
            alt_text=b.get("alt_text"),
            language=b.get("language"),
        )
        for b in (row.get("content_blocks") or [])
    ]

    checkpoint_items = [
        CheckpointItem(
            id=str(i),
            question=c.get("question", ""),
            answer=c.get("answer", ""),
            hints=c.get("hints", []),
            explanation=c.get("explanation"),
        )
        for i, c in enumerate(row.get("checkpoint_items") or [])
    ]

    practice_items = [
        PracticeItem(
            id=str(i),
            question=p.get("question", ""),
            answer=p.get("answer", ""),
            hints=p.get("hints", []),
            explanation=p.get("explanation"),
        )
        for i, p in enumerate(row.get("practice_items") or [])
    ]

    return Lesson(
        id=str(row["id"]),
        subject_id=str(row["subject_id"]) if row.get("subject_id") else None,
        title_th=row["title_th"],
        title_en=row.get("title_en"),
        objective=row.get("objective"),
        content_blocks=content_blocks,
        checkpoint_items=checkpoint_items,
        practice_items=practice_items,
        knowledge_component_ids=row.get("knowledge_component_ids") or [],
        source_type=row["source_type"],
        review_status=row["review_status"],
    )


async def submit_checkpoint(
    lesson_id: str,
    student_id: str,
    checkpoint_index: int,
    answer: str,
) -> dict:
    """Submit an answer for a checkpoint and return feedback.

    Returns:
      {
        "result": "correct" | "incorrect" | "partial",
        "feedback": "message in Thai",
        "hint": "next hint if incorrect",
        "hints_used": int,
        "mastery_updated": bool,
      }
    """
    lesson = await get_lesson(lesson_id)
    if not lesson:
        return {"result": "error", "feedback": "ไม่พบบทเรียนนี้"}

    if checkpoint_index >= len(lesson.checkpoint_items):
        return {"result": "error", "feedback": "ไม่พบข้อคำถามนี้"}

    checkpoint = lesson.checkpoint_items[checkpoint_index]
    checkpoint.attempts += 1

    # Normalize answers for comparison
    is_correct = _check_answer(answer, checkpoint.answer)

    if is_correct:
        checkpoint.result = CheckpointResult.CORRECT

        # Log interaction
        await write_interaction(
            student_id=student_id,
            subject=lesson.subject_id,
            is_correct=True,
            interaction_type="lesson_checkpoint",
            evidence_summary=f"Checkpoint {checkpoint_index} of lesson {lesson_id}: correct",
            hint_count=checkpoint.attempts - 1,
        )

        # Update mastery for each KC
        for kc_id in lesson.knowledge_component_ids:
            await update_mastery(
                student_id=student_id,
                kc_id=kc_id,
                subject=lesson.subject_id or "general",
                is_correct=True,
                interaction_id=f"lesson_{lesson_id}_cp_{checkpoint_index}",
            )

        return {
            "result": "correct",
            "feedback": "ถูกต้อง! เยี่ยมมาก! 🎉",
            "explanation": checkpoint.explanation,
            "hints_used": checkpoint.attempts - 1,
            "mastery_updated": True,
        }

    # Incorrect — provide hint
    hints = checkpoint.hints or []
    hints_used = checkpoint.attempts  # each incorrect attempt uses one hint

    if hints and hints_used <= len(hints):
        hint = hints[min(hints_used - 1, len(hints) - 1)]
    else:
        hint = "ลองคิดอีกครั้งนะ! ลองทบทวนเนื้อหาข้างบนดู"

    # Log incorrect attempt
    await write_interaction(
        student_id=student_id,
        subject=lesson.subject_id,
        is_correct=False,
        interaction_type="lesson_checkpoint",
        hint_count=hints_used,
    )

    return {
        "result": "incorrect",
        "feedback": "ยังไม่ถูกนะ ลองอีกครั้ง! 💪",
        "hint": hint,
        "hints_used": hints_used,
        "mastery_updated": False,
    }


def _check_answer(student_answer: str, correct_answer: str) -> bool:
    """Simple answer comparison with normalization.

    Production should use a more robust comparison (Levenshtein, numeric tolerance, etc.)
    """
    sa = student_answer.strip().lower()
    ca = correct_answer.strip().lower()
    return sa == ca


async def get_lesson_progress(
    lesson_id: str,
    student_id: str,
) -> LessonProgress:
    """Get a student's progress through a lesson.

    TODO: Implement persistent progress tracking table.
    Currently returns fresh state.
    """
    lesson = await get_lesson(lesson_id)
    if not lesson:
        return LessonProgress(
            lesson_id=lesson_id,
            student_id=student_id,
            status=LessonStatus.NOT_STARTED,
        )

    return LessonProgress(
        lesson_id=lesson_id,
        student_id=student_id,
        status=LessonStatus.NOT_STARTED,
        checkpoint_count=len(lesson.checkpoint_items),
        completed_checkpoints=0,
        checkpoint_states=[
            UserCheckpointState(checkpoint_id=str(i))
            for i in range(len(lesson.checkpoint_items))
        ],
    )


async def complete_lesson(
    lesson_id: str,
    student_id: str,
) -> dict:
    """Mark a lesson as complete and award XP.

    TODO: Persist completion in a lesson_completions table.
    """
    # Award XP
    from core.education.mastery.service import award_xp
    xp = await award_xp(student_id, 50)

    return {
        "lesson_id": lesson_id,
        "status": "completed",
        "xp_awarded": 50,
        "message": "เรียนจบแล้ว! ยอดเยี่ยมมาก! 🎉",
    }