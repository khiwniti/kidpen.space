'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type UserRole = 'student' | 'teacher' | 'school_admin' | 'platform_admin';

export interface UserProfile {
  id: string;
  school_id: string | null;
  role: UserRole;
  grade_level: number | null;
  display_name: string | null;
  parent_email: string | null;
  consent_granted_at: string | null;
  consent_granted_by: string | null;
}

export interface School {
  id: string;
  name_th: string;
  name_en: string | null;
  province: string;
  school_code: string | null;
}

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  school: School | null;
  role: UserRole;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  needsOnboarding: boolean;
  needsConsent: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useUserProfile(): UseUserProfileReturn {
  const { user, isLoading: isAuthLoading } = useAuth();
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (profile doesn't exist yet)
        throw profileError;
      }

      // Fetch school if profile has school_id
      let school: School | null = null;
      if (profile?.school_id) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('*')
          .eq('id', profile.school_id)
          .single();
        school = schoolData;
      }

      return { profile, school };
    },
    enabled: !!user?.id && !isAuthLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const profile = data?.profile || null;
  const school = data?.school || null;
  const role: UserRole = profile?.role || 'student';

  // Computed properties
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'school_admin' || role === 'platform_admin';

  // Check if user needs onboarding (no profile exists)
  const needsOnboarding = !isLoading && !!user && !profile;

  // Check if minor student needs parental consent
  const needsConsent = isStudent && 
    profile?.grade_level != null && 
    profile.grade_level <= 3 && // ม.1-3 (ages 12-15, minors)
    !profile.consent_granted_at;

  return {
    profile,
    school,
    role,
    isStudent,
    isTeacher,
    isAdmin,
    isLoading: isLoading || isAuthLoading,
    error: error as Error | null,
    needsOnboarding,
    needsConsent,
  };
}

// ═══════════════════════════════════════════════════════════════
// ROLE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get default sidebar view based on user role
 */
export function getDefaultSidebarView(role: UserRole): 'student' | 'classroom' | 'chats' {
  switch (role) {
    case 'student':
      return 'student';
    case 'teacher':
    case 'school_admin':
      return 'classroom';
    case 'platform_admin':
      return 'chats'; // Admins see agent tools by default
    default:
      return 'student';
  }
}

/**
 * Check if a user can access teacher features
 */
export function canAccessTeacherFeatures(role: UserRole): boolean {
  return role === 'teacher' || role === 'school_admin' || role === 'platform_admin';
}

/**
 * Check if a user can access admin features
 */
export function canAccessAdminFeatures(role: UserRole): boolean {
  return role === 'school_admin' || role === 'platform_admin';
}

/**
 * Get role display name in Thai
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'student':
      return 'นักเรียน';
    case 'teacher':
      return 'คุณครู';
    case 'school_admin':
      return 'ผู้ดูแลโรงเรียน';
    case 'platform_admin':
      return 'ผู้ดูแลระบบ';
    default:
      return 'ผู้ใช้';
  }
}
