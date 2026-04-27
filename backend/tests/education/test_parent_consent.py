import pytest


class TestGuardianRelationship:
    @pytest.mark.skip(reason="Requires Supabase with guardians+children seeded")
    async def test_guardian_can_link_to_verified_child(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with guardians+children seeded")
    async def test_unverified_link_is_blocked(self):
        pass


class TestConsentManagement:
    @pytest.mark.skip(reason="Requires Supabase with consent records")
    async def test_guardian_can_grant_consent(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with consent records")
    async def test_withdraw_consent_blocks_access(self):
        pass


class TestVisibilityControl:
    @pytest.mark.skip(reason="Requires Supabase with guardians+children")
    async def test_parent_sees_progress_summary(self):
        pass

    @pytest.mark.skip(reason="Requires Supabase with guardians+children")
    async def test_conversations_hidden_by_default(self):
        pass