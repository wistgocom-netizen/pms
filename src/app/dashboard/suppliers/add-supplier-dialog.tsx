
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
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray } from 'react-hook-form';
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
import type { Supplier } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.array(z.object({ value: z.string() })).optional(),
  address: z.string().optional(),
});

interface SupplierFormDialogProps {
  onSave: (supplier: Omit<Supplier, 'id'> & { id?: string }) => void;
  supplierToEdit: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierFormDialog({ supplierToEdit, open, onOpenChange, onSave }: SupplierFormDialogProps) {
  const { t } = useStore();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: [{ value: '' }],
      address: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phone"
  });

  useEffect(() => {
    if (open) {
      if (supplierToEdit) {
        form.reset({
            ...supplierToEdit,
            phone: supplierToEdit.phone?.length ? supplierToEdit.phone.map(p => ({ value: p })) : [{ value: '' }],
        });
      } else {
        form.reset({
          id: '',
          name: '',
          contactPerson: '',
          email: '',
          phone: [{ value: '' }],
          address: '',
        });
      }
    }
  }, [supplierToEdit, open, form]);

  function onSubmit(values: z.infer<typeof supplierSchema>) {
    const supplierData = {
        ...values,
        id: supplierToEdit?.id,
        phone: values.phone?.map(p => p.value).filter(Boolean),
    };
    onSave(supplierData);
  }

  const isEditMode = !!supplierToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit Supplier') : t('Add New Supplier')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('Update the details of the existing supplier.') : t('Enter supplier details below.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Supplier Name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="ACME Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Contact Person')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
                <FormLabel>{t('Phone Numbers')}</FormLabel>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <FormField
                        key={field.id}
                        control={form.control}
                        name={`phone.${index}.value`}
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                <Input {...field} placeholder="(555) 123-4567" />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ value: "" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('Add Phone Number')}
                </Button>
            </FormItem>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Address')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Industrial Way, Anytown, USA" {...field} />
                  </FormControl>
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
