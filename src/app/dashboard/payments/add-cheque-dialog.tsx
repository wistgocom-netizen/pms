
'use client';

import { useEffect, useState, useMemo } from 'react';
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
import type { Cheque, ChequeStatus } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const chequeSchema = z.object({
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  chequeNo: z.string().min(1, 'Cheque number is required'),
  duration: z.coerce.number().optional(),
  chequeIssueDate: z.date({ required_error: 'Cheque issue date is required.'}),
  chequePrintedDate: z.date().optional(),
  chequeClearDate: z.date().optional(),
  bank: z.string().min(1, 'Bank name is required'),
  chequeAmount: z.coerce.number().positive('Amount must be positive'),
});

interface AddChequeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cheque: Omit<Cheque, 'id'>) => Promise<void>;
}

export function AddChequeDialog({ open, onOpenChange, onSave }: AddChequeDialogProps) {
  const { t, banks } = useStore();

  const form = useForm<z.infer<typeof chequeSchema>>({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      invoiceNo: '',
      chequeNo: '',
      bank: '',
      chequeIssueDate: undefined,
      chequeAmount: 0,
      duration: undefined,
      chequeClearDate: undefined,
      chequePrintedDate: undefined,
    },
  });

  const [issueDateParts, setIssueDateParts] = useState<{year?: string, month?: string, day?: string}>({
    year: undefined,
    month: undefined,
    day: undefined
  });
  const [printedDateParts, setPrintedDateParts] = useState<{year?: string, month?: string, day?: string}>({});
  const [clearDateParts, setClearDateParts] = useState<{year?: string, month?: string, day?: string}>({});


  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const daysInIssueMonth = useMemo(() => {
      if (issueDateParts.year && issueDateParts.month) {
          return new Date(parseInt(issueDateParts.year), parseInt(issueDateParts.month), 0).getDate();
      }
      return 31;
  }, [issueDateParts.year, issueDateParts.month]);
  const issueDays = Array.from({ length: daysInIssueMonth }, (_, i) => String(i + 1));

  const daysInPrintedMonth = useMemo(() => {
      if (printedDateParts.year && printedDateParts.month) {
          return new Date(parseInt(printedDateParts.year), parseInt(printedDateParts.month), 0).getDate();
      }
      return 31;
  }, [printedDateParts.year, printedDateParts.month]);
  const printedDays = Array.from({ length: daysInPrintedMonth }, (_, i) => String(i + 1));

  const daysInClearMonth = useMemo(() => {
      if (clearDateParts.year && clearDateParts.month) {
          return new Date(parseInt(clearDateParts.year), parseInt(clearDateParts.month), 0).getDate();
      }
      return 31;
  }, [clearDateParts.year, clearDateParts.month]);
  const clearDays = Array.from({ length: daysInClearMonth }, (_, i) => String(i + 1));


  useEffect(() => {
    if (open) {
      form.reset({
          invoiceNo: '',
          chequeNo: '',
          bank: '',
          chequeIssueDate: undefined,
          chequeAmount: 0,
          duration: undefined,
          chequeClearDate: undefined,
          chequePrintedDate: undefined,
      });
      setIssueDateParts({ year: undefined, month: undefined, day: undefined });
      setPrintedDateParts({});
      setClearDateParts({});
    }
  }, [open, form]);

  useEffect(() => {
    const { year, month, day } = issueDateParts;
    if (year && month && day) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (newDate.getFullYear() === parseInt(year) && newDate.getMonth() === parseInt(month) - 1 && newDate.getDate() === parseInt(day)) {
        form.setValue('chequeIssueDate', newDate, { shouldValidate: true });
      }
    } else {
      form.setValue('chequeIssueDate', undefined, { shouldValidate: true });
    }
  }, [issueDateParts, form]);

  useEffect(() => {
    const { year, month, day } = printedDateParts;
    if (year && month && day) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (newDate.getFullYear() === parseInt(year) && newDate.getMonth() === parseInt(month) - 1 && newDate.getDate() === parseInt(day)) {
        form.setValue('chequePrintedDate', newDate, { shouldValidate: true });
      }
    } else {
      form.setValue('chequePrintedDate', undefined, { shouldValidate: true });
    }
  }, [printedDateParts, form]);

  useEffect(() => {
    const { year, month, day } = clearDateParts;
    if (year && month && day) {
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (newDate.getFullYear() === parseInt(year) && newDate.getMonth() === parseInt(month) - 1 && newDate.getDate() === parseInt(day)) {
        form.setValue('chequeClearDate', newDate, { shouldValidate: true });
      }
    } else {
      form.setValue('chequeClearDate', undefined, { shouldValidate: true });
    }
  }, [clearDateParts, form]);

  const handleIssueDatePartChange = (part: 'year' | 'month' | 'day') => (value: string) => {
    let processedValue = value;
    if (part === 'year' && value.length > 4) {
        processedValue = value.slice(0, 4);
    }
    setIssueDateParts(prev => {
        const newState = {...prev, [part]: processedValue};
        if (part === 'month' || part === 'year') {
            const newDaysInMonth = new Date(parseInt(newState.year || `${currentYear}`), parseInt(newState.month || '1'), 0).getDate();
            if (newState.day && parseInt(newState.day) > newDaysInMonth) {
                newState.day = undefined;
            }
        }
        return newState;
    });
  };

  const handlePrintedDatePartChange = (part: 'year' | 'month' | 'day') => (value: string) => {
    let processedValue = value;
    if (part === 'year' && value.length > 4) {
        processedValue = value.slice(0, 4);
    }
    setPrintedDateParts(prev => {
        const newState = {...prev, [part]: processedValue};
        if (part === 'month' || part === 'year') {
            const newDaysInMonth = new Date(parseInt(newState.year || `${currentYear}`), parseInt(newState.month || '1'), 0).getDate();
            if (newState.day && parseInt(newState.day) > newDaysInMonth) {
                newState.day = undefined;
            }
        }
        return newState;
    });
  };

  const handleClearDatePartChange = (part: 'year' | 'month' | 'day') => (value: string) => {
    let processedValue = value;
    if (part === 'year' && value.length > 4) {
        processedValue = value.slice(0, 4);
    }
    setClearDateParts(prev => {
        const newState = {...prev, [part]: processedValue};
        if (part === 'month' || part === 'year') {
            const newDaysInMonth = new Date(parseInt(newState.year || `${currentYear}`), parseInt(newState.month || '1'), 0).getDate();
            if (newState.day && parseInt(newState.day) > newDaysInMonth) {
                newState.day = undefined;
            }
        }
        return newState;
    });
  };

  async function onSubmit(values: z.infer<typeof chequeSchema>) {
    const chequeData: Omit<Cheque, 'id' | 'status' | 'date'> & { status: ChequeStatus; date: Date } & Partial<Pick<Cheque, 'duration' | 'chequePrintedDate' | 'chequeClearDate'>> = {
      invoiceNo: values.invoiceNo,
      chequeNo: values.chequeNo,
      chequeIssueDate: format(values.chequeIssueDate, 'yyyy-MM-dd'),
      bank: values.bank,
      chequeAmount: values.chequeAmount,
      status: 'Pending',
      date: new Date(),
    };

    if (values.duration) {
      chequeData.duration = values.duration;
    }
    if (values.chequePrintedDate) {
      chequeData.chequePrintedDate = format(values.chequePrintedDate, 'yyyy-MM-dd');
    }
    if (values.chequeClearDate) {
      chequeData.chequeClearDate = format(values.chequeClearDate, 'yyyy-MM-dd');
    }
    
    await onSave(chequeData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('Add New Cheque')}</DialogTitle>
          <DialogDescription>
            {t('Enter the details for the new cheque payment.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="invoiceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Invoice No')}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chequeNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Cheque No')}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Bank')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a bank")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {(banks || []).map(bank => (
                                <SelectItem key={bank.id} value={bank.name}>
                                    {bank.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chequeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Cheque Amount')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={e => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chequeIssueDate"
                  render={() => (
                    <FormItem>
                        <FormLabel>{t('Cheque Issue Date')}</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                            <Select onValueChange={handleIssueDatePartChange('month')} value={issueDateParts.month}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Month')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={`issue-month-${m.value}`} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={handleIssueDatePartChange('day')} value={issueDateParts.day} disabled={!issueDateParts.month || !issueDateParts.year}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Day')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {issueDays.map(d => <SelectItem key={`issue-day-${d}`} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder={t('Year')}
                                value={issueDateParts.year || ''}
                                onChange={(e) => handleIssueDatePartChange('year')(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Duration (days)')}</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chequePrintedDate"
                  render={() => (
                  <FormItem>
                      <FormLabel>{t('Cheque Printed Date')}</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                          <Select onValueChange={handlePrintedDatePartChange('month')} value={printedDateParts.month}>
                              <FormControl><SelectTrigger><SelectValue placeholder={t('Month')} /></SelectTrigger></FormControl>
                              <SelectContent>
                                  {months.map(m => <SelectItem key={`printed-month-${m.value}`} value={m.value}>{m.label}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Select onValueChange={handlePrintedDatePartChange('day')} value={printedDateParts.day} disabled={!printedDateParts.month || !printedDateParts.year}>
                              <FormControl><SelectTrigger><SelectValue placeholder={t('Day')} /></SelectTrigger></FormControl>
                              <SelectContent>
                                  {printedDays.map(d => <SelectItem key={`printed-day-${d}`} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Input
                              type="number"
                              placeholder={t('Year')}
                              value={printedDateParts.year || ''}
                              onChange={(e) => handlePrintedDatePartChange('year')(e.target.value)}
                              maxLength={4}
                          />
                      </div>
                      <FormMessage />
                  </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="chequeClearDate"
                    render={() => (
                    <FormItem>
                        <FormLabel>{t('Cheque Clear Date')}</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                            <Select onValueChange={handleClearDatePartChange('month')} value={clearDateParts.month}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Month')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={`clear-month-${m.value}`} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={handleClearDatePartChange('day')} value={clearDateParts.day} disabled={!clearDateParts.month || !clearDateParts.year}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('Day')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {clearDays.map(d => <SelectItem key={`clear-day-${d}`} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder={t('Year')}
                                value={clearDateParts.year || ''}
                                onChange={(e) => handleClearDatePartChange('year')(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{t('Save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
