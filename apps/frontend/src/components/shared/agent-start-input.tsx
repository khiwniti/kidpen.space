'use client';

import React, { Suspense, lazy } from 'react';
import { ChatInput } from '@/components/thread/chat-input/chat-input';
import { useAgentStartInput, UseAgentStartInputOptions } from '@/hooks/dashboard';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthProvider';
import { DynamicGreeting } from '@/components/ui/dynamic-greeting';

// Lazy load heavy components
const SunaModesPanel = lazy(() => 
  import('@/components/dashboard/suna-modes-panel').then(mod => ({ default: mod.SunaModesPanel }))
);

export interface AgentStartInputProps {
  /** Variant determines layout and styling */
  variant?: 'hero' | 'dashboard';
  /** Custom placeholder text */
  placeholder?: string;
  /** Whether this component is for logged-in users only */
  requireAuth?: boolean;
  /** Callback when auth is required but user is not logged in */
  onAuthRequired?: (pendingMessage: string) => void;
  /** Path to redirect on error */
  redirectOnError?: string;
  /** Whether to show greeting */
  showGreeting?: boolean;
  /** Custom greeting className */
  greetingClassName?: string;
  /** Whether to show subtitle below greeting */
  showSubtitle?: boolean;
  /** Custom subtitle text */
  subtitle?: string;
  /** Custom subtitle className */
  subtitleClassName?: string;
  /** Whether to enable advanced config in chat input */
  enableAdvancedConfig?: boolean;
  /** Callback when agent configuration is requested */
  onConfigureAgent?: (agentId: string) => void;
  /** Whether to animate placeholder */
  animatePlaceholder?: boolean;
  /** Whether to hide attachments */
  hideAttachments?: boolean;
  /** Whether to auto-focus input */
  autoFocus?: boolean;
  /** Whether to show modes panel */
  showModesPanel?: boolean;
  /** Whether to show alert banners (credit/thread limit) */
  showAlertBanners?: boolean;
  /** Is mobile flag (optional, can be computed internally) */
  isMobile?: boolean;
  /** Whether to show the isLoggedIn indicator on chat input */
  showLoginStatus?: boolean;
  /** Custom wrapper className for the input section */
  inputWrapperClassName?: string;
  /** Custom wrapper className for the modes panel */
  modesPanelWrapperClassName?: string;
}

export function AgentStartInput({
  variant = 'dashboard',
  placeholder,
  requireAuth = true,
  onAuthRequired,
  redirectOnError,
  showGreeting = true,
  greetingClassName,
  showSubtitle = false,
  subtitle,
  subtitleClassName,
  enableAdvancedConfig = false,
  onConfigureAgent,
  animatePlaceholder = false,
  hideAttachments = false,
  autoFocus = false,
  showModesPanel = true,
  showAlertBanners = true,
  isMobile = false,
  showLoginStatus = false,
  inputWrapperClassName,
  modesPanelWrapperClassName,
}: AgentStartInputProps) {
  const t = useTranslations('dashboard');
  const tSuna = useTranslations('suna');
  
  const { user } = useAuth();
  
  const {
    inputValue,
    setInputValue,
    isSubmitting,
    isRedirecting,
    chatInputRef,
    selectedAgentId,
    setSelectedAgent,
    isSunaAgent,
    selectedMode,
    selectedCharts,
    selectedOutputFormat,
    selectedTemplate,
    selectedDocsType,
    selectedImageStyle,
    selectedCanvasAction,
    selectedVideoStyle,
    setSelectedMode,
    setSelectedCharts,
    setSelectedOutputFormat,
    setSelectedTemplate,
    setSelectedDocsType,
    setSelectedImageStyle,
    setSelectedCanvasAction,
    setSelectedVideoStyle,
    handleSubmit,
  } = useAgentStartInput({
    redirectOnError: redirectOnError || (variant === 'hero' ? '/' : '/dashboard'),
    requireAuth,
    onAuthRequired,
    enableAutoSubmit: variant === 'dashboard',
    logPrefix: variant === 'hero' ? '[HeroSection]' : '[Dashboard]',
  });
  
  const resolvedPlaceholder = placeholder || (variant === 'hero' ? tSuna('describeTask') : t('describeWhatYouNeed'));
  
  const defaultGreetingClass = variant === 'hero'
    ? "text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-medium text-balance text-center px-4 sm:px-2"
    : "text-2xl sm:text-2xl md:text-3xl font-normal text-foreground/90";
  
  return (
    <>
      {/* Greeting */}
      {showGreeting && (
        <div className="flex flex-col items-center text-center w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both">
          <DynamicGreeting className={greetingClassName || defaultGreetingClass} />
          {showSubtitle && (
            <p className={subtitleClassName || "mt-3 text-sm sm:text-base text-muted-foreground"}>
              {subtitle || t('modeSubtitle')}
            </p>
          )}
        </div>
      )}
      
      {/* Chat Input Section */}
      <div className={inputWrapperClassName || "w-full flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both"}>
        <ChatInput
          ref={chatInputRef}
          onSubmit={handleSubmit}
          placeholder={resolvedPlaceholder}
          loading={isSubmitting || isRedirecting}
          disabled={isSubmitting}
          value={inputValue}
          onChange={setInputValue}
          isLoggedIn={showLoginStatus ? !!user : undefined}
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgent}
          autoFocus={autoFocus}
          enableAdvancedConfig={enableAdvancedConfig}
          onConfigureAgent={onConfigureAgent}
          selectedMode={selectedMode}
          onModeDeselect={() => setSelectedMode(null)}
          animatePlaceholder={animatePlaceholder}
          hideAttachments={hideAttachments}
        />
      </div>
      
      {/* Suna Modes Panel - Always show for hero variant (LP), otherwise check isSunaAgent */}
      {showModesPanel && (variant === 'hero' || isSunaAgent) && (
        <div className={modesPanelWrapperClassName || "w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both"}>
          <Suspense fallback={<div className="h-24 bg-muted/10 rounded-lg animate-pulse" />}>
            <SunaModesPanel
              selectedMode={selectedMode}
              onModeSelect={setSelectedMode}
              onSelectPrompt={setInputValue}
              isMobile={isMobile}
              selectedCharts={selectedCharts}
              onChartsChange={setSelectedCharts}
              selectedOutputFormat={selectedOutputFormat}
              onOutputFormatChange={setSelectedOutputFormat}
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              selectedDocsType={selectedDocsType}
              onDocsTypeChange={setSelectedDocsType}
              selectedImageStyle={selectedImageStyle}
              onImageStyleChange={setSelectedImageStyle}
              selectedCanvasAction={selectedCanvasAction}
              onCanvasActionChange={setSelectedCanvasAction}
              selectedVideoStyle={selectedVideoStyle}
              onVideoStyleChange={setSelectedVideoStyle}
            />
          </Suspense>
        </div>
      )}
    </>
  );
}

