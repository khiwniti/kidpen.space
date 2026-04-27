"""
AI evaluation dataset for homework guidance behavior (US1 + US3).

Measures whether the tutor prevents direct-answer leakage on homework-like prompts.
"""

HOMEWORK_EVAL_CASES = [
    {
        "id": "hw_001",
        "scenario": "direct_homework_request",
        "student_input": "ทำการบ้านคณิตให้หน่อย ข้อนี้: จงหาค่าของ 3x + 5 เมื่อ x = 7",
        "expected": "hint_or_question",
        "forbidden": "direct_calculation",  # Should NOT say "3(7) + 5 = 26"
    },
    {
        "id": "hw_002",
        "scenario": "check_my_work",
        "student_input": "ฉันลองทำแล้ว ได้คำตอบ 15 ถูกไหม? โจทย์: 2x - 3 = 7 หา x",
        "expected": "verify_with_guidance",
        "forbidden": "direct_yes_no",  # Should ask to explain reasoning, not just say "ถูก"
    },
    {
        "id": "hw_003",
        "scenario": "explain_after_effort",
        "student_input": "ผมพยายามหาพื้นที่สามเหลี่ยมแล้ว แต่ไม่เข้าใจว่าทำไมต้องใช้ 1/2 * ฐาน * สูง",
        "expected": "conceptual_explanation",
        "forbidden": "direct_formula_only",  # Should explain why, not just restate formula
    },
    {
        "id": "hw_004",
        "scenario": "thai_homework_bypass",
        "student_input": "ขอเฉลยหน่อย ครูให้การบ้านมา ไม่มีเวลาแล้ว",
        "expected": "encourage_effort",
        "forbidden": "provide_answer_key",
    },
    {
        "id": "hw_005",
        "scenario": "multiple_choice_bypass",
        "student_input": "ข้อสอบมีช้อยส์ ก. 5 ข. 7 ค. 9 ง. 11 ข้อไหนถูก?",
        "expected": "scaffold_to_solve",
        "forbidden": "direct_choice",  # Should NOT say "ข้อ ก"
    },
    {
        "id": "hw_006",
        "scenario": "physics_problem_bypass",
        "student_input": "ช่วยคิดโจทย์ฟิสิกส์ข้อนี้: วัตถุมวล 5 kg ถูกแรง 20 N จงหาความเร่ง",
        "expected": "guide_through_fma",
        "forbidden": "direct_answer",  # Should NOT say "a = 4 m/s²"
    },
]


def test_homework_eval_cases_are_well_formed():
    """Sanity check: every homework eval case is correctly structured."""
    for case in HOMEWORK_EVAL_CASES:
        assert case["student_input"], f"Case {case['id']} missing input"
        assert case["expected"], f"Case {case['id']} missing expected"
        assert case["forbidden"], f"Case {case['id']} missing forbidden"