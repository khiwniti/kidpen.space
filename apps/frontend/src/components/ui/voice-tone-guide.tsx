'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { brandVoice } from '@/lib/brand-identity';
import { Check, X } from 'lucide-react';

/**
 * VoiceToneCard - Display voice & tone guidelines
 * 
 * Used in documentation, teacher dashboard, or content guidelines
 */

interface VoiceToneExampleProps {
  type: 'do' | 'dont';
  textTh: string;
  textEn?: string;
  context?: string;
  why?: string;
}

export function VoiceToneExample({
  type,
  textTh,
  textEn,
  context,
  why,
}: VoiceToneExampleProps) {
  const isDo = type === 'do';
  
  return (
    <div
      className={cn(
        'p-6 rounded-2xl flex gap-6 border',
        isDo
          ? 'bg-green-50/50 border-green-200'
          : 'bg-red-50/50 border-red-200'
      )}
    >
      <div
        className={cn(
          'text-3xl flex-shrink-0',
          isDo ? 'text-green-500' : 'text-red-500'
        )}
      >
        {isDo ? <Check className="w-8 h-8" /> : <X className="w-8 h-8" />}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-2 font-thai">
          {isDo
            ? 'Do: Encourage & Scaffold (ส่งเสริมและคอยนำทาง)'
            : "Don't: Give Direct Answers (ห้ามให้คำตอบโดยตรง)"}
        </h4>
        <p className="font-thai text-kidpen-dark/70 leading-relaxed mb-2">
          "{textTh}"
        </p>
        {textEn && (
          <p className="text-sm text-kidpen-dark/50 italic">
            "{textEn}"
          </p>
        )}
        {context && (
          <p className="text-xs text-kidpen-dark/40 mt-2">
            Context: {context}
          </p>
        )}
        {why && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Why avoid: {why}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * VoiceToneGuide - Full voice & tone guidelines panel
 */
export function VoiceToneGuide({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Voice & Tone 📣</h2>
        <p className="text-kidpen-dark/70 font-thai">
          {brandVoice.principleTh}
        </p>
        <p className="text-sm text-kidpen-dark/50">
          {brandVoice.principle}
        </p>
      </div>

      {/* DO examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
          <Check className="w-6 h-6" />
          ควรทำ (Do)
        </h3>
        {brandVoice.doExamples.map((example, i) => (
          <VoiceToneExample
            key={i}
            type="do"
            textTh={example.th}
            textEn={example.en}
            context={example.context}
          />
        ))}
      </div>

      {/* DON'T examples */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <X className="w-6 h-6" />
          ไม่ควรทำ (Don't)
        </h3>
        {brandVoice.dontExamples.map((example, i) => (
          <VoiceToneExample
            key={i}
            type="dont"
            textTh={example.th}
            textEn={example.en}
            why={example.why}
          />
        ))}
      </div>

      {/* Characteristics */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-kidpen-dark/10">
        <h3 className="text-xl font-bold mb-4">Tone Characteristics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(brandVoice.characteristics).map(([key, value]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-kidpen-gold">✦</span>
              <div>
                <span className="font-bold capitalize">{key}:</span>{' '}
                <span className="text-kidpen-dark/70">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scaffold levels */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-kidpen-dark/10">
        <h3 className="text-xl font-bold mb-4">Scaffold Levels (pyBKT-driven)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(brandVoice.scaffoldLevels).map(([level, data]) => (
            <div key={level} className="flex items-start gap-3 p-3 rounded-xl bg-kidpen-cream">
              <span className="w-8 h-8 rounded-full bg-kidpen-gold text-white flex items-center justify-center font-bold">
                {level}
              </span>
              <div>
                <span className="font-bold">{data.name}</span>
                <p className="text-sm text-kidpen-dark/60">{data.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
