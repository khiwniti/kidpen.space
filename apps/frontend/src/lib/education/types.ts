/**
 * Kidpen Education types.
 *
 * Shared types for the education frontend features.
 */

export interface EducationSubject {
  key: SubjectKey;
  name_th: string;
  icon: string;
  color: string;
}

export type SubjectKey = 'math' | 'physics' | 'chemistry' | 'biology' | 'cs';

export interface TutorThread {
  thread_id: string;
  subject_id: string | null;
  subject_key: SubjectKey | null;
  subject_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasteryState {
  student_id: string;
  kc_id: string;
  p_mastery: number;       // 0.0 - 1.0
  confidence: number;       // 0.0 - 1.0
  opportunity_count: number;
  correct_count: number;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error';

export const SUBJECT_DETAILS: Record<
  SubjectKey,
  { name_th: string; icon: string; color: string }
> = {
  math: { name_th: 'คณิตศาสตร์', icon: 'Calculator', color: '#2563EB' },
  physics: { name_th: 'ฟิสิกส์', icon: 'Atom', color: '#F97316' },
  chemistry: { name_th: 'เคมี', icon: 'FlaskConical', color: '#10B981' },
  biology: { name_th: 'ชีววิทยา', icon: 'Leaf', color: '#8B5CF6' },
  cs: { name_th: 'วิทยาการคอมฯ', icon: 'Code2', color: '#8B5CF6' },
};