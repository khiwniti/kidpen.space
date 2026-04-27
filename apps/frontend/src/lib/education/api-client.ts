/**
 * Kidpen Education API client — React hooks for the education platform.
 *
 * Provides typed fetch wrappers for all education endpoints:
 *   - Subjects listing
 *   - Tutor chat (streaming SSE)
 *   - Mastery & progress
 *   - Thread management
 */

import type { EducationSubject, TutorThread, MasteryState } from './types';

const API_PREFIX = '/v1/education';

// ═════════════════════════════════════════════════════════════
// Subjects
// ═════════════════════════════════════════════════════════════

export async function fetchSubjects(): Promise<EducationSubject[]> {
  const res = await fetch(`${API_PREFIX}/subjects`);
  if (!res.ok) throw new Error(`Failed to fetch subjects: ${res.status}`);
  return res.json();
}

export async function fetchSubject(key: string): Promise<EducationSubject> {
  const res = await fetch(`${API_PREFIX}/subjects/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error(`Failed to fetch subject: ${res.status}`);
  return res.json();
}

// ═════════════════════════════════════════════════════════════
// Tutor Chat (SSE streaming)
// ═════════════════════════════════════════════════════════════

export interface TutorMessagePayload {
  thread_id?: string;
  subject?: string;
  message: string;
}

export async function* streamTutorMessage(
  payload: TutorMessagePayload,
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${API_PREFIX}/tutor/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Tutor request failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const content = line.slice(6);
        if (content === '[DONE]') return;
        if (content.startsWith('[ERROR]')) {
          throw new Error(content.slice(8));
        }
        yield content;
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════
// Tutor Threads
// ═════════════════════════════════════════════════════════════

export async function fetchTutorThreads(): Promise<{ threads: TutorThread[] }> {
  const res = await fetch(`${API_PREFIX}/tutor/threads`);
  if (!res.ok) throw new Error(`Failed to fetch threads: ${res.status}`);
  return res.json();
}

export async function fetchTutorThread(
  threadId: string,
): Promise<{ thread_id: string; messages: unknown[] }> {
  const res = await fetch(`${API_PREFIX}/tutor/threads/${encodeURIComponent(threadId)}`);
  if (!res.ok) throw new Error(`Failed to fetch thread: ${res.status}`);
  return res.json();
}

// ═════════════════════════════════════════════════════════════
// Mastery & Progress
// ═════════════════════════════════════════════════════════════

export async function fetchMyMastery(
  subject?: string,
): Promise<{ mastery: MasteryState[] }> {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const res = await fetch(`${API_PREFIX}/mastery/me${params}`);
  if (!res.ok) throw new Error(`Failed to fetch mastery: ${res.status}`);
  return res.json();
}