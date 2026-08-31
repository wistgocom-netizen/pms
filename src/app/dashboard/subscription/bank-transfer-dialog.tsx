'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, AlertTriangle } from 'lucide-react';
import type { BankDetails } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BankTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  planName: string;
  amount: number;
}

export function BankTransferDialog({ open, onOpenChange, onConfirm, planName, amount }: BankTransferDialogProps) {
    const { t, formatCurrency, userProfile, bankDetails, updateBankDetails } = useStore();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [localBankDetails, setLocalBankDetails] = useState<BankDetails>({});

    useEffect(() => {
        if (bankDetails) {
            setLocalBankDetails(bankDetails);
        } else {
            // Provide default values if none are fetched
            setLocalBankDetails({
                bankName: 'Commercial Bank',
                accountName: 'Adyfire',
                accountNumber: '1000 1234 5678',
                branch: 'Colombo',
                importantMessage: 'Your subscription will be activated after payment confirmation. Please use your email as the reference.'
            });
        }
    }, [bankDetails]);

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    const handleSaveChanges = async () => {
        await updateBankDetails(localBankDetails);
        toast({ title: t('Bank Details Updated') });
        setIsEditing(false);
    };
    
    const handleDetailChange = (field: keyof BankDetails, value: string) => {
        setLocalBankDetails(prev => ({ ...prev, [field]: value }));
    };

    const isSuperAdmin = userProfile?.role === 'super-admin';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-between items-start">
            <AlertDialogTitle>{t('Complete Payment via Bank Transfer')}</AlertDialogTitle>
            {isSuperAdmin && (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <AlertDialogDescription>
            {t('Please transfer {amount} for the {planName} plan to the bank account below. Once completed, click "Confirm Payment".', { amount: formatCurrency(amount), planName: t(planName) })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4 text-sm">
            {isEditing && isSuperAdmin ? (
                <div className="p-4 bg-muted rounded-md space-y-2">
                    <div className="space-y-1">
                        <Label htmlFor="bankName">{t('Bank Name')}</Label>
                        <Input id="bankName" value={localBankDetails.bankName || ''} onChange={(e) => handleDetailChange('bankName', e.target.value)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="accountName">{t('Account Name')}</Label>
                        <Input id="accountName" value={localBankDetails.accountName || ''} onChange={(e) => handleDetailChange('accountName', e.target.value)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="accountNumber">{t('Account Number')}</Label>
                        <Input id="accountNumber" value={localBankDetails.accountNumber || ''} onChange={(e) => handleDetailChange('accountNumber', e.target.value)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="branch">{t('Branch')}</Label>
                        <Input id="branch" value={localBankDetails.branch || ''} onChange={(e) => handleDetailChange('branch', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="importantMessage">{t('Important Message')}</Label>
                        <Textarea id="importantMessage" value={localBankDetails.importantMessage || ''} onChange={(e) => handleDetailChange('importantMessage', e.target.value)} />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-muted rounded-md">
                    <p><span className="font-semibold">{t('Bank Name')}:</span> {localBankDetails.bankName || t('N/A')}</p>
                    <p><span className="font-semibold">{t('Account Name')}:</span> {localBankDetails.accountName || t('N/A')}</p>
                    <p><span className="font-semibold">{t('Account Number')}:</span> {localBankDetails.accountNumber || t('N/A')}</p>
                    <p><span className="font-semibold">{t('Branch')}:</span> {localBankDetails.branch || t('N/A')}</p>
                </div>
            )}
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('Important')}</AlertTitle>
                <AlertDescription>
                    {localBankDetails.importantMessage || t('Your subscription will be activated after payment confirmation. Please use your email as the reference.')}
                </AlertDescription>
            </Alert>
        </div>
        <AlertDialogFooter>
          {isEditing && isSuperAdmin ? (
              <>
                  <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      // Reset to original if cancelled
                      if(bankDetails) setLocalBankDetails(bankDetails);
                  }}>{t('Cancel')}</Button>
                  <Button onClick={handleSaveChanges}>{t('Save Changes')}</Button>
              </>
          ) : (
              <>
                  <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirm}>
                    {t('Confirm Payment')}
                  </AlertDialogAction>
              </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
