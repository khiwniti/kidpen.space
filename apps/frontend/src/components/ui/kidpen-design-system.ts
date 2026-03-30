/**
 * Kidpen Design System Components
 * 
 * "Learning should feel like a tiny party" — Design Philosophy
 * 
 * Core principles:
 * 1. LIGHT & WARM — cream backgrounds, not cold whites
 * 2. ROUNDED EVERYTHING — no sharp corners, ever (gummy feel)
 * 3. SUBJECT COLORS — each subject has its own color world
 * 4. CELEBRATE PROGRESS — delight in every correct answer
 * 5. THAI-NATIVE — designed in Thai from day one
 */

// Buttons
export { GummyButton, gummyButtonVariants } from './gummy-button';
export type { GummyButtonProps } from './gummy-button';

// Cards
export { SubjectCard, subjectStyles } from './subject-card';
export type { SubjectType } from './subject-card';

// Progress & Mastery
export { MasteryRing } from './mastery-ring';

// Chat Interface
export { 
  ChatBubble, 
  ChatContainer, 
  KidpenChatInput as ChatInput,
  CodeInline 
} from './chat-bubble';
