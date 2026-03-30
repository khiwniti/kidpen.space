'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GummyButton } from '@/components/ui/gummy-button';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Clock,
  BookOpen,
  Shield,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Bell
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Student {
  id: string;
  name: string;
  avatar?: string;
  class: string;
  grade: string;
  pybkt: number;
  scaffoldLevel: 1 | 2 | 3 | 4;
  active: boolean;
  lastSeen?: string;
  struggling?: boolean;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface ClassGroup {
  id: string;
  name: string;
  studentCount: number;
  avgMastery: number;
}

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════

const DEMO_STUDENTS: Student[] = [
  { id: '1', name: 'ด.ญ. สมใจ รักเรียน', class: 'ม.1/1', grade: 'ม.1', pybkt: 85, scaffoldLevel: 3, active: true, lastSeen: 'กำลังติว', trend: 'up', trendValue: 12 },
  { id: '2', name: 'ด.ช. ปิติ มานะ', class: 'ม.1/1', grade: 'ม.1', pybkt: 42, scaffoldLevel: 2, active: true, lastSeen: 'กำลังติว', struggling: true, trend: 'down', trendValue: 5 },
  { id: '3', name: 'ด.ญ. วีณา ใจดี', class: 'ม.4/3', grade: 'ม.4', pybkt: 92, scaffoldLevel: 4, active: false, lastSeen: '2 ชม. ที่แล้ว', trend: 'up', trendValue: 3 },
  { id: '4', name: 'ด.ช. ชูใจ เก่งกาจ', class: 'ม.4/3', grade: 'ม.4', pybkt: 15, scaffoldLevel: 1, active: true, lastSeen: 'กำลังติว', struggling: true, trend: 'down', trendValue: 8 },
  { id: '5', name: 'ด.ญ. มาลี สดใส', class: 'ม.1/2', grade: 'ม.1', pybkt: 78, scaffoldLevel: 3, active: false, lastSeen: 'เมื่อวาน', trend: 'stable', trendValue: 0 },
  { id: '6', name: 'ด.ช. กิตติ เก่งมาก', class: 'ม.1/2', grade: 'ม.1', pybkt: 28, scaffoldLevel: 1, active: false, lastSeen: '3 วัน ที่แล้ว', struggling: true, trend: 'down', trendValue: 15 },
];

const DEMO_CLASSES: ClassGroup[] = [
  { id: '1', name: 'ม.1/1', studentCount: 35, avgMastery: 62 },
  { id: '2', name: 'ม.1/2', studentCount: 32, avgMastery: 58 },
  { id: '3', name: 'ม.4/3', studentCount: 28, avgMastery: 71 },
];

// ═══════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'warning' | 'success' | 'gold';
}

function MetricCard({ icon, label, value, subtext, variant = 'default' }: MetricCardProps) {
  const variants = {
    default: 'bg-white border-kidpen-dark/5',
    warning: 'bg-red-50 border-red-200',
    success: 'bg-emerald-50 border-emerald-200',
    gold: 'bg-amber-50 border-amber-200',
  };
  
  const iconColors = {
    default: 'text-kidpen-dark/60 bg-gray-100',
    warning: 'text-red-600 bg-red-100',
    success: 'text-emerald-600 bg-emerald-100',
    gold: 'text-amber-600 bg-amber-100',
  };

  const valueColors = {
    default: 'text-kidpen-dark',
    warning: 'text-red-600',
    success: 'text-emerald-600',
    gold: 'text-amber-600',
  };

  return (
    <div className={cn('rounded-2xl border p-5 shadow-sm', variants[variant])}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', iconColors[variant])}>
          {icon}
        </div>
        <span className="text-xs font-bold text-kidpen-dark/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn('text-3xl font-extrabold', valueColors[variant])}>{value}</div>
      {subtext && <div className="text-xs text-kidpen-dark/50 font-thai mt-1">{subtext}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDENT ROW
// ═══════════════════════════════════════════════════════════════

interface StudentRowProps {
  student: Student;
  onView?: () => void;
}

function StudentRow({ student, onView }: StudentRowProps) {
  const masteryColor = student.pybkt >= 80 
    ? 'text-emerald-600' 
    : student.pybkt >= 50 
      ? 'text-amber-600' 
      : 'text-red-600';
  
  const masteryBg = student.pybkt >= 80 
    ? 'bg-emerald-500' 
    : student.pybkt >= 50 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  const statusLabel = student.pybkt >= 80 
    ? 'เข้าใจดี' 
    : student.pybkt >= 50 
      ? 'กำลังเรียนรู้' 
      : 'ต้องการความช่วยเหลือ';

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-gray-50 group',
      student.struggling && 'bg-red-50/50'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0',
        student.active ? 'bg-kidpen-blue' : 'bg-gray-300'
      )}>
        {student.name.charAt(4)}
      </div>

      {/* Name & Status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold font-thai text-kidpen-dark truncate">{student.name}</span>
          {student.struggling && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">
              ⚠️ ต้องดูแล
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-kidpen-dark/50">
          <span className="font-thai">{student.class}</span>
          {student.active ? (
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              กำลังติว
            </span>
          ) : (
            <span className="font-thai">{student.lastSeen}</span>
          )}
        </div>
      </div>

      {/* Mastery */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-20">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', masteryBg)} style={{ width: `${student.pybkt}%` }} />
          </div>
        </div>
        <span className={cn('text-sm font-bold w-12 text-right', masteryColor)}>{student.pybkt}%</span>
        <div className="flex items-center gap-1 w-16">
          {student.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {student.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          <span className={cn(
            'text-xs font-bold',
            student.trend === 'up' ? 'text-emerald-500' : student.trend === 'down' ? 'text-red-500' : 'text-gray-400'
          )}>
            {student.trend !== 'stable' && `${student.trend === 'up' ? '+' : '-'}${student.trendValue}%`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button className="p-2 rounded-lg hover:bg-kidpen-blue/10 text-kidpen-blue">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button onClick={onView} className="p-2 rounded-lg hover:bg-kidpen-blue/10 text-kidpen-blue">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLASS CARD
// ═══════════════════════════════════════════════════════════════

interface ClassCardProps {
  classGroup: ClassGroup;
  isSelected: boolean;
  onSelect: () => void;
}

function ClassCard({ classGroup, isSelected, onSelect }: ClassCardProps) {
  const masteryColor = classGroup.avgMastery >= 70 
    ? 'text-emerald-600 bg-emerald-50' 
    : classGroup.avgMastery >= 50 
      ? 'text-amber-600 bg-amber-50' 
      : 'text-red-600 bg-red-50';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'p-4 rounded-2xl border text-left transition-all w-full',
        isSelected 
          ? 'bg-kidpen-blue/5 border-kidpen-blue/30 ring-2 ring-kidpen-blue/20' 
          : 'bg-white border-kidpen-dark/10 hover:border-kidpen-dark/20'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-kidpen-dark">{classGroup.name}</span>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', masteryColor)}>
          {classGroup.avgMastery}%
        </span>
      </div>
      <div className="text-xs text-kidpen-dark/50 font-thai">
        {classGroup.studentCount} นักเรียน
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN TEACHER DASHBOARD
// ═══════════════════════════════════════════════════════════════

export function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students
  const filteredStudents = DEMO_STUDENTS
    .filter(s => {
      if (selectedClass && !s.class.includes(selectedClass.split('/')[0])) return false;
      if (searchQuery && !s.name.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => a.pybkt - b.pybkt); // Sort by mastery (struggling first)

  const strugglingCount = DEMO_STUDENTS.filter(s => s.struggling).length;
  const activeCount = DEMO_STUDENTS.filter(s => s.active).length;
  const avgMastery = Math.round(DEMO_STUDENTS.reduce((sum, s) => sum + s.pybkt, 0) / DEMO_STUDENTS.length);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-thai text-kidpen-dark tracking-tight mb-1">
            ภาพรวมห้องเรียน
          </h1>
          <p className="text-kidpen-dark/60 font-thai">ติดตามความก้าวหน้าและช่วยเหลือนักเรียนที่ต้องการ</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-kidpen-blue/10 text-kidpen-blue px-4 py-2 rounded-full font-bold font-thai text-sm border border-kidpen-blue/20">
            โรงเรียนสาธิตฯ
          </span>
        </div>
      </div>

      {/* ═══ METRICS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<Users className="w-4 h-4" />}
          label="นักเรียนทั้งหมด"
          value={DEMO_STUDENTS.length}
          subtext={`${activeCount} กำลังเรียนอยู่`}
          variant="gold"
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg. Mastery"
          value={`${avgMastery}%`}
          subtext="ค่าเฉลี่ย pyBKT"
          variant={avgMastery >= 60 ? 'success' : 'default'}
        />
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="ต้องดูแล"
          value={strugglingCount}
          subtext="นักเรียนที่มีปัญหา"
          variant={strugglingCount > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          icon={<Shield className="w-4 h-4" />}
          label="Safety Alerts"
          value="0"
          subtext="ไม่มีเนื้อหาไม่เหมาะสม"
          variant="success"
        />
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT: Class Filter */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-wider">ห้องเรียน</h3>
          <button
            onClick={() => setSelectedClass(null)}
            className={cn(
              'w-full p-3 rounded-xl text-left font-thai text-sm transition-all',
              !selectedClass 
                ? 'bg-kidpen-dark text-white font-bold' 
                : 'bg-white border border-kidpen-dark/10 text-kidpen-dark/70 hover:border-kidpen-dark/20'
            )}
          >
            ทุกห้อง ({DEMO_STUDENTS.length} คน)
          </button>
          {DEMO_CLASSES.map(cls => (
            <ClassCard
              key={cls.id}
              classGroup={cls}
              isSelected={selectedClass === cls.name}
              onSelect={() => setSelectedClass(cls.name)}
            />
          ))}
        </div>

        {/* RIGHT: Student List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-kidpen-dark/10 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-kidpen-dark/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold font-thai text-kidpen-dark text-lg">
                {selectedClass ? `นักเรียน ${selectedClass}` : 'นักเรียนที่ต้องการความช่วยเหลือ'}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kidpen-dark/40" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl border border-kidpen-dark/10 text-sm font-thai focus:outline-none focus:border-kidpen-blue/50 w-48"
                  />
                </div>
                <button className="p-2 rounded-xl border border-kidpen-dark/10 hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-kidpen-dark/50" />
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="divide-y divide-kidpen-dark/5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <StudentRow key={student.id} student={student} />
                ))
              ) : (
                <div className="p-12 text-center text-kidpen-dark/50 font-thai">
                  ไม่พบนักเรียน
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-kidpen-dark/5 bg-gray-50/50 flex justify-between items-center">
              <span className="text-sm text-kidpen-dark/50 font-thai">
                แสดง {filteredStudents.length} จาก {DEMO_STUDENTS.length} คน
              </span>
              <button className="text-sm font-bold text-kidpen-blue hover:underline font-thai flex items-center gap-1">
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
