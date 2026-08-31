
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/context/StoreContext';
import type { Loan, Customer } from '@/lib/types';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const paymentSchema = z.object({
  paymentAmount: z.coerce.number().positive('Payment must be a positive number.'),
});

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  customer: Customer;
  onSavePayment: (loanId: string, paymentAmount: number) => void;
}

export function AddPaymentDialog({ open, onOpenChange, loan, customer, onSavePayment }: AddPaymentDialogProps) {
  const { formatCurrency, t } = useStore();

  const outstandingBalance = useMemo(() => loan.originalAmount - loan.paidAmount, [loan]);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentAmount: outstandingBalance > 0 ? outstandingBalance : 0,
    },
  });
  
  useEffect(() => {
    form.trigger();
  }, [form]);

  useEffect(() => {
    if (open) {
      const balance = loan.originalAmount - loan.paidAmount;
      form.reset({ paymentAmount: balance > 0 ? parseFloat(balance.toFixed(2)) : 0 });
    }
  }, [open, loan, form]);

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    if (values.paymentAmount > outstandingBalance + 0.001) { // Add tolerance for float issues
      form.setError('paymentAmount', {
        type: 'manual',
        message: t('Payment cannot exceed outstanding balance.'),
      });
      return;
    }
    onSavePayment(loan.id, values.paymentAmount);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t('Add Payment')}</DialogTitle>
              <DialogDescription>
                {t('Record a payment for Invoice ID {saleId}.', { saleId: loan.saleId.slice(0, 7).toUpperCase() })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Label>{t('Outstanding Balance')}</Label>
                <p className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</p>
              </div>
              <FormField
                control={form.control}
                name="paymentAmount"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="paymentAmount">{t('Payment Amount')}</Label>
                    <FormControl>
                      <Input id="paymentAmount" type="number" step="0.01" {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Save Payment')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
