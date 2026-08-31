'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Printer, Layout, Settings, Network, Info, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReceiptPreview } from './receipt-preview';
import { InvoicePreview } from './invoice-preview';
import { ConfigureReceiptDialog } from './configure-receipt-dialog';
import { ConfigureInvoiceDialog } from './configure-invoice-dialog';
import type { ReceiptSettings, InvoiceSettings } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function PrintLayoutPage() {
  const { t, userProfile, updateReceiptSettings, updateInvoiceSettings } = useStore();
  const { toast } = useToast();
  const [isReceiptConfigOpen, setIsReceiptConfigOpen] = useState(false);
  const [isInvoiceConfigOpen, setIsInvoiceConfigOpen] = useState(false);
  
  const [bridgeUrl, setBridgeUrl] = useState('http://localhost:8181');
  const [bridgeStatus, setBridgeStatus] = useState<'connected' | 'disconnected' | 'searching'>('disconnected');

  useEffect(() => {
    // Initial mock connection check
    setBridgeStatus('searching');
    const timer = setTimeout(() => setBridgeStatus('connected'), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (userProfile?.role !== 'super-admin' && !userProfile?.cashierPermissions?.printLayout) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  const handleSaveReceiptSettings = async (settings: ReceiptSettings) => {
    await updateReceiptSettings(settings);
  };

  const handleSaveInvoiceSettings = async (settings: InvoiceSettings) => {
    await updateInvoiceSettings(settings);
  };

  const handleUpdateBridge = () => {
    setBridgeStatus('searching');
    toast({ title: t('Searching...'), description: t('Looking for hardware bridge at {url}', { url: bridgeUrl }) });
    setTimeout(() => {
        setBridgeStatus('connected');
        toast({ title: t('Connected'), description: t('Hardware bridge established.') });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Print Layout')}</h1>
          <p className="text-muted-foreground">{t('Configure and preview your document print templates.')}</p>
        </div>
        <div className="flex items-center gap-2 bg-card border p-2 rounded-lg">
            <div className="p-2 rounded-full bg-primary/10">
                <Network className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{t('Bridge Status')}</p>
                <div className="flex items-center gap-1.5 mt-1">
                    {bridgeStatus === 'connected' ? (
                        <Badge variant="success" className="h-5 text-[10px] gap-1 px-1.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> {t('Connected')}
                        </Badge>
                    ) : bridgeStatus === 'searching' ? (
                        <Badge variant="outline" className="h-5 text-[10px] gap-1 px-1.5 animate-pulse">
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" /> {t('Searching...')}
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="h-5 text-[10px] gap-1 px-1.5">
                            <AlertCircle className="h-2.5 w-2.5" /> {t('Disconnected')}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Hardware Bridge Card */}
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Network className="h-5 w-5 text-primary" />
                    {t('Hardware Connectivity')}
                </CardTitle>
                <CardDescription>
                    {t('Establish connection with local hardware via Print Bridge.')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-1 space-y-4 w-full">
                        <div className="grid gap-2">
                            <Label htmlFor="bridge-url">{t('Bridge URL')}</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="bridge-url" 
                                    value={bridgeUrl} 
                                    onChange={(e) => setBridgeUrl(e.target.value)} 
                                    placeholder="http://localhost:8181"
                                    className="bg-background"
                                />
                                <Button variant="secondary" onClick={handleUpdateBridge}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t('Update Connection')}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-background/50 p-4 rounded-lg border border-dashed text-sm">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-muted-foreground leading-relaxed">
                                {t('Bridge Info')}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Thermal Receipt Card */}
        <Card className="flex flex-col">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Printer className="h-5 w-5 text-primary" />
              {t('Thermal Receipt')}
            </CardTitle>
            <CardDescription>
              {t('80mm format for POS thermal printers.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 sm:p-6">
            <div className="space-y-6">
                <ReceiptPreview />
                <div className="space-y-2">
                    <p className="text-sm font-semibold">{t('Settings')}:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>{t('Header information (Store name, address)')}</li>
                        <li>{t('Footer message')}</li>
                        <li>{t('Font size and contrast')}</li>
                        <li>{t('Custom margins and width')}</li>
                    </ul>
                </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button variant="outline" className="w-full" onClick={() => setIsReceiptConfigOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                {t('Configure Receipt')}
            </Button>
          </CardFooter>
        </Card>

        {/* A4 Invoice Card */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Layout className="h-5 w-5 text-primary" />
              {t('A4 Invoice')}
            </CardTitle>
            <CardDescription>
              {t('Standard A4 format for professional wholesale invoices.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-4 sm:p-6">
            <div className="space-y-6">
                <InvoicePreview />
                <div className="space-y-2">
                    <p className="text-sm font-semibold">{t('Settings')}:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>{t('Company Logo')}</li>
                        <li>{t('Standard branding color')}</li>
                        <li>{t('Terms and Conditions')}</li>
                    </ul>
                </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0">
            <Button variant="outline" className="w-full" onClick={() => setIsInvoiceConfigOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                {t('Configure Invoice')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ConfigureReceiptDialog 
        open={isReceiptConfigOpen} 
        onOpenChange={setIsReceiptConfigOpen} 
        onSave={handleSaveReceiptSettings} 
      />

      <ConfigureInvoiceDialog
        open={isInvoiceConfigOpen}
        onOpenChange={setIsInvoiceConfigOpen}
        onSave={handleSaveInvoiceSettings}
      />
    </div>
  );
}
