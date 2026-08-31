'use client';

import { Users, Globe, Rocket, ShieldCheck, Heart, Hotel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    {
      title: "Integrity First",
      icon: ShieldCheck,
      description: "We build trust through transparency and reliable software that properties can depend on every single day."
    },
    {
      title: "Hospitality Focused",
      icon: Heart,
      description: "Your guests are our priority. We design every feature to enhance the guest experience and property operations."
    },
    {
      title: "Global Scalability",
      icon: Globe,
      description: "Our platform supports properties worldwide, with multi-currency support and global compliance standards."
    },
    {
      title: "Continuous Innovation",
      icon: Rocket,
      description: "Hospitality technology moves fast. We're constantly adding features to help you stay ahead of guest expectations."
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Empowering hospitality for <span className="text-primary">everyone</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Adyfire (PMS) was founded with a simple goal: to provide boutique hotels, guest houses, and retreats with the professional management tools they need to thrive in a digital world.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold font-headline mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                What started as a small project to help a local retreat track their room cleanings has grown into a comprehensive platform used by properties across the region.
              </p>
              <p>
                We noticed that many property owners were struggling with fragmented systems—one for bookings, another for staff tasks, and another for financial reporting. Adyfire was built to solve this by creating a unified, cloud-based ecosystem.
              </p>
              <p>
                Today, our team is dedicated to pushing the boundaries of what a modern PMS can do, integrating advanced features like digital guest bills and real-time maintenance tracking.
              </p>
            </div>
          </div>
          <div className="bg-muted/30 rounded-3xl p-8 flex items-center justify-center border aspect-square md:aspect-video overflow-hidden">
             <div className="text-center space-y-4">
                <Hotel className="h-16 w-16 text-primary mx-auto opacity-50" />
                <p className="font-brand text-2xl tracking-widest opacity-20 uppercase">Adyfire PMS</p>
             </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold font-headline text-center mb-12">Our Core Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardTitle className="text-xl font-headline mb-2">{value.title}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team / Stats Section */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-bold font-headline">200+</p>
              <p className="text-sm opacity-80 uppercase tracking-widest mt-2">Active Properties</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-headline">50K+</p>
              <p className="text-sm opacity-80 uppercase tracking-widest mt-2">Nights Booked</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-headline">10+</p>
              <p className="text-sm opacity-80 uppercase tracking-widest mt-2">Countries</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-headline">24/7</p>
              <p className="text-sm opacity-80 uppercase tracking-widest mt-2">Expert Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
