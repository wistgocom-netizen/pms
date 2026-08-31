
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
import type { Load } from '@/lib/types';

const loadSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  userId: z.string().min(1, 'User is required'),
});

interface AddLoadDialogProps {
  onSave: (data: Omit<Load, 'id' | 'createdAt' | 'status' | 'items' | 'totalValue'>) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLoadDialog({ open, onOpenChange, onSave }: AddLoadDialogProps) {
  const { t, vehicles, users } = useStore();

  const form = useForm<z.infer<typeof loadSchema>>({
    resolver: zodResolver(loadSchema),
    defaultValues: {
      vehicleId: '',
      userId: '',
    }
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        vehicleId: '',
        userId: '',
      });
    }
  }, [open, form]);

  async function onSubmit(values: z.infer<typeof loadSchema>) {
    await onSave(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Create New Load')}</DialogTitle>
          <DialogDescription>
            {t("Assign a vehicle and a user to this load.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="vehicleId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Vehicle')}</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a vehicle")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(vehicles || []).map(vehicle => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.name} ({vehicle.licensePlate})
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="userId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('User / Cashier')}</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a user")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(users || []).map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                  {user.displayName}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Create Load')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
