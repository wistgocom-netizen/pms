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
import { useStore } from '@/context/StoreContext';
import { Textarea } from '@/components/ui/textarea';
import type { InvoiceSettings } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConfigureInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: InvoiceSettings) => void;
}

export function ConfigureInvoiceDialog({ open, onOpenChange, onSave }: ConfigureInvoiceDialogProps) {
  const { organization, t } = useStore();
  const [settings, setSettings] = useState<InvoiceSettings>({
    showLogo: false,
    termsAndConditions: [],
    accentColor: '#3F51B5',
  });

  const [newTerm, setNewTerm] = useState('');

  useEffect(() => {
    if (open && organization?.invoiceSettings) {
      setSettings(organization.invoiceSettings);
    }
  }, [open, organization]);

  const handleChange = (key: keyof InvoiceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addTerm = () => {
    if (newTerm.trim()) {
      setSettings(prev => ({
        ...prev,
        termsAndConditions: [...(prev.termsAndConditions || []), newTerm.trim()]
      }));
      setNewTerm('');
    }
  };

  const removeTerm = (index: number) => {
    setSettings(prev => ({
      ...prev,
      termsAndConditions: (prev.termsAndConditions || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('Configure A4 Invoice')}</DialogTitle>
          <DialogDescription>
            {t('Set up terms and styling for wholesale invoices.')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-1">{t('Terms and Conditions')}</h4>
              <div className="flex gap-2">
                <Input
                  placeholder={t('Add a term or note...')}
                  value={newTerm}
                  onChange={e => setNewTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTerm()}
                />
                <Button type="button" size="icon" variant="outline" onClick={addTerm}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {(settings.termsAndConditions || []).map((term, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm group">
                    <p className="flex-1">{term}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTerm(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm border-b pb-1">{t('Styling')}</h4>
              <div className="space-y-2">
                <Label htmlFor="accent-color">{t('Accent Color')}</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="accent-color"
                    type="color"
                    className="w-12 h-10 p-1"
                    value={settings.accentColor || '#3F51B5'}
                    onChange={e => handleChange('accentColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    className="flex-1"
                    value={settings.accentColor || '#3F51B5'}
                    onChange={e => handleChange('accentColor', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
          <Button onClick={() => { onSave(settings); onOpenChange(false); }}>{t('Save Configuration')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
