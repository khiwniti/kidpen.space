"""
Teacher dashboard tests (US4).

Verifies teacher role boundaries and class summary access.
"""

import pytest


class TestTeacherDashboardAccess:
    """Teacher can access their school and class data."""

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_teacher_can_list_class_students(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_teacher_cannot_access_other_school_data(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_teacher_sees_class_mastery_summary(self):
        pass


class TestAssignmentManagement:
    """Teacher assignment CRUD."""

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_create_assignment_makes_it_draft(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_publish_assignment_makes_it_available(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with teachers + students seeded")
    async def test_student_submission_shows_in_teacher_view(self):
        pass


class TestTeacherInsights:
    """Teacher insight and intervention read models."""

    @pytest.mark.skip(reason="Requires Supabase with mastery data")
    async def test_misconception_summary_shows_common_errors(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with mastery data")
    async def test_intervention_suggestions_rank_by_need(self):
        pass