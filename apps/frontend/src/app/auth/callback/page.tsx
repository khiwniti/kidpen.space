'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KidpenLoader } from '@/components/ui/kidpen-loader';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('auth');
  
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  useEffect(() => {
    if (error) {
      // Handle error case
      console.error('Auth callback error:', error, errorDescription);
      // Show error UI - in a real app this would render an error state
      // For now, redirect back to auth with error
      router.replace(`/auth?error=${encodeURIComponent(error || 'unknown_error')}`);
      return;
    }
    
    if (code) {
      // In a real implementation, we would exchange the code for a session
      // For now, simulate successful auth and redirect
      router.replace(returnUrl);
      return;
    }
    
    // No code or error - redirect back to auth
    router.replace('/auth');
  }, [searchParams, router, t]);

  // While checking, show loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <KidpenLoader size="medium" className="mb-4" />
      <p className="text-center text-foreground/60">
        {t('callbackLoading')}
      </p>
    </div>
  );
}