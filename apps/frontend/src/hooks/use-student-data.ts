'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserProfile } from './use-user-profile';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface KnowledgeComponent {
  id: string;
  name_th: string;
  name_en: string | null;
  subject: string;
  grade_level: number;
  ipst_standard: string | null;
  strand: string | null;
  difficulty_tier: number;
}

export interface StudentKCMastery {
  student_id: string;
  kc_id: string;
  p_mastery: number;
  p_transit: number;
  opportunity_count: number;
  correct_count: number;
  last_practiced: string | null;
  knowledge_component?: KnowledgeComponent;
}

export interface Course {
  id: string;
  school_id: string | null;
  teacher_id: string | null;
  name_th: string;
  subject: string;
  grade_level: number;
  kc_ids: string[];
  created_at: string;
}

export interface StudentSubject {
  id: string;
  name: string;
  subject: 'math' | 'science' | 'coding' | 'physics';
  icon: string;
  mastery: number;
  scaffoldLevel: 1 | 2 | 3 | 4;
  streak: number;
  lastStudied: string | null;
  totalMinutes: number;
  kcCount: number;
  masteredKcCount: number;
}

// ═══════════════════════════════════════════════════════════════
// SUBJECT MAPPING
// ═══════════════════════════════════════════════════════════════

const subjectMapping: Record<string, { type: 'math' | 'science' | 'coding' | 'physics'; icon: string }> = {
  'math': { type: 'math', icon: '📐' },
  'mathematics': { type: 'math', icon: '📐' },
  'คณิตศาสตร์': { type: 'math', icon: '📐' },
  'science': { type: 'science', icon: '🧪' },
  'chemistry': { type: 'science', icon: '🧪' },
  'biology': { type: 'science', icon: '🧬' },
  'วิทยาศาสตร์': { type: 'science', icon: '🧪' },
  'เคมี': { type: 'science', icon: '🧪' },
  'ชีววิทยา': { type: 'science', icon: '🧬' },
  'physics': { type: 'physics', icon: '⚡' },
  'ฟิสิกส์': { type: 'physics', icon: '⚡' },
  'coding': { type: 'coding', icon: '💻' },
  'computer': { type: 'coding', icon: '💻' },
  'programming': { type: 'coding', icon: '💻' },
  'วิทยาการคำนวณ': { type: 'coding', icon: '💻' },
};

function getSubjectInfo(subject: string): { type: 'math' | 'science' | 'coding' | 'physics'; icon: string } {
  const key = subject.toLowerCase();
  return subjectMapping[key] || { type: 'science', icon: '📚' };
}

// ═══════════════════════════════════════════════════════════════
// SCAFFOLD LEVEL CALCULATION
// ═══════════════════════════════════════════════════════════════

function calculateScaffoldLevel(mastery: number): 1 | 2 | 3 | 4 {
  if (mastery >= 90) return 4; // Challenge
  if (mastery >= 70) return 3; // Independent
  if (mastery >= 40) return 2; // Guided
  return 1; // Scaffolding
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useStudentSubjects
// ═══════════════════════════════════════════════════════════════

export function useStudentSubjects() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const supabase = createClient();

  return useQuery({
    queryKey: ['student-subjects', user?.id],
    queryFn: async (): Promise<StudentSubject[]> => {
      if (!user?.id) return [];

      // Fetch student's KC mastery data with knowledge component info
      const { data: masteryData, error } = await supabase
        .from('student_kc_mastery')
        .select(`
          *,
          knowledge_component:knowledge_components(*)
        `)
        .eq('student_id', user.id);

      if (error) {
        console.error('Error fetching student mastery:', error);
        return [];
      }

      // Group by subject
      const subjectMap = new Map<string, {
        kcs: StudentKCMastery[];
        totalMastery: number;
        lastPracticed: string | null;
      }>();

      for (const item of masteryData || []) {
        const kc = item.knowledge_component as KnowledgeComponent;
        if (!kc) continue;

        const subject = kc.subject;
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { kcs: [], totalMastery: 0, lastPracticed: null });
        }

        const subjectData = subjectMap.get(subject)!;
        subjectData.kcs.push(item);
        subjectData.totalMastery += item.p_mastery;

        // Track most recent practice
        if (item.last_practiced) {
          if (!subjectData.lastPracticed || item.last_practiced > subjectData.lastPracticed) {
            subjectData.lastPracticed = item.last_practiced;
          }
        }
      }

      // Convert to StudentSubject array
      const subjects: StudentSubject[] = [];
      for (const [subjectName, data] of subjectMap) {
        const avgMastery = data.kcs.length > 0 
          ? Math.round((data.totalMastery / data.kcs.length) * 100) 
          : 0;
        
        const masteredCount = data.kcs.filter(kc => kc.p_mastery >= 0.9).length;
        const subjectInfo = getSubjectInfo(subjectName);

        subjects.push({
          id: subjectName,
          name: `${subjectName} ม.${profile?.grade_level || 1}`,
          subject: subjectInfo.type,
          icon: subjectInfo.icon,
          mastery: avgMastery,
          scaffoldLevel: calculateScaffoldLevel(avgMastery),
          streak: 0, // TODO: Calculate from interactions
          lastStudied: data.lastPracticed,
          totalMinutes: 0, // TODO: Calculate from interactions
          kcCount: data.kcs.length,
          masteredKcCount: masteredCount,
        });
      }

      return subjects.sort((a, b) => b.mastery - a.mastery);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useOverallMastery
// ═══════════════════════════════════════════════════════════════

export function useOverallMastery() {
  const { data: subjects, isLoading } = useStudentSubjects();

  const overallMastery = subjects && subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.mastery, 0) / subjects.length)
    : 0;

  const avgScaffoldLevel = subjects && subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.scaffoldLevel, 0) / subjects.length) as 1 | 2 | 3 | 4
    : 2;

  return {
    overallMastery,
    avgScaffoldLevel,
    subjectCount: subjects?.length || 0,
    isLoading,
  };
}
