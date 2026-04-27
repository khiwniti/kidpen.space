"""
Homework policy unit tests (US3).

Verifies the homework state machine behavior:
  - strict_no_answer: hints only, never direct answers
  - check_after_attempt: requires student attempt first
  - explain_after_effort: explains after demonstrated effort
  - teacher_allowed: full answers permitted per assignment
  - Transition rules and escalation triggers
"""

import pytest
from backend.core.education.tutoring import homework_policy


class TestStrictNoAnswerMode:
    def test_direct_answer_is_always_blocked(self):
        """In strict_no_answer mode, any request for answer should be blocked."""
        policy = homework_policy.get_policy("strict_no_answer")
        result = policy.evaluate(
            student_message="ขอคำตอบหน่อย",
            has_student_attempt=False,
        )
        assert result.action == "blocked"
        assert result.redirect_to == "hint"

    def test_conceptual_question_is_allowed(self):
        """Conceptual questions not asking for answers should pass."""
        policy = homework_policy.get_policy("strict_no_answer")
        result = policy.evaluate(
            student_message="ช่วยอธิบายวิธีการหาพื้นที่สามเหลี่ยม",
            has_student_attempt=False,
        )
        assert result.action == "allow"


class TestCheckAfterAttemptMode:
    def test_no_attempt_is_blocked(self):
        """Asking to check work without showing attempt is blocked."""
        policy = homework_policy.get_policy("check_after_attempt")
        result = policy.evaluate(
            student_message="ช่วยตรวจให้หน่อย",
            has_student_attempt=False,
        )
        assert result.action == "blocked"
        assert "ลองทำก่อน" in result.feedback

    def test_with_attempt_is_allowed(self):
        """Asking to check work with attempt shown is allowed."""
        policy = homework_policy.get_policy("check_after_attempt")
        result = policy.evaluate(
            student_message="ฉันทำแล้วได้ x = 5 ถูกไหม?",
            has_student_attempt=True,
        )
        assert result.action == "allow"
        assert result.mode == "verify_not_answer"


class TestExplainAfterEffortMode:
    def test_no_effort_is_blocked(self):
        """Request for explanation without evidence of effort is blocked."""
        policy = homework_policy.get_policy("explain_after_effort")
        result = policy.evaluate(
            student_message="อธิบายให้หน่อย",
            has_student_attempt=False,
            effort_count=0,
        )
        assert result.action == "blocked"

    def test_after_effort_is_allowed(self):
        """Request for explanation after 3+ attempts is allowed."""
        policy = homework_policy.get_policy("explain_after_effort")
        result = policy.evaluate(
            student_message="อธิบายให้หน่อย",
            has_student_attempt=True,
            effort_count=3,
        )
        assert result.action == "allow"
        assert result.mode == "explain_stepwise"


class TestTeacherAllowedMode:
    def test_always_allowed_in_teacher_allowed_mode(self):
        """In teacher_allowed mode,14m everything is allowed."""
        policy = homework_policy.get_policy("teacher_allowed")
        result = policy.evaluate(
            student_message="ขอคำตอบเลย",
            has_student_attempt=False,
        )
        assert result.action == "allow"


class TestHomeworkKeywordDetection:
    def test_detects_thai_homework_request(self):
        """Should detect 'ทำการบ้านให้หน่อย' as homework intent."""
        result = homework_policy.detect_homework_intent("ทำการบ้านให้หน่อย")
        assert result.is_homework is True

    def test_detects_answer_key_request(self):
        """Should detect 'ขอเฉลย' as homework intent."""
        result = homework_policy.detect_homework_intent("ขอเฉลยหน่อย")
        assert result.is_homework is True

    def test_no_homework_detected_for_normal_question(self):
        """Normal questions should not be flagged as homework."""
        result = homework_policy.detect_homework_intent("สอนชีววิทยาเรื่อง cells ให้หน่อย")
        assert result.is_homework is False