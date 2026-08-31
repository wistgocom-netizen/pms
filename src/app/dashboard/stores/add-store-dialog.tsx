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
import type { UserProfile } from '@/lib/types';

const createStoreSchema = (isSuperAdmin: boolean) => {
  const baseSchema = {
    storeName: z.string().min(1, 'Store name is required'),
  };

  if (isSuperAdmin) {
    return z.object({
      ...baseSchema,
      adminFirstName: z.string().min(1, 'First name is required'),
      adminLastName: z.string().min(1, 'Last name is required'),
      adminEmail: z.string().email('Invalid email address'),
      adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
      subscriptionPlan: z.string().min(1, "Subscription plan is required"),
    });
  }

  return z.object(baseSchema);
};


interface AddStoreDialogProps {
  onSave: (data: any) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile | null;
}

export function AddStoreDialog({ open, onOpenChange, onSave, userProfile }: AddStoreDialogProps) {
  const { t, pricingPlans } = useStore();
  const isSuperAdmin = userProfile?.role === 'super-admin';
  const storeSchema = createStoreSchema(isSuperAdmin);

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: isSuperAdmin ? {
      storeName: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      subscriptionPlan: 'pro',
    } : {
        storeName: '',
    }
  });
  
  useEffect(() => {
    if (open) {
      form.reset(isSuperAdmin ? {
        storeName: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: '',
        subscriptionPlan: 'pro',
      } : {
        storeName: '',
      });
    }
  }, [open, form, isSuperAdmin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('Create New Store')}</DialogTitle>
          <DialogDescription>
            {isSuperAdmin ? t("This will create a new store and an admin account for it.") : t("Enter the name for your new store.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField control={form.control} name="storeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Store Name')}</FormLabel>
                  <FormControl><Input {...field} placeholder={t("e.g. Acme Supermarket")} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSuperAdmin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="adminFirstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Admin's First Name")}</FormLabel>
                        <FormControl><Input {...field} placeholder="John" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="adminLastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Admin's Last Name")}</FormLabel>
                        <FormControl><Input {...field} placeholder="Doe" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control} name="adminEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Admin's Email")}</FormLabel>
                      <FormControl><Input type="email" {...field} placeholder="admin@example.com" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="adminPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Admin's Password")}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Create Store')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
