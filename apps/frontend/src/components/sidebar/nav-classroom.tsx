'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Eye,
  MessageCircle,
  ChevronRight,
  School,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/utils';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Student {
  id: string;
  name: string;
  class: string;
  pybkt: number;
  active: boolean;
  struggling: boolean;
  trend: 'up' | 'down' | 'stable';
}

interface ClassGroup {
  id: string;
  name: string;
  studentCount: number;
  avgMastery: number;
  strugglingCount: number;
}

// ═══════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════

const DEMO_STUDENTS: Student[] = [
  { id: '1', name: 'ด.ญ. สมใจ รักเรียน', class: 'ม.1/1', pybkt: 85, active: true, struggling: false, trend: 'up' },
  { id: '2', name: 'ด.ช. ปิติ มานะ', class: 'ม.1/1', pybkt: 42, active: true, struggling: true, trend: 'down' },
  { id: '3', name: 'ด.ญ. วีณา ใจดี', class: 'ม.4/3', pybkt: 92, active: false, struggling: false, trend: 'up' },
  { id: '4', name: 'ด.ช. ชูใจ เก่งกาจ', class: 'ม.4/3', pybkt: 15, active: true, struggling: true, trend: 'down' },
  { id: '5', name: 'ด.ญ. มาลี สดใส', class: 'ม.1/2', pybkt: 78, active: false, struggling: false, trend: 'stable' },
  { id: '6', name: 'ด.ช. กิตติ เก่งมาก', class: 'ม.1/2', pybkt: 28, active: false, struggling: true, trend: 'down' },
];

const DEMO_CLASSES: ClassGroup[] = [
  { id: '1', name: 'ม.1/1', studentCount: 35, avgMastery: 62, strugglingCount: 3 },
  { id: '2', name: 'ม.1/2', studentCount: 32, avgMastery: 58, strugglingCount: 5 },
  { id: '3', name: 'ม.4/3', studentCount: 28, avgMastery: 71, strugglingCount: 2 },
];

// ═══════════════════════════════════════════════════════════════
// CLASS ITEM
// ═══════════════════════════════════════════════════════════════

interface ClassItemProps {
  classGroup: ClassGroup;
  isSelected: boolean;
  onSelect: () => void;
}

function ClassItem({ classGroup, isSelected, onSelect }: ClassItemProps) {
  const masteryColor = classGroup.avgMastery >= 70 
    ? 'text-emerald-600' 
    : classGroup.avgMastery >= 50 
      ? 'text-amber-600' 
      : 'text-red-600';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
        'hover:bg-white/80 border border-transparent',
        isSelected && 'bg-white border-kidpen-blue/30 shadow-sm'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isSelected ? 'bg-kidpen-blue text-white' : 'bg-gray-100 text-kidpen-dark/60'
      )}>
        <School className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-kidpen-dark">{classGroup.name}</span>
          <span className={cn('text-sm font-bold', masteryColor)}>{classGroup.avgMastery}%</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-kidpen-dark/50">
          <span>{classGroup.studentCount} คน</span>
          {classGroup.strugglingCount > 0 && (
            <span className="text-red-500 flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              {classGroup.strugglingCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDENT ROW (Compact)
// ═══════════════════════════════════════════════════════════════

interface StudentRowProps {
  student: Student;
  onView: () => void;
}

function StudentRow({ student, onView }: StudentRowProps) {
  const masteryColor = student.pybkt >= 70 
    ? 'text-emerald-600' 
    : student.pybkt >= 50 
      ? 'text-amber-600' 
      : 'text-red-600';

  const masteryBg = student.pybkt >= 70 
    ? 'bg-emerald-500' 
    : student.pybkt >= 50 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg transition-colors group cursor-pointer',
        'hover:bg-white/80',
        student.struggling && 'bg-red-50/50'
      )}
      onClick={onView}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
        student.active ? 'bg-kidpen-blue' : 'bg-gray-300'
      )}>
        {student.name.charAt(4)}
      </div>
      
      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-thai text-kidpen-dark truncate">{student.name}</span>
          {student.struggling && (
            <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', masteryBg)} style={{ width: `${student.pybkt}%` }} />
          </div>
          <span className={cn('text-xs font-bold', masteryColor)}>{student.pybkt}%</span>
          {student.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
          {student.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 rounded-lg hover:bg-kidpen-blue/10 text-kidpen-blue">
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAV CLASSROOM (Sidebar Component)
// ═══════════════════════════════════════════════════════════════

export function NavClassroom() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  // Stats
  const totalStudents = DEMO_STUDENTS.length;
  const strugglingStudents = DEMO_STUDENTS.filter(s => s.struggling);
  const activeStudents = DEMO_STUDENTS.filter(s => s.active);

  // Filter students by selected class
  const filteredStudents = DEMO_STUDENTS
    .filter(s => {
      if (selectedClass && s.class !== selectedClass) return false;
      if (searchQuery && !s.name.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => a.pybkt - b.pybkt); // Struggling first

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard?student=${studentId}&mode=teacher`);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header Stats */}
      <div className="mb-4 px-1">
        <h3 className="text-sm font-bold text-kidpen-dark/50 uppercase tracking-wider mb-3">
          ห้องเรียน
        </h3>
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-blue-50 text-center">
            <div className="text-lg font-bold text-kidpen-blue">{totalStudents}</div>
            <div className="text-xs text-kidpen-dark/50">ทั้งหมด</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-center">
            <div className="text-lg font-bold text-emerald-600">{activeStudents.length}</div>
            <div className="text-xs text-kidpen-dark/50">ออนไลน์</div>
          </div>
          <div className="p-2 rounded-lg bg-red-50 text-center">
            <div className="text-lg font-bold text-red-600">{strugglingStudents.length}</div>
            <div className="text-xs text-kidpen-dark/50">ต้องดูแล</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kidpen-dark/40" />
          <input
            type="text"
            placeholder="ค้นหานักเรียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-kidpen-dark/10 text-sm font-thai focus:outline-none focus:border-kidpen-blue/50 bg-white"
          />
        </div>
      </div>

      {/* Class Filter */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedClass(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors',
              !selectedClass 
                ? 'bg-kidpen-dark text-white' 
                : 'bg-gray-100 text-kidpen-dark/60 hover:bg-gray-200'
            )}
          >
            ทุกห้อง
          </button>
          {DEMO_CLASSES.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.name)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1',
                selectedClass === cls.name 
                  ? 'bg-kidpen-blue text-white' 
                  : 'bg-gray-100 text-kidpen-dark/60 hover:bg-gray-200'
              )}
            >
              {cls.name}
              {cls.strugglingCount > 0 && (
                <span className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                  selectedClass === cls.name ? 'bg-white/20' : 'bg-red-500 text-white'
                )}>
                  {cls.strugglingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-1">
        <div className="text-xs text-kidpen-dark/40 uppercase tracking-wider mb-2 px-1">
          {strugglingStudents.length > 0 ? 'ต้องการความช่วยเหลือ' : 'นักเรียนทั้งหมด'}
        </div>
        <div className="space-y-1">
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onView={() => handleViewStudent(student.id)}
            />
          ))}
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-kidpen-dark/40 text-sm font-thai">
            ไม่พบนักเรียน
          </div>
        )}
      </div>

      {/* View Full Dashboard Link */}
      <div className="mt-4 pt-4 border-t border-kidpen-dark/10 px-1">
        <button 
          onClick={() => {
            router.push('/dashboard?role=teacher');
            if (isMobile) setOpenMobile(false);
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-thai text-kidpen-dark"
        >
          <span>ดูภาพรวมทั้งหมด</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
