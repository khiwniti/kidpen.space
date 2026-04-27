"""
Tutor request classifier — determines the intent of a student message.

Routes messages to the appropriate tutoring strategy:
  - concept: new concept exploration → socratic questioning
  - homework: homework help → homework coach policy
  - check_work: student wants verification → check-after-attempt
  - safety: distress or inappropriate content → safety escalation
  - off_topic: non-educational → redirect
  - lab: computer-use lab command → lab session handler (Phase 8)
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class TutorIntent(str, Enum):
    CONCEPT = "concept"          # New concept exploration
    HOMEWORK = "homework"        # Homework help request
    CHECK_WORK = "check_work"    # Student wants answer verified
    SAFETY = "safety"            # Distress or harmful content
    OFF_TOPIC = "off_topic"      # Non-educational
    LAB = "lab"                  # Computer-use lab command


@dataclass
class ClassifiedRequest:
    intent: TutorIntent
    confidence: float  # 0.0 - 1.0
    subject: Optional[str] = None
    reasoning: str = ""


# Thai keywords for intent classification
_HOMEWORK_KEYWORDS = [
    "การบ้าน", "แบบฝึกหัด", "ใบงาน", "ข้อสอบ", "สอบ",
    "ทำการบ้าน", "ส่งงาน", "อาจารย์สั่ง", "ครูให้",
    "homework", "assignment", "exercise",
]

_CHECK_WORK_KEYWORDS = [
    "ถูกไหม", "ถูกรึเปล่า", "ใช่ไหม", "ตรวจให้หน่อย",
    "เช็คให้หน่อย", "ดูให้หน่อย", "ที่ทำไป",
    "ที่คิดไว้", "คำตอบคือ", "ตอบว่า", "ได้คำตอบ",
    "check", "correct", "verify",
]

_SAFETY_KEYWORDS = [
    "เครียด", "ท้อ", "ไม่อยาก", "เบื่อ", "เหนื่อย",
    "自杀", "ตาย", "ไม่ไหว", "ทุกข์",
]

_OFF_TOPIC_KEYWORDS = [
    "แฟน", "เกม", "หนัง", "เพลง", "ซื้อ",
    "girlfriend", "boyfriend", "game",
]


def classify_message(message: str) -> ClassifiedRequest:
    """Classify a student message into one of the tutor intents.

    Simple keyword-based classification with confidence scoring.
    Production should evolve to use a fine-tuned Thai BERT classifier.
    """
    msg_lower = message.lower()

    # Check safety signals first (highest priority)
    safety_matches = [k for k in _SAFETY_KEYWORDS if k in msg_lower]
    if safety_matches:
        return ClassifiedRequest(
            intent=TutorIntent.SAFETY,
            confidence=min(0.9, 0.6 + len(safety_matches) * 0.1),
            reasoning=f"Safety keywords detected: {safety_matches}",
        )

    # Check homework intent
    hw_matches = [k for k in _HOMEWORK_KEYWORDS if k in msg_lower]
    cw_matches = [k for k in _CHECK_WORK_KEYWORDS if k in msg_lower]

    if cw_matches and "?" in message:
        return ClassifiedRequest(
            intent=TutorIntent.CHECK_WORK,
            confidence=min(0.9, 0.6 + cw_matches * 0.1),
            reasoning=f"Work-check keywords: {cw_matches}",
        )

    if hw_matches:
        return ClassifiedRequest(
            intent=TutorIntent.HOMEWORK,
            confidence=min(0.9, 0.5 + hw_matches * 0.1),
            reasoning=f"Homework keywords: {hw_matches}",
        )

    # Check off-topic
    off_matches = [k for k in _OFF_TOPIC_KEYWORDS if k in msg_lower]
    if off_matches:
        return ClassifiedRequest(
            intent=TutorIntent.OFF_TOPIC,
            confidence=0.6,
            reasoning=f"Off-topic keywords: {off_matches}",
        )

    # Default: concept exploration
    return ClassifiedRequest(
        intent=TutorIntent.CONCEPT,
        confidence=0.5,
        reasoning="Default concept exploration",
    )