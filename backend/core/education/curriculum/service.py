"""
Curriculum service — subject and knowledge component read models.

Provides validated access to subjects and knowledge components
for student browsing, teacher planning, and tutor context selection.
"""

from typing import Optional

# Subject keys aligned with prototype and spec
SUBJECT_KEYS = ["math", "physics", "chemistry", "biology", "cs"]

SUBJECT_NAMES_TH = {
    "math": "คณิตศาสตร์",
    "physics": "ฟิสิกส์",
    "chemistry": "เคมี",
    "biology": "ชีววิทยา",
    "cs": "วิทยาการคอมพิวเตอร์",
}

SUBJECT_COLORS = {
    "math": "#2563EB",
    "physics": "#F97316",
    "chemistry": "#10B981",
    "biology": "#8B5CF6",
    "cs": "#8B5CF6",
}

SUBJECT_ICONS = {
    "math": "Calculator",
    "physics": "Atom",
    "chemistry": "FlaskConical",
    "biology": "Leaf",
    "cs": "Code2",
}


async def list_subjects() -> list[dict]:
    """Return all available subjects with metadata."""
    return [
        {
            "key": key,
            "name_th": SUBJECT_NAMES_TH[key],
            "icon": SUBJECT_ICONS[key],
            "color": SUBJECT_COLORS[key],
        }
        for key in SUBJECT_KEYS
    ]


async def get_subject(subject_key: str) -> Optional[dict]:
    """Get a single subject by key."""
    if subject_key not in SUBJECT_KEYS:
        return None
    return {
        "key": subject_key,
        "name_th": SUBJECT_NAMES_TH[subject_key],
        "icon": SUBJECT_ICONS[subject_key],
        "color": SUBJECT_COLORS[subject_key],
    }


async def list_knowledge_components(
    subject: Optional[str] = None,
    grade_level: Optional[int] = None,
) -> list[dict]:
    """List knowledge components, optionally filtered by subject and grade level.

    TODO: Replace with Supabase query once migration T013 is applied.
    """
    # Stub — will query knowledge_components table after migration
    return []