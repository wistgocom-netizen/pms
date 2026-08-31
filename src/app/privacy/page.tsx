'use client';

import { Lock, ShieldCheck, Eye, Database, UserCheck, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';

export default function PrivacyPage() {
  const { privacyPolicyText, publicContactEmail } = useStore();

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: "As a PMS, we collect two types of data: Account Data (your business name, email, and staff details) and Property Data (room inventory, guest names, contact numbers, and reservation history). We also store digital copies of guest IDs/Passports when uploaded for check-in compliance."
    },
    {
      title: "2. How We Use Property Data",
      icon: UserCheck,
      content: "Your data is used strictly to provide management services. This includes generating room grids, calculating revenue reports, and processing digital bills. We use anonymized, aggregated data to improve our system's performance and analytics accuracy."
    },
    {
      title: "3. Guest Privacy & Digital Bills",
      icon: Smartphone,
      content: "When you generate a QR code for a guest, we provide them with a secure, temporary view of their itemized bill. We do not sell guest contact information to third-party marketers. Your property remains the 'Data Controller' for all guest-related information."
    },
    {
      title: "4. Data Retention & Backups",
      icon: ShieldCheck,
      content: "We perform automated daily backups of your property database. If you cancel your subscription, we retain your data for 30 days to allow for final exports before permanent deletion from our secure cloud storage."
    },
    {
      title: "5. Third-Party Integrations",
      icon: Eye,
      content: "Adyfire may connect with third-party hardware bridges (like QZ Tray) or maps services. These providers have their own privacy policies. We only share the minimum necessary data required to perform the specific integration task (e.g., printing a receipt)."
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {privacyPolicyText || "Your privacy and the security of your guest data are foundational to our platform."}
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/5 p-2 rounded-lg mt-1 shrink-0">
                    <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
                        <span className="text-primary/20 font-black text-4xl">0{index + 1}</span>
                        {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-4">
                        {section.content}
                    </p>
                </div>
              </div>
              {index < sections.length - 1 && <Separator className="mt-8 ml-12" />}
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-muted/30 border border-dashed flex flex-col md:flex-row items-center gap-6">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Data Protection Questions?</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions about how we handle guest or property data, please contact our Data Protection Officer at <a href={`mailto:${publicContactEmail}`} className="text-primary hover:underline">{publicContactEmail}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
