
'use client';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { Organization } from "@/lib/types";
import React, { useState, useEffect } from "react";

interface PaySubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: Organization | null;
    onConfirm: (organizationId: string, billingCycle?: 'monthly' | 'yearly') => void;
}

export function PaySubscriptionDialog({ open, onOpenChange, organization, onConfirm }: PaySubscriptionDialogProps) {
    const { t } = useStore();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        if (organization) {
            setBillingCycle(organization.billingCycle || 'monthly');
        }
    }, [organization]);

    if (!organization) return null;

    const handlePayment = () => {
        onConfirm(organization.id, billingCycle);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Confirm Payment')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Select billing cycle to extend the subscription for "{orgName}".', { orgName: organization.name })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
                        <SelectTrigger>
                            <SelectValue placeholder={t("Select billing cycle")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">{t('Monthly')}</SelectItem>
                            <SelectItem value="yearly">{t('Yearly')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment}>
                        {t('Confirm & Pay')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
