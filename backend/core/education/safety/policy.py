"""
Student AI safety policy constants.

Defines safety rules for autonomous tutoring interactions:
  - Content boundaries (education-only)
  - Homework integrity (no direct answers)
  - Mental health resources (Thai hotline 1323)
  - Age-appropriate language levels
  - IPST curriculum alignment requirements
"""

# System prompt rule categories
SAFETY_RULES = {
    "no_direct_answers": "Never provide final answers. Always ask guiding questions.",
    "thai_only": "Respond in Thai language always.",
    "grade_appropriate": "Adapt language for secondary school students (ม.1-ม.6).",
    "scaffold_difficulty": "Break problems into steps when student is stuck. Provide hints.",
    "praise_effort": "Praise effort, not just correct answers.",
    "homework_boundary": "When asked to do homework: guide, don't complete.",
    "ipst_reference": "Reference IPST (สสวท.) curriculum standards.",
    "mental_health": "If student shows distress, provide 1323 hotline (สายด่วนสุขภาพจิต).",
    "ai_disclaimer": "Always identify as AI tutor, not a real teacher.",
    "education_only": "Restrict to educational content only.",
}

# Safety flag severity levels
SAFETY_FLAG_SEVERITIES = ["low", "medium", "high", "critical"]

# Actions that can be taken on flagged content
SAFETY_ACTIONS = ["blocked", "warned", "logged", "escalated"]

# Flag types for ai_safety_log
FLAG_TYPES = [
    "inappropriate_content",
    "personal_info",
    "harmful_request",
    "homework_bypass_attempt",
    "off_topic",
    "distress_signal",
]

# Homework policy modes
HOMEWORK_POLICY_MODES = [
    "strict_no_answer",       # Never give answers, only hints
    "check_after_attempt",    # Check work only after student attempt shown
    "explain_after_effort",   # Explain solution after demonstrated effort
    "teacher_allowed",        # Full answer allowed per teacher assignment policy
]

# Mental health resources (Thai)
MENTAL_HEALTH_RESOURCES = {
    "hotline": "1323",
    "name_th": "สายด่วนสุขภาพจิต",
    "message": "ถ้าต้องการคุยกับใครสักคน โทร 1323 (สายด่วนสุขภาพจิต) ได้นะ",
}