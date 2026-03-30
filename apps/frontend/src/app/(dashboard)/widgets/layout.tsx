'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Puzzle, BookOpen, Sparkles } from 'lucide-react';

const navItems = [
  {
    href: '/widgets',
    label: 'Widget Library',
    icon: Puzzle,
    description: 'Interactive STEM education widgets',
  },
  {
    href: '/widgets/authoring',
    label: 'Content Authoring',
    icon: BookOpen,
    description: 'Markdown + Widget integration',
  },
];

export default function WidgetsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-kidpen-cream">
      {/* Header */}
      <header className="border-b border-kidpen-gold/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kidpen-gold to-kidpen-gold/70 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-outfit font-bold text-lg text-gray-900">
                  Kidpen Widget Library
                </h1>
                <p className="text-xs text-muted-foreground">
                  Spark of Joy Design System v2.0
                </p>
              </div>
            </div>
            <nav className="flex gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-kidpen-gold text-white shadow-kidpen'
                        : 'text-gray-600 hover:bg-kidpen-gold/10 hover:text-kidpen-gold'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-kidpen-gold/20 bg-white/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Kidpen.space - Thai STEM Education Platform
          </p>
          <p className="mt-1">
            Built with the Spark of Joy Design System
          </p>
        </div>
      </footer>
    </div>
  );
}
