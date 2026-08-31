'use client';

import { useEffect } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/context/StoreContext';
import type { Organization } from '@/lib/types';

const storeSchema = z.object({
  subscriptionPlan: z.string().min(1, 'Subscription plan is required'),
  billingCycle: z.enum(['monthly', 'yearly', '7days']),
  subscriptionDays: z.coerce.number().int().optional(),
});

interface EditStoreDialogProps {
  onSave: (orgId: string, data: z.infer<typeof storeSchema>) => Promise<void>;
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStoreDialog({ open, onOpenChange, onSave, organization }: EditStoreDialogProps) {
  const { t, pricingPlans, userProfile } = useStore();
  const isSuperAdmin = userProfile?.role === 'super-admin';

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      subscriptionPlan: 'pro',
      billingCycle: 'monthly',
      subscriptionDays: undefined,
    }
  });
  
  useEffect(() => {
    if (open && organization) {
      const daysLeft = organization.subscriptionEndDate
        ? Math.ceil((new Date(organization.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      form.reset({
        subscriptionPlan: organization.subscriptionPlan || 'pro',
        billingCycle: organization.billingCycle || 'monthly',
        subscriptionDays: daysLeft && daysLeft > 0 ? daysLeft : 0,
      });
    }
  }, [open, form, organization]);

  if (!organization) return null;

  function onSubmit(values: z.infer<typeof storeSchema>) {
    if (!organization) return;
    onSave(organization.id, values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Edit Store Subscription')}</DialogTitle>
          <DialogDescription>
            {t("Change the subscription plan for")} {organization.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="subscriptionPlan" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Subscription Plan')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select a plan")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {(pricingPlans || []).map(plan => (
                          <SelectItem key={plan.id} value={plan.name.toLowerCase()}>
                              {t(plan.name)}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="billingCycle" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Billing Cycle')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select a billing cycle")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{t('monthly')}</SelectItem>
                      <SelectItem value="yearly">{t('yearly')}</SelectItem>
                      {isSuperAdmin && <SelectItem value="7days">{t('7 Days')}</SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subscriptionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Subscription Days Left')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                      disabled
                    />
                  </FormControl>
                  <FormDescription>
                    {t("Remaining days based on the current subscription.")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Update Plan')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
