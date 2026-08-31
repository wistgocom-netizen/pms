'use client';

import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';

export default function ContactPage() {
  const { toast } = useToast();
  const { publicContactEmail } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We've received your inquiry and will get back to you within 24 hours.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="py-12 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline mb-6">
            Get in <span className="text-primary">touch</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Whether you're a boutique hotelier, a property manager, or a hospitality consultant, our team is ready to assist you with onboarding, technical support, or custom PMS solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-lg border-muted/50">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Send us a message</CardTitle>
              <CardDescription>Fill out the form below and an expert will reach out shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" placeholder="john@property.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Technical Support / Sales Inquiry" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your property and management needs..." 
                    className="min-h-[150px]" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Details & Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold font-headline mb-6">Contact Information</h2>
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Email Support</p>
                    <a href={`mailto:${publicContactEmail}`} className="text-primary hover:underline font-semibold text-lg">{publicContactEmail}</a>
                    <p className="text-muted-foreground text-xs mt-1">General inquiries, onboarding & sales</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Customer Support</p>
                    <a href="tel:+94721123412" className="text-primary hover:underline font-semibold text-lg">94 72 1123 412</a>
                    <p className="text-muted-foreground text-xs mt-1">Available Mon-Fri, 9am - 8pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Headquarters</p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      No-21, yahalabetta Road<br />
                      Haputale
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-bold font-headline mb-6">Support Hours</h2>
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-muted-foreground">9:00 AM - 8:00 PM EST</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Saturday</span>
                  <span className="text-muted-foreground">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Sunday</span>
                  <span className="text-primary font-bold uppercase tracking-wider">Critical Support Only</span>
                </div>
              </div>
            </div>

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-start gap-4">
                <MessageSquare className="h-8 w-8 opacity-50 shrink-0" />
                <div>
                  <p className="font-bold text-lg mb-1">Schedule a Demo</p>
                  <p className="text-sm opacity-80 mb-4">Let our specialists show you how Adyfire (PMS) can automate your property workflows and increase guest satisfaction.</p>
                  <Button variant="secondary" size="sm" asChild>
                    <a href={`mailto:${publicContactEmail}`}>Book Demo Session</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
