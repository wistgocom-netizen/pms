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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useStore } from "@/context/StoreContext";
import type { PricingPlan } from "@/lib/types";
import { useState, useEffect } from "react";

interface PaymentCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PricingPlan | null;
  initialCycle: 'monthly' | 'yearly';
  onConfirm: (plan: PricingPlan, cycle: 'monthly' | 'yearly') => void;
}

export function PaymentCycleDialog({ open, onOpenChange, plan, initialCycle, onConfirm }: PaymentCycleDialogProps) {
    const { t, formatCurrency } = useStore();
    const [cycle, setCycle] = useState(initialCycle);

    useEffect(() => {
        if(open) {
            setCycle(initialCycle);
        }
    }, [open, initialCycle])

    if (!plan) return null;
    
    const monthlyPrice = formatCurrency(plan.priceMonthly);
    const yearlyPrice = formatCurrency(plan.priceMonthly * 12 * (1 - plan.yearlyDiscount / 100));

    const handleConfirm = () => {
        onConfirm(plan, cycle);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Select Billing Cycle for {planName}', { planName: plan.name })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('Choose how you want to be billed for this plan.')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <RadioGroup value={cycle} onValueChange={(value) => setCycle(value as 'monthly' | 'yearly')}>
                        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className="cursor-pointer flex-grow">{t('Monthly')} - <span className="font-bold">{monthlyPrice}</span></Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                            <RadioGroupItem value="yearly" id="yearly" />
                            <Label htmlFor="yearly" className="cursor-pointer flex-grow">{t('Yearly')} - <span className="font-bold">{yearlyPrice}</span> ({t('save {discount}%', {discount: plan.yearlyDiscount})})</Label>
                        </div>
                    </RadioGroup>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        {t('Proceed to Payment')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
