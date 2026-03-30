'use client';

import React, { useState, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/utils';
import { useAuth } from '@/components/AuthProvider';
import { isStagingMode, isLocalMode } from '@/lib/config';
import { toast } from '@/lib/toast';
import { useSidebar } from '@/components/ui/sidebar';
import { useWelcomeBannerStore } from '@/stores/welcome-banner-store';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { NotificationDropdown } from '../notifications/notification-dropdown';
import { useAgentStartInput } from '@/hooks/dashboard';
import { ChatInput } from '@/components/thread/chat-input/chat-input';
import { Menu, Users, GraduationCap, Sparkles } from 'lucide-react';
import { StudentDashboard } from './student-dashboard';
import { TeacherDashboard } from './teacher-dashboard';
import { KidpenAvatar } from '@/components/ui/kidpen-avatar';

const CustomAgentsSection = lazy(() => 
  import('./custom-agents-section').then(mod => ({ default: mod.CustomAgentsSection }))
);
const AgentConfigurationDialog = lazy(() => 
  import('@/components/agents/agent-configuration-dialog').then(mod => ({ default: mod.AgentConfigurationDialog }))
);

// ═══════════════════════════════════════════════════════════════
// MODE TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════

interface ModeToggleProps {
  mode: 'student' | 'teacher';
  onChange: (mode: 'student' | 'teacher') => void;
}

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-white rounded-full border border-kidpen-dark/10 p-1 shadow-sm">
      <button
        onClick={() => onChange('student')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold font-thai transition-all',
          mode === 'student' 
            ? 'bg-kidpen-blue text-white shadow-sm' 
            : 'text-kidpen-dark/60 hover:text-kidpen-dark hover:bg-gray-50'
        )}
      >
        <GraduationCap className="w-4 h-4" />
        <span className="hidden sm:inline">โหมดนักเรียน</span>
        <span className="sm:hidden">นักเรียน</span>
      </button>
      <button
        onClick={() => onChange('teacher')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold font-thai transition-all',
          mode === 'teacher' 
            ? 'bg-kidpen-dark text-white shadow-sm' 
            : 'text-kidpen-dark/60 hover:text-kidpen-dark hover:bg-gray-50'
        )}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">โหมดคุณครู</span>
        <span className="sm:hidden">คุณครู</span>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD CONTENT
// ═══════════════════════════════════════════════════════════════

export function DashboardContent() {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configAgentId, setConfigAgentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'super-worker' | 'worker-templates'>('super-worker');
  const [demoRole, setDemoRole] = useState<'student' | 'teacher'>('student');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isVisible: isWelcomeBannerVisible } = useWelcomeBannerStore();
  const { setOpen: setSidebarOpenState, setOpenMobile } = useSidebar();

  // Handle tab changes from URL
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'worker-templates') {
      setViewMode('worker-templates');
    } else {
      setViewMode('super-worker');
    }
    
    // Handle role from URL
    const role = searchParams.get('role');
    if (role === 'teacher') {
      setDemoRole('teacher');
    } else if (role === 'student') {
      setDemoRole('student');
    }
  }, [searchParams]);

  // Handle expired link notification for logged-in users
  React.useEffect(() => {
    const linkExpired = searchParams.get('linkExpired');
    if (linkExpired === 'true') {
      toast.info(tAuth('magicLinkExpired'), {
        description: tAuth('magicLinkExpiredDescription'),
        duration: 5000,
      });
      
      // Clean up URL param
      const url = new URL(window.location.href);
      url.searchParams.delete('linkExpired');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, tAuth]);

  const handleConfigureAgent = (agentId: string) => {
    setConfigAgentId(agentId);
    setShowConfigDialog(true);
  };

  // Use the agent start input hook for state management
  const {
    inputValue,
    setInputValue,
    isSubmitting,
    isRedirecting,
    chatInputRef,
    selectedAgentId,
    setSelectedAgent,
    selectedMode,
    selectedCharts,
    selectedOutputFormat,
    selectedTemplate,
    setSelectedMode,
    setSelectedCharts,
    setSelectedOutputFormat,
    setSelectedTemplate,
    handleSubmit,
  } = useAgentStartInput({
    redirectOnError: '/dashboard',
    requireAuth: true,
    enableAutoSubmit: true,
    logPrefix: '[Dashboard]',
  });

  // Handle role change with URL update
  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setDemoRole(newRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-col h-screen w-full overflow-hidden relative">
        {/* Brandmark Background - responsive sizing for all devices */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/kidpen-brandmark-bg.svg"
            alt=""
            className="absolute left-1/2 -translate-x-1/2 top-[-10%] sm:top-1/2 sm:-translate-y-1/2 w-[140vw] min-w-[700px] h-auto sm:w-[160vw] sm:min-w-[1000px] md:min-w-[1200px] lg:w-[162vw] lg:min-w-[1620px] object-contain select-none invert dark:invert-0"
            draggable={false}
          />
        </div>

        {/* ═══ TOP BAR ═══ */}
        <div className={cn(
          "absolute left-0 right-0 flex items-center justify-between px-3 sm:px-4 transition-[top] duration-200 z-10",
          isWelcomeBannerVisible ? "top-12" : "top-2"
        )}>
          {/* Left: Menu + Mode Toggle */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={() => {
                  setSidebarOpenState(true);
                  setOpenMobile(true);
                }}
                className="flex items-center justify-center h-10 w-10 rounded-xl text-kidpen-dark/60 hover:text-kidpen-dark hover:bg-white/80 active:bg-white transition-colors touch-manipulation"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <ModeToggle mode={demoRole} onChange={handleRoleChange} />
          </div>

          {/* Right: Notifications */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 flex flex-col relative z-[1] overflow-y-auto w-full pt-16">
          {viewMode === 'super-worker' && (
            <>
              <div className="flex-1 w-full mx-auto pb-36">
                {demoRole === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
              </div>

              {/* ═══ CHAT INPUT (Fixed at bottom) ═══ */}
              <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 bg-gradient-to-t from-kidpen-cream via-kidpen-cream/95 to-transparent pt-8">
                <div className="w-full max-w-3xl mx-auto">
                  {/* Kidpen branding above input */}
                  <div className="flex items-center justify-center gap-2 mb-3 opacity-80">
                    <KidpenAvatar size="sm" />
                    <span className="text-sm font-thai text-kidpen-dark/60">
                      {demoRole === 'student' 
                        ? 'ถามคิดเป็นได้เลย — พร้อมช่วยติวทุกเรื่อง!' 
                        : 'ถามคิดเป็นเกี่ยวกับนักเรียนหรือเนื้อหา'}
                    </span>
                  </div>
                  <ChatInput
                    ref={chatInputRef}
                    onSubmit={handleSubmit}
                    placeholder={demoRole === 'student' 
                      ? t('describeWhatYouNeed') 
                      : 'ถามเกี่ยวกับความก้าวหน้าของนักเรียน, สร้างแบบฝึกหัด...'}
                    loading={isSubmitting || isRedirecting}
                    disabled={isSubmitting}
                    value={inputValue}
                    onChange={setInputValue}
                    selectedAgentId={selectedAgentId}
                    onAgentSelect={setSelectedAgent}
                    autoFocus={false}
                    enableAdvancedConfig={false}
                    onConfigureAgent={handleConfigureAgent}
                    selectedMode={selectedMode}
                    onModeDeselect={() => setSelectedMode(null)}
                    animatePlaceholder={true}
                    hideAttachments={false}
                    hideAgentSelection={demoRole === 'student'} // Hide agent selection for students
                  />
                </div>
              </div>
            </>
          )}
          
          {(viewMode === 'worker-templates') && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full animate-in fade-in-0 duration-300">
                {(isStagingMode() || isLocalMode()) && (
                  <div className="w-full px-4 pb-8">
                    <div className="max-w-5xl mx-auto">
                      <Suspense fallback={<div className="h-64 bg-muted/10 rounded-lg animate-pulse" />}>
                        <CustomAgentsSection
                          onAgentSelect={() => {}}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {configAgentId && (
        <Suspense fallback={null}>
          <AgentConfigurationDialog
            open={showConfigDialog}
            onOpenChange={setShowConfigDialog}
            agentId={configAgentId}
            onAgentChange={(newAgentId) => {
              setConfigAgentId(newAgentId);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
