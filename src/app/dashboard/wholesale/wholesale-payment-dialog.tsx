'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/hooks/use-toast';
import type { Customer, CartItem } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Printer } from 'lucide-react';
import { CustomerFormDialog } from '../customers/add-customer-dialog';
import { cn } from '@/lib/utils';

interface WholesalePaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalAmount: number;
    subtotal: number;
    taxes: number;
    totalDiscount: number;
    onPaymentSuccess: (paymentData: any, shouldPrint?: boolean) => void;
    customerId: string;
    items: CartItem[];
    storeName: string;
    onSaveDraftSuccess: () => void;
    onPrint: (type: 'receipt' | 'invoice') => void;
}

export function WholesalePaymentDialog({ 
    open, 
    onOpenChange, 
    totalAmount, 
    subtotal, 
    taxes, 
    totalDiscount, 
    onPaymentSuccess, 
    customerId, 
    items, 
    onSaveDraftSuccess,
    onPrint
}: WholesalePaymentDialogProps) {
  const { customers, banks, t, saveWholesaleDraft, addCustomer, theme } = useStore();
  const { toast } = useToast();

  const [cashAmount, setCashAmount] = useState(0);
  const [chequeAmount, setChequeAmount] = useState(0);
  const [chequeNo, setChequeNo] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeIssueDate, setChequeIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chequeClearDate, setChequeClearDate] = useState('');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const initialCustomer = customers.find(c => c.id === customerId);
      setSelectedCustomerId(customerId);
      setCustomerSearch(initialCustomer && initialCustomer.id !== 'walk-in' ? (initialCustomer.name || `${initialCustomer.firstName} ${initialCustomer.lastName}`) : '');
      
      setCashAmount(totalAmount || 0);
      setChequeAmount(0);
      setChequeNo('');
      setChequeBank('');
      setChequeIssueDate(format(new Date(), 'yyyy-MM-dd'));
      setChequeClearDate('');
    }
  }, [open, totalAmount, customerId, customers]);
  
  const paidAmount = useMemo(() => cashAmount + chequeAmount, [cashAmount, chequeAmount]);
  const balance = useMemo(() => totalAmount - paidAmount, [totalAmount, paidAmount]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const lowerQuery = customerSearch.toLowerCase();
    return customers.filter(c => 
        (c.name || `${c.firstName} ${c.lastName}`).toLowerCase().includes(lowerQuery)
    );
  }, [customerSearch, customers]);
  
  const handleSelectCustomer = (customer: Pick<Customer, 'id' | 'name' | 'firstName' | 'lastName'>) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch(customer.id === 'walk-in' ? '' : (customer.name || `${customer.firstName} ${customer.lastName}`) || '');
    setIsCustomerListVisible(false);
  }

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id' | 'totalLoanAmount' | 'totalPaidAmount'>) => {
    const newCustomerId = await addCustomer(customerData);
    if (newCustomerId) {
        handleSelectCustomer({ ...customerData, id: newCustomerId });
        toast({
            title: t('Customer Added'),
            description: t('{firstName} {lastName} has been successfully saved.', { firstName: customerData.firstName!, lastName: customerData.lastName! }),
        });
    }
    setIsAddCustomerOpen(false);
  };

  const handlePay = () => {
    if (paidAmount < totalAmount - 0.01) {
      toast({ title: t('Payment Incomplete'), description: t('Paid amount is less than total amount.'), variant: 'destructive' });
      return;
    }
    if ((chequeAmount > 0) && (!chequeNo || !chequeBank || !chequeIssueDate)) {
      toast({ title: t('Cheque Details Missing'), description: t('Please fill all cheque details.'), variant: 'destructive' });
      return;
    }

    let paymentMethod;
    if (cashAmount > 0 && chequeAmount > 0) {
      paymentMethod = 'split';
    } else if (chequeAmount > 0) {
      paymentMethod = 'cheque';
    } else {
      paymentMethod = 'cash';
    }
    
    onPaymentSuccess({
      paymentMethod,
      customerId: selectedCustomerId,
      paymentDetails: {
        cashAmount: cashAmount,
        chequeAmount: chequeAmount,
        chequeDetails: {
          chequeNo,
          bank: chequeBank,
          chequeIssueDate: chequeIssueDate,
          chequeClearDate: chequeClearDate
        }
      }
    });

    onOpenChange(false);
  };
  
  const handleSaveDraft = async () => {
      const saleData = {
        items,
        total: totalAmount,
        subtotal,
        taxes,
        discount: totalDiscount,
        customerId: selectedCustomerId,
        paymentMethod: 'split',
        paymentDetails: {
          cashAmount,
          chequeAmount,
          chequeDetails: {
            chequeNo,
            bank: chequeBank,
            chequeIssueDate,
            chequeClearDate
          }
        }
      };

      await saveWholesaleDraft(saleData);
      toast({ title: t('Order Saved'), description: t('The order has been saved as a draft.') });
      onOpenChange(false);
      onSaveDraftSuccess();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('Complete Payment')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
              <div className="space-y-4 py-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('Total Amount')}</p>
                      <p className={cn("text-3xl font-bold text-primary", theme === 'coinlytix' && 'text-foreground')}>{totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="relative">
                      <Label htmlFor="wholesale-customer-search">{t('Customer')}</Label>
                      <Input 
                          id="wholesale-customer-search"
                          placeholder={t('Search for a customer...')}
                          value={customerSearch}
                          onChange={e => {
                              setCustomerSearch(e.target.value);
                              if (!isCustomerListVisible) setIsCustomerListVisible(true);
                          }}
                          onFocus={() => setIsCustomerListVisible(true)}
                          onBlur={() => setTimeout(() => setIsCustomerListVisible(false), 200)}
                          autoComplete="off"
                      />
                      {isCustomerListVisible && (
                          <Card className="absolute top-full mt-1 w-full z-50 max-h-60 overflow-y-auto">
                              <CardContent className="p-0">
                                  <ScrollArea className="h-full">
                                      <div 
                                          className="p-2 text-sm cursor-pointer hover:bg-accent flex justify-between items-center"
                                          onMouseDown={() => handleSelectCustomer({id: 'walk-in', name: 'Walk-in Customer', firstName: 'Walk-in', lastName: 'Customer'})}
                                      >
                                          {t('Walk-in Customer')}
                                      </div>
                                      {filteredCustomers.map(customer => (
                                          <div 
                                              key={customer.id}
                                              className="p-2 text-sm cursor-pointer hover:bg-accent"
                                              onMouseDown={() => handleSelectCustomer(customer)}
                                          >
                                              {customer.name || `${customer.firstName} ${customer.lastName}`}
                                          </div>
                                      ))}
                                  </ScrollArea>
                              </CardContent>
                              <CardFooter className="p-1 border-t">
                                  <Button variant="link" size="sm" className="w-full" onMouseDown={(e) => { e.preventDefault(); setIsAddCustomerOpen(true); }}>
                                      <PlusCircle className="mr-2 h-4 w-4" />
                                      {t('Add New Customer')}
                                  </Button>
                              </CardFooter>
                          </Card>
                      )}
                  </div>


                  <div className="space-y-2">
                      <Label htmlFor="cash-amount">{t('Cash Amount')}</Label>
                      <Input id="cash-amount" type="number" value={cashAmount || ''} onChange={e => setCashAmount(parseFloat(e.target.value) || 0)} />
                  </div>
                  
                  <div className="font-bold text-center">+</div>

                  <div className="p-4 border rounded-md space-y-4">
                      <h4 className="font-semibold">{t('Cheque Payment')}</h4>
                      <div className="space-y-2">
                          <Label htmlFor="cheque-amount">{t('Cheque Amount')}</Label>
                          <Input id="cheque-amount" type="number" value={chequeAmount || ''} onChange={e => setChequeAmount(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="cheque-no">{t('Cheque No')}</Label>
                          <Input id="cheque-no" value={chequeNo} onChange={e => setChequeNo(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="cheque-bank">{t('Bank')}</Label>
                          <Select value={chequeBank} onValueChange={setChequeBank}>
                              <SelectTrigger><SelectValue placeholder={t('Select a bank')} /></SelectTrigger>
                              <SelectContent>
                                  {(banks || []).map(bank => <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="cheque-issue-date">{t('Cheque Issue Date')}</Label>
                          <Input id="cheque-issue-date" type="date" value={chequeIssueDate} onChange={e => setChequeIssueDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="cheque-clear-date">{t('Cheque Clear Date')}</Label>
                          <Input id="cheque-clear-date" type="date" value={chequeClearDate} onChange={e => setChequeClearDate(e.target.value)} />
                      </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg text-lg space-y-1">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('Total Paid')}</span>
                          <span className="font-bold">{paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('Balance')}</span>
                          <span className="font-bold">{balance.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
          </ScrollArea>
          <DialogFooter className="flex flex-row justify-between gap-2 mt-4">
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
                <Button variant="secondary" onClick={handleSaveDraft}>{t('Save')}</Button>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="default" onClick={() => onPrint('receipt')}>
                    <Printer className="mr-2 h-4 w-4" /> {t('Print Receipt')}
                </Button>
                <Button onClick={handlePay}>{t('Pay')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomerFormDialog 
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onSave={handleSaveCustomer}
        customerToEdit={null}
      />
    </>
  );
}
