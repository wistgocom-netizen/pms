'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PublicFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/10 py-12 px-4">
      <footer className="container mx-auto bg-white dark:bg-gray-950 border border-muted/50 rounded-[2.5rem] shadow-xl overflow-hidden p-8 md:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Logo & Newsletter Section */}
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <Laptop className="h-6 w-6 text-primary" />
              <span className="font-bold text-2xl tracking-tighter text-gray-900 dark:text-white font-brand">Adyfire (PMS)</span>
            </Link>
            
            <div className="space-y-4 max-w-sm">
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Sign up for property management tips and updates.</p>
              <div className="relative flex items-center">
                <Input 
                  type="email" 
                  placeholder="Enter you email" 
                  className="rounded-full h-12 pl-6 pr-28 bg-muted/20 border-muted/50 focus-visible:ring-primary"
                  suppressHydrationWarning
                />
                <Button className="absolute right-1 h-10 rounded-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black px-6">
                  Submit
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                By subscribing you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link> and provide consent to receive updates from our company.
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Resources</h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blogs</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/help/articles" className="hover:text-primary transition-colors">Guides</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">About</h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link href="#" className="hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Support</h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ's</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Legal</h3>
              <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-muted/30 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {currentYear || ''} Adyfire Solutions, All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
