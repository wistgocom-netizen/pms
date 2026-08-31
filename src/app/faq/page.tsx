'use client';

import { Search, MessageCircle, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FAQPage() {
  const faqCategories = [
    {
      title: "General & Setup",
      questions: [
        {
          q: "What is Adyfire (PMS)?",
          a: "Adyfire is a comprehensive Property Management System designed for boutique hotels, guest houses, and retreats. It streamlines everything from room reservations and housekeeping tasks to guest billing and financial reporting in one unified cloud platform."
        },
        {
          q: "Is Adyfire difficult to set up?",
          a: "Not at all. We've designed Adyfire to be intuitive. You can set up your room inventory, floors, and pricing tiers in minutes. Our 'Getting Started' guides walk you through every step of the configuration process."
        },
        {
          q: "Does Adyfire support multiple languages?",
          a: "Yes, the dashboard and guest billing interfaces can be configured to support various regional languages and currencies, making it ideal for properties serving international travelers."
        }
      ]
    },
    {
      title: "Reservations & Pricing",
      questions: [
        {
          q: "Can I manage hourly stays or 'day-use' rooms?",
          a: "Yes. Adyfire features a flexible 'Stay Mode' that supports Standard (nightly) and Hourly (slot-based) bookings. You can define custom pricing tiers for specific time durations to maximize your room occupancy."
        },
        {
          q: "How does the room grid prevent overbookings?",
          a: "Our reservation engine performs real-time conflict checks. When you attempt to book a room, the system automatically verifies availability against existing bookings and maintenance blocks for those specific dates and times."
        },
        {
          q: "Can I track guest advance payments and deposits?",
          a: "Absolutely. Every booking includes a ledger for advance payments. This is automatically deducted from the final bill during check-out, ensuring your staff always collects the correct remaining balance."
        }
      ]
    },
    {
      title: "Housekeeping & Operations",
      questions: [
        {
          q: "How do cleaning staff know which rooms to attend to?",
          a: "Staff have a mobile-optimized dashboard. Rooms are automatically marked as 'Dirty' upon guest check-out. Managers can also manually assign high-priority cleaning tasks or maintenance requests directly to specific team members."
        },
        {
          q: "Can guests request services through the platform?",
          a: "Yes. By scanning a unique QR code in their room, guests can view their live digital bill and request amenities (like laundry, extra towels, or F&B). These requests appear instantly on your dashboard for staff approval."
        }
      ]
    },
    {
      title: "Billing & Hardware",
      questions: [
        {
          q: "Does it support professional invoice printing?",
          a: "Yes. Adyfire supports high-quality A4 professional invoices for business guests and standard 80mm thermal receipts for quick check-outs. You can customize headers, footers, and logos for both formats."
        },
        {
          q: "Do I need special hardware to use Adyfire?",
          a: "Adyfire works on any device with a web browser. For physical printing, we support standard USB/Bluetooth thermal printers and A4 laser printers. We recommend using a hardware bridge like QZ Tray for seamless local printing."
        }
      ]
    }
  ];

  return (
    <div className="py-12 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Everything you need to <span className="text-primary">know</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about managing your property, staff, and guests with Adyfire (PMS).
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search help topics..." 
              className="h-14 pl-12 pr-4 text-lg shadow-sm border-muted/50 rounded-xl bg-muted/10"
            />
          </div>
        </div>

        {/* Categories & Questions */}
        <div className="space-y-12 mb-24">
          {faqCategories.map((category, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-2xl font-bold font-headline border-b pb-2 text-primary/80 uppercase tracking-widest text-xs">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, qIndex) => (
                  <AccordionItem key={qIndex} value={`${index}-${qIndex}`} className="border-muted/30">
                    <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-16 text-center border border-dashed">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-headline mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Our property management experts are here to help you optimize your property's daily workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">View User Guides</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
