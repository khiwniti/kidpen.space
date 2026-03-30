'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserProfile } from './use-user-profile';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ClassroomStudent {
  id: string;
  display_name: string | null;
  grade_level: number | null;
  avgMastery: number;
  scaffoldLevel: 1 | 2 | 3 | 4;
  isActive: boolean;
  lastSeen: string | null;
  isStruggling: boolean;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  kcProgress: {
    total: number;
    mastered: number;
  };
}

export interface ClassGroup {
  id: string;
  name: string;
  gradeLevel: number;
  studentCount: number;
  avgMastery: number;
  strugglingCount: number;
  activeCount: number;
}

export interface TeacherCourse {
  id: string;
  name_th: string;
  subject: string;
  grade_level: number;
  studentCount: number;
  avgMastery: number;
}

export interface ClassroomStats {
  totalStudents: number;
  activeStudents: number;
  strugglingStudents: number;
  avgMastery: number;
  safetyAlerts: number;
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useTeacherCourses
// ═══════════════════════════════════════════════════════════════

export function useTeacherCourses() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const supabase = createClient();

  return useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: async (): Promise<TeacherCourse[]> => {
      if (!user?.id || profile?.role === 'student') return [];

      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id);

      if (error) {
        console.error('Error fetching teacher courses:', error);
        return [];
      }

      return courses?.map(course => ({
        id: course.id,
        name_th: course.name_th,
        subject: course.subject,
        grade_level: course.grade_level,
        studentCount: 0, // TODO: Count enrolled students
        avgMastery: 0, // TODO: Calculate from student mastery
      })) || [];
    },
    enabled: !!user?.id && profile?.role !== 'student',
    staleTime: 5 * 60 * 1000,
  });
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useClassroomStudents
// ═══════════════════════════════════════════════════════════════

export function useClassroomStudents(courseId?: string) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const supabase = createClient();

  return useQuery({
    queryKey: ['classroom-students', user?.id, profile?.school_id, courseId],
    queryFn: async (): Promise<ClassroomStudent[]> => {
      if (!user?.id || profile?.role === 'student') return [];

      // For teachers, get students in their school
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'student');

      // Filter by school if teacher has a school
      if (profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data: students, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }

      // Get mastery data for these students
      const studentIds = students?.map(s => s.id) || [];
      if (studentIds.length === 0) return [];

      const { data: masteryData } = await supabase
        .from('student_kc_mastery')
        .select('student_id, p_mastery')
        .in('student_id', studentIds);

      // Calculate per-student stats
      const studentMasteryMap = new Map<string, number[]>();
      for (const item of masteryData || []) {
        if (!studentMasteryMap.has(item.student_id)) {
          studentMasteryMap.set(item.student_id, []);
        }
        studentMasteryMap.get(item.student_id)!.push(item.p_mastery);
      }

      return students?.map(student => {
        const masteries = studentMasteryMap.get(student.id) || [];
        const avgMastery = masteries.length > 0
          ? Math.round((masteries.reduce((a, b) => a + b, 0) / masteries.length) * 100)
          : 0;
        
        const isStruggling = avgMastery < 40;
        const scaffoldLevel = avgMastery >= 90 ? 4 : avgMastery >= 70 ? 3 : avgMastery >= 40 ? 2 : 1;

        return {
          id: student.id,
          display_name: student.display_name,
          grade_level: student.grade_level,
          avgMastery,
          scaffoldLevel: scaffoldLevel as 1 | 2 | 3 | 4,
          isActive: false, // TODO: Check recent activity
          lastSeen: null, // TODO: Get from interactions
          isStruggling,
          trend: 'stable' as const, // TODO: Calculate from historical data
          trendValue: 0,
          kcProgress: {
            total: masteries.length,
            mastered: masteries.filter(m => m >= 0.9).length,
          },
        };
      }) || [];
    },
    enabled: !!user?.id && profile?.role !== 'student',
    staleTime: 2 * 60 * 1000,
  });
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useClassroomStats
// ═══════════════════════════════════════════════════════════════

export function useClassroomStats() {
  const { data: students, isLoading } = useClassroomStudents();
  const { user } = useAuth();
  const supabase = createClient();

  // Get safety alerts count
  const { data: safetyData } = useQuery({
    queryKey: ['safety-alerts', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('ai_safety_log')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const stats: ClassroomStats = {
    totalStudents: students?.length || 0,
    activeStudents: students?.filter(s => s.isActive).length || 0,
    strugglingStudents: students?.filter(s => s.isStruggling).length || 0,
    avgMastery: students && students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.avgMastery, 0) / students.length)
      : 0,
    safetyAlerts: safetyData || 0,
  };

  return { stats, isLoading };
}
