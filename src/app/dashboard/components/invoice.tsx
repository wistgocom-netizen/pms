'use client';

import type { CartItem, Sale } from '@/lib/types';
import { useStore } from '@/context/StoreContext';

interface InvoiceProps {
  order: {
    id: string;
    items: (CartItem | Sale['items'][0])[];
    subtotal: number;
    taxes: number;
    discount: number;
    total: number;
    saleDate: Date;
    serviceCharge?: number;
  };
  storeName: string;
  customerName: string;
  customerAddress?: string;
  companyMessage?: string;
}

export function Invoice({ order, storeName, customerName, customerAddress, companyMessage }: InvoiceProps) {
  const { organization, storeAddress, storePhone, storeEmail } = useStore();
  const date = order.saleDate ? (typeof order.saleDate === 'string' ? new Date(order.saleDate) : order.saleDate) : new Date();
  
  const settings = organization?.invoiceSettings || {
    accentColor: '#3F51B5',
    termsAndConditions: [],
  };

  return (
    <div className="bg-white text-black font-sans text-[9px] w-full max-w-[210mm] min-h-[297mm] flex flex-col p-[10mm] ml-0 print:max-w-none print:border-none print:p-0 print:m-0 print:w-full text-left">
      <div>
        <header className="flex justify-between items-start mb-4 text-left">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter" style={{ color: settings.accentColor }}>{storeName}</h1>
            <p className="text-gray-600 text-[8px] mt-0.5">{storeAddress || companyMessage || 'Wholesale Distribution Center'}</p>
            <p className="text-gray-600 text-[8px]">{storePhone ? `Tel: ${storePhone}` : ''} {storeEmail ? `| Email: ${storeEmail}` : ''}</p>
            <p className="text-[8px] text-gray-500 italic mt-1">Official Invoice</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase text-gray-800 tracking-widest leading-none">Invoice</h2>
            <p className="mt-1 text-[8px] text-gray-600 font-semibold"><strong>Inv No:</strong> {order.id.slice(-8).toUpperCase()}</p>
            <p className="text-[8px] text-gray-600"><strong>Date:</strong> {date.toLocaleDateString()}</p>
          </div>
        </header>

        <main>
            <section className="mb-4 text-left">
                <div className="border border-gray-300 p-2 rounded bg-gray-50/50 max-w-[250px]">
                    <h3 className="font-bold text-gray-700 mb-0.5 text-[8px] uppercase tracking-wider border-b border-gray-200 pb-0.5">Bill To:</h3>
                    <p className="font-bold text-gray-900 text-[10px]">{customerName}</p>
                    <p className="text-gray-600 text-[8px] leading-tight">{customerAddress || 'Customer Address'}</p>
                </div>
            </section>

            <section>
                <table className="w-full border-collapse text-gray-800">
                  <thead>
                    <tr className="bg-gray-100" style={{ borderBottom: `1.5px solid ${settings.accentColor}` }}>
                      <th className="border border-gray-300 p-1 text-left w-6 font-bold uppercase">#</th>
                      <th className="border border-gray-300 p-1 text-left w-20 font-bold uppercase">Code</th>
                      <th className="border border-gray-300 p-1 text-left font-bold uppercase">Description</th>
                      <th className="border border-gray-300 p-1 text-right w-10 font-bold uppercase">Qty</th>
                      <th className="border border-gray-300 p-1 text-right w-20 font-bold uppercase">Rate</th>
                      <th className="border border-gray-300 p-1 text-right w-12 font-bold uppercase">D%</th>
                      <th className="border border-gray-300 p-1 text-right w-24 font-bold uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const itemAsAny = item as any;
                      const name = itemAsAny.name || itemAsAny.productName;
                      const price = itemAsAny.price || itemAsAny.unitPrice;
                      const code = itemAsAny.id || itemAsAny.productId;
                      const discount = itemAsAny.discount || 0;

                      return (
                        <tr key={index} className="even:bg-gray-50/20 h-5">
                          <td className="border border-gray-200 p-0.5 text-center text-[8px] text-gray-500">{index + 1}</td>
                          <td className="border border-gray-200 p-0.5 font-mono text-[8px]">{code}</td>
                          <td className="border border-gray-200 p-0.5 truncate max-w-[220px]">{name}</td>
                          <td className="border border-gray-200 p-0.5 text-right font-medium">{item.quantity}</td>
                          <td className="border border-gray-200 p-0.5 text-right text-gray-600">{price.toFixed(2)}</td>
                          <td className="border border-gray-200 p-0.5 text-right text-destructive">{discount > 0 ? `${discount}%` : '-'}</td>
                          <td className="border border-gray-200 p-0.5 text-right font-bold">
                              {(price * (1 - discount / 100) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    {order.items.length < 15 && Array.from({ length: 15 - order.items.length }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-5">
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                        <td className="border border-gray-200"></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2" style={{ borderColor: settings.accentColor }}>
                    <tr className="bg-white">
                      <td colSpan={6} className="p-0.5 text-right font-bold uppercase text-[8px] text-gray-500">Subtotal</td>
                      <td className="border border-gray-200 p-0.5 text-right font-bold text-[9px] font-mono">{order.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-white">
                      <td colSpan={6} className="p-0.5 text-right font-bold uppercase text-[8px] text-gray-500">Total Discount</td>
                      <td className="border border-gray-200 p-0.5 text-right font-bold text-[9px] text-destructive font-mono">-{order.discount.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-white">
                      <td colSpan={6} className="p-0.5 text-right font-bold uppercase text-[8px] text-gray-500">Tax</td>
                      <td className="border border-gray-200 p-0.5 text-right font-bold text-[9px] font-mono">{order.taxes.toFixed(2)}</td>
                    </tr>
                    {order.serviceCharge && (
                      <tr className="bg-white">
                        <td colSpan={6} className="p-0.5 text-right font-bold uppercase text-[8px] text-gray-500">Service Charge</td>
                        <td className="border border-gray-200 p-0.5 text-right font-bold text-[9px] font-mono">{order.serviceCharge.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-100/50">
                      <td colSpan={6} className="p-1 text-right font-bold uppercase text-[10px] text-gray-700">Total Payable</td>
                      <td className="border border-gray-300 p-1 text-right font-black text-[12px] font-mono" style={{ color: settings.accentColor }}>
                        {order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
            </section>
        </main>
      </div>

      <footer className="mt-auto pt-6 text-[8px] text-gray-600 text-left">
        <div className="grid grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold uppercase mb-1 border-b pb-0.5 inline-block" style={{ borderColor: settings.accentColor }}>Terms & Conditions:</h4>
                {settings.termsAndConditions && settings.termsAndConditions.length > 0 ? (
                    <ul className="list-decimal pl-3 space-y-0.5">
                        {settings.termsAndConditions.map((term, i) => (
                            <li key={i}>{term}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-400">Standard terms apply. Goods once sold are non-returnable.</p>
                )}
            </div>
            <div className="flex flex-col justify-end">
                <div className="flex justify-between items-end pb-4 gap-4">
                    <div className="text-center flex-1">
                        <div className="border-t border-gray-400 pt-0.5">
                            <p className="text-[7px] font-bold uppercase text-gray-500">Authorized Signatory</p>
                        </div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="border-t border-gray-400 pt-0.5">
                            <p className="text-[7px] font-bold uppercase text-gray-500">Customer Signature</p>
                        </div>
                    </div>
                </div>
                <div className="text-center pt-2 border-t border-dotted border-gray-300">
                    <p className="font-brand text-[9px] tracking-widest text-black">Adyfire</p>
                    <p className="text-[6px] opacity-50 uppercase text-black">Software Solutions</p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
