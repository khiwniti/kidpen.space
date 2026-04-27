/**
 * useTutorChat hook — manages Socratic tutor chat state and streaming.
 *
 * Handles:
 *   - Message list state
 *   - SSE streaming consumption
 *   - Thread management (create, switch, list)
 *   - Loading / error states
 */
'use client';

import { useState, useRef, useCallback } from 'react';
import { streamTutorMessage, fetchTutorThreads, fetchTutorThread } from '@/lib/education/api-client';
import type { ChatMessage, ChatStatus, SubjectKey } from '@/lib/education/types';

interface UseTutorChatOptions {
  subject?: SubjectKey;
  threadId?: string;
}

interface UseTutorChatReturn {
  messages: ChatMessage[];
  status: ChatStatus;
  threadId: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadThread: (id: string) => Promise<void>;
  loadThreadList: () => Promise<void>;
  threads: Array<{ thread_id: string; title: string }>;
  error: string | null;
}

export function useTutorChat(options: UseTutorChatOptions = {}): UseTutorChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [threadId, setThreadId] = useState<string | null>(options.threadId ?? null);
  const [threads, setThreads] = useState<Array<{ thread_id: string; title: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setError(null);
      setStatus('loading');

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Placeholder for streaming assistant message
      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        setStatus('streaming');

        let accumulated = '';
        for await (const chunk of streamTutorMessage({
          thread_id: threadId ?? undefined,
          subject: options.subject,
          message: content,
        })) {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        setStatus('idle');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Remove the placeholder assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    },
    [threadId, options.subject],
  );

  const loadThread = useCallback(async (id: string) => {
    try {
      const data = await fetchTutorThread(id);
      setThreadId(id);
      setMessages(
        (data.messages as ChatMessage[]).map((m) => ({
          ...m,
          timestamp: m.timestamp || new Date().toISOString(),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load thread');
    }
  }, []);

  const loadThreadList = useCallback(async () => {
    try {
      const data = await fetchTutorThreads();
      setThreads(
        data.threads.map((t) => ({
          thread_id: t.thread_id,
          title: t.subject_name || 'บทสนทนา',
        })),
      );
    } catch {
      // Silently fail for thread list
    }
  }, []);

  return {
    messages,
    status,
    threadId,
    sendMessage,
    loadThread,
    loadThreadList,
    threads,
    error,
  };
}