import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Worker Conversation | Kidpen',
  description: 'Interactive Worker conversation powered by Kidpen',
  openGraph: {
    title: 'Worker Conversation | Kidpen',
    description: 'Interactive Worker conversation powered by Kidpen',
    type: 'website',
  },
};

export default async function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
