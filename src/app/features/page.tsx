'use client';

import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart2, 
  Settings, 
  Monitor, 
  Truck, 
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChefHat,
  CalendarCheck,
  Brush
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FeaturesPage() {
  const featureGroups = [
    {
      title: "Reservation Engine",
      icon: CalendarCheck,
      description: "Fast and flexible booking for all types of guest stays.",
      features: [
        "Visual Room Grid for instant availability checks",
        "Support for Hourly, Daily, and Multi-night stays",
        "Quick Reservation sidebar for front-desk speed",
        "Automated Check-in/out status tracking",
        "Advance payment & deposit management",
        "Overbooking protection and conflict alerts"
      ]
    },
    {
      title: "Housekeeping & HK",
      icon: Brush,
      description: "Maintain property hygiene with real-time staff coordination.",
      features: [
        "Real-time Room Status (Dirty, Clean, Inspecting)",
        "Mobile-optimized dashboard for cleaning staff",
        "Automated task generation after check-out",
        "Priority cleaning tags for VIP arrivals",
        "Maintenance block management",
        "Cleaning history and staff performance logs"
      ]
    },
    {
      title: "Guest CRM & Billing",
      icon: Users,
      description: "Personalized guest experiences and seamless check-outs.",
      features: [
        "Detailed Guest Profiles & preferences",
        "Digital Bill access via unique QR codes",
        "Itemized Service Charges (Laundry, F&B, mini-bar)",
        "Identity document (Passport/ID) digital archiving",
        "Stay history and total value tracking",
        "Bulk guest communications & newsletter tools"
      ]
    },
    {
      title: "Services & Amenities",
      icon: ChefHat,
      description: "Manage on-property services from dining to wellness.",
      features: [
        "Real-time Room Service ordering interface",
        "Mini-bar inventory automated deduction",
        "Spa & Wellness service booking",
        "Table-side ordering for on-site restaurants",
        "Custom Service Charge & Tax configuration",
        "Amenity usage analytics and reporting"
      ]
    },
    {
      title: "Finance & Reporting",
      icon: BarChart2,
      description: "Deep insights into your property's financial health.",
      features: [
        "Daily, Weekly, and Monthly Revenue trends",
        "Occupancy Rate analytics per room type",
        "Expense tracking for utilities & maintenance",
        "Staff Payroll and salary payment history",
        "Net Profit vs Expenditure summaries",
        "Professional A4 and Thermal Receipt templates"
      ]
    },
    {
      title: "Hardware & Display",
      icon: Monitor,
      description: "Connect your hardware for a professional setup.",
      features: [
        "Customer-facing Live Display support",
        "Kitchen Display System (KDS) for F&B",
        "Thermal Receipt Printing (80mm & 58mm)",
        "Hardware Bridge (QZ Tray) integration",
        "Cash Drawer auto-opening support",
        "Barcode scanner support for retail items"
      ]
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline">
            Powerful features to <span className="text-primary">grow</span> your property
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Adyfire (PMS) is built with modern hospitality needs in mind. 
            A complete suite of tools to handle every aspect of your daily operations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">
          {featureGroups.map((group, index) => (
            <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <group.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">{group.title}</CardTitle>
                <CardDescription className="text-sm">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {group.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-muted/30 rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-headline mb-4">Ready to streamline your property?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience these features first-hand by creating a free account.
            No complex setup required—get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
