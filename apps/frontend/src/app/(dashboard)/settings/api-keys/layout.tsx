import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys | Kidpen',
  description: 'Manage your API keys for programmatic access to Kidpen',
  openGraph: {
    title: 'API Keys | Kidpen',
    description: 'Manage your API keys for programmatic access to Kidpen',
    type: 'website',
  },
};

export default async function APIKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
