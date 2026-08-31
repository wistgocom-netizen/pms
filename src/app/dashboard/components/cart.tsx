
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CartItem } from '@/lib/types';
import { Minus, Plus, Trash2, XCircle, ShoppingBag, Printer, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { PaymentDialog, PaymentMethod } from './payment-dialog';
import { PaymentSuccessDialog } from './payment-success-dialog';
import { Receipt } from './receipt';
import { Invoice } from './invoice';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


type CompletedOrder = {
    id: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    taxes: number;
    discount: number;
    saleDate: Date;
    customerId?: string;
};

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (lineItemId: string, quantity: number) => void;
  onRemoveItem: (lineItemId: string) => void;
  onClearCart: () => void;
  subtotal: number;
  taxes: number;
  itemDiscount: number;
  totalDiscount: number;
  total: number;
  orderDiscountPercentage: number;
  setOrderDiscountPercentage: (discount: number) => void;
  orderDiscountAmount: number;
  tableNumber?: string;
  customerName?: string;
  customerId?: string;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearCart, subtotal, taxes, itemDiscount, totalDiscount, total, orderDiscountPercentage, setOrderDiscountPercentage, orderDiscountAmount, tableNumber, customerName, customerId }: CartProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { storeName, addSale, taxRate, focusBarcode, autoPrintReceipt, openCashDrawer, autoOpenCashDrawer, t, customers, addExtraCharge } = useStore();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);
  const [printType, setPrintType] = useState<'receipt' | 'invoice' | null>(null);

  // Use an effect to trigger printing after the state has updated and content has rendered
  useEffect(() => {
    if (printType) {
      // Increased timeout ensures the DOM has updated with the content even on slower machines
      const timer = setTimeout(() => {
        window.print();
        setPrintType(null);
        focusBarcode();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printType, focusBarcode]);

  const handlePrint = useCallback((type: 'receipt' | 'invoice' = 'receipt') => {
    setPrintType(type);
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentMethod: PaymentMethod, customerId: string, details?: any) => {
    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const saleData = {
        items,
        total,
        subtotal,
        taxes,
        discountAmount: totalDiscount,
        paymentMethod: paymentMethod as any,
        customerId,
        paymentDetails: details,
    };
    await addSale(saleData);

    const completedOrder: CompletedOrder = {
        id: saleId,
        items: [...items],
        total: total,
        subtotal: subtotal,
        taxes: taxes,
        discount: totalDiscount,
        saleDate: new Date(),
        customerId,
    };

    setLastOrder(completedOrder);
    onClearCart();
    setIsSuccessDialogOpen(true);

    if ((paymentMethod === 'cash' || paymentMethod === 'split') && autoOpenCashDrawer) {
        openCashDrawer();
    }

    if (autoPrintReceipt) {
        setTimeout(() => {
            handlePrint('receipt');
        }, 600);
    }

    setTimeout(() => {
        router.push('/dashboard/new-orders');
    }, 1500);
  }, [items, total, subtotal, taxes, totalDiscount, addSale, onClearCart, autoPrintReceipt, handlePrint, autoOpenCashDrawer, openCashDrawer, router]);

  const handleCharge = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (items.length === 0) {
      toast({
        title: t('Empty Cart'),
        description: t('Please add items to the cart before proceeding to payment.'),
        variant: 'destructive',
      });
      return;
    }
    setIsPaymentDialogOpen(true);
  }, [items.length, toast, t]);

  const handleOrderNow = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    const saleData = {
        items: items.map(i => ({
            productId: i.id,
            productName: i.name,
            quantity: i.quantity,
            unitPrice: i.price,
            discount: i.discount,
            isPrepared: false
        })),
        totalAmount: total,
        subtotal,
        taxes: taxes,
        discountAmount: totalDiscount,
        paymentMethod: 'cash',
        status: 'New',
        orderType: 'dine-in',
        tableNumber,
        customerName,
        customerId: customerId || 'walk-in',
    };
    
    const newSale = await addSale(saleData);

    if (customerId && customerId !== 'walk-in' && newSale) {
        for (const item of items) {
            await addExtraCharge(customerId, {
                description: `${item.quantity}x ${item.name}`,
                amount: (item.price * (1 - (item.discount || 0) / 100)) * item.quantity,
                source: 'staff',
                saleId: newSale.id
            });
        }
    }
    
    onClearCart();
    toast({
        title: customerId ? t("Added to Room Bill") : t("Order Placed"),
        description: customerId 
            ? t("Services for Room {room} added to the guest's statement.", { room: tableNumber || 'N/A' })
            : t("Order for Room {room} has been sent to the board.", { room: tableNumber || 'N/A' }),
    });
    router.push('/dashboard/new-orders');
  }, [items, total, subtotal, taxes, totalDiscount, tableNumber, customerName, customerId, addSale, addExtraCharge, onClearCart, t, toast, router]);

  const handleNewSale = useCallback(() => {
    setIsSuccessDialogOpen(false);
    setLastOrder(null);
    setTimeout(() => {
      focusBarcode();
    }, 100);
  }, [focusBarcode]);

  const proformaOrder = useMemo(() => ({
    id: `DRAFT-${Date.now()}`,
    items: items,
    subtotal: subtotal,
    taxes: taxes,
    discount: totalDiscount,
    total: total,
    saleDate: new Date(),
  }), [items, subtotal, taxes, totalDiscount, total]);

  const currentCustomerName = useMemo(() => {
    if (customerName) return customerName;
    const cid = lastOrder?.customerId || 'walk-in';
    const customer = customers.find(c => c.id === cid);
    return customer ? (customer.name || `${customer.firstName} ${customer.lastName}`) : t('Walk-in Customer');
  }, [customers, lastOrder, t, customerName]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const isRoomOrder = !!tableNumber;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            body { 
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important; 
                width: 100% !important; 
            }
            
            body > *:not(.print-container) {
                display: none !important;
            }

            .non-printable, header, nav, footer, aside, button, [data-sidebar="sidebar"], [role="dialog"], .sidebar-inset { 
                display: none !important; 
                visibility: hidden !important; 
            }

            .print-container {
                display: block !important;
                visibility: visible !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                z-index: 999999 !important;
            }

            ${printType === 'receipt' ? `
                @page { size: 80mm auto !important; margin: 0 !important; }
                .printable-receipt { 
                    display: block !important;
                    width: 80mm !important; 
                    margin: 0 !important;
                    padding: 0 !important;
                }
            ` : ''}

            ${printType === 'invoice' ? `
                @page { size: A4 !important; margin: 0 !important; }
                .printable-invoice { 
                    display: block !important;
                    width: 100% !important; 
                }
            ` : ''}
        }
      `}} />

      <Card className={cn("flex flex-col bg-card h-full non-printable shadow-inner border-none")}>
        <CardHeader className="flex-row items-center justify-between shrink-0 p-4">
            <div>
                <CardTitle className="font-headline text-xl">{t('Current Order')}</CardTitle>
                {isRoomOrder && (
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Room {tableNumber}</p>
                )}
            </div>
            {items.length > 0 && (
              <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={onClearCart}>
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">{t('Clear cart')}</span>
              </Button>
            )}
        </CardHeader>
        <CardContent className={cn("p-4 pt-0 flex-grow min-h-0")}>
            {items.length === 0 ? (
                lastOrder ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <p className="text-sm font-medium text-green-600">{t('Payment Complete!')}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePrint('receipt')}>
                                <Printer className="mr-2 h-4 w-4" />
                                {t('Receipt')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePrint('invoice')}>
                                <FileText className="mr-2 h-4 w-4" />
                                {t('Invoice')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">{t('Cart is empty')}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t('Add items from the product grid to start a new sale')}</p>
                    </div>
                )
            ) : (
              <ScrollArea className="h-full pr-4 -mr-4">
                  <div className="space-y-4">
                      {items.map((item) => (
                      <div key={item.lineItemId} className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                              <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg shrink-0">
                                <span className="text-xl">{item.emoji}</span>
                              </div>
                              <div className="flex flex-col">
                                <p className="font-semibold text-xs">{item.name}</p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-[10px] text-muted-foreground">{item.price.toFixed(2)}</p>
                                  <p className="font-black text-xs font-mono">{((item.price * (1 - (item.discount || 0) / 100)) * item.quantity).toFixed(2)}</p>
                                </div>
                                {item.discount && item.discount > 0 && (
                                    <p className="text-[9px] text-destructive font-bold uppercase">
                                        (-{item.discount}% off)
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => onUpdateQuantity(item.lineItemId, item.quantity - 1)}
                                    >
                                    <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const newQuantity = parseFloat(e.target.value);
                                            onUpdateQuantity(item.lineItemId, isNaN(newQuantity) ? 0 : newQuantity);
                                        }}
                                        className="h-6 w-12 text-center px-1 text-xs font-bold"
                                        step="0.01"
                                        min="0"
                                    />
                                    <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => onUpdateQuantity(item.lineItemId, item.quantity + 1)}
                                    >
                                    <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                              </div>
                          </div>
                          <div className="flex items-center h-full">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                              onClick={() => onRemoveItem(item.lineItemId)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
          )}
        </CardContent>
        {items.length > 0 && (
            <CardFooter className="flex-col p-4 border-t pb-6 shrink-0 bg-muted/10">
                <form onSubmit={isRoomOrder ? handleOrderNow : handleCharge} className="w-full">
                    <div className="w-full space-y-1.5 text-xs">
                        <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('Subtotal')}</span>
                        <span className="font-mono font-medium">{subtotal.toFixed(2)}</span>
                        </div>
                        {itemDiscount > 0 && (
                            <div className="flex justify-between text-destructive">
                               <span>{t('Item Discounts')}</span>
                                <span className="font-mono font-bold">-{itemDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <Label htmlFor="order-discount" className="cursor-pointer text-muted-foreground">
                                {t('Order Discount (%)')}
                            </Label>
                             <div className="flex items-center gap-1">
                                <Input
                                    id="order-discount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={orderDiscountPercentage > 0 ? orderDiscountPercentage : ''}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setOrderDiscountPercentage(isNaN(value) || value < 0 ? 0 : value);
                                    }}
                                    className="h-7 w-16 text-right pr-1 text-xs"
                                    placeholder="0"
                                />
                                <span className="text-[10px] font-bold">%</span>
                            </div>
                        </div>
                        {orderDiscountAmount > 0 && (
                            <div className="flex justify-between text-xs text-destructive">
                                <span>{t('Discount')}</span>
                                <span className="font-bold font-mono">-{orderDiscountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('Tax')} ({taxRate}%)</span>
                        <span className="font-mono font-medium">{taxes.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-black text-lg text-primary">
                        <span>{t('Total')}</span>
                        <span className="font-mono">{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                            {isRoomOrder ? t('Add') : `${t('Charge')} ${total.toFixed(2)}`}
                        </Button>
                    </div>
                </form>
            </CardFooter>
        )}
      </Card>

      <div className="non-printable">
        <PaymentDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            totalAmount={total}
            itemCount={totalItems}
            onPaymentSuccess={handlePaymentSuccess}
        />
        <PaymentSuccessDialog
            open={isSuccessDialogOpen}
            onOpenChange={setIsSuccessDialogOpen}
            onNewSale={handleNewSale}
            onPrint={() => handlePrint('receipt')}
        />
      </div>

      <div className="hidden print:block print-container">
        {printType === 'receipt' && (
            <div className="printable-receipt">
                <Receipt order={(lastOrder || proformaOrder) as any} />
            </div>
        )}
        {printType === 'invoice' && (
            <div className="printable-invoice">
                <Invoice 
                    order={(lastOrder || proformaOrder) as any} 
                    storeName={storeName} 
                    customerName={currentCustomerName}
                />
            </div>
        )}
      </div>
    </>
  );
}
