'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { brandColors } from '@/lib/brand-identity';

/**
 * ColorSwatch - Individual color display card
 */
interface ColorSwatchProps {
  name: string;
  hex: string;
  label?: string;
  className?: string;
}

export function ColorSwatch({ name, hex, label, className }: ColorSwatchProps) {
  return (
    <div className={cn('rounded-2xl overflow-hidden shadow-sm border border-kidpen-dark/5', className)}>
      <div 
        className="h-32" 
        style={{ backgroundColor: hex }}
      />
      <div className="p-4 bg-white">
        <div className="font-bold">{name}</div>
        <div className="text-sm text-kidpen-dark/60">{hex}</div>
        {label && (
          <div className="text-xs font-thai mt-1 text-kidpen-dark/50">{label}</div>
        )}
      </div>
    </div>
  );
}

/**
 * SubjectColorCard - Color card for a subject
 */
interface SubjectColorCardProps {
  subject: keyof typeof brandColors.subjects;
  className?: string;
}

export function SubjectColorCard({ subject, className }: SubjectColorCardProps) {
  const data = brandColors.subjects[subject];
  
  return (
    <div className={cn('rounded-2xl overflow-hidden shadow-sm border border-kidpen-dark/5', className)}>
      <div 
        className="h-32 flex items-center justify-center text-4xl"
        style={{ backgroundColor: data.primary }}
      >
        <span className="text-white">{data.icon}</span>
      </div>
      <div className="p-4 bg-white">
        <div className="font-bold">{data.nameEn}</div>
        <div className="text-sm text-kidpen-dark/60">{data.primary}</div>
        <div className="text-xs font-thai mt-1 text-kidpen-dark/50">{data.name}</div>
      </div>
    </div>
  );
}

/**
 * ColorPalette - Full brand color palette display
 */
export function ColorPalette({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8', className)}>
      <div>
        <h2 className="text-3xl font-bold mb-2">Color Palette 🎨</h2>
        <p className="text-kidpen-dark/70 text-lg mb-8">
          Kidpen uses a vibrant, accessible color system mapped to specific STEM subjects. 
          The background is always a warm, inviting cream rather than a cold, stark white.
        </p>
      </div>

      {/* Brand & Background Colors */}
      <div>
        <h3 className="text-xl font-bold mb-4">Brand & Background</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ColorSwatch name="Brand Gold" hex={brandColors.brand.gold} label="Primary Brand" />
          <ColorSwatch name="Warm Cream" hex={brandColors.background.cream} label="Background Base" />
          <ColorSwatch name="Chat Warm" hex={brandColors.background.creamWarm} label="Chat Backgrounds" />
          <ColorSwatch name="Dark" hex={brandColors.background.dark} label="Dark Mode" />
        </div>
      </div>

      {/* Subject Colors */}
      <div>
        <h3 className="text-xl font-bold mb-4">Subject Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <SubjectColorCard subject="math" />
          <SubjectColorCard subject="science" />
          <SubjectColorCard subject="physics" />
          <SubjectColorCard subject="coding" />
          <SubjectColorCard subject="data" />
        </div>
      </div>

      {/* Feedback Colors */}
      <div>
        <h3 className="text-xl font-bold mb-4">Feedback Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Success" hex={brandColors.feedback.success} label="ถูกต้อง" />
          <ColorSwatch name="Error" hex={brandColors.feedback.error} label="ผิดพลาด" />
          <ColorSwatch name="Warning" hex={brandColors.feedback.warning} label="เตือน" />
          <ColorSwatch name="Hint" hex={brandColors.feedback.hint} label="คำใบ้" />
        </div>
      </div>
    </div>
  );
}
