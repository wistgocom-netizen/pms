
'use client';

import { useStore } from '@/context/StoreContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

export function InvoicePreview() {
  const { storeName, storeAddress, storePhone, storeEmail, organization } = useStore();
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScale(0.25);
      else if (width < 1024) setScale(0.4);
      else if (width < 1280) setScale(0.5);
      else setScale(0.6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = organization?.invoiceSettings || {
    showLogo: false,
    termsAndConditions: [
        "Payment is due within 30 days.",
        "Goods once sold are not returnable."
    ],
    accentColor: '#3F51B5',
  };

  const previewDate = new Date();
  
  const mockItems = Array.from({ length: 40 }).map((_, i) => ({
    code: `HSN-${1000 + i}`,
    name: `Wholesale Item Description ${i + 1}`,
    qty: i % 5 + 1,
    price: 1500 + (i * 10),
    discount: i % 5 === 0 ? 10 : (i % 3 === 0 ? 5 : 0)
  }));

  const subtotal = mockItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalDiscount = mockItems.reduce((acc, i) => acc + (i.price * (i.discount / 100)) * i.qty, 0);
  const taxableAmount = subtotal - totalDiscount;
  const tax = taxableAmount * 0.08; 
  const total = taxableAmount + tax;

  return (
    <div className="w-full bg-muted/30 rounded-lg border border-dashed overflow-hidden h-[600px] sm:h-[850px] relative">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col items-start py-8 min-h-full pl-4">
          <div 
            style={{ 
              width: `${210 * scale}mm`, 
              height: `${297 * scale}mm`,
              position: 'relative',
              transition: 'all 0.3s ease-out',
            }}
          >
            <div 
              className="bg-white text-black shadow-2xl w-[210mm] min-h-[297mm] flex flex-col p-[15mm] origin-top-left text-left"
              style={{ 
                fontFamily: 'sans-serif',
                transform: `scale(${scale})`,
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: '10px'
              }}
            >
              <header className="flex justify-between items-start mb-6 text-left">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter" style={{ color: settings.accentColor }}>{storeName}</h1>
                  <p className="text-[9px] text-gray-500 mt-1 max-w-[250px]">{storeAddress || 'Store Address Configured in Settings'}</p>
                  <p className="text-[9px] text-gray-500">Tel: {storePhone || 'Phone Not Set'} | Email: {storeEmail || 'Email Not Set'}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-gray-800 uppercase tracking-widest leading-none">Invoice</h2>
                  <p className="mt-2 text-[10px] text-gray-600 font-bold">Inv No: #INV-2024-001</p>
                  <p className="text-[10px] text-gray-600">Date: {format(previewDate, 'dd/MM/yyyy')}</p>
                </div>
              </header>

              <section className="mb-6 text-left">
                  <div className="border border-gray-300 p-3 rounded bg-gray-50/50 max-w-[280px]">
                      <h3 className="font-bold text-gray-700 mb-1 text-[9px] uppercase tracking-wider border-b pb-1">Bill To:</h3>
                      <p className="font-bold text-gray-900 text-[11px]">Acme Wholesale Distribution</p>
                      <p className="text-gray-600 text-[9px] leading-tight mt-1">45 Merchant Lane, City Center,<br />Colombo 01, Sri Lanka</p>
                  </div>
              </section>

              <section className="flex-grow">
                  <table className="w-full border-collapse text-gray-800">
                    <thead>
                      <tr className="bg-gray-100" style={{ borderBottom: `2px solid ${settings.accentColor}` }}>
                        <th className="border border-gray-300 p-1 text-left w-8 font-bold uppercase">S.No</th>
                        <th className="border border-gray-300 p-1 text-left w-24 font-bold uppercase">Code</th>
                        <th className="border border-gray-300 p-1 text-left font-bold uppercase">Description</th>
                        <th className="border border-gray-300 p-1 text-right w-12 font-bold uppercase">Qty</th>
                        <th className="border border-gray-300 p-1 text-right w-24 font-bold uppercase">Rate</th>
                        <th className="border border-gray-300 p-1 text-right w-16 font-bold uppercase">Disc%</th>
                        <th className="border border-gray-300 p-1 text-right w-32 font-bold uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockItems.map((item, index) => (
                        <tr key={index} className="even:bg-gray-50/30 h-6">
                          <td className="border border-gray-200 p-1 text-center text-[9px] text-gray-500">{index + 1}</td>
                          <td className="border border-gray-200 p-1 font-mono text-[9px]">{item.code}</td>
                          <td className="border border-gray-200 p-1 truncate max-w-[220px]">{item.name}</td>
                          <td className="border border-gray-200 p-1 text-right font-medium">{item.qty}</td>
                          <td className="border border-gray-200 p-1 text-right text-gray-600 font-mono">{item.price.toFixed(2)}</td>
                          <td className="border border-gray-200 p-1 text-right text-destructive">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                          <td className="border border-gray-200 p-1 text-right font-bold font-mono">
                              {(item.price * (1 - item.discount / 100) * item.qty).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2" style={{ borderColor: settings.accentColor }}>
                      <tr className="bg-white">
                        <td colSpan={6} className="p-1 text-right font-bold uppercase text-[9px] text-gray-500">Subtotal</td>
                        <td className="border border-gray-200 p-1 text-right font-bold text-[10px] font-mono">{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan={6} className="p-1 text-right font-bold uppercase text-[9px] text-gray-500">Total Discount</td>
                        <td className="border border-gray-200 p-1 text-right font-bold text-[10px] text-destructive font-mono">-{totalDiscount.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan={6} className="p-1 text-right font-bold uppercase text-[9px] text-gray-500">Tax</td>
                        <td className="border border-gray-200 p-1 text-right font-bold text-[10px] font-mono">{tax.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-100/50">
                        <td colSpan={6} className="p-2 text-right font-bold uppercase text-[11px] text-gray-700">Total Payable</td>
                        <td className="border border-gray-300 p-2 text-right font-black text-[14px] font-mono" style={{ color: settings.accentColor }}>
                          {total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
              </section>

              <footer className="mt-8 text-[9px] text-gray-600 text-left">
                  <div className="grid grid-cols-2 gap-12">
                      <div>
                          <h4 className="font-bold uppercase mb-2 border-b pb-1 inline-block" style={{ borderColor: settings.accentColor }}>Terms & Conditions:</h4>
                          {settings.termsAndConditions && settings.termsAndConditions.length > 0 ? (
                              <ul className="list-decimal pl-4 space-y-1">
                                  {settings.termsAndConditions.map((term, i) => (
                                      <li key={i}>{term}</li>
                                  ))}
                              </ul>
                          ) : (
                              <p className="italic text-gray-400">1. Payment is due within 30 days.<br />2. Goods once sold are not returnable.</p>
                          )}
                      </div>
                      <div className="flex flex-col justify-end">
                          <div className="flex justify-between items-end pb-4 gap-6">
                              <div className="text-center flex-1">
                                  <div className="border-t border-gray-400 pt-1">
                                      <p className="text-[8px] font-bold uppercase text-gray-500">Authorized Signatory</p>
                                  </div>
                              </div>
                              <div className="text-center flex-1">
                                  <div className="border-t border-gray-400 pt-1">
                                      <p className="text-[8px] font-bold uppercase text-gray-500">Customer Signature</p>
                                  </div>
                              </div>
                          </div>
                          <div className="mt-4 text-center pt-2 border-t border-dotted border-gray-300">
                              <p className="font-brand text-[10px] tracking-widest text-black">Adyfire</p>
                              <p className="text-[7px] opacity-50 uppercase text-black">Software Solutions</p>
                          </div>
                      </div>
                  </div>
              </footer>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
