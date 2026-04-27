"""
Tutor orchestration service — manages Socratic tutoring sessions.

Coordinates:
  1. Thread creation/retrieval via agentpress ThreadManager
  2. Prompt assembly with subject context
  3. Agent run execution with streaming
  4. Interaction logging and mastery updates
  5. Safety policy enforcement
"""

import asyncio
import os
from pathlib import Path
from typing import Optional, AsyncGenerator, Dict, Any

from core.agentpress.thread_manager import ThreadManager
from core.agentpress.processor_config import ProcessorConfig
from core.education.tutoring.classifier import classify_message, TutorIntent
from core.education.safety.policy import (
    SAFETY_RULES,
    HOMEWORK_POLICY_MODES,
    MENTAL_HEALTH_RESOURCES,
)
from core.services.supabase import DBConnection

db = DBConnection()

# Load prompt templates
_PROMPTS_DIR = Path(__file__).parent.parent.parent.parent / "prompts" / "education"


def _load_prompt(filename: str) -> str:
    """Load a markdown prompt template."""
    path = _PROMPTS_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    # Fallback embedded prompt
    return "คุณคือ AI ผู้สอนแบบโสคราติกสำหรับนักเรียนไทย ตอบเป็นภาษาไทยเสมอ ห้ามให้คำตอบโดยตรง"


def build_system_prompt(subject: Optional[str] = None) -> str:
    """Build the system prompt for the tutor agent."""
    base_prompt = _load_prompt("socratic_tutor.md")

    subject_contexts = {
        "math": "\n\n## วิชาปัจจุบัน: คณิตศาสตร์\nครอบคลุม: พีชคณิต เรขาคณิต ตรีโกณมิติ สถิติ แคลคูลัสเบื้องต้น ตามหลักสูตร สสวท.",
        "physics": "\n\n## วิชาปัจจุบัน: ฟิสิกส์\nครอบคลุม: กลศาสตร์ คลื่น ไฟฟ้า แสง ความร้อน ฟิสิกส์อะตอม ตามหลักสูตร สสวท.",
        "chemistry": "\n\n## วิชาปัจจุบัน: เคมี\nครอบคลุม: อะตอม ตารางธาตุ พันธะเคมี ปฏิกิริยาเคมี สมดุลเคมี เคมีอินทรีย์ ตามหลักสูตร สสวท.",
        "biology": "\n\n## วิชาปัจจุบัน: ชีววิทยา\nครอบคลุม: เซลล์ พันธุศาสตร์ วิวัฒนาการ ระบบนิเวศ ร่างกายมนุษย์ ตามหลักสูตร สสวท.",
        "cs": "\n\n## วิชาปัจจุบัน: วิทยาการคอมพิวเตอร์\nครอบคลุม: อัลกอริทึม โปรแกรมมิ่ง ข้อมูล เครือข่าย AI เบื้องต้น ตามหลักสูตร สสวท.",
    }

    if subject and subject in subject_contexts:
        base_prompt += subject_contexts[subject]

    return base_prompt


async def create_tutor_thread(
    learner_id: str,
    subject: Optional[str] = None,
    title: Optional[str] = None,
) -> str:
    """Create a new tutor thread for a student."""
    manager = ThreadManager()
    thread_id = await manager.create_thread(
        metadata={
            "type": "education_tutor",
            "learner_id": learner_id,
            "subject": subject,
            "title": title or "บทสนทนาใหม่",
        }
    )

    # Create tutor_threads record for education metadata
    await db.execute(
        """
        INSERT INTO tutor_threads (thread_id, learner_id, subject_id)
        SELECT :thread_id, :learner_id, s.id
        FROM subjects s
        WHERE s.key = :subject
        """,
        {
            "thread_id": thread_id,
            "learner_id": learner_id,
            "subject": subject,
        },
    )

    return thread_id


async def run_tutor_message(
    thread_id: str,
    learner_id: str,
    message: str,
    subject: Optional[str] = None,
    stream: bool = True,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Process a student message and stream the tutor response.

    Yields event dicts: {"type": "text_delta", "content": "..."}
                        {"type": "message_complete", "message_id": "...", ...}
                        {"type": "error", "message": "..."}
    """
    # Classify intent
    classification = classify_message(message)

    #avian safety check
    if classification.intent == TutorIntent.SAFETY:
        yield {
            "type": "text_delta",
            "content": MENTAL_HEALTH_RESOURCES["message"],
        }
        yield {
            "type": "safety_escalation",
            "intent": "safety",
            "resource": MENTAL_HEALTH_RESOURCES,
        }
        return

    if classification.intent == TutorIntent.OFF_TOPIC:
        yield {
            "type": "text_delta",
            "content": "ฉันถูกออกแบบมาเพื่อช่วยเรื่องการเรียนโดยเฉพาะนะ มีอะไรให้ช่วยเรื่องเรียนไหม? 📚",
        }
        return

    # Build system prompt
    system_prompt = build_system_prompt(subject)

    # Adjust prompt based on intent
    if classification.intent == TutorIntent.HOMEWORK:
        homework_coach = _load_prompt("homework_coach.md")
        system_prompt = homework_coach
    elif classification.intent == TutorIntent.CHECK_WORK:
        system_prompt += "\n\n## โหมด: ตรวจการบ้าน\nนักเรียนได้ลองทำแล้วและต้องการให้ตรวจ ให้ตรวจทีละ步骤 และอธิบายว่าผิดตรงไหน"

    # Initialize ThreadManager and add user message
    manager = ThreadManager(thread_id=thread_id)
    await manager.add_message(
        thread_id=thread_id,
        content=message,
        role="user",
    )

    # Run the agent
    try:
        response_stream = await manager.run_thread(
            thread_id=thread_id,
            system_prompt={"role": "system", "content": system_prompt},
            stream=stream,
            processor_config=ProcessorConfig(),
            native_max_auto_continues=0,  # Single response, no tool loops for MVP
        )

        if hasattr(response_stream, "__aiter__"):
            async for event in response_stream:
                if isinstance(event, dict):
                    event_type = event.get("type", "unknown")
                    if event_type == "text_delta":
                        yield {"type": "text_delta", "content": event.get("content", "")}
                    elif event_type == "message_complete":
                        yield event
        else:
            # Non-streaming response
            content = response_stream.get("content", "")
            yield {"type": "text_delta", "content": content}
            yield {"type": "message_complete", "content": content}

    except Exception as e:
        yield {
            "type": "error",
            "message": f"ขอโทษนะ ตอนนี้มีปัญหาเล็กน้อย ลองถามใหม่อีกครั้งนะ! 🙏 ({str(e)[:100]})",
        }


async def get_thread_messages(thread_id: str) -> list[Dict[str, Any]]:
    """Retrieve messages for a tutor thread."""
    manager = ThreadManager(thread_id=thread_id)
    return await manager.get_llm_messages(thread_id)


async def get_student_threads(learner_id: str) -> list[Dict[str, Any]]:
    """List all tutor threads for a student."""
    result = await db.execute(
        """
        SELECT tt.thread_id, tt.subject_id, tt.created_at,
               t.updated_at, s.key as subject_key, s.name_th as subject_name
        FROM tutor_threads tt
        JOIN threads t ON tt.thread_id = t.thread_id
        LEFT JOIN subjects s ON tt.subject_id = s.id
        WHERE tt.learner_id = :learner_id
        ORDER BY t.updated_at DESC
        """,
        {"learner_id": learner_id},
    )
    return result or []