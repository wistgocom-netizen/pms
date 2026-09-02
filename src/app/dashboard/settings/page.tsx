'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
    Hotel, 
    Globe, 
    Palette, 
    Bell, 
    Printer, 
    Save, 
    Mail, 
    Phone, 
    MapPin, 
    ZoomIn,
    Languages,
    Fingerprint,
    Database,
    Loader2,
    Sparkles,
    ImageIcon,
    Trash2,
    FileText,
    QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { currencies } from '@/lib/currencies';
import { db } from '@/lib/db';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SettingsPage() {
  const { 
    storeName, setStoreName, 
    storeAddress, setStoreAddress, 
    storePhone, setStorePhone, 
    storeEmail, setStoreEmail,
    currency, setCurrency, 
    taxRate, setTaxRate,
    theme, setTheme,
    zoom, setZoom,
    autoPrintReceipt, setAutoPrintReceipt,
    printFontScale, setPrintFontScale,
    hotelLogo, setHotelLogo,
    reviewQrCode, setReviewQrCode,
    userProfile,
    organization,
    seedDemoData,
    t
  } = useStore();
  
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedData = async () => {
    const orgId = userProfile?.organizationId || organization?.id;
    if (!orgId) return;
    setIsSeeding(true);
    try {
      await seedDemoData(orgId);
      toast({
        title: "Demo Data Loaded",
        description: "Sri Lankan sample data (rooms, bookings, employees) has been added to your database.",
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not seed demo data.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSave = async () => {
    const { 
      storeName, setStoreName, 
      storeAddress, setStoreAddress, 
      storePhone, setStorePhone, 
      storeEmail, setStoreEmail,
      currency, setCurrency, 
      taxRate, setTaxRate,
      theme, setTheme,
      zoom, setZoom,
      autoPrintReceipt, setAutoPrintReceipt,
      printFontScale, setPrintFontScale,
      hotelLogo, setHotelLogo,
      reviewQrCode, setReviewQrCode,
      userProfile
    } = useStore();

    if (!userProfile?.organizationId) {
      toast({
        title: "Error",
        description: "No organization found. Please sign in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await db.upsertSettings(userProfile.organizationId, {
        storeName, storeAddress, storePhone, storeEmail, currency,
        taxRate, theme, zoom, autoPrintReceipt, printFontScale, hotelLogo, reviewQrCode
      });
      toast({
        title: "Settings Saved",
        description: "Your configurations have been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not save settings.",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setHotelLogo(typeof reader.result === 'string' ? reader.result : '');
      toast({ title: "Logo Added", description: "Your hotel logo will appear on printed receipts." });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReviewQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReviewQrCode(typeof reader.result === 'string' ? reader.result : '');
      toast({ title: "Review QR Added", description: "The QR code will appear at the bottom of printed receipts." });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const propertyId = userProfile?.organizationId || organization?.id || '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Settings</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Configure your property details and system preferences.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 w-full md:w-auto h-11 md:h-10 rounded-xl md:rounded-md shadow-lg shadow-primary/10">
          <Save className="h-4 w-4" /> Save Configurations
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Property Information */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
              <Hotel className="h-5 w-5 text-primary" />
              Property Profile
            </CardTitle>
            <CardDescription className="text-xs">Official information shown on receipts and digital bills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Fingerprint className="h-3 w-3" />
                System Property ID
              </Label>
              <Input value={propertyId} readOnly className="bg-muted font-mono text-xs h-10 select-all" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hotel Name</Label>
              <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="h-11 text-sm font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-11 text-sm" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11 text-sm" value={storePhone} onChange={e => setStorePhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11 text-sm" type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Localization */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
              <Globe className="h-5 w-5 text-primary" />
              Regional Settings
            </CardTitle>
            <CardDescription className="text-xs">Manage currency, taxes, and system localization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-sm">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Property Tax Rate (%)</Label>
              <Input type="number" className="h-11 text-sm font-bold" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dashboard Language</Label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select defaultValue="en">
                  <SelectTrigger className="pl-9 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-sm">English (US)</SelectItem>
                    <SelectItem value="es" className="text-sm">Español</SelectItem>
                    <SelectItem value="fr" className="text-sm">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
              <Palette className="h-5 w-5 text-primary" />
              Interface Theme
            </CardTitle>
            <CardDescription className="text-xs">Personalize your property management dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-5 sm:p-6 pt-0">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Color Scheme</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['light', 'dark', 'midnight', 'blue', 'green', 'coinlytix'].map(t => (
                  <Button 
                    key={t} 
                    variant={theme === t ? 'default' : 'outline'} 
                    size="sm" 
                    className="capitalize rounded-xl h-10 font-bold"
                    onClick={() => setTheme(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <ZoomIn className="h-4 w-4" /> Interface Scaling
                </Label>
                <span className="text-sm font-black text-primary">{zoom}%</span>
              </div>
              <Slider 
                min={80} 
                max={120} 
                step={5} 
                value={[zoom]} 
                onValueChange={v => setZoom(v[0])} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Operational Preferences */}
        <Card className="border-none shadow-sm">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
              <Bell className="h-5 w-5 text-primary" />
              Operations
            </CardTitle>
            <CardDescription className="text-xs">Automation and staff alert preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 sm:p-6 pt-0">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted/50">
              <div className="space-y-0.5 min-w-0 pr-2">
                <Label className="text-sm font-black uppercase tracking-tighter">Auto-Print Receipt</Label>
                <p className="text-[10px] text-muted-foreground leading-tight">Print statement immediately on checkout.</p>
              </div>
              <Switch checked={autoPrintReceipt} onCheckedChange={setAutoPrintReceipt} className="shrink-0" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted/50">
              <div className="space-y-0.5 min-w-0 pr-2">
                <Label className="text-sm font-black uppercase tracking-tighter">Staff Alerts</Label>
                <p className="text-[10px] text-muted-foreground leading-tight">Mobile alerts for new guest bookings.</p>
              </div>
              <Switch defaultValue="on" className="shrink-0" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-muted/50">
              <div className="space-y-0.5 min-w-0 pr-2">
                <Label className="text-sm font-black uppercase tracking-tighter">Maintenance Notifications</Label>
                <p className="text-[10px] text-muted-foreground leading-tight">Alert managers when a room needs attention.</p>
              </div>
              <Switch defaultValue="on" className="shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print & Branding */}
      <Card className="border-none shadow-sm col-span-full">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
            <Printer className="h-5 w-5 text-primary" />
            Print & Branding
          </CardTitle>
          <CardDescription className="text-xs">Control how guest bills and receipts appear when printed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-5 sm:p-6 pt-0">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <FileText className="h-4 w-4" /> Print Text Size
                </Label>
                <span className="text-sm font-black text-primary">{Math.round(printFontScale * 100)}%</span>
              </div>
              <Slider
                min={90}
                max={150}
                step={5}
                value={[Math.round(printFontScale * 100)]}
                onValueChange={v => setPrintFontScale((v[0]) / 100)}
              />
              <p className="text-[10px] text-muted-foreground">Increase to make receipt text larger. Applies to the guest proforma bill.</p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <ImageIcon className="h-4 w-4" /> Hotel Logo
              </Label>
              <div className="flex items-center gap-4">
                {hotelLogo ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hotelLogo} alt="Hotel logo" className="h-20 w-20 object-cover rounded-xl border bg-muted/20" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow"
                      onClick={() => { setHotelLogo(''); toast({ title: "Logo Removed" }); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/20">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <label className="inline-flex items-center justify-center h-10 px-4 rounded-xl border bg-background text-sm font-bold cursor-pointer hover:bg-muted/50 gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {hotelLogo ? 'Replace' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">Square PNG or JPG recommended. Shown at the top of printed bills.</p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <QrCode className="h-4 w-4" /> Review QR Code
              </Label>
              <div className="flex items-center gap-4">
                {reviewQrCode ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reviewQrCode} alt="Google Review QR" className="h-20 w-20 object-cover rounded-xl border bg-muted/20" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow"
                      onClick={() => { setReviewQrCode(''); toast({ title: "Review QR Removed" }); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/20">
                    <QrCode className="h-6 w-6" />
                  </div>
                )}
                <label className="inline-flex items-center justify-center h-10 px-4 rounded-xl border bg-background text-sm font-bold cursor-pointer hover:bg-muted/50 gap-2">
                  <QrCode className="h-4 w-4" />
                  {reviewQrCode ? 'Replace' : 'Upload QR'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleReviewQrUpload} />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">Your Google review QR. Shown at the bottom of printed bills — "Scan me!".</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer */}
      <Card className="border-none shadow-sm">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tight">
            <Database className="h-5 w-5 text-primary" />
            Developer
          </CardTitle>
          <CardDescription className="text-xs">These actions are for development purposes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5 sm:p-6 pt-0">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50">
            <div className="space-y-1 min-w-0">
              <Label className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Seed Demo Data
              </Label>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Add sample Sri Lankan rooms, bookings, and employee records to your database.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2 h-10 rounded-xl font-bold"
              onClick={handleSeedData}
              disabled={isSeeding}
            >
              {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              {isSeeding ? "Seeding..." : "Seed Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
