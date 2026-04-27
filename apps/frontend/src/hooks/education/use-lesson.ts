/**
 * useLesson hook — manages interactive lesson state (US2).
 */

'use client';

import { useState, useCallback } from 'react';
import type { CheckpointResult, LessonProgress } from '@/lib/education/types';

interface CheckpointState {
  index: number;
  result: CheckpointResult;
  attempts: number;
  hintsUsed: number;
  feedback: string | null;
}

interface LessonState {
  lessonId: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  currentBlock: number;
  totalBlocks: number;
  checkpoints: CheckpointState[];
  error: string | null;
}

export function useLesson(lessonId: string | null) {
  const [state, setState] = useState<LessonState>({
    lessonId,
    status: 'not_started',
    currentBlock: 0,
    totalBlocks: 0,
    checkpoints: [],
    error: null,
  });

  const startLesson = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/v1/education/lessons/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`Failed to load lesson: ${res.status}`);
      const lesson = await res.json();

      setState({
        lessonId: id,
        status: 'in_progress',
        currentBlock: 0,
        totalBlocks: (lesson.content_blocks?.length || 0) + (lesson.checkpoint_items?.length || 0),
        checkpoints: (lesson.checkpoint_items || []).map((_: unknown, i: number) => ({
          index: i,
          result: 'not_attempted' as CheckpointResult,
          attempts: 0,
          hintsUsed: 0,
          feedback: null,
        })),
        error: null,
      });
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to load lesson' }));
    }
  }, []);

  const submitCheckpoint = useCallback(async (checkpointIndex: number, answer: string) => {
    if (!state.lessonId) return;

    try {
      const res = await fetch(`/v1/education/lessons/${state.lessonId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint_index: checkpointIndex, answer }),
      });
      const result = await res.json();

      setState((s) => ({
        ...s,
        checkpoints: s.checkpoints.map((cp) =>
          cp.index === checkpointIndex
            ? {
                ...cp,
                result: result.result as CheckpointResult,
                attempts: cp.attempts + 1,
                hintsUsed: result.hints_used || cp.hintsUsed,
                feedback: result.feedback || result.hint || null,
              }
            : cp,
        ),
      }));
    } catch (err) {
      setState((s) => ({ ...s, error: 'Failed to submit checkpoint' }));
    }
  }, [state.lessonId]);

  const advance = useCallback(() => {
    setState((s) => ({
      ...s,
      currentBlock: Math.min(s.currentBlock + 1, s.totalBlocks),
    }));
  }, []);

  const completeLesson = useCallback(async () => {
    if (!state.lessonId) return;
    try {
      await fetch(`/v1/education/lessons/${state.lessonId}/complete`, { method: 'POST' });
      setState((s) => ({ ...s, status: 'completed' }));
    } catch {
      // Lesson completion is best-effort
    }
  }, [state.lessonId]);

  return { state, startLesson, submitCheckpoint, advance, completeLesson };
}