'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicFooter } from '@/components/public-footer';

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Force light theme on public pages
    document.documentElement.classList.remove('dark', 'midnight', 'blue', 'coinlytix', 'green');
    document.documentElement.classList.add('light');
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 p-2 bg-gradient-to-b from-blue-50/80 dark:from-blue-900/40 to-transparent">
        <div className="container mx-auto flex h-16 items-center justify-between rounded-lg border bg-white/80 px-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
            <Link href="/" className="flex items-center gap-2">
                <Laptop className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl tracking-tighter text-gray-900 dark:text-white font-brand">Adyfire (PMS)</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                <Link href="/features" className="text-primary font-semibold">Features</Link>
                <Link href="/pricing" className="hover:text-primary">Pricing</Link>
                <Link href="/about" className="hover:text-primary">About</Link>
                <Link href="/blog" className="hover:text-primary">Blog</Link>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <PublicFooter />
    </div>
  );
}
