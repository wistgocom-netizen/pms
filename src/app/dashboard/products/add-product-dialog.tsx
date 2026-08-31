'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import type { Product, Category, Supplier } from '@/lib/types';
import { Barcode, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/context/StoreContext';
import { BarcodeScannerDialog } from '../components/barcode-scanner-dialog';

const productSchema = z.object({
  id: z.string().min(1, 'HSN / Item Code is required'),
  name: z.string().min(1, 'Product name is required'),
  genericName: z.string().optional(),
  manufacturer: z.string().optional(),
  packSize: z.string().optional(),
  batchNumber: z.string().optional(),
  manufacturingDate: z.date().optional(),
  rackLocation: z.string().optional(),
  emoji: z.string().min(1, 'Emoji is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stock: z.coerce.number().min(0, 'Stock must be a non-negative number'),
  supplier: z.string().optional(),
  buyingPrice: z.coerce.number().min(0).optional(),
  expireDate: z.date().optional(),
  hasWarranty: z.boolean().default(false),
  warrantyPeriod: z.string().optional(),
});


interface ProductFormDialogProps {
  onSave: (product: Product) => Promise<void>;
  categories: Category[];
  suppliers: Supplier[];
  productToEdit: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ onSave, categories, suppliers, productToEdit, open, onOpenChange }: ProductFormDialogProps) {
  const { toast } = useToast();
  const { t } = useStore();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: '',
      name: '',
      genericName: '',
      manufacturer: '',
      packSize: '',
      batchNumber: '',
      rackLocation: '',
      emoji: '',
      category: '',
      price: 0,
      stock: 0,
      supplier: '',
      buyingPrice: 0,
      expireDate: undefined,
      manufacturingDate: undefined,
      hasWarranty: false,
      warrantyPeriod: '',
    }
  });
  
  const hasWarranty = form.watch('hasWarranty');

  const [expireDateParts, setExpireDateParts] = useState<{year?: string, month?: string, day?: string}>({
    year: undefined,
    month: undefined,
    day: undefined
  });
  const [mfgDateParts, setMfgDateParts] = useState<{year?: string, month?: string, day?: string}>({
    year: undefined,
    month: undefined,
    day: undefined
  });

  const [isSupplierListVisible, setIsSupplierListVisible] = useState(false);

  const watchedSupplier = form.watch('supplier');
  const filteredSuppliers = useMemo(() => {
    const searchTerm = watchedSupplier || '';
    if (!searchTerm) {
        return suppliers;
    }
    return suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [watchedSupplier, suppliers]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear + i));
  const mfgYears = Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const daysInExpireMonth = useMemo(() => {
      if (expireDateParts.year && expireDateParts.month) {
          return new Date(parseInt(expireDateParts.year), parseInt(expireDateParts.month), 0).getDate();
      }
      return 31;
  }, [expireDateParts.year, expireDateParts.month]);
  
  const daysInMfgMonth = useMemo(() => {
      if (mfgDateParts.year && mfgDateParts.month) {
          return new Date(parseInt(mfgDateParts.year), parseInt(mfgDateParts.month), 0).getDate();
      }
      return 31;
  }, [mfgDateParts.year, mfgDateParts.month]);

  const expireDays = Array.from({ length: daysInExpireMonth }, (_, i) => String(i + 1));
  const mfgDays = Array.from({ length: daysInMfgMonth }, (_, i) => String(i + 1));

  useEffect(() => {
    if (open) {
      if (productToEdit) {
        const expireDate = productToEdit.expireDate ? parseISO(productToEdit.expireDate) : undefined;
        const manufacturingDate = productToEdit.manufacturingDate ? parseISO(productToEdit.manufacturingDate) : undefined;
        form.reset({
            ...productToEdit,
            expireDate,
            manufacturingDate,
        });
        if (expireDate) {
          setExpireDateParts({
            year: String(expireDate.getFullYear()),
            month: String(expireDate.getMonth() + 1),
            day: String(expireDate.getDate())
          });
        } else {
          setExpireDateParts({ year: undefined, month: undefined, day: undefined });
        }
        if (manufacturingDate) {
          setMfgDateParts({
            year: String(manufacturingDate.getFullYear()),
            month: String(manufacturingDate.getMonth() + 1),
            day: String(manufacturingDate.getDate())
          });
        } else {
          setMfgDateParts({ year: undefined, month: undefined, day: undefined });
        }
      } else {
        form.reset({
          id: '', name: '', emoji: '', category: '', price: 0, stock: 0, supplier: '',
          buyingPrice: 0, expireDate: undefined, hasWarranty: false, warrantyPeriod: '',
          genericName: '', manufacturer: '', packSize: '', batchNumber: '', manufacturingDate: undefined, rackLocation: ''
        });
        setExpireDateParts({ year: undefined, month: undefined, day: undefined });
        setMfgDateParts({ year: undefined, month: undefined, day: undefined });
      }
    }
  }, [productToEdit, open, form]);

  useEffect(() => {
    const { year, month, day } = expireDateParts;
    if (year && month && day) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (newDate.getFullYear() === parseInt(year) && newDate.getMonth() === parseInt(month) - 1 && newDate.getDate() === parseInt(day)) {
        form.setValue('expireDate', newDate, { shouldValidate: true });
      }
    } else {
      form.setValue('expireDate', undefined, { shouldValidate: true });
    }
  }, [expireDateParts, form]);
  
  useEffect(() => {
    const { year, month, day } = mfgDateParts;
    if (year && month && day) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (newDate.getFullYear() === parseInt(year) && newDate.getMonth() === parseInt(month) - 1 && newDate.getDate() === parseInt(day)) {
        form.setValue('manufacturingDate', newDate, { shouldValidate: true });
      }
    } else {
      form.setValue('manufacturingDate', undefined, { shouldValidate: true });
    }
  }, [mfgDateParts, form]);

  const handleExpireDatePartChange = (part: 'year' | 'month' | 'day') => (value: string) => {
    setExpireDateParts(prev => {
        const newState = {...prev, [part]: value};
        if (part === 'month' || part === 'year') {
            const newDaysInMonth = new Date(parseInt(newState.year || `${currentYear}`), parseInt(newState.month || '1'), 0).getDate();
            if (newState.day && parseInt(newState.day) > newDaysInMonth) {
                newState.day = undefined;
            }
        }
        return newState;
    });
  };

  const handleMfgDatePartChange = (part: 'year' | 'month' | 'day') => (value: string) => {
    setMfgDateParts(prev => {
        const newState = {...prev, [part]: value};
        if (part === 'month' || part === 'year') {
            const newDaysInMonth = new Date(parseInt(newState.year || `${currentYear}`), parseInt(newState.month || '1'), 0).getDate();
            if (newState.day && parseInt(newState.day) > newDaysInMonth) {
                newState.day = undefined;
            }
        }
        return newState;
    });
  };


  async function onSubmit(values: z.infer<typeof productSchema>) {
    const productData: Product = {
      ...values,
      supplier: values.supplier || '',
      buyingPrice: values.buyingPrice || 0,
      expireDate: values.expireDate ? format(values.expireDate, 'yyyy-MM-dd') : '',
      manufacturingDate: values.manufacturingDate ? format(values.manufacturingDate, 'yyyy-MM-dd') : '',
      warrantyPeriod: (values.hasWarranty && values.warrantyPeriod) ? values.warrantyPeriod : '',
    };
    await onSave(productData);
    toast({
      title: productToEdit ? t('Product Updated') : t('Product Added'),
      description: t('Product {name} has been successfully {action}.', { name: productData.name, action: productToEdit ? t('updated') : t('added') }),
    });
    onOpenChange(false);
  }
  
  const handleRawScan = useCallback((code: string) => {
    // Explicitly set the form value and mark it as dirty/touched
    form.setValue('id', code, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  }, [form]);

  const isEditMode = !!productToEdit;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? t('Edit Product') : t('Add New Product')}</DialogTitle>
            <DialogDescription>
              {isEditMode ? t('Update the details of the existing product.') : t('Enter product details below.')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <ScrollArea className="h-[60vh] pr-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('HSN / Item Code')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder={t('Scan or type product HSN/ID')} {...field} disabled={isEditMode} className="pr-10" />
                        </FormControl>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary/80"
                          onClick={() => setIsScannerOpen(true)}
                          disabled={isEditMode}
                          title={t('Scan Barcode')}
                        >
                          <Scan className="h-5 w-5" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('Product Name')}</FormLabel>
                          <FormControl>
                          <Input placeholder={t('e.g. Espresso Coffee')} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="genericName"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('Generic Name')}</FormLabel>
                          <FormControl>
                          <Input placeholder={t('e.g. Paracetamol')} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                   <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('Manufacturer / Company')}</FormLabel>
                          <FormControl>
                          <Input placeholder={t('e.g. Pharma Inc.')} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="emoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Emoji')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('e.g. ☕️')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('Category')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select a category')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="packSize"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('Pack Size')}</FormLabel>
                          <FormControl>
                          <Input placeholder={t('e.g. 10 per strip')} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="batchNumber"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>{t('Batch Number')}</FormLabel>
                          <FormControl>
                          <Input placeholder={t('e.g. B-12345')} {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('Selling Price')}</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="buyingPrice"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>{t('Buying Price')}</FormLabel>
                          <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('Stock')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="rackLocation"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>{t('Rack/Shelf Location')}</FormLabel>
                          <FormControl>
                              <Input placeholder={t('e.g. A1-01')} {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>{t('Supplier')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('Find or type supplier')}
                          {...field}
                          value={field.value ?? ''}
                          onFocus={() => setIsSupplierListVisible(true)}
                          onBlur={() => setTimeout(() => setIsSupplierListVisible(false), 150)}
                          autoComplete="off"
                        />
                      </FormControl>
                       {isSupplierListVisible && (
                          <Card className="absolute top-full mt-1 w-full z-50 max-h-48 shadow-lg bg-popover">
                              <CardContent className="p-0">
                                  <ScrollArea className="h-auto max-h-48">
                                      {filteredSuppliers.length > 0 ? (
                                          filteredSuppliers.map(supplier => (
                                              <div
                                                  key={supplier.id}
                                                  className="p-2 text-sm cursor-pointer hover:bg-accent"
                                                  onMouseDown={() => {
                                                      form.setValue('supplier', supplier.name, { shouldValidate: true });
                                                      setIsSupplierListVisible(false);
                                                  }}
                                              >
                                                  {supplier.name}
                                              </div>
                                          ))
                                      ) : (
                                          <div className="p-2 text-sm text-muted-foreground">{t('No suppliers found.')}</div>
                                      )}
                                  </ScrollArea>
                              </CardContent>
                          </Card>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="manufacturingDate"
                  render={() => (
                      <FormItem>
                          <FormLabel>{t('Manufacturing Date')}</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                              <Select onValueChange={handleMfgDatePartChange('month')} value={mfgDateParts.month}>
                                  <FormControl><SelectTrigger><SelectValue placeholder={t('Month')} /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {months.map(m => <SelectItem key={`mfg-month-${m.value}`} value={m.value}>{m.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select onValueChange={handleMfgDatePartChange('day')} value={mfgDateParts.day} disabled={!mfgDateParts.month || !mfgDateParts.year}>
                                  <FormControl><SelectTrigger><SelectValue placeholder={t('Day')} /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {mfgDays.map(d => <SelectItem key={`mfg-day-${d}`} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                              <Select onValueChange={handleMfgDatePartChange('year')} value={mfgDateParts.year}>
                                  <FormControl><SelectTrigger><SelectValue placeholder={t('Year')} /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {mfgYears.map(y => <SelectItem key={`mfg-year-${y}`} value={y}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
                <FormField
                  control={form.control}
                  name="expireDate"
                  render={() => (
                    <FormItem>
                        <FormLabel>{t('Expire Date')}</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                            <Select onValueChange={handleExpireDatePartChange('month')} value={expireDateParts.month}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Month')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={`exp-month-${m.value}`} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={handleExpireDatePartChange('day')} value={expireDateParts.day} disabled={!expireDateParts.month || !expireDateParts.year}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Day')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {expireDays.map(d => <SelectItem key={`exp-day-${d}`} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={handleExpireDatePartChange('year')} value={expireDateParts.year}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Year')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={`exp-year-${y}`} value={y}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="hasWarranty"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>{t('Has Warranty?')}</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {hasWarranty && (
                        <FormField
                            control={form.control}
                            name="warrantyPeriod"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('Warranty Period')}</FormLabel>
                                <FormControl>
                                <Input placeholder={t('e.g. 1 year, 6 months')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                </div>
              </div>
              </ScrollArea>
              <DialogFooter className="pt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
                <Button type="submit">{t('Save Changes')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BarcodeScannerDialog 
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onRawScan={handleRawScan}
      />
    </>
  );
}
