
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';
import type { Order } from './columns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const { formatCurrency, t } = useStore();

  if (!order) return null;
  
  const subtotal = order.items?.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('Order Details')}</DialogTitle>
          <DialogDescription>
            {t('Order ID')}: <span className="font-mono">{order.id.slice(-6).toUpperCase()}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">{t('Customer')}</p>
                <p className="font-medium">{order.customerName}</p>
            </div>
            <div className="text-right">
                <p className="text-muted-foreground">{t('Date')}</p>
                <p className="font-medium">{new Date(order.saleDate).toLocaleString()}</p>
            </div>
            <div>
                <p className="text-muted-foreground">{t('Payment Method')}</p>
                <div className="font-medium">
                  <Badge variant="outline" className="capitalize">{t(order.paymentMethod)}</Badge>
                  {(order.paymentMethod === 'split' || !!order.paymentDetails) && order.paymentDetails && (
                      <div className="text-xs mt-1 text-muted-foreground space-y-0.5">
                          {(order.paymentDetails.cashAmount ?? 0) > 0 && <p>{t('Cash')}: {formatCurrency(order.paymentDetails.cashAmount!)}</p>}
                          {(order.paymentDetails.cardAmount ?? 0) > 0 && <p>{t('Card')}: {formatCurrency(order.paymentDetails.cardAmount!)}</p>}
                          {(order.paymentDetails.chequeAmount ?? 0) > 0 && <p>{t('Cheque')}: {formatCurrency(order.paymentDetails.chequeAmount!)}</p>}
                      </div>
                  )}
                </div>
            </div>
        </div>

        <Separator />

        <ScrollArea className="max-h-[300px] -mx-6 px-6 no-scrollbar">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Product')}</TableHead>
                <TableHead className="text-center">{t('Quantity')}</TableHead>
                <TableHead className="text-right">{t('Unit Price')}</TableHead>
                <TableHead className="text-right">{t('Total')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.items || []).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="w-full space-y-2 text-sm pt-4 border-t">
            <div className="flex justify-between">
                <span>{t('Subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span>{t('Tax')}</span>
                <span>{formatCurrency(order.taxes)}</span>
            </div>
            <div className="flex justify-between">
                <span>{t('Discount')}</span>
                <span className="text-destructive">-{formatCurrency(order.discountAmount)}</span>
            </div>
            {order.serviceCharge && order.serviceCharge > 0 && (
                <div className="flex justify-between">
                    <span>{t('Service Charge')}</span>
                    <span>{formatCurrency(order.serviceCharge)}</span>
                </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
                <span>{t('Total')}</span>
                <span>{formatCurrency(order.totalAmount)}</span>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
