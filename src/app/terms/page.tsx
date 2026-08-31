'use client';

import { ShieldCheck, FileText, Scale, AlertCircle, Clock, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';

export default function TermsPage() {
  const { termsConditionsText, publicContactEmail } = useStore();

  const sections = [
    {
      title: "1. Acceptance of Service",
      icon: ShieldCheck,
      content: "By creating an account or accessing Adyfire (PMS), you agree to these terms. Our software provides a platform for property management, including reservations, housekeeping, and guest billing. You must be at least 18 years old and have the authority to bind your business entity to these terms."
    },
    {
      title: "2. Subscription & SaaS Billing",
      icon: Clock,
      content: "Adyfire operates on a subscription-as-a-service model. Plans are billed in advance (Monthly or Yearly). While we offer a 7-day free trial for new properties, subsequent billing is final. Late payments may result in restricted access to the dashboard until the balance is cleared via the supported bank transfer methods."
    },
    {
      title: "3. Property Data & Guest Privacy",
      icon: Globe,
      content: "You retain all rights to your property and guest data. However, you grant Adyfire a license to host and process this data to provide our services. It is your responsibility to comply with local hospitality regulations and privacy laws regarding the collection of guest ID/Passport information through our platform."
    },
    {
      title: "4. System Uptime & Support",
      icon: AlertCircle,
      content: "We strive for 99.9% uptime. Scheduled maintenance will be communicated via the dashboard notifications. Support is provided according to your plan level (Basic, Pro, or Business). We are not liable for business interruptions caused by local internet outages or browser-side hardware bridge failures."
    },
    {
      title: "5. Intellectual Property",
      icon: FileText,
      content: "Adyfire (PMS), its logos, UI designs, and proprietary booking logic are the property of Adyfire Solutions. Unauthorized reverse engineering, scraping, or redistribution of our software interface is strictly prohibited."
    },
    {
      title: "6. Limitation of Liability",
      icon: Scale,
      content: "In no event shall Adyfire be liable for any indirect, special, or consequential damages (including loss of revenue from missed bookings) arising from the use of our platform. Our maximum liability is limited to the amount paid for your current subscription term."
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Terms & <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {termsConditionsText || "These terms govern the use of our property management services."}
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
                    <h2 className="text-2xl font-bold font-headline text-foreground">
                        {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Questions about these terms?</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions or concerns regarding our terms of service, please contact our legal team at <a href={`mailto:${publicContactEmail}`} className="text-primary hover:underline">{publicContactEmail}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
