"""
Unit tests34m for education tool policy decisions.

Verifies:
  - Allowed tools pass policy check
  - Denied tools are blocked
  - Always-denied tools are blocked regardless of policy
  - Assignment context requirement is enforced
  - Default student lab policy is restrictive
"""

import pytest
from backend.core.education.safety.tool_policy import (
    ToolPolicy,
    ToolPolicyResult,
    ToolDecision,
    DEFAULT_STUDENT_LAB_POLICY,
    STUDENT_ALWAYS_DENIED_TOOLS,
)


class TestToolPolicyBasics:
    """Basic tool policy allow/deny behavior."""

    def test_explicitly_allowed_tool_passes(self):
        """A tool in the allowed list with assignment context should be allowed."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["read_file"],
            require_assignment_context=False,
        )
        result = policy.check_tool("read_file")
        assert result.allowed is True
        assert result.decision == ToolDecision.ALLOW

    def test_explicitly_denied_tool_is_blocked(self):
        """A tool in the denied list should be blocked."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["read_file"],
            denied_tools=["terminal"],
            require_assignment_context=False,
        )
        result = policy.check_tool("terminal")
        assert result.allowed is False
        assert result.decision == ToolDecision.DENY

    def test_unlisted_tool_is_blocked(self):
        """A tool not in the allowed list should be blocked."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["read_file"],
            require_assignment_context=False,
        )
        result = policy.check_tool("write_file")
        assert result.allowed is False
        assert result.decision == ToolDecision.DENY

    def test_denied_takes_precedence_over_allowed(self):
        """If a tool is both in allowed and denied, denied wins."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["terminal"],
            denied_tools=["terminal"],
            require_assignment_context=False,
        )
        result = policy.check_tool("terminal")
        assert result.allowed is False


class TestAssignmentContextRequirement:
    """Assignment context must be present when required."""

    def test_blocked_without_assignment_context(self):
        """Tool should be blocked if assignment context is required but absent."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["read_file"],
            require_assignment_context=True,
        )
        result = policy.check_tool("read_file", has_assignment_context=False)
        assert result.allowed is False
        assert "assignment context" in result.reason.lower()

    def test_allowed_with_assignment_context(self):
        """Tool should be allowed if assignment context is present."""
        policy = ToolPolicy(
            name="test",
            allowed_tools=["read_file"],
            require_assignment_context=True,
        )
        result = policy.check_tool("read_file", has_assignment_context=True)
        assert result.allowed is True


class TestStudentAlwaysDeniedTools:
    """Certain tools are always denied for students."""

    def test_terminal_always_denied_for_student(self):
        """Terminal access should always be denied for students."""
        assert "terminal" in STUDENT_ALWAYS_DENIED_TOOLS

    def test_credential_access_always_denied_for_student(self):
        """Credential access should always be denied for students."""
        assert "credential_access" in STUDENT_ALWAYS_DENIED_TOOLS

    def test_default_policy_denies_always_denied_tools(self):
        """Default student policy should deny the always-denied tools."""
        for tool in STUDENT_ALWAYS_DENIED_TOOLS:
            assert tool in DEFAULT_STUDENT_LAB_POLICY.denied_tools, (
                f"Tool '{tool}' should be in default denied list"
            )


class TestDefaultStudentLabPolicy:
    """Default student lab policy is appropriately restrictive."""

    def test_default_policy_requires_assignment_context(self):
        """Default policy should require assignment context."""
        assert DEFAULT_STUDENT_LAB_POLICY.require_assignment_context is True

    def test_default_policy_disallows_browser(self):
        """Default policy should not allow browser by default."""
        assert DEFAULT_STUDENT_LAB_POLICY.allow_browser is False

    def test_default_policy_disallows_filesystem_write(self):
        """Default policy should not allow filesystem32u writes."""
        assert DEFAULT_STUDENT_LAB_POLICY.allow_filesystem_write is False

    def test_default_policy_disallows_network_access(self):
        """Default policy should not allow network access."""
        assert DEFAULT_STUDENT_LAB_POLICY.allow_network_access is False

    def test_default_policy_disallows_code_execution(self):
        """Default policy should not allow code execution."""
        assert DEFAULT_STUDENT_LAB_POLICY.allow_code_execution is False

    def test_default_policy_max_duration_is_30_minutes(self):
        """Default session should be capped at 30 minutes."""
        assert DEFAULT_STUDENT_LAB_POLICY.max_session_duration_minutes == 30


class TestToolPolicyResult:
    """ToolPolicyResult dataclass behavior."""

    def test_result_requires_audit_by_default(self):
        """Tool policy results should require auditing by default."""
        result = ToolPolicyResult(
            allowed=False,
            reason="test",
            tool_name="test_tool",
        )
        assert result.requires_audit is True

    def test_allow_result_has_correct_decision(self):
        """Allowed result should have ALLOW decision."""
        result = ToolPolicyResult(
            allowed=True,
            reason="test",
            tool_name="test_tool",
            decision=ToolDecision.ALLOW,
        )
        assert result.decision == ToolDecision.ALLOW