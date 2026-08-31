
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Sale, Customer } from '@/lib/types';
import { OrderDetails } from './order-details';
import { useStore } from '@/context/StoreContext';

interface OrderDetailsDialogProps {
  order: (Sale & { customer?: Customer }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayBill: () => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange, onPayBill }: OrderDetailsDialogProps) {
  const { t } = useStore();
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md h-[90dvh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 sr-only">
          {/* This title is visually hidden but available for screen readers */}
          <DialogTitle>{t('Order Details')}</DialogTitle>
        </DialogHeader>
        <OrderDetails order={order} onPayBill={onPayBill} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
