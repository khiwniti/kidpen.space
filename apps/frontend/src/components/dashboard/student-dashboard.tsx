'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DynamicGreeting } from '@/components/ui/dynamic-greeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MasteryRing } from '@/components/ui/mastery-ring';
import { GummyButton } from '@/components/ui/gummy-button';
import { KidpenAvatar } from '@/components/ui/kidpen-avatar';
import { BookOpen, Trophy, Flame, Target, ChevronRight, Sparkles, Clock, Zap } from 'lucide-react';

// Subject data with proper typing
interface Subject {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  mastery: number;
  scaffoldLevel: 1 | 2 | 3 | 4;
  lastStudied?: string;
  totalMinutes: number;
  streak: number;
  subject: 'math' | 'science' | 'coding' | 'physics';
}

const DEMO_SUBJECTS: Subject[] = [
  {
    id: 'math-m1',
    name: 'คณิตศาสตร์ ม.1',
    nameEn: 'Math M.1',
    icon: '📐',
    mastery: 65,
    scaffoldLevel: 2,
    lastStudied: '2 ชม. ที่แล้ว',
    totalMinutes: 245,
    streak: 5,
    subject: 'math',
  },
  {
    id: 'cs-m1',
    name: 'วิทยาการคำนวณ ม.1',
    nameEn: 'CS M.1',
    icon: '💻',
    mastery: 15,
    scaffoldLevel: 1,
    lastStudied: 'เมื่อวาน',
    totalMinutes: 60,
    streak: 1,
    subject: 'coding',
  },
  {
    id: 'physics-m4',
    name: 'ฟิสิกส์ ม.4',
    nameEn: 'Physics M.4',
    icon: '⚡',
    mastery: 90,
    scaffoldLevel: 4,
    lastStudied: '3 วัน ที่แล้ว',
    totalMinutes: 520,
    streak: 12,
    subject: 'physics',
  },
  {
    id: 'science-m2',
    name: 'วิทยาศาสตร์ ม.2',
    nameEn: 'Science M.2',
    icon: '🧪',
    mastery: 42,
    scaffoldLevel: 2,
    lastStudied: 'สัปดาห์ที่แล้ว',
    totalMinutes: 180,
    streak: 0,
    subject: 'science',
  },
];

// Subject color mapping
const subjectColors = {
  math: {
    bg: 'bg-kidpen-blue',
    bgLight: 'bg-blue-50',
    border: 'border-kidpen-blue/20 hover:border-kidpen-blue/40',
    text: 'text-kidpen-blue',
    ring: 'ring-kidpen-blue/30',
  },
  science: {
    bg: 'bg-kidpen-green',
    bgLight: 'bg-emerald-50',
    border: 'border-kidpen-green/20 hover:border-kidpen-green/40',
    text: 'text-kidpen-green',
    ring: 'ring-kidpen-green/30',
  },
  coding: {
    bg: 'bg-kidpen-purple',
    bgLight: 'bg-purple-50',
    border: 'border-kidpen-purple/20 hover:border-kidpen-purple/40',
    text: 'text-kidpen-purple',
    ring: 'ring-kidpen-purple/30',
  },
  physics: {
    bg: 'bg-kidpen-orange',
    bgLight: 'bg-orange-50',
    border: 'border-kidpen-orange/20 hover:border-kidpen-orange/40',
    text: 'text-kidpen-orange',
    ring: 'ring-kidpen-orange/30',
  },
};

// Scaffold level labels
const scaffoldLabels = {
  1: { name: 'ต้องการความช่วยเหลือ', nameEn: 'Scaffolding', color: 'bg-red-100 text-red-700' },
  2: { name: 'กำลังเรียนรู้', nameEn: 'Guided', color: 'bg-amber-100 text-amber-700' },
  3: { name: 'เข้าใจดี', nameEn: 'Independent', color: 'bg-blue-100 text-blue-700' },
  4: { name: 'เชี่ยวชาญ', nameEn: 'Challenge', color: 'bg-emerald-100 text-emerald-700' },
};

// ═══════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  accent?: 'gold' | 'blue' | 'green' | 'purple';
}

function StatCard({ icon, label, value, subtext, accent = 'gold' }: StatCardProps) {
  const accentColors = {
    gold: 'text-kidpen-gold',
    blue: 'text-kidpen-blue',
    green: 'text-kidpen-green',
    purple: 'text-kidpen-purple',
  };

  return (
    <div className="bg-white rounded-2xl border border-kidpen-dark/5 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', accentColors[accent], 'bg-current/10')}>
          {icon}
        </div>
        <span className="text-xs font-bold text-kidpen-dark/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn('text-3xl font-extrabold', accentColors[accent])}>{value}</div>
      {subtext && <div className="text-xs text-kidpen-dark/50 font-thai mt-1">{subtext}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUBJECT CARD COMPONENT (NEW DESIGN)
// ═══════════════════════════════════════════════════════════════

interface SubjectCardNewProps {
  subject: Subject;
  isSelected: boolean;
  onSelect: () => void;
}

function SubjectCardNew({ subject, isSelected, onSelect }: SubjectCardNewProps) {
  const colors = subjectColors[subject.subject];
  const scaffold = scaffoldLabels[subject.scaffoldLevel];

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white border-2 rounded-3xl p-5 cursor-pointer transition-all duration-200 group relative overflow-hidden',
        colors.border,
        isSelected && `ring-4 ${colors.ring} ring-offset-2 border-opacity-60`
      )}
    >
      {/* Background decoration */}
      <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20', colors.bg)} />
      
      {/* Header: Icon + Name */}
      <div className="flex items-start gap-4 relative z-10">
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md flex-shrink-0',
          colors.bg, 'text-white',
          'transition-transform group-hover:scale-105 group-hover:rotate-3'
        )}>
          {subject.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-kidpen-dark font-thai text-lg leading-tight mb-1">
            {subject.name}
          </h3>
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', scaffold.color)}>
            {scaffold.name}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-kidpen-dark/50 font-thai">ความเข้าใจ (Mastery)</span>
          <span className={cn('text-sm font-bold', colors.text)}>{subject.mastery}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colors.bg)}
            style={{ width: `${subject.mastery}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-4 text-xs text-kidpen-dark/50 relative z-10">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-thai">{subject.lastStudied}</span>
        </div>
        {subject.streak > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold">{subject.streak} วัน</span>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className={cn(
        'absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity',
        colors.text
      )}>
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  variant?: 'default' | 'highlight';
}

function QuickAction({ icon, label, description, onClick, variant = 'default' }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl border transition-all text-left w-full group',
        variant === 'highlight'
          ? 'bg-kidpen-gold/10 border-kidpen-gold/30 hover:border-kidpen-gold/50 hover:bg-kidpen-gold/20'
          : 'bg-white border-kidpen-dark/10 hover:border-kidpen-dark/20 hover:shadow-sm'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
        variant === 'highlight' ? 'bg-kidpen-gold text-white' : 'bg-gray-100 text-kidpen-dark/60'
      )}>
        {icon}
      </div>
      <div>
        <div className="font-bold font-thai text-kidpen-dark">{label}</div>
        {description && <div className="text-xs text-kidpen-dark/50 font-thai">{description}</div>}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN STUDENT DASHBOARD (REDESIGNED)
// ═══════════════════════════════════════════════════════════════

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Calculate overall stats
  const overallMastery = Math.round(
    DEMO_SUBJECTS.reduce((sum, s) => sum + s.mastery, 0) / DEMO_SUBJECTS.length
  );
  const totalStreak = Math.max(...DEMO_SUBJECTS.map(s => s.streak));
  const totalMinutes = DEMO_SUBJECTS.reduce((sum, s) => sum + s.totalMinutes, 0);

  const selectedSubjectData = DEMO_SUBJECTS.find(s => s.id === selectedSubject);

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <DynamicGreeting className="text-2xl sm:text-3xl font-bold font-thai text-kidpen-dark tracking-tight mb-1" />
          <p className="text-kidpen-dark/60 font-thai">มาเรียนรู้และสนุกไปกับการแก้ปัญหาด้วยกันเถอะ!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200">
            <Flame className="w-4 h-4" />
            <span className="font-bold text-sm">{totalStreak} วัน streak</span>
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Target className="w-4 h-4" />}
          label="Mastery"
          value={`${overallMastery}%`}
          subtext="ความเข้าใจเฉลี่ย (pyBKT)"
          accent="gold"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Scaffold"
          value="Lv.2"
          subtext="Guided Mode"
          accent="blue"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="เวลาเรียน"
          value={`${Math.round(totalMinutes / 60)}h`}
          subtext={`${totalMinutes} นาทีทั้งหมด`}
          accent="green"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4" />}
          label="วิชา"
          value={DEMO_SUBJECTS.length}
          subtext="กำลังเรียนอยู่"
          accent="purple"
        />
      </div>

      {/* ═══ MAIN CONTENT: 2 COLUMNS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Subject Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold font-thai text-kidpen-dark mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-kidpen-gold" />
            วิชาของฉัน
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DEMO_SUBJECTS.map((subject) => (
              <SubjectCardNew
                key={subject.id}
                subject={subject}
                isSelected={selectedSubject === subject.id}
                onSelect={() => setSelectedSubject(subject.id)}
              />
            ))}
          </div>

          {/* Add Subject Button */}
          <button className="mt-4 w-full border-2 border-dashed border-kidpen-dark/20 rounded-2xl p-4 text-kidpen-dark/50 font-thai hover:border-kidpen-gold/50 hover:text-kidpen-gold hover:bg-kidpen-gold/5 transition-all flex items-center justify-center gap-2">
            <span className="text-xl">+</span>
            เพิ่มวิชาใหม่
          </button>
        </div>

        {/* RIGHT: Quick Actions + Selected Subject */}
        <div className="space-y-6">
          {/* Selected Subject Panel */}
          {selectedSubjectData ? (
            <div className="bg-white rounded-3xl border border-kidpen-dark/10 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                  subjectColors[selectedSubjectData.subject].bg, 'text-white'
                )}>
                  {selectedSubjectData.icon}
                </div>
                <div>
                  <h3 className="font-bold font-thai text-kidpen-dark">{selectedSubjectData.name}</h3>
                  <span className="text-xs text-kidpen-dark/50">{selectedSubjectData.nameEn}</span>
                </div>
              </div>

              <div className="flex justify-center my-6">
                <MasteryRing 
                  percentage={selectedSubjectData.mastery} 
                  scaffoldLevel={selectedSubjectData.scaffoldLevel}
                  size="lg"
                />
              </div>

              <GummyButton variant="primary" size="lg" className="w-full">
                <Sparkles className="w-5 h-5 mr-2" />
                เริ่มติวเลย!
              </GummyButton>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-kidpen-gold/10 to-amber-50 rounded-3xl border border-kidpen-gold/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <KidpenAvatar size="lg" />
                <div>
                  <h3 className="font-bold font-thai text-kidpen-dark">พร้อมเรียนรู้แล้ว!</h3>
                  <span className="text-sm text-kidpen-dark/60 font-thai">เลือกวิชาที่ต้องการติว</span>
                </div>
              </div>
              <p className="text-sm text-kidpen-dark/60 font-thai leading-relaxed">
                คิดเป็นจะช่วยนำทางการเรียนรู้ด้วยวิธีโสคราติส — ไม่ให้คำตอบ แต่ใบ้และช่วยให้คิดเองได้
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction
                icon={<Sparkles className="w-5 h-5" />}
                label="ถามคิดเป็นอะไรก็ได้"
                description="AI พร้อมช่วยเหลือ"
                variant="highlight"
              />
              <QuickAction
                icon={<Target className="w-5 h-5" />}
                label="ทบทวนจุดอ่อน"
                description="ฝึกเนื้อหาที่ยังไม่เข้าใจ"
              />
              <QuickAction
                icon={<Trophy className="w-5 h-5" />}
                label="ความสำเร็จของฉัน"
                description="ดู badges และ achievements"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
