'use client';

import { Search, Rocket, CalendarCheck, Bed, Brush, ShieldCheck, MessageCircle, ChevronRight, FileText, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HelpCenterPage() {
  const categories = [
    {
      title: "Getting Started",
      icon: Rocket,
      description: "Set up your property, rooms, and staff profiles.",
      articles: [
        { title: "Creating your property profile", slug: "creating-your-property-profile" },
        { title: "Adding rooms and room types", slug: "adding-rooms-and-room-types" },
        { title: "Configuring staff roles", slug: "configuring-staff-roles" }
      ]
    },
    {
      title: "Reservations",
      icon: CalendarCheck,
      description: "Manage bookings, walk-ins, and stay modes.",
      articles: [
        { title: "Processing a new booking", slug: "processing-a-new-booking" },
        { title: "Managing hourly vs daily stays", slug: "managing-hourly-vs-daily-stays" },
        { title: "Handling booking cancellations", slug: "handling-bookings-cancellations" }
      ]
    },
    {
      title: "Housekeeping",
      icon: Brush,
      description: "Coordination for cleaning and maintenance.",
      articles: [
        { title: "Assigning cleaning tasks", slug: "assigning-cleaning-tasks" },
        { title: "Updating room status (HK)", slug: "updating-room-status" },
        { title: "Reporting room maintenance", slug: "reporting-room-maintenance" }
      ]
    },
    {
      title: "Billing & CRM",
      icon: FileText,
      description: "Guest check-outs, digital bills, and profiles.",
      articles: [
        { title: "Finalizing guest check-out", slug: "finalizing-guest-check-out" },
        { title: "Sending digital bills via QR", slug: "sending-digital-bills-via-qr" },
        { title: "Managing guest preferences", slug: "managing-guest-preferences" }
      ]
    },
    {
      title: "Services & F&B",
      icon: ChefHat,
      description: "Management for restaurant, spa, and room service.",
      articles: [
        { title: "Room service workflows", slug: "room-service-guide" },
        { title: "Restaurant table management", slug: "restaurant-setup" },
        { title: "Service charge configuration", slug: "service-charges" }
      ]
    },
    {
      title: "Security & Admin",
      icon: ShieldCheck,
      description: "System oversight and access control.",
      articles: [
        { title: "Managing staff login access", slug: "managing-staff-login-access" },
        { title: "Platform master controls", slug: "platform-master-controls" },
        { title: "Subscription management", slug: "subscription-management" }
      ]
    }
  ];

  return (
    <div className="py-12 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Hero Search Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            How can we <span className="text-primary">help?</span>
          </h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for guides, tasks, and more..." 
              className="h-14 pl-12 pr-4 text-lg shadow-sm border-muted/50 rounded-xl"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-24">
          {categories.map((category, index) => (
            <Card key={index} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {category.articles.map((article, aIndex) => (
                    <li key={aIndex}>
                      <Link 
                        href={`/help/articles/${article.slug}`} 
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 group"
                      >
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button variant="link" className="p-0 mt-6 h-auto" asChild>
                  <Link href="/help/articles">View all guides</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-2xl font-bold font-headline mb-8 text-center">Featured Tutorials</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Processing your first check-in", slug: "processing-a-new-booking" },
              { title: "Setting up 80mm thermal receipts", slug: "thermal-printer-configuration" },
              { title: "Managing staff task assignments", slug: "assigning-cleaning-tasks" },
              { title: "Sending digital guest bills", slug: "sending-digital-bills-via-qr" },
              { title: "Handling multi-night stay pricing", slug: "adding-rooms-and-room-types" }
            ].map((article, index) => (
              <Link 
                key={index} 
                href={`/help/articles/${article.slug}`} 
                className="p-4 rounded-xl border border-muted/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">{article.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-16 text-center border border-dashed">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-headline mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Our expert property management specialists are available 24/7 to help you with technical setup or operational advice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="mailto:support@adyfire.com">Email Our Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
