# Tutor Chat — Student QA Manual

Quickstart validation steps for the Thai Socratic tutor chat feature (US1).

## Prerequisites

- Backend running with `/v1/education/health` returning `status: "ok"`
- Supabase migrations applied (education schema + gap migration)
- LLM provider configured (Anthropic Claude or OpenAI GPT)

## QA Steps

### 1. Student Login & Navigation

1. Sign in as student user (e.g., israel@kidpen.space / demo1234)
2. Navigate to Dashboard
3. Verify: Dashboard shows time-based greeting, XP, streak, subject cards
4. Click "ถาม AI" (Ask AI) — should navigate to tutor chat view

### 2. Socratic Tutor Chat

1. In the chat, select subject: "คณิตศาสตร์" (Mathematics)
2. Type: "สมการ x² + 5x + 6 = 0 ทำอย่างไร?"
3. **Verify**: Response is in Thai language
4. **Verify**: Response asks a guiding question, NOT "คำตอบคือ x = -2, -3"
5. **Verify**: Response suggests factoring or breaking down the problem
6. **Verify**: Response references IPST (สสวท.) when appropriate

### 3. Homework Integrity

1. Type: "ทำการบ้านให้หน่อย ข้อ 2x + 3 = 11"
2. **Verify**: Tutor does NOT directly give the answer (x = 4)
3. **Verify**: Tutor asks student to try first, offers hints
4. Type: "ฉันลองแล้ว ได้ x = 4 ถูกไหม?"
5. **Verify**: Tutor asks HOW student got that answer before confirming

### 4. Streaming & UX

1. Send any question
2. **Verify**: Response streams in with typing indicator
3. **Verify**: Code blocks have syntax highlighting + copy button
4. **Verify**: LaTeX/math renders correctly ($...$ and $$...$$)
5. **Verify**: Loading state shows skeleton/typing dots during LLM call

### 5. Thread Management

1. Create multiple threads by asking different questions
2. **Verify**: Each thread has a recognizable title (from first message)
3. **Verify**: Thread history persists after page refresh
4. **Verify**: Can switch between threads

### 6. Mastery & Progress

1. Have a meaningful tutoring conversation (5+ exchanges)
2. Navigate to "ความก้าวหน้า" (Progress) view
3. **Verify**: Mastery radar shows subject practiced
4. **Verify**: XP increased from pre-chat value
5. **Verify**: Interaction count updated

### 7. Error & Edge Cases

1. **Network offline**: Send message while disconnected → graceful error toast
2. **Empty message**: Try sending empty message → prevented by UI
3. **LLM timeout**: (Simulate by using slow model) → fallback message shown
4. **Unicode/emoji**: Send emoji + Thai mix → correctly rendered

### 8. Mobile

1. Open on mobile viewport (375px width)
2. **Verify**: Chat input stays visible above keyboard
3. **Verify**: Bottom nav accessible during chat
4. **Verify**: Messages readable without horizontal scroll

## Pass Criteria

- [ ] All Thai responses, no English
- [ ] Zero direct answers on homework-style prompts
- [ ] Streaming works end-to-end
- [ ] Mastery updates after interactions
- [ ] Thread persistence across refresh
- [ ] No console errors or hydration warnings