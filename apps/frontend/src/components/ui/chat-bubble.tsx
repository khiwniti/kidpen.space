'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

/**
 * ChatBubble - AI/student message bubbles for Socratic tutoring
 * 
 * Design from design_system.html:
 * - AI (Kidpen): Gold avatar, white bubble with warm border
 * - Student: Blue avatar, blue bubble
 * - Thai-native typography
 * - Soft shadows, rounded corners
 */

type ChatRole = 'ai' | 'student';

interface ChatBubbleProps {
  role: ChatRole;
  children: React.ReactNode;
  avatarText?: string;
  senderName?: string;
  className?: string;
}

export function ChatBubble({
  role,
  children,
  avatarText,
  senderName,
  className,
}: ChatBubbleProps) {
  const isAI = role === 'ai';
  
  return (
    <div className={cn(
      'flex gap-4',
      !isAI && 'flex-row-reverse',
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm',
        isAI ? 'bg-kidpen-gold text-white' : 'bg-kidpen-blue text-white'
      )}>
        {avatarText || (isAI ? 'ก' : <User className="h-5 w-5" />)}
      </div>
      
      {/* Message content */}
      <div className={cn(
        'flex flex-col gap-1',
        !isAI && 'items-end'
      )}>
        {/* Sender name */}
        {senderName && (
          <span className={cn(
            'text-xs font-bold font-thai',
            isAI ? 'text-kidpen-gold' : 'text-kidpen-blue'
          )}>
            {senderName}
          </span>
        )}
        
        {/* Bubble */}
        <div className={cn(
          'p-4 max-w-lg',
          isAI ? [
            'bg-white rounded-2xl rounded-tl-sm',
            'shadow-[0_2px_10px_rgba(0,0,0,0.02)]',
            'border border-kidpen-gold/10',
          ] : [
            'bg-kidpen-blue text-white rounded-2xl rounded-tr-sm',
            'shadow-[0_2px_10px_rgba(37,99,235,0.15)]',
          ]
        )}>
          <div className="font-thai leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatContainer - Wrapper for the chat interface with warm background
 */
interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  return (
    <div className={cn(
      'bg-[#FFF8EF] rounded-3xl p-6 border border-kidpen-gold/20',
      'flex flex-col gap-6 w-full max-w-2xl mx-auto',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * ChatInput - Input field for the chat interface
 */
interface ChatInputProps {
  placeholder?: string;
  submitText?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

export function KidpenChatInput({
  placeholder = 'พิมพ์คำตอบของคุณที่นี่...',
  submitText = 'ส่งคำตอบ',
  onSubmit,
  className,
}: ChatInputProps) {
  const [value, setValue] = React.useState('');
  
  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value);
      setValue('');
    }
  };
  
  return (
    <div className={cn(
      'bg-white mt-4 p-2 rounded-full border-2 border-kidpen-gold/20',
      'flex items-center shadow-sm',
      className
    )}>
      {/* Hint button */}
      <button 
        type="button"
        className="p-2 text-kidpen-dark/40 hover:text-kidpen-gold transition-colors"
        title="ขอคำใบ้"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </button>
      
      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-2 outline-none font-thai text-kidpen-dark placeholder:text-kidpen-dark/40"
      />
      
      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-kidpen-gold text-white p-2 px-4 rounded-full font-bold font-thai hover:bg-kidpen-gold/90 transition-colors"
      >
        {submitText}
      </button>
    </div>
  );
}

/**
 * CodeInline - Inline code styling for formulas
 */
export function CodeInline({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
      {children}
    </span>
  );
}
