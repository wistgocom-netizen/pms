'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PricingPlan } from '@/lib/types';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  features: z.string().min(1, 'Please add at least one feature.'),
  priceMonthly: z.coerce.number().min(0, 'Monthly price must be a positive number'),
  durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day').optional(),
  yearlyDiscount: z.coerce.number().min(0, 'Discount must be between 0 and 100').max(100),
  priceYearly: z.coerce.number().min(0, 'Yearly price must be a positive number'),
  rooms: z.coerce.number().min(0, 'Room count must be a non-negative number'),
  products: z.coerce.number().min(0, 'Product count must be a non-negative number'),
  isPopular: z.boolean(),
});

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planToEdit: PricingPlan | null;
}

export function PlanFormDialog({ open, onOpenChange, planToEdit }: PlanFormDialogProps) {
  const { t, addPricingPlan, updatePricingPlan } = useStore();
  const { toast } = useToast();
  const isEditMode = !!planToEdit;

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      features: '',
      priceMonthly: 0,
      durationDays: 30,
      yearlyDiscount: 10,
      priceYearly: 0,
      rooms: 5,
      products: 5,
      isPopular: false,
    },
  });

  const priceMonthly = form.watch('priceMonthly');
  const yearlyDiscount = form.watch('yearlyDiscount');

  useEffect(() => {
    if (priceMonthly > 0 && yearlyDiscount >= 0) {
      const yearlyTotal = priceMonthly * 12;
      const discountedYearly = yearlyTotal * (1 - yearlyDiscount / 100);
      form.setValue('priceYearly', parseFloat(discountedYearly.toFixed(2)));
    } else {
        form.setValue('priceYearly', 0);
    }
  }, [priceMonthly, yearlyDiscount, form]);

  useEffect(() => {
    if (open) {
      if (planToEdit) {
        form.reset({
          name: planToEdit.name,
          description: planToEdit.description,
          features: planToEdit.features.join('\n'),
          priceMonthly: planToEdit.priceMonthly,
          priceYearly: planToEdit.priceYearly,
          durationDays: planToEdit.durationDays || 30,
          yearlyDiscount: planToEdit.yearlyDiscount,
          rooms: planToEdit.rooms,
          products: planToEdit.products || planToEdit.rooms,
          isPopular: planToEdit.isPopular,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          features: '',
          priceMonthly: 0,
          durationDays: 30,
          yearlyDiscount: 10,
          priceYearly: 0,
          rooms: 5,
          products: 5,
          isPopular: false,
        });
      }
    }
  }, [planToEdit, open, form]);

  async function onSubmit(values: z.infer<typeof planSchema>) {
    const planData = {
      ...values,
      features: values.features.split('\n').filter(f => f.trim() !== ''),
    };

    try {
      if (isEditMode && planToEdit) {
        await updatePricingPlan(planToEdit.id, planData);
        toast({ title: t('Plan Updated'), description: t('The subscription plan has been updated.') });
      } else {
        await addPricingPlan(planData);
        toast({ title: t('Plan Created'), description: t('The new subscription plan has been created.') });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast({
        variant: 'destructive',
        title: t('Save Failed'),
        description: t('There was a problem saving the plan.'),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit Plan') : t('Create New Plan')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('Modify the details of this subscription plan.') : t('Define a new subscription plan for your users.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Plan Name')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Description')}</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="features" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Features (one per line)')}</FormLabel>
                    <FormControl><Textarea {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="priceMonthly" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Monthly Price')}</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="durationDays" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Duration (Days)')}</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="yearlyDiscount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Yearly Discount (%)')}</FormLabel>
                        <FormControl><Input id="plan-discount-yearly" type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="priceYearly" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Yearly Price')}</FormLabel>
                        <FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="rooms" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Room Limit')}</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="products" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Product Limit')}</FormLabel>
                        <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="isPopular" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('Mark as Popular')}</FormLabel>
                      <FormDescription>{t('Highlight this plan on the pricing page.')}</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{isEditMode ? t('Save Changes') : t('Create Plan')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}