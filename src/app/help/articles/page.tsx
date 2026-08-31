'use client';

import { ArrowLeft, ChevronRight, Rocket, CalendarCheck, Brush, Monitor, FileText, ShieldCheck, BookOpen, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AllArticlesPage() {
  const categories = [
    {
      title: "Getting Started",
      icon: Rocket,
      articles: [
        { title: "Creating your property profile", slug: "creating-your-property-profile" },
        { title: "Adding rooms and room types", slug: "adding-rooms-and-room-types" },
        { title: "Configuring staff roles", slug: "configuring-staff-roles" },
        { title: "Inviting team members", slug: "inviting-team-members" },
      ]
    },
    {
      title: "Reservations",
      icon: CalendarCheck,
      articles: [
        { title: "Processing a new booking", slug: "processing-a-new-booking" },
        { title: "Managing hourly vs daily stays", slug: "managing-hourly-vs-daily-stays" },
        { title: "Handling booking cancellations", slug: "handling-bookings-cancellations" },
        { title: "Overbooking prevention tips", slug: "overbooking-prevention" },
      ]
    },
    {
      title: "Housekeeping",
      icon: Brush,
      articles: [
        { title: "Assigning cleaning tasks", slug: "assigning-cleaning-tasks" },
        { title: "Updating room status (HK)", slug: "updating-room-status" },
        { title: "Reporting room maintenance", slug: "reporting-room-maintenance" },
        { title: "Housekeeping staff mobile view", slug: "staff-mobile-view" }
      ]
    },
    {
      title: "Services & F&B",
      icon: ChefHat,
      articles: [
        { title: "Managing mini-bar inventory", slug: "minibar-inventory" },
        { title: "Room service workflow setup", slug: "room-service-guide" },
        { title: "Restaurant table mapping", slug: "restaurant-setup" },
        { title: "Spa and amenity scheduling", slug: "amenity-bookings" },
      ]
    },
    {
      title: "Billing & Invoicing",
      icon: FileText,
      articles: [
        { title: "Finalizing guest check-out", slug: "finalizing-guest-check-out" },
        { title: "Sending digital bills via QR", slug: "sending-digital-bills-via-qr" },
        { title: "Generating A4 professional invoices", slug: "generating-a4-invoices" },
      ]
    },
    {
      title: "Admin & Security",
      icon: ShieldCheck,
      articles: [
        { title: "Managing staff login access", slug: "managing-staff-login-access" },
        { title: "Audit logs and transaction tracking", slug: "audit-logs-guide" },
        { title: "Subscription and property limits", slug: "subscription-management" },
      ]
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/help" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Help Center
            </Link>
          </Button>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-headline flex items-center gap-4">
            <BookOpen className="h-10 w-10 text-primary" />
            Full Knowledge Base
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Browse our complete directory of property management tutorials and technical guides.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {categories.map((category, index) => (
            <Card key={index} className="h-fit">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-headline">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {category.articles.map((article, aIndex) => (
                    <li key={aIndex}>
                      <Link 
                        href={`/help/articles/${article.slug}`} 
                        className="flex items-center justify-between text-muted-foreground hover:text-primary group transition-colors"
                      >
                        <span className="text-sm font-medium">{article.title}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-20 p-8 rounded-3xl bg-primary text-primary-foreground text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="mb-8 opacity-90 max-w-xl mx-auto">
            Our support team consists of hospitality experts who can help you optimize your property workflow.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" asChild className="font-bold">
              <Link href="/contact">Talk to an Expert</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
