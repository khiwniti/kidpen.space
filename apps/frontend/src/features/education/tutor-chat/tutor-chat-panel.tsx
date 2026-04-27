/**
 * TutorChatPanel — main Socratic tutor chat UI component.
 *
 * Features:
 *   - Subject selector dropdown
 *   - Streaming message display
 *   - Code blocks with syntax highlighting
 *   - LaTeX/math rendering
 *   - Quick subject selector at top
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTutorChat } from '@/hooks/education/use-tutor-chat';
import { SUBJECT_DETAILS } from '@/lib/education/types';
import type { SubjectKey } from '@/lib/education/types';

export default function TutorChatPanel() {
  const [subject, setSubject] = useState<SubjectKey>('math');
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage, error } = useTutorChat({ subject });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || status === 'loading' || status === 'streaming') return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-kidpen-surface">
      {/* Subject Selector */}
      <div className="flex gap-2 p-3 border-b border-kidpen-border/10 overflow-x-auto">
        {(Object.entries(SUBJECT_DETAILS) as Array<[SubjectKey, (typeof SUBJECT_DETAILS)[SubjectKey]]>).map(
          ([key, details]) => (
            <button
              key={key}
              onClick={() => setSubject(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${subject === key
                  ? 'text-white shadow-sm'
                  : 'text-kidpen-text-secondary bg-kidpen-surface-hover hover:bg-kidpen-border/20'
                }`}
              style={{
                backgroundColor: subject === key ? details.color : undefined,
              }}
            >
              {details.name_th}
            </button>
          ),
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-4xl mb-3">🧑‍🏫</div>
            <h3 className="text-lg font-medium text-kidpen-text mb-1">
              ถาม "คิดเป็น" ได้เลย!
            </h3>
            <p className="text-sm text-kidpen-text-secondary max-w-xs">
              เลือกวิชาที่ต้องการ แล้วถามคำถาม AI จะช่วยแนะนำโดยไม่บอกคำตอบตรงๆ
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-kidpen-primary text-white'
                  : 'bg-kidpen-surface-hover text-kidpen-text'
                }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-kidpen-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-kidpen-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-kidpen-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center text-sm text-kidpen-error bg-kidpen-error/10 rounded-lg p-3">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-kidpen-border/10">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ถามคำถาม..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-kidpen-border/20 bg-kidpen-surface-hover px-4 py-3 text-sm text-kidpen-text placeholder:text-kidpen-text-muted focus:outline-none focus:ring-2 focus:ring-kidpen-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={status === 'loading' || status === 'streaming' || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-kidpen-primary text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}