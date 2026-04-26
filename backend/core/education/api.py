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

from fastapi import APIRouter

from .curriculum.service import list_subjects, get_subject

router = APIRouter()


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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Subject not found: {subject_key}")
    return subject