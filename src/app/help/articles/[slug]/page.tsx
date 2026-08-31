
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const ARTICLES = {
  'creating-your-property-profile': {
    title: "Creating your property profile",
    category: "Getting Started",
    readTime: "4 min",
    lastUpdated: "Nov 15, 2023",
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">Your property profile defines how your hotel name, address, and contact details appear on guest receipts and invoices.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Global Settings</h2>
          <p>Navigate to <strong>Settings</strong> in the sidebar. Here you can set the store name, official address, and support email. These are synchronized across all modules, including the public digital bills.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Localization</h2>
          <p>Select your preferred currency and tax rate. Adyfire supports multi-currency display, which is crucial for international travelers.</p>
        </section>
      </div>
    )
  },
  'adding-rooms-and-room-types': {
    title: "Adding rooms and room types",
    category: "Getting Started",
    readTime: "5 min",
    lastUpdated: "Oct 30, 2023",
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">Correct room configuration ensures accurate availability and revenue tracking.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Room Categories</h2>
          <p>Go to the <strong>Rooms</strong> page and click "Add Room". Define your primary types (e.g., Deluxe, Suite, Pool View). Each room is assigned a floor and a base capacity.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Pricing Tiers</h2>
          <p>You can add custom pricing tiers for each room, such as "Weekend Rate" or "6-Hour Special", giving you total flexibility for short-stay markets.</p>
        </section>
      </div>
    )
  },
  'processing-a-new-booking': {
    title: "Processing a new booking",
    category: "Reservations",
    readTime: "3 min",
    lastUpdated: "Nov 02, 2023",
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">The booking engine is designed for speed. Follow these steps to handle a guest reservation correctly.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">The Booking Grid</h2>
          <p>Navigate to the <strong>Bookings</strong> page. Use the date picker to verify room availability. A green badge indicates the room is free for the selected dates.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Stay Modes</h2>
          <p>Choose between <strong>Daily</strong> (Standard check-in/out) or <strong>Hourly</strong> (Flexible slots). Adyfire will automatically calculate the subtotal based on your pricing tiers.</p>
        </section>
      </div>
    )
  },
  'assigning-cleaning-tasks': {
    title: "Assigning cleaning tasks",
    category: "Housekeeping",
    readTime: "2 min",
    lastUpdated: "Nov 05, 2023",
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">Ensure rooms are turned over quickly by assigning tasks to your staff.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Real-time HK Status</h2>
          <p>Go to the <strong>Housekeeping</strong> module. You will see a live status of every room. When a guest checks out, the room automatically switches to "Dirty".</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Staff Assignments</h2>
          <p>Click "Assign Task". Select a staff member and set the priority. The assigned user will see this on their mobile device instantly.</p>
        </section>
      </div>
    )
  },
  'sending-digital-bills-via-qr': {
    title: "Sending digital bills via QR",
    category: "Billing & CRM",
    readTime: "4 min",
    lastUpdated: "Nov 10, 2023",
    content: (
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">Reduce front-desk friction by providing guests with live access to their statements.</p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Generating the QR Code</h2>
          <p>On the <strong>Bookings</strong> dashboard, click the QR icon for an active guest. This code links to a secure, live webpage showing their room subtotal and extra charges.</p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-foreground">Guest Orders</h2>
          <p>From the digital bill, guests can browse your service menu and request items (like water or soda) which appear as "Requested Orders" on your dashboard for staff approval.</p>
        </section>
      </div>
    )
  }
};

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = ARTICLES[slug as keyof typeof ARTICLES];

  if (!article) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
        <p className="text-muted-foreground mb-8">The requested technical guide could not be located.</p>
        <Button asChild>
          <Link href="/help">Return to Help Center</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/help" className="hover:text-primary transition-colors">Help Center</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/help/articles" className="hover:text-primary transition-colors">Guides</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">{article.title}</span>
        </nav>

        <article>
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              {article.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white font-headline mb-6">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: {article.lastUpdated}</span>
              </div>
            </div>
          </header>

          <Separator className="my-10" />

          <div className="prose prose-blue dark:prose-invert max-w-none">
            {article.content}
          </div>

          <Separator className="my-16" />

          <footer className="bg-muted/20 border rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Was this guide helpful?</h3>
            <p className="text-muted-foreground mb-6">We're constantly updating our documentation based on property owner feedback.</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="px-8 font-bold">Yes</Button>
              <Button variant="outline" className="px-8 font-bold">No</Button>
            </div>
          </footer>

          <div className="mt-12">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-primary">
              <Link href="/help/articles" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to all guides
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
