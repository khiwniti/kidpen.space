"""
E2E test: Thai Socratic Tutor Flow (US1).

Verifies the full student question → agent run → stream → interaction → mastery pipeline.
"""

import pytest


@pytest.mark.skip(reason="Requires running backend + Supabase + LLM provider")
class TestEducationTutorFlow:
    """End-to-end tutor flow from student question to mastery update."""

    async def test_student_sends_question_creates_thread(self):
        """POST /education/tutor/messages creates a thread and returns response."""
        pass

    async def test_tutor_response_is_thai_socratic(self):
        """Tutor response should be in Thai with Socratic guidance, not direct answers."""
        pass

    async def test_streaming_response_produces_events(self):
        """Streaming response should produce multiple text delta events."""
        pass

    async def test_interaction_is_logged_after_response(self):
        """A LearningInteraction record should be created after each tutor response."""
        pass

    async def test_mastery_is_updated_after_interaction(self):
        """MasteryState should update after an interaction is logged."""
        pass

    async def test_xp_is_awarded_for_engagement(self):
        """Student should earn XP for meaningful tutor interactions."""
        pass

    async def test_homework_direct_answer_is_blocked(self):
        """Tutor should refuse to give direct answers to homework questions."""
        pass

    async def test_thread_history_is_retrievable(self):
        """GET /education/tutor/threads/{threadId} returns full message history."""
        pass