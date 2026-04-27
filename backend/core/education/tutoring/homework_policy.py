"""
Homework policy state machine (US3).

Enforces homework integrity policies:
  - strict_no_answer: Never give direct answers, only hints
  - check_after_attempt: Verify work only after student attempt is shown
  - explain_after_effort: Explain solution after demonstrated effort
  - teacher_allowed: Full answers permitted per teacher assignment policy
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class HomeworkPolicyResult:
    """Result of evaluating a homework policy against student input."""
    action: str  # "allow", "blocked", "escalate"
    mode: Optional[str] = None  # hint, verify_not_answer, explain_stepwise
    feedback: str = ""
    redirect_to: Optional[str] = None
    requires_audit: bool = True


@dataclass
class HomeworkIntent:
    """Whether a student message shows homework intent."""
    is_homework: bool
    confidence: float = 0.0  # 0.0 - 1.0
    subtype: Optional[str] = None  # direct_request, check_work, request_explanation
    keywords_matched: list[str] = field(default_factory=list)


class HomeworkPolicyEngine:
    """Evaluates homework policies against student messages."""

    def __init__(self, mode: str = "strict_no_answer"):
        self.mode = mode

    def evaluate(
        self,
        student_message: str,
        has_student_attempt: bool = False,
        effort_count: int = 0,
    ) -> HomeworkPolicyResult:
        if self.mode == "strict_no_answer":
            return self._evaluate_strict(student_message)
        elif self.mode == "check_after_attempt":
            return self._evaluate_check_after(student_message, has_student_attempt)
        elif self.mode == "explain_after_effort":
            return self._evaluate_explain_after(student_message, has_student_attempt, effort_count)
        elif self.mode == "teacher_allowed":
            return HomeworkPolicyResult(action="allow", requires_audit=False)
        else:
            return HomeworkPolicyResult(
                action="blocked",
                feedback="ไม่สามารถดำเนินการในโหมดนี้ได้",
            )

    def _evaluate_strict(self, message: str) -> HomeworkPolicyResult:
        intent = detect_homework_intent(message)
        if not intent.is_homework:
            return HomeworkPolicyResult(action="allow", requires_audit=False)

        # Check if it's asking for a direct answer
        if intent.subtype == "direct_request":
            return HomeworkPolicyResult(
                action="blocked",
                mode="hint",
                feedback="มาลองคิดด้วยกันนะ! เริ่มจากตรงไหนดี?",
                redirect_to="hint",
            )

        if intent.subtype == "request_explanation":
            return HomeworkPolicyResult(
                action="allow",
                mode="hint",
                feedback="",
            )

        return HomeworkPolicyResult(action="allow", mode="hint")

    def _evaluate_check_after(
        self, message: str, has_attempt: bool
    ) -> HomeworkPolicyResult:
        intent = detect_homework_intent(message)
        if not intent.is_homework:
            return HomeworkPolicyResult(action="allow", requires_audit=False)

        if not has_attempt:
            return HomeworkPolicyResult(
                action="blocked",
                feedback="ช่วยลองทำดูก่อนนะ! แล้วมาดูด้วยกันว่าถูกไหม 😊",
                redirect_to="hint",
            )

        return HomeworkPolicyResult(
            action="allow",
            mode="verify_not_answer",
        )

    def _evaluate_explain_after(
        self, message: str, has_attempt: bool, effort_count: int
    ) -> HomeworkPolicyResult:
        intent = detect_homework_intent(message)
        if not intent.is_homework:
            return HomeworkPolicyResult(action="allow", requires_audit=False)

        if not has_attempt or effort_count < 2:
            return HomeworkPolicyResult(
                action="blocked",
                feedback="ลองพยายามอีกนิดนะ! ฉันเชื่อว่าทำได้ 💪",
                redirect_to="hint",
            )

        return HomeworkPolicyResult(
            action="allow",
            mode="explain_stepwise",
        )


# Thai homework intent keywords
_DIRECT_REQUEST_KEYWORDS = [
    "ทำการบ้านให้", "ช่วยทำ", "ทำให้หน่อย", "ขอวิธีทำ",
    "ให้คำตอบ", "บอกคำตอบ", "เฉลย", "ตอบหน่อย",
    "คำตอบคืออะไร", "ตอบข้อไหน", "ข้อไหนถูก",
    "homework", "do for me", "give answer",
]

_CHECK_WORK_KEYWORDS = [
    "ตรวจให้", "ช่วยดูให้", "ถูกไหม", "เช็คให้",
    "ที่ทำไป", "วิธีที่ทำ", "check", "verify",
]

_REQUEST_EXPLANATION_KEYWORDS = [
    "อธิบาย", "ช่วยสอน", "ไม่เข้าใจ", "สอนหน่อย",
    "explain", "teach", "help understand",
]


def detect_homework_intent(message: str) -> HomeworkIntent:
    """Detect whether a message is asking for homework help."""
    msg_lower = message.lower()

    direct_matches = [k for k in _DIRECT_REQUEST_KEYWORDS if k in msg_lower]
    if direct_matches:
        return HomeworkIntent(
            is_homework=True,
            confidence=min(0.95, 0.6 + len(direct_matches) * 0.1),
            subtype="direct_request",
            keywords_matched=direct_matches,
        )

    check_matches = [k for k in _CHECK_WORK_KEYWORDS if k in msg_lower]
    if check_matches:
        return HomeworkIntent(
            is_homework=True,
            confidence=0.7,
            subtype="check_work",
            keywords_matched=check_matches,
        )

    explain_matches = [k for k in _REQUEST_EXPLANATION_KEYWORDS if k in msg_lower]
    if explain_matches:
        return HomeworkIntent(
            is_homework=False,  # Explanation requests are educational, not homework bypass
            confidence=0.3,
            subtype="request_explanation",
        )

    return HomeworkIntent(is_homework=False, confidence=0.0)


def get_policy(mode: str) -> HomeworkPolicyEngine:
    """Get a homework policy engine for a given mode."""
    return HomeworkPolicyEngine(mode=mode)