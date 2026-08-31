
'use client';

import { useStore } from '@/context/StoreContext';
import type { Sale, Customer } from '@/lib/types';
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
import { Button } from '@/components/ui/button';

interface SavedOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadOrder: (order: Sale) => void;
}

export function SavedOrdersDialog({ open, onOpenChange, onLoadOrder }: SavedOrdersDialogProps) {
  const { t, sales, formatCurrency, customers } = useStore();

  const savedOrders = sales.filter(s => s.status === 'Draft' && s.orderType === 'wholesale');

  const handleLoad = (order: Sale) => {
    onLoadOrder(order);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('Saved Orders')}</DialogTitle>
          <DialogDescription>{t('Select an order to load it into the cart.')}</DialogDescription>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Order ID')}</TableHead>
                <TableHead>{t('Date')}</TableHead>
                <TableHead>{t('Customer')}</TableHead>
                <TableHead>{t('Items')}</TableHead>
                <TableHead className="text-right">{t('Total')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedOrders.length > 0 ? (
                savedOrders.map(order => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const customerName = customer ? (customer.name || `${customer.firstName} ${customer.lastName}`) : t('Walk-in Customer');
                    return (
                        <TableRow key={order.id}>
                            <TableCell><span className="font-mono">{order.id.slice(-6).toUpperCase()}</span></TableCell>
                            <TableCell>{new Date(order.saleDate).toLocaleString()}</TableCell>
                            <TableCell>{customerName}</TableCell>
                            <TableCell>{order.items?.length || 0}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                            <Button size="sm" onClick={() => handleLoad(order)}>{t('Load')}</Button>
                            </TableCell>
                        </TableRow>
                    )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">{t('No saved orders found.')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
