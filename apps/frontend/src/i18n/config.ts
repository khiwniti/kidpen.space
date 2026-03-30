import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['th', 'en', 'de', 'it', 'zh', 'ja', 'pt', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

// Kidpen is Thai-first - default to Thai
export const defaultLocale: Locale = 'th';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../../translations/${locale}.json`)).default
  };
});

