"""
Education API router — aggregates all education sub-routers.

Endpoints are organized by domain:
  - /education/health       Platform metadata & status
  - /education/subjects     Curriculum & subject browsing
  - /education/tutor/*      Socratic tutoring chat & threads
  - /education/mastery/*    Student mastery & progress
  - /education/lessons/*    Structured interactive lessons
  - /education/assignments/* Teacher assignment management
  - /education/teacher/*    Teacher dashboards & insights
  - /education/parent/*     Guardian views & consent
  - /education/labs/*       Computer-use lab sessions
  - /education/safety/*     Safety policy & audit
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from .curriculum.service import list_subjects, get_subject
from .mastery.service import get_student_mastery, update_mastery, award_xp
from .mastery.interactions import write_interaction
from core.utils.auth_utils import verify_and_get_user_id_from_jwt

router = APIRouter()


class TutorMessageRequest(BaseModel):
    thread_id: Optional[str] = None
    subject: Optional[str] = None
    message: str


@router.get("/education/health")
async def education_health():
    """Health check and platform metadata for the education module."""
    return {
        "status": "ok",
        "module": "kidpen-education",
        "version": "0.1.0",
        "features": {
            "socratic_tutor": True,
            "thai_language": True,
            "subjects": ["math", "physics", "chemistry", "biology", "cs"],
            "ipst_aligned": True,
            "mastery_tracking": True,
            "pdpa_consent": True,
            "teacher_dashboard": True,
            "parent_dashboard": True,
            "computer_lab": False,  # Phase 8
        },
        "spec": "001-autonomous-education-platform",
        "data_model": "specs/001-autonomous-education-platform/data-model.md",
    }


@router.get("/education/subjects")
async def education_list_subjects():
    """List all available STEM subjects with Thai metadata."""
    subjects = await list_subjects()
    return subjects


@router.get("/education/subjects/{subject_key}")
async def education_get_subject(subject_key: str):
    """Get a single subject by key."""
    subject = await get_subject(subject_key)
    if subject is None:
        raise HTTPException(status_code=404, detail=f"Subject not found: {subject_key}")
    return subject


# ═══════════════════════════════════════════════════════
# T028: POST /education/tutor/messages
# T029: GET  /education/tutor/threads/{threadId}
# T030: GET  /education/mastery/me
# ═══════════════════════════════════════════════════════


@router.post("/education/tutor/messages")
async def tutor_send_message(
    body: TutorMessageRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Send a message to the Socratic tutor and stream the response.

    If thread_id is not provided, creates a new tutor thread.
    Returns SSE stream of text_delta events + final message_complete.
    """
    from .tutoring.service import run_tutor_message, create_tutor_thread

    thread_id = body.thread_id
    if not thread_id:
        thread_id = await create_tutor_thread(
            learner_id=user_id,
            subject=body.subject,
            title=body.message[:60],
        )

    async def event_stream():
        try:
            async for event in run_tutor_message(
                thread_id=thread_id,
                learner_id=user_id,
                message=body.message,
                subject=body.subject,
                stream=True,
            ):
                event_type = event.get("type", "unknown")
                if event_type == "text_delta":
                    yield f"data: {event['content']}\n\n"
                elif event_type == "message_complete":
                    # Log interaction
                    await write_interaction(
                        student_id=user_id,
                        thread_id=thread_id,
                        subject=body.subject,
                        interaction_type="chat",
                    )
                    # Update mastery (simple stub for MVP)
                    kc_id = f"{body.subject or 'general'}_chat"
                    await update_mastery(
                        student_id=user_id,
                        kc_id=kc_id,
                        subject=body.subject or "general",
                        is_correct=None,  # Chat interactions aren't scored
                        interaction_id="chat",
                    )
                    await award_xp(user_id, 10)
                    yield f"data: [DONE]\n\n"
                elif event_type == "error":
                    yield f"data: [ERROR] {event['message']}\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/education/tutor/threads/{thread_id}")
async def tutor_get_thread(
    thread_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Get messages for a tutor thread."""
    from .tutoring.service import get_thread_messages
    messages = await get_thread_messages(thread_id)
    return {"thread_id": thread_id, "messages": messages}


@router.get("/education/tutor/threads")
async def tutor_list_threads(
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """List all tutor threads for the current student."""
    from .tutoring.service import get_student_threads
    threads = await get_student_threads(user_id)
    return {"threads": threads}


@router.get("/education/mastery/me")
async def mastery_get_mine(
    subject: Optional[str] = None,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Get the current student's mastery states."""
    mastery = await get_student_mastery(user_id, subject)
    return {"mastery": mastery}


# ═══════════════════════════════════════════════════════
# T040: Lesson endpoints (US2)
# ═══════════════════════════════════════════════════════


class CheckpointSubmitRequest(BaseModel):
    checkpoint_index: int
    answer: str


@router.get("/education/lessons")
async def lessons_list(
    subject: Optional[str] = None,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """List published lessons, optionally filtered by subject key."""
    from .lessons.service import list_published_lessons
    lessons = await list_published_lessons(subject_id=subject)
    return {"lessons": lessons}


@router.get("/education/lessons/{lesson_id}")
async def lessons_get(
    lesson_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Get a full lesson with content blocks, checkpoints, and practice items."""
    from .lessons.service import get_lesson
    lesson = await get_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/education/lessons/{lesson_id}/checkpoint")
async def lessons_submit_checkpoint(
    lesson_id: str,
    body: CheckpointSubmitRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Submit an answer for a checkpoint and get feedback."""
    from .lessons.service import submit_checkpoint
    result = await submit_checkpoint(
        lesson_id=lesson_id,
        student_id=user_id,
        checkpoint_index=body.checkpoint_index,
        answer=body.answer,
    )
    return result


@router.get("/education/lessons/{lesson_id}/progress")
async def lessons_get_progress(
    lesson_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Get current progress through a lesson."""
    from .lessons.service import get_lesson_progress
    progress = await get_lesson_progress(lesson_id, user_id)
    return progress


@router.post("/education/lessons/{lesson_id}/complete")
async def lessons_complete(
    lesson_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Mark a lesson as complete and award XP."""
    from .lessons.service import complete_lesson
    result = await complete_lesson(lesson_id, user_id)
    return result


# ═══════════════════════════════════════════════════════
# T052: Teacher assignment/dashboard endpoints (US4)
# ═══════════════════════════════════════════════════════


class CreateAssignmentRequest(BaseModel):
    subject_id: Optional[str] = None
    title: str
    instructions: Optional[str] = None
    due_at: Optional[str] = None
    homework_policy: Optional[str] = "strict_no_answer"
    knowledge_component_ids: Optional[list[str]] = None


@router.post("/education/assignments")
async def assignments_create(
    body: CreateAssignmentRequest,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Create a new assignment (teacher only)."""
    from .assignments.service import create_assignment
    result = await create_assignment(
        teacher_id=user_id,
        tenant_id="default",
        subject_id=body.subject_id,
        title=body.title,
        instructions=body.instructions,
        due_at=body.due_at,
        homework_policy=body.homework_policy or "strict_no_answer",
        knowledge_component_ids=body.knowledge_component_ids,
    )
    return result


@router.get("/education/assignments")
async def assignments_list(
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """List teacher's assignments."""
    from .assignments.service import list_teacher_assignments
    assignments = await list_teacher_assignments(user_id)
    return {"assignments": assignments}


@router.post("/education/assignments/{assignment_id}/publish")
async def assignments_publish(
    assignment_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Publish a draft assignment."""
    from .assignments.service import publish_assignment
    result = await publish_assignment(assignment_id, user_id)
    return result


@router.post("/education/assignments/{assignment_id}/close")
async def assignments_close(
    assignment_id: str,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Close an assignment."""
    from .assignments.service import close_assignment
    result = await close_assignment(assignment_id, user_id)
    return result


@router.get("/education/teacher/dashboard")
async def teacher_dashboard(
    subject: Optional[str] = None,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Teacher dashboard with class mastery and misconception summary."""
    from .assignments.service import get_class_mastery_summary, get_kc_misconception_summary
    mastery = await get_class_mastery_summary("default", subject)
    misconceptions = await get_kc_misconception_summary("default", subject)
    return {
        "class_mastery": mastery,
        "misconceptions": misconceptions,
    }


# ═══════════════════════════════════════════════════════
# T055/US5: Parent visibility + consent endpoints (US5)
# ═══════════════════════════════════════════════════════


@router.get("/education/parent/dashboard")
async def parent_dashboard(
    child_id: Optional[str] = None,
    user_id: str = Depends(verify_and_get_user_id_from_jwt),
):
    """Parent/guardian dashboard showing linked child's progress."""
    from .pdpa.service import require_consent_or_raise, ConsentScope
    # TODO: Verify guardian relationship exists
    if child_id:
        await require_consent_or_raise(child_id, ConsentScope.DATA_COLLECTION)
        mastery = await get_student_mastery(child_id)
        return {"child_id": child_id, "mastery": mastery}
    return {"children": [], "message": "ยังไม่ได้เชื่อมต่อกับบัญชีนักเรียน"}