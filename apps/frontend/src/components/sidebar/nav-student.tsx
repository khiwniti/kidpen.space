'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Target, 
  ChevronRight,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';
import { MasteryRing } from '@/components/ui/mastery-ring';
import { GummyButton } from '@/components/ui/gummy-button';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/utils';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Subject {
  id: string;
  name: string;
  icon: string;
  mastery: number;
  scaffoldLevel: 1 | 2 | 3 | 4;
  streak: number;
  subject: 'math' | 'science' | 'coding' | 'physics';
}

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════

const DEMO_SUBJECTS: Subject[] = [
  { id: 'math-m1', name: 'คณิตศาสตร์ ม.1', icon: '📐', mastery: 65, scaffoldLevel: 2, streak: 5, subject: 'math' },
  { id: 'cs-m1', name: 'วิทยาการคำนวณ ม.1', icon: '💻', mastery: 15, scaffoldLevel: 1, streak: 1, subject: 'coding' },
  { id: 'physics-m4', name: 'ฟิสิกส์ ม.4', icon: '⚡', mastery: 90, scaffoldLevel: 4, streak: 12, subject: 'physics' },
  { id: 'science-m2', name: 'วิทยาศาสตร์ ม.2', icon: '🧪', mastery: 42, scaffoldLevel: 2, streak: 0, subject: 'science' },
];

// Subject color mapping
const subjectColors = {
  math: { bg: 'bg-kidpen-blue', text: 'text-kidpen-blue', light: 'bg-blue-50' },
  science: { bg: 'bg-kidpen-green', text: 'text-kidpen-green', light: 'bg-emerald-50' },
  coding: { bg: 'bg-kidpen-purple', text: 'text-kidpen-purple', light: 'bg-purple-50' },
  physics: { bg: 'bg-kidpen-orange', text: 'text-kidpen-orange', light: 'bg-orange-50' },
};

// ═══════════════════════════════════════════════════════════════
// SUBJECT ITEM (Compact for sidebar)
// ═══════════════════════════════════════════════════════════════

interface SubjectItemProps {
  subject: Subject;
  isSelected: boolean;
  onSelect: () => void;
}

function SubjectItem({ subject, isSelected, onSelect }: SubjectItemProps) {
  const colors = subjectColors[subject.subject];
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
        'hover:bg-white/80 border border-transparent',
        isSelected && 'bg-white border-kidpen-gold/30 shadow-sm'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
        colors.bg, 'text-white'
      )}>
        {subject.icon}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm font-thai text-kidpen-dark truncate">
          {subject.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Mini progress bar */}
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
            <div 
              className={cn('h-full rounded-full', colors.bg)}
              style={{ width: `${subject.mastery}%` }}
            />
          </div>
          <span className={cn('text-xs font-bold', colors.text)}>{subject.mastery}%</span>
          {subject.streak > 0 && (
            <span className="text-xs text-amber-500 flex items-center gap-0.5">
              <Flame className="w-3 h-3" />
              {subject.streak}
            </span>
          )}
        </div>
      </div>
      
      {/* Arrow */}
      <ChevronRight className={cn(
        'w-4 h-4 text-kidpen-dark/30 flex-shrink-0 transition-transform',
        'group-hover:text-kidpen-dark/50 group-hover:translate-x-0.5'
      )} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAV STUDENT (Sidebar Component)
// ═══════════════════════════════════════════════════════════════

export function NavStudent() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  // Calculate overall stats
  const overallMastery = Math.round(
    DEMO_SUBJECTS.reduce((sum, s) => sum + s.mastery, 0) / DEMO_SUBJECTS.length
  );
  const totalStreak = Math.max(...DEMO_SUBJECTS.map(s => s.streak));

  const handleStartTutoring = (subjectId: string) => {
    // TODO: Create tutoring-specific chat thread
    // For now, navigate to dashboard with subject context
    router.push(`/dashboard?subject=${subjectId}&mode=tutoring`);
    if (isMobile) setOpenMobile(false);
  };

  const selectedSubjectData = DEMO_SUBJECTS.find(s => s.id === selectedSubject);

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header Stats */}
      <div className="mb-4 px-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-wider">
            วิชาของฉัน
          </h3>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-bold">{totalStreak}</span>
          </div>
        </div>
        
        {/* Overall mastery */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-kidpen-gold/10 to-amber-50 border border-kidpen-gold/20">
          <div className="relative">
            <MasteryRing percentage={overallMastery} size="sm" />
          </div>
          <div>
            <div className="text-xs text-kidpen-dark/50 font-thai">ความเข้าใจเฉลี่ย</div>
            <div className="text-lg font-bold text-kidpen-gold">{overallMastery}%</div>
          </div>
        </div>
      </div>

      {/* Subject List */}
      <div className="flex-1 overflow-y-auto space-y-1 px-1">
        {DEMO_SUBJECTS.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            isSelected={selectedSubject === subject.id}
            onSelect={() => setSelectedSubject(subject.id)}
          />
        ))}
        
        {/* Add subject button */}
        <button className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-kidpen-dark/10 text-kidpen-dark/40 hover:border-kidpen-gold/30 hover:text-kidpen-gold hover:bg-kidpen-gold/5 transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-current border-dashed">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-thai">เพิ่มวิชา</span>
        </button>
      </div>

      {/* Selected Subject Action */}
      {selectedSubjectData && (
        <div className="mt-4 pt-4 border-t border-kidpen-dark/10 px-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{selectedSubjectData.icon}</span>
            <span className="font-bold font-thai text-sm text-kidpen-dark truncate">
              {selectedSubjectData.name}
            </span>
          </div>
          <GummyButton 
            variant={selectedSubjectData.subject}
            size="sm" 
            className="w-full"
            onClick={() => handleStartTutoring(selectedSubjectData.id)}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            เริ่มติวเลย!
          </GummyButton>
        </div>
      )}

      {/* Quick action when no subject selected */}
      {!selectedSubjectData && (
        <div className="mt-4 pt-4 border-t border-kidpen-dark/10 px-1">
          <button 
            onClick={() => {
              router.push('/dashboard?mode=tutoring');
              if (isMobile) setOpenMobile(false);
            }}
            className="w-full flex items-center gap-2 p-3 rounded-xl bg-kidpen-gold/10 text-kidpen-gold hover:bg-kidpen-gold/20 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-bold font-thai text-sm">ถามคิดเป็นอะไรก็ได้</span>
          </button>
        </div>
      )}
    </div>
  );
}
