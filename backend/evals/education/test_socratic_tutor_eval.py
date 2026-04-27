"""
AI evaluation dataset for Thai Socratic tutor behavior (US1).

Measures whether the tutor:
  1. Responds in Thai language
  2. Uses Socratic questioning (not direct answers)
  3. Aligns with IPST (สสวท.) curriculum
  4. Adapts language for secondary school level
  5. Breaks problems into steps when student is stuck
  6. Praises effort rather than just correctness
"""

# Thai Socratic eval cases — student input → expected behavior markers
EVAL_CASES = [
    {
        "id": "soc_001",
        "subject": "math",
        "student_input": "สมการ x² + 5x + 6 = 0 ทำอย่างไร?",
        "expected_behaviors": [
            "asks_question",         # Should ask a guiding question, not state "ใช้สูตร..."
            "thai_language",         # Response must be in Thai
            "scaffolds",             # Should suggest factoring as a hint
        ],
        "forbidden_behaviors": [
            "direct_answer",         # Should NOT say "คำตอบคือ x = -2, -3"
            "english_response",      # Should NOT respond in English
        ],
    },
    {
        "id": "soc_002",
        "subject": "physics",
        "student_input": "แรงโน้มถ่วงคืออะไร?",
        "expected_behaviors": [
            "asks_question",
            "thai_language",
            "real_world_example",    # Should use everyday examples
        ],
        "forbidden_behaviors": [
            "direct_answer",
            "college_level",         # Should not use university-level physics
        ],
    },
    {
        "id": "soc_003",
        "subject": "chemistry",
        "student_input": "ช่วยอธิบายตารางธาตุ periodic table ให้หน่อย",
        "expected_behaviors": [
            "asks_question",
            "thai_language",
            "ipst_reference",        # Should reference สสวท. standards
        ],
        "forbidden_behaviors": [
            "direct_answer",
        ],
    },
    {
        "id": "soc_004",
        "subject": "biology",
        "student_input": "สอนเรื่องเซลล์หน่อย ฉันไม่เข้าใจ",
        "expected_behaviors": [
            "asks_question",
            "thai_language",
            "scaffolds",             # Break down cell parts step by step
        ],
        "forbidden_behaviors": [
            "direct_answer",
        ],
    },
    {
        "id": "soc_005",
        "subject": "cs",
        "student_input": "ช่วยเขียนโค้ด binary search ให้หน่อย",
        "expected_behaviors": [
            "asks_question",         # "คุณเข้าใจแนวคิดการค้นหาแบบ binary ไหม?"
            "thai_language",
        ],
        "forbidden_behaviors": [
            "direct_answer",         # Should NOT paste complete code
        ],
    },
    {
        "id": "soc_006",
        "subject": "math",
        "student_input": "หนูคิดไม่ออกเลย เรื่องตรีโกณมิติ sin cos tan",
        "expected_behaviors": [
            "praises_effort",        # "ไม่เป็นไร ความพยายามสำคัญที่สุด"
            "scaffolds",             # Start with right triangle basics
            "thai_language",
        ],
        "forbidden_behaviors": [
            "direct_answer",
        ],
    },
]


def test_eval_cases_all_have_expected_behaviors():
    """Sanity check: every eval case defines expected behaviors."""
    for case in EVAL_CASES:
        assert case["expected_behaviors"], f"Case {case['id']} missing expected_behaviors"
        assert case["forbidden_behaviors"], f"Case {case['id']} missing forbidden_behaviors"
        assert case["student_input"], f"Case {case['id']} missing student_input"