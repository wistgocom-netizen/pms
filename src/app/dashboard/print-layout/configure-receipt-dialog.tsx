'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/context/StoreContext';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { ReceiptSettings } from '@/lib/types';

interface ConfigureReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: ReceiptSettings) => void;
}

export function ConfigureReceiptDialog({ open, onOpenChange, onSave }: ConfigureReceiptDialogProps) {
  const { organization, t } = useStore();
  const [settings, setSettings] = useState<ReceiptSettings>({
    showStoreAddress: true,
    showStorePhone: true,
    fontSize: 12,
    margin: 4,
    showLogo: false,
    paperWidth: '80mm',
    headerText: '',
    footerText: 'Thank you for shopping with us!',
  });

  useEffect(() => {
    if (open && organization?.receiptSettings) {
      setSettings({
        ...organization.receiptSettings,
        paperWidth: '80mm' // Enforce 80mm even if older records had 58mm
      });
    }
  }, [open, organization]);

  const handleToggle = (key: keyof ReceiptSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof ReceiptSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('Configure Thermal Receipt')}</DialogTitle>
          <DialogDescription>
            {t('Adjust the layout and content of your thermal receipts. Standardized to 80mm.')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <h4 className="font-medium text-sm border-b pb-1">{t('Content')}</h4>
            <div className="space-y-2">
              <Label htmlFor="header-text">{t('Custom Header Text')}</Label>
              <Input
                id="header-text"
                placeholder="e.g. Welcome to Our Store"
                value={settings.headerText || ''}
                onChange={e => handleChange('headerText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-text">{t('Footer Message')}</Label>
              <Textarea
                id="footer-text"
                placeholder="e.g. Thank you! Visit again."
                value={settings.footerText || ''}
                onChange={e => handleChange('footerText', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-address">{t('Show Store Address')}</Label>
              <Switch
                id="show-address"
                checked={settings.showStoreAddress}
                onCheckedChange={() => handleToggle('showStoreAddress')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-phone">{t('Show Store Phone')}</Label>
              <Switch
                id="show-phone"
                checked={settings.showStorePhone}
                onCheckedChange={() => handleToggle('showStorePhone')}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="font-medium text-sm border-b pb-1">{t('Layout & Style')}</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>{t('Font Size')} ({settings.fontSize}px)</Label>
              </div>
              <Slider
                min={8}
                max={20}
                step={1}
                value={[settings.fontSize]}
                onValueChange={v => handleChange('fontSize', v[0])}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>{t('Page Margin')} ({settings.margin}mm)</Label>
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[settings.margin]}
                onValueChange={v => handleChange('margin', v[0])}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
          <Button onClick={() => { onSave(settings); onOpenChange(false); }}>{t('Save Configuration')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
