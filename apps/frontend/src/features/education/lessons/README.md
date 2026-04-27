# Interactive Lesson — Student QA Manual

Quickstart validation for the interactive lesson flow (US2).

## Prerequisites

- Backend running with education endpoints available
- At least one published lesson in the database for each subject
- Student account signed in

## QA Steps

### 1. Lesson Discovery

1. Navigate to "บทเรียน" (Lessons) from the main dashboard
2. **Verify**: Lessons are listed by subject with title and Thai description
3. **Verify**: Completed lessons show a checkmark badge
4. **Verify**: Lesson card shows progress bar (% completed)
5. Tap a lesson to open it

### 2. Lesson Content Flow

1. Open a lesson — should show the first content block
2. **Verify**: Content blocks render correctly:
   - Text blocks with Thai formatting
   - Code blocks with syntax highlighting
   - Math blocks with LaTeX rendering
   - Image blocks with alt text
3. Tap "ถัดไป" (Next) to advance through content blocks
4. **Verify**: Progress bar updates as you advance

### 3. Checkpoint Questions

1. Reach a checkpoint question in the lesson
2. **Verify**: Question is displayed with answer input field
3. Enter a correct answer → **Verify**: Green feedback + "เยี่ยมมาก!" message
4. Enter an incorrect answer → **Verify**: Yellow hint shown, NOT the correct answer
5. Try incorrect answer again → **Verify**: Second hint is more specific
6. Enter correct answer after hints → **Verify**:  Feedback acknowledges the effort
7. Checkpoint shows "ผ่าน" (passed) badge

### 4. Practice Items

1. After content blocks, practice items appear
2. **Verify**: Practice items function identically to checkpoints
3. **Verify**: Practice items can be attempted unlimited times

### 5. Lesson Completion

1. Complete all checkpoints in a lesson
2. **Verify**: Completion screen appears with:
   - "เรียนจบแล้ว! 🎉" message
   - XP earned
   - Subjects/KCs practiced
   - "กลับไปหน้าหลัก" (Back to home) button
3. Navigate back to lessons list
4. **Verify**: The completed lesson now shows ✅ badge

### 6. Progress Persistence

1. Partially complete a lesson (do 2 of 4 checkpoints)
2. Navigate away, then return
3. **Verify**: Lesson resumes from where you left off
4. **Verify**: Completed checkpoints are not repeatable

### 7. Error & Edge Cases

1. **Network offline during checkpoint submit** → Toast error, retry available
2. **Submit empty answer** → Prevented by UI validation
3. **Rapid taps on checkpoint submit** → Single submission only (debounce)
4. **Resize during lesson** → Content reflows correctly

### 8. Mobile

1. Open lesson on mobile (375px width)
2. **Verify**: Content blocks are readable without zooming
3. **Verify**: Checkpoint input + submit button visible without scroll
4. **Verify**: All interactive elements have 44px+ touch targets

## Pass Criteria

- [ ] All content block types render correctly
- [ ] Checkpoint feedback: correct → green, incorrect → hint (not answer)
- [ ] Lesson completion awards XP
- [ ] Progress persists across sessions
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Thai text renders correctly (no tofu/boxes)