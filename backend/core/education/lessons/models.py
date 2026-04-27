"""
Lesson domain models (US2).

Dataclasses for lesson content, checkpoints, practice items, and progress state.
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class ContentBlockType(str, Enum):
    TEXT = "text"
    CODE = "code"
    MATH = "math"
    IMAGE = "image"
    DIAGRAM = "diagram"
    VIDEO = "video"


class CheckpointResult(str, Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    PARTIAL = "partial"
    NOT_ATTEMPTED = "not_attempted"


class LessonStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class ContentBlock:
    """A single content block within a lesson."""
    type: ContentBlockType
    content: str
    media_url: Optional[str] = None
    alt_text: Optional[str] = None
    language: Optional[str] = None  # for code blocks


@dataclass
class CheckpointItem:
    """A checkpoint question within a lesson."""
    id: str
    question: str
    answer: str
    hints: list[str] = field(default_factory=list)
    explanation: Optional[str] = None
    result: CheckpointResult = CheckpointResult.NOT_ATTEMPTED
    attempts: int = 0


@dataclass
class PracticeItem:
    """A practice question within a lesson (unlimited attempts)."""
    id: str
    question: str
    answer: str
    hints: list[str] = field(default_factory=list)
    explanation: Optional[str] = None
    result: CheckpointResult = CheckpointResult.NOT_ATTEMPTED


@dataclass
class UserCheckpointState:
    """Tracks a student's progress on a specific checkpoint."""
    checkpoint_id: str
    result: CheckpointResult = CheckpointResult.NOT_ATTEMPTED
    attempts: int = 0
    hints_used: int = 0
    response_time_ms: Optional[int] = None


@dataclass
class Lesson:
    """Full lesson with all content, checkpoints, and practice items."""
    id: str
    subject_id: Optional[str]
    title_th: str
    title_en: Optional[str] = None
    objective: Optional[str] = None
    content_blocks: list[ContentBlock] = field(default_factory=list)
    checkpoint_items: list[CheckpointItem] = field(default_factory=list)
    practice_items: list[PracticeItem] = field(default_factory=list)
    knowledge_component_ids: list[str] = field(default_factory=list)
    source_type: str = "system"
    review_status: str = "draft"


@dataclass
class LessonProgress:
    """A student's progress through a lesson."""
    lesson_id: str
    student_id: str
    status: LessonStatus = LessonStatus.NOT_STARTED
    current_block_index: int = 0
    checkpoint_states: list[UserCheckpointState] = field(default_factory=list)
    checkpoint_count: int = 0
    completed_checkpoints: int = 0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None