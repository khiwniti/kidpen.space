"""
Step 9: Kidpen Admin API Key
"""

from setup.steps.base import BaseStep, StepResult
from setup.utils.secrets import generate_admin_api_key


class KidpenStep(BaseStep):
    """Auto-generate Kidpen admin API key."""

    name = "kidpen"
    display_name = "Kidpen Admin API Key"
    order = 9
    required = True
    depends_on = ["requirements"]

    def run(self) -> StepResult:
        # Always generate a new key (overwrite existing if any)
        self.info("Generating a secure admin API key for Kidpen administrative functions...")

        self.config.kidpen.KIDPEN_ADMIN_API_KEY = generate_admin_api_key()

        self.success("Kidpen admin API key generated.")
        self.success("Kidpen admin configuration saved.")

        return StepResult.ok(
            "Kidpen admin key generated",
            {"kidpen": self.config.kidpen.model_dump()},
        )

    def get_config_keys(self):
        return ["KIDPEN_ADMIN_API_KEY"]

    def is_complete(self) -> bool:
        return bool(self.config.kidpen.KIDPEN_ADMIN_API_KEY)
