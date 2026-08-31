'use client';

import { ShieldCheck, Lock, Key, Server, Eye, CheckCircle2, CloudLightning, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';

export default function SecurityPage() {
  const { securityText, publicContactEmail } = useStore();

  const securityPillars = [
    {
      title: "Bank-Grade Encryption",
      icon: Lock,
      description: "All guest and financial records are encrypted both in transit (SSL/TLS) and at rest (AES-256). This ensures that sensitive information like ID numbers and revenue data remains confidential."
    },
    {
      title: "Granular Access Control",
      icon: Key,
      description: "Property owners can define specific permissions for each staff login. Housekeeping staff only see room tasks, while front-desk staff manage bookings, and only admins can view financial reports."
    },
    {
      title: "Cloud Infrastructure",
      icon: CloudLightning,
      description: "Adyfire is hosted on redundant, world-class cloud infrastructure. We provide multi-zone availability to ensure your property management system remains online even during localized outages."
    },
    {
      title: "Real-time Auditing",
      icon: ShieldAlert,
      description: "Every sensitive action in the system—from deleting a booking to updating a room rate—is logged. This audit trail provides transparency and helps prevent internal fraud."
    }
  ];

  return (
    <div className="py-12 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="h-3 w-3" />
            Reliable PMS Security
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Your property data is in <span className="text-primary">safe hands</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {securityText || "We implement multi-layered security protocols to protect your business and your guests."}
          </p>
        </div>

        {/* Security Pillars */}
        <div className="grid gap-8 md:grid-cols-2 mb-24">
          {securityPillars.map((pillar, index) => (
            <Card key={index} className="border-muted/30 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <pillar.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compliance Section */}
        <div className="bg-muted/20 rounded-3xl p-8 md:p-16 border border-dashed text-center">
          <h2 className="text-3xl font-bold font-headline mb-8">Our Commitment to Reliability</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            {[
              "Automated Daily DB Backups",
              "DDoS Attack Protection",
              "Staff Access Permission Logs",
              "Secure Password Hashing",
              "End-to-end Data Integrity",
              "24/7 Server Monitoring"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reporting Section */}
        <div className="mt-24 text-center">
          <Separator className="mb-12" />
          <h3 className="text-2xl font-bold mb-4">Found a vulnerability?</h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We take every security report seriously. If you believe you've found a security issue in our PMS platform, please reach out to our security team.
          </p>
          <a href={`mailto:${publicContactEmail}`} className="text-primary font-bold hover:underline text-lg">
            {publicContactEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
