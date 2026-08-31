'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/context/StoreContext';
import { CreditCard, Wallet, Handshake, QrCode, Split } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { PaymentMethodType, Customer } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NumericKeypad } from './numeric-keypad';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';


export type PaymentMethod = 'card' | 'cash' | 'loan' | 'qr' | 'split';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  itemCount: number;
  onPaymentSuccess: (paymentMethod: PaymentMethod, customerId: string, details?: any) => void;
  customer?: Customer | null;
  allowedPaymentMethods?: PaymentMethod[];
}


export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  itemCount,
  onPaymentSuccess,
  customer,
  allowedPaymentMethods,
}: PaymentDialogProps) {
  const { formatCurrency, customers, paymentMethods: enabledPaymentMethods, cashDenominations, theme } = useStore();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer?.id || 'walk-in');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerListVisible, setIsCustomerListVisible] = useState(false);
  const cashInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Split payment state
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitCardAmount, setSplitCardAmount] = useState('');


  useEffect(() => {
    if (open) {
      const firstEnabledMethod = (Object.keys(enabledPaymentMethods) as PaymentMethod[]).find(
        (method) => enabledPaymentMethods[method]
      );
      
      const defaultMethod = enabledPaymentMethods.cash ? 'cash' : firstEnabledMethod;

      setPaymentMethod(defaultMethod || 'cash');
      setCashReceived('');
      setSelectedCustomerId(customer?.id || 'walk-in');
      const customerName = customer ? (customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()) : '';
      setCustomerSearch(customerName);
      setIsCustomerListVisible(false);

      // Reset split amounts
      setSplitCashAmount(totalAmount.toFixed(2));
      setSplitCardAmount('0.00');
    }
  }, [open, enabledPaymentMethods, customer, totalAmount]);
  
  useEffect(() => {
    // When payment method changes, if it's not loan, reset customer selection
    if (paymentMethod !== 'loan' && !customer) {
        setSelectedCustomerId('walk-in');
        setCustomerSearch('');
    }
    if (open && paymentMethod === 'cash' && !isMobile) {
      setTimeout(() => {
        cashInputRef.current?.focus();
        cashInputRef.current?.select();
      }, 100);
    }
  }, [paymentMethod, open, customer, isMobile]);


  const filteredCustomers = useMemo(() => {
    const lowerQuery = customerSearch.toLowerCase();
    if (!lowerQuery) return customers;
    return customers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(lowerQuery)
    );
  }, [customerSearch, customers]);
  
  const handleSelectCustomer = (customer: Pick<Customer, 'id' | 'firstName' | 'lastName'>) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch(customer.id === 'walk-in' ? '' : `${customer.firstName} ${customer.lastName}`);
    setIsCustomerListVisible(false);
  }

  const selectedCustomerName = useMemo(() => {
    if (selectedCustomerId === 'walk-in') {
      return 'Walk-in Customer';
    }
    const foundCustomer = customers.find(c => c.id === selectedCustomerId);
    return foundCustomer ? (foundCustomer.name || `${foundCustomer.firstName || ''} ${foundCustomer.lastName || ''}`.trim()) : 'Walk-in Customer';
  }, [selectedCustomerId, customers]);


  const handlePayment = () => {
    if (paymentMethod === 'loan' && selectedCustomerId === 'walk-in') {
      toast({
        title: 'Customer Required',
        description: 'Please select a customer to process a loan.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'split') {
        const cash = parseFloat(splitCashAmount) || 0;
        const card = parseFloat(splitCardAmount) || 0;
        if (Math.abs(cash + card - totalAmount) > 0.01) {
            toast({
                title: 'Invalid Split Amount',
                description: `Total split must equal ${formatCurrency(totalAmount)}`,
                variant: 'destructive',
            });
            return;
        }
    }

    toast({
      title: 'Payment Successful',
      description: `${formatCurrency(totalAmount)} has been charged.`,
    });

    const details = paymentMethod === 'split' ? {
        cashAmount: parseFloat(splitCashAmount) || 0,
        cardAmount: parseFloat(splitCardAmount) || 0,
    } : undefined;

    onPaymentSuccess(paymentMethod, selectedCustomerId, details);
    onOpenChange(false);
  };
  
  const handleKeypadClick = (key: string) => {
    if (key === 'backspace') {
      setCashReceived(prev => prev.slice(0, -1));
    } else if (key === '.' && cashReceived.includes('.')) {
      return;
    } else {
      setCashReceived(prev => prev + key);
    }
  };

  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const changeDue = cashReceivedAmount > totalAmount ? cashReceivedAmount - totalAmount : 0;

  const paymentButtons: { id: PaymentMethod; label: string; icon: React.ElementType; }[] = [
    { id: 'cash', label: 'Cash', icon: Wallet },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'qr', label: 'QR Pay', icon: QrCode },
    { id: 'loan', label: 'Loan', icon: Handshake },
    { id: 'split', label: 'Split', icon: Split },
  ];
  
  const paymentDialogContent = (
     <>
        <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg my-2 text-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className={cn("text-3xl font-bold", theme === 'coinlytix' ? 'text-foreground' : 'text-primary')}>{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</p>
        </div>

        <div className='space-y-4'>
            {paymentMethod === 'loan' && (
            <div className="space-y-1 relative">
                <Label htmlFor="customer-search">Customer</Label>
                <Input 
                    id="customer-search"
                    placeholder="Type to search customer..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onFocus={() => setIsCustomerListVisible(true)}
                    onBlur={() => setTimeout(() => setIsCustomerListVisible(false), 150)}
                    autoComplete="off"
                    disabled={!!customer}
                />
                {isCustomerListVisible && !customer && (
                        <Card className="absolute top-full mt-1 w-full z-10 max-h-48 overflow-y-auto">
                            <CardContent className="p-0">
                                <ScrollArea className="h-full">
                                    <div 
                                        className="p-2 text-sm cursor-pointer hover:bg-accent"
                                        onMouseDown={() => handleSelectCustomer({id: 'walk-in', firstName: 'Walk-in', lastName: 'Customer'})}
                                    >
                                        Walk-in Customer
                                    </div>
                                    {filteredCustomers.map(customer => (
                                        <div 
                                            key={customer.id}
                                            className="p-2 text-sm cursor-pointer hover:bg-accent"
                                            onMouseDown={() => handleSelectCustomer(customer)}
                                        >
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                <p className="text-xs text-muted-foreground pt-1">Selected: {selectedCustomerName}</p>
            </div>
            )}

            <div>
                <p className="text-sm font-medium mb-1">Payment Method</p>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {paymentButtons.filter(p => (allowedPaymentMethods || ['cash', 'card', 'qr', 'loan', 'split']).includes(p.id)).filter(p => p.id === 'split' || enabledPaymentMethods[p.id as PaymentMethodType]).map((button) => (
                        <Button
                            key={button.id}
                            variant={paymentMethod === button.id ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod(button.id)}
                            className="h-auto py-2 flex-col gap-1 px-1"
                        >
                            <button.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-[10px] sm:text-xs leading-tight">{button.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
        
        {paymentMethod === 'cash' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <NumericKeypad onKeyClick={handleKeypadClick} />
                </div>
                <div className="space-y-2">
                    <div>
                        <Label htmlFor="cash-received" className="text-sm font-medium">Cash Received</Label>
                        <Input
                            id="cash-received"
                            ref={cashInputRef}
                            type="text"
                            inputMode="decimal"
                            placeholder={formatCurrency(0)}
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="text-right text-2xl h-12 mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[...cashDenominations].sort((a,b) => a-b).slice(0, 3).map((amount) => (
                        <Button key={amount} variant="outline" size="sm" className="h-12" onClick={() => setCashReceived(String(amount))}>
                            {formatCurrency(amount).replace(/\.00$/, '')}
                        </Button>
                        ))}
                        <Button variant="outline" size="sm" className="h-12" onClick={() => setCashReceived(totalAmount.toFixed(2))}>Exact</Button>
                    </div>
                        {changeDue > 0 && (
                        <div className="text-center p-2 rounded-md bg-green-100 dark:bg-green-900/50 mt-2">
                        <p className="text-xs text-green-800 dark:text-green-300">Change Due</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(changeDue)}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {paymentMethod === 'split' && (
            <div className="mt-4 space-y-4 p-4 border rounded-md bg-muted/20">
                <h4 className="font-semibold text-sm">Split Payment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="split-cash">Cash Amount</Label>
                        <Input 
                            id="split-cash"
                            type="number"
                            step="0.01"
                            value={splitCashAmount}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSplitCashAmount(val);
                                const numericVal = parseFloat(val) || 0;
                                setSplitCardAmount(Math.max(0, totalAmount - numericVal).toFixed(2));
                            }}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="split-card">Card Amount</Label>
                        <Input 
                            id="split-card"
                            type="number"
                            step="0.01"
                            value={splitCardAmount}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSplitCardAmount(val);
                                const numericVal = parseFloat(val) || 0;
                                setSplitCashAmount(Math.max(0, totalAmount - numericVal).toFixed(2));
                            }}
                            className="font-mono"
                        />
                    </div>
                </div>
                <div className={cn(
                    "text-xs text-center p-2 rounded",
                    Math.abs((parseFloat(splitCashAmount) || 0) + (parseFloat(splitCardAmount) || 0) - totalAmount) <= 0.01 
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20" 
                        : "text-destructive bg-destructive/10"
                )}>
                    Total: {((parseFloat(splitCashAmount) || 0) + (parseFloat(splitCardAmount) || 0)).toFixed(2)} / {totalAmount.toFixed(2)}
                </div>
            </div>
        )}
    </>
  );

  const paymentDialogActions = (
      <div className="w-full">
        {paymentMethod === 'cash' ? (
            <div className="w-full space-y-2">
                <Button
                    size="lg"
                    className="w-full h-12 text-base"
                    onClick={handlePayment}
                    disabled={Math.round(cashReceivedAmount * 100) < Math.round(totalAmount * 100)}
                >
                    Complete Cash Payment
                </Button>
            </div>
        ) : (
            <Button
                size="lg"
                className="w-full h-12 text-base"
                onClick={handlePayment}
                disabled={
                    (paymentMethod === 'loan' && selectedCustomerId === 'walk-in') ||
                    (paymentMethod === 'split' && Math.abs((parseFloat(splitCashAmount) || 0) + (parseFloat(splitCardAmount) || 0) - totalAmount) > 0.01)
                }
            >
                Complete Payment
            </Button>
        )}
      </div>
  );

  if(isMobile) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="max-h-[90dvh] flex flex-col p-0">
                <SheetHeader className="p-4 pb-0 text-left">
                    <SheetTitle>Complete Payment</SheetTitle>
                </SheetHeader>
                <div className="flex-grow min-h-0 overflow-y-auto">
                    <div className="p-4">
                      {paymentDialogContent}
                    </div>
                </div>
                <SheetFooter className="p-4 pt-2 border-t bg-background">
                    {paymentDialogActions}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-4">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
            {paymentDialogContent}
        </div>
        {paymentDialogActions}
      </DialogContent>
    </Dialog>
  );
}
