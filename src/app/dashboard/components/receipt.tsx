'use client';

import type { CartItem, Sale } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

interface ReceiptProps {
  order: {
    items: (CartItem | Sale['items'][0])[];
    subtotal: number;
    taxes: number;
    discount: number;
    total: number;
    saleDate: Date;
    serviceCharge?: number;
  };
}

export function Receipt({ order }: ReceiptProps) {
  const { storeName, storeAddress, storePhone, organization } = useStore();
  const date = order.saleDate ? (typeof order.saleDate === 'string' ? new Date(order.saleDate) : order.saleDate) : new Date();

  // Pull settings from the active organization, or use defaults. Standardized to 80mm.
  const settings = organization?.receiptSettings || {
    showStoreAddress: true,
    showStorePhone: true,
    fontSize: 12,
    margin: 4,
    showLogo: false,
    paperWidth: '80mm' as const,
    headerText: 'WELCOME',
    footerText: 'Thank you for your purchase!',
  };

  const paperWidthClass = "w-[80mm]";

  return (
    <div 
      className={cn(
        "bg-white text-black font-mono print:shadow-none",
        paperWidthClass
      )}
      style={{ 
        padding: `${settings.margin}mm`,
        fontSize: `${settings.fontSize}px`,
        lineHeight: '1.2',
        border: '3px solid #000',
        borderRadius: '12px'
      }}
    >
      <div className="text-center space-y-1 mb-4">
        <h2 className="font-bold text-lg leading-tight uppercase">{storeName}</h2>
        {settings.headerText && <p className="text-[0.9em]">{settings.headerText}</p>}
        {settings.showStoreAddress && storeAddress && <p className="text-[0.8em]">{storeAddress}</p>}
        {settings.showStorePhone && storePhone && <p className="text-[0.8em]">Tel: {storePhone}</p>}
        <p className="text-[0.8em]">{date.toLocaleDateString()} {date.toLocaleTimeString()}</p>
      </div>

      <div className="py-2 space-y-1 mb-2" style={{ borderTop: '3px solid #000', borderBottom: '3px solid #000' }}>
        <div className="flex justify-between font-bold text-[0.9em]">
          <span>ITEM</span>
          <span className="text-right">AMT</span>
        </div>
        {order.items.map((item, index) => {
          const itemAsAny = item as any;
          const key = itemAsAny.lineItemId || itemAsAny.productId || itemAsAny.id || index;
          const name = itemAsAny.name || itemAsAny.productName;
          const price = itemAsAny.price || itemAsAny.unitPrice;
          
          return (
            <div key={key} className="flex justify-between leading-tight gap-4">
              <span className="truncate pr-2">{item.quantity}x {name}</span>
              <span className="shrink-0 font-mono">{(price * item.quantity).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1 text-left mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono">{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="font-mono">{order.taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span className="font-mono text-black">-{order.discount.toFixed(2)}</span>
        </div>
        {order.serviceCharge && order.serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>S.Charge</span>
              <span className="font-mono">{order.serviceCharge.toFixed(2)}</span>
            </div>
        )}
        <div className="flex justify-between font-bold" style={{ borderTop: '3px solid #000', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
          <span>TOTAL</span>
          <span className="font-mono">{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center text-[0.9em]" style={{ paddingTop: '0.5rem', borderTop: '3px solid #000' }}>
        <p>{settings.footerText || 'Visit us again!'}</p>
        <div className="mt-4" style={{ paddingTop: '0.5rem', borderTop: '3px solid #000' }}>
            <p className="font-brand text-[0.8em] tracking-widest text-black">Adyfire</p>
            <p className="text-[0.6em] opacity-50 uppercase text-black">Software Solutions</p>
        </div>
      </div>
    </div>
  );
}
