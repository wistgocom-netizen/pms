'use client';

import { Receipt } from '../components/receipt';

export function ReceiptPreview() {
  const previewOrder = {
    items: [
      { productId: 'mock-1', productName: 'Classic Coffee Bean', quantity: 2, unitPrice: 450 },
      { productId: 'mock-2', productName: 'Stainless Steel Flask', quantity: 1, unitPrice: 1200 },
    ],
    subtotal: 2100,
    taxes: 168,
    discount: 0,
    total: 2268,
    saleDate: new Date(),
  };

  return (
    <div className="flex justify-center p-4 bg-muted/30 min-h-[400px]">
      <Receipt order={previewOrder as any} />
    </div>
  );
}
