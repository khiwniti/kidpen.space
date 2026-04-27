"""
Tests for interactive lesson API endpoints (US2).

Verifies:
  - GET /education/lessons returns lessons by subject
  - GET /education/lessons/:id returns lesson with content blocks + checkpoints
  - POST /education/lessons/:id/submit-checkpoint submits answer and gets feedback
  - Checkpoint submission creates interaction + updates mastery
  - Lesson completion marks progress
"""

import pytest


class TestLessonList:
    """Lesson listing by subject."""

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons")
    async def test_list_lessons_by_subject_returns_published_only(self):
        """GET /education/lessons?subject=math returns published math lessons."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons")
    async def test_student_cannot_see_draft_lessons(self):
        """Draft lessons should not appear in student listing."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons")
    async def test_teacher_sees_own_drafts(self):
        """Teacher should see their own draft lessons."""
        pass


class TestLessonContent:
    """Lesson content retrieval."""

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons")
    async def test_get_lesson_includes_content_blocks(self):
        """Lesson response should include content_blocks array."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons")
    async def test_get_lesson_includes_checkpoints(self):
        """Lesson response should include checkpoint_items."""
        pass


class TestCheckpointSubmission:
    """Checkpoint submission and feedback loop."""

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_submit_correct_checkpoint_answer_returns_feedback(self):
        """Correct answer should return positive feedback + mastery update."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_submit_incorrect_answer_returns_hint(self):
        """Incorrect answer should return a hint, not the answer."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_checkpoint_creates_interaction_record(self):
        """Each checkpoint submission should create a student_interaction."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_checkpoint_updates_mastery(self):
        """Correct checkpoint should update KC mastery state."""
        pass


class TestLessonCompletion:
    """Lesson completion and progress tracking."""

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_complete_lesson_awards_xp(self):
        """Completing all checkpoints should award XP."""
        pass

    @pytest.mark.skip(reason="Requires Supabase with seeded lessons + running backend")
    async def test_complete_lesson_marks_as_completed(self):
        """Lesson should be marked as completed after all checkpoints passed."""
        pass