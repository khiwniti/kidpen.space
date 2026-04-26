"""
Tool policy model for role/tenant/assignment-bounded computer-use.

Determines which tools a student can access during lab sessions
based on:
  - Role (student vs teacher)
  - Tenant policy (school-wide tool restrictions)
  - Assignment context (per-assignment tool allowlists)
  - Safety constraints (always-deny patterns)
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ToolDecision(str, Enum):
    ALLOW = "allow"
    DENY = "deny"


@dataclass
class ToolPolicyResult:
    """Result of a tool policy check."""
    allowed: bool
    reason: str
    tool_name: str
    decision: ToolDecision = ToolDecision.DENY
    requires_audit: bool = True


@dataclass
class ToolPolicy:
    """A tool policy that can be attached to tenants or assignments."""

    id: Optional[str] = None
    name: str = "default"
    allowed_tools: list[str] = field(default_factory=list)
    denied_tools: list[str] = field(default_factory=list)
    require_assignment_context: bool = True
    max_session_duration_minutes: int = 60
   ump allow_browser: bool = False
    allow_filesystem_write: bool = False
    allow_network_access: bool = False
    allow_code_execution: bool = False

    def check_tool(
        self,
        tool_name: str,
        has_assignment_context: bool = False,
    ) -> ToolPolicyResult:
        """Check whether a tool is allowed under this policy."""
        if self.require_assignment_context and not has_assignment_context:
            return ToolPolicyResult(
                allowed=False,
                reason="Tool use requires active assignment context",
                tool_name=tool_name,
            )

        if tool_name in self.denied_tools:
            return ToolPolicyResult(
                allowed=False,
                reason=f"Tool '{tool_name}' is explicitly denied by policy",
                tool_name=tool_name,
            )

        if tool_name in self.allowed_tools:
            return ToolPolicyResult(
                allowed=True,
                reason=f"Tool '{tool_name}' is explicitly allowed by policy",
                tool_name=tool_name,
                decision=ToolDecision.ALLOW,
            )

        return ToolPolicyResult(
            allowed=False,
            reason=f"Tool '{tool_name}' is not in the allowed list",
            tool_name=tool_name,
        )


# Always-denied tools for student safety (regardless of policy)
STUDENT_ALWAYS_DENIED_TOOLS = {
    "terminal": "Unrestricted terminal access",
    "file_delete": "Destructive file operations",
    "network_egress": "Unrestricted network egress",
    "credential_access": "Credential/secret access",
}

# Default student lab policy — minimalsafest defaults
DEFAULT_STUDENT_LAB_POLICY = ToolPolicy(
    name="default_student_lab",
    allowed_tools=["read_file", "list_directory"],
    denied_tools=list(STUDENT_ALWAYS_DENIED_TOOLS.keys()),
    require_assignment_context=True,
    max_session_duration_minutes=30,
    allow_browser=False,
    allow_filesystem_write=False,
    allow_network_access=False,
    allow_code_execution=False,
)