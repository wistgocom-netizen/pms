

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
import type { Customer } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import { PlusCircle, Trash2 } from 'lucide-react';

const customerSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.array(z.object({ value: z.string() })).optional(),
});

interface CustomerFormDialogProps {
  onSave: (customer: Omit<Customer, 'totalLoanAmount' | 'totalPaidAmount' | 'id'> & { id?: string }) => void;
  customerToEdit: Omit<Customer, 'totalLoanAmount' | 'totalPaidAmount'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerFormDialog({ customerToEdit, open, onOpenChange, onSave }: CustomerFormDialogProps) {
  const { t } = useStore();

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      phone: [{ value: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phone"
  });

  useEffect(() => {
    if (open) {
      if (customerToEdit) {
        const phoneNumbers = customerToEdit.phone
            ? (Array.isArray(customerToEdit.phone) ? customerToEdit.phone : [customerToEdit.phone])
            : [];
        form.reset({
          ...customerToEdit,
          phone: phoneNumbers.length > 0 ? phoneNumbers.map(p => ({ value: p })) : [{ value: '' }],
        });
      } else {
        form.reset({
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          address: '',
          phone: [{ value: '' }],
        });
      }
    }
  }, [customerToEdit, open, form]);

  function onSubmit(values: z.infer<typeof customerSchema>) {
    const customerData = {
        ...values,
        id: customerToEdit?.id,
        phone: values.phone?.map(p => p.value).filter(Boolean),
    };
    onSave(customerData);
  }

  const isEditMode = !!customerToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit Customer') : t('Add New Customer')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('Update the details of the existing customer.') : t('Enter customer details below.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('First Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Last Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Address')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
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
                                    disabled={fields.length === 1 && !form.getValues('phone.0.value')}
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
