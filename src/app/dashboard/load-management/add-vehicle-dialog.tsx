
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
import type { Vehicle } from '@/lib/types';
import { useStore } from '@/context/StoreContext';

const vehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  type: z.enum(['van', 'truck']),
  licensePlate: z.string().min(1, 'License plate is required'),
});

interface AddVehicleDialogProps {
  onSave: (vehicle: Omit<Vehicle, 'id'>) => void;
  onUpdate: (vehicleId: string, vehicle: Partial<Omit<Vehicle, 'id'>>) => void;
  vehicleToEdit: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVehicleDialog({ open, onOpenChange, onSave, onUpdate, vehicleToEdit }: AddVehicleDialogProps) {
  const { t } = useStore();
  const isEditMode = !!vehicleToEdit;

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: '',
      type: 'van',
      licensePlate: '',
    }
  });

  useEffect(() => {
    if (open) {
      if (vehicleToEdit) {
        form.reset(vehicleToEdit);
      } else {
        form.reset({
          name: '',
          type: 'van',
          licensePlate: '',
        });
      }
    }
  }, [vehicleToEdit, open, form]);

  function onSubmit(values: z.infer<typeof vehicleSchema>) {
    if (isEditMode && vehicleToEdit) {
        onUpdate(vehicleToEdit.id, values);
    } else {
        onSave(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit Vehicle') : t('Add New Vehicle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('Update the details for this vehicle.') : t('Enter the details for the new vehicle.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Vehicle Name / Number')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Primary Van" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('License Plate')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ABC-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Vehicle Type')}</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a type")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="van">{t('Van')}</SelectItem>
                            <SelectItem value="truck">{t('Truck')}</SelectItem>
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Save Changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
