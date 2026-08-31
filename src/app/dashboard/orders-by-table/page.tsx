
'use client';

import { useStore } from '@/context/StoreContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, PlusCircle, ChefHat } from 'lucide-react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import type { Sale, Customer } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderCard } from './order-card';
import { OrderDetailsDialog } from './order-details-dialog';
import { PaymentDialog, PaymentMethod } from '../components/payment-dialog';
import { PaymentSuccessDialog } from '../components/payment-success-dialog';
import { Receipt } from '../components/receipt';
import { Invoice } from '../components/invoice';
import { NewOrderDialog } from './new-order-dialog';
import { useKitchenDisplay } from '@/hooks/use-kitchen-display';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type OrderStatus = 'Approved' | 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
const allStatuses: OrderStatus[] = ['Approved', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function OrdersByTablePage() {
  const { sales, customers, updateSaleDetails, storeName, t, userProfile } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [lastPaidOrder, setLastPaidOrder] = useState<Sale & { customerName?: string } | null>(null);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const { updateDisplay: updateKitchenDisplay, openDisplay: openKitchenDisplay } = useKitchenDisplay();
  const [activeStatuses, setActiveStatuses] = useState<Set<OrderStatus>>(new Set(['Approved', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled']));
  const [printType, setPrintType] = useState<'receipt' | 'invoice' | null>(null);

  const ordersWithCustomer = useMemo(() => {
    if (!sales || !customers) return [];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return sales
      .filter(sale => {
        if (sale.orderType !== 'dine-in' || !sale.saleDate) {
            return false;
        }
        const saleDate = sale.saleDate;
        return saleDate >= yesterday;
      })
      .map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const customerName = sale.customerName || (customer ? (customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()) : t('Walk-in Customer'));
      return {
        ...sale,
        customer,
        customerName,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
      };
    });
  }, [sales, customers, t]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return ordersWithCustomer.find(order => order.id === selectedOrderId) || null;
  }, [selectedOrderId, ordersWithCustomer]);
  
  const filteredOrders = useMemo(() => {
    return ordersWithCustomer.filter(order => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (order.customerName || t('Walk-in Customer')).toLowerCase().includes(lowerSearch) ||
        order.id.toLowerCase().includes(lowerSearch) ||
        (order.tableNumber || '').toLowerCase().includes(lowerSearch) ||
        (order.items || []).some(item => item.productName.toLowerCase().includes(lowerSearch))
      );
    });
  }, [ordersWithCustomer, searchTerm, t]);

  useEffect(() => {
    const ordersForKitchen = filteredOrders
      .map(order => ({
        ...order,
        items: order.items?.filter(item => !item.isPrepared),
      }))
      .filter(order => order.status === 'Approved' || order.status === 'New' || (order.items && order.items.length > 0));
    
    updateKitchenDisplay({ orders: ordersForKitchen });
  }, [filteredOrders, updateKitchenDisplay]);

  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, (Sale & { customerName?: string })[]> = {
      Approved: [],
      New: [],
      Preparing: [],
      Ready: [],
      Completed: [],
      Cancelled: [],
    };
    filteredOrders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });
    return grouped;
  }, [filteredOrders]);

  const handleSelectOrder = (order: Sale & { customer?: Customer }) => {
    setSelectedOrderId(order.id);
  };
  
  const handleOrderCreated = useCallback((order: Sale) => {
    setSelectedOrderId(order.id);
  }, []);

  const handlePayBill = () => {
    if (!selectedOrder) return;
    setIsPaymentDialogOpen(true);
  };
  
  const handlePaymentSuccess = (paymentMethod: PaymentMethod, customerId: string) => {
    if (!selectedOrder) return;
    
    const totalAmount = selectedOrder.totalAmount;

    updateSaleDetails(selectedOrder.id, { 
      paymentMethod, 
      status: 'Completed',
      totalAmount: totalAmount,
      items: selectedOrder.items,
      taxes: selectedOrder.taxes,
      discountAmount: selectedOrder.discountAmount,
      serviceCharge: selectedOrder.serviceCharge,
    });
    
    const paidOrder = { ...selectedOrder, saleDate: new Date(), totalAmount: totalAmount }; 
    setLastPaidOrder(paidOrder);
    
    setIsPaymentDialogOpen(false);
    setSelectedOrderId(null);
    setIsSuccessDialogOpen(true);
  };
  
  const handleNewSale = () => {
    setIsSuccessDialogOpen(false);
    setLastPaidOrder(null);
  };

  const handlePrint = useCallback((type: 'receipt' | 'invoice') => {
    setPrintType(type);
    setTimeout(() => {
        window.print();
        setTimeout(() => setPrintType(null), 500);
    }, 250);
  }, []);

  const handleStatusToggle = (status: OrderStatus) => {
    setActiveStatuses(prev => {
        const newSet = new Set(prev);
        if (newSet.has(status)) {
            newSet.delete(status);
        } else {
            newSet.add(status);
        }
        return newSet;
    });
  };

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.orderBoard;

  if (!canAccess) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page { margin: 10mm; size: auto; }
            body { margin: 0; padding: 0; background: white !important; width: 100% !important; visibility: hidden !important; }
            
            .non-printable, header, nav, footer, aside, button, [data-sidebar="sidebar"] { 
                display: none !important; 
                visibility: hidden !important; 
            }

            ${printType === 'receipt' ? `
                @page { size: 80mm auto !important; margin: 0 !important; }
                .printable-receipt { 
                    visibility: visible !important; 
                    display: flex !important;
                    position: fixed !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 80mm !important; 
                    justify-content: flex-start !important;
                    z-index: 999999 !important;
                    background: white !important;
                }
                .printable-receipt * { 
                    visibility: visible !important; 
                }
            ` : ''}

            ${printType === 'invoice' ? `
                @page { size: A4 !important; }
                .printable-invoice { 
                    visibility: visible !important; 
                    display: block !important;
                    position: absolute !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 100% !important; 
                    z-index: 999999 !important; 
                    background: white !important;
                }
                .printable-invoice * { 
                    visibility: visible !important; 
                }
            ` : ''}
        }
      `}} />

      <div className="h-full flex flex-col non-printable">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Order Board')}</h1>
            <p className="text-muted-foreground">{t('A real-time overview of your current orders.')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder={t('Search orders...')}
                className="pl-10 w-full sm:w-48 md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="h-10 gap-2 px-4" onClick={() => openKitchenDisplay()}>
                    <ChefHat className="h-4 w-4" />
                    <span>Kitchen Display</span>
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    {t('Filter')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>{t('Filter by Status')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allStatuses.map(status => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        checked={activeStatuses.has(status)}
                        onCheckedChange={() => handleStatusToggle(status)}
                    >
                        {t(status)}
                    </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => setIsNewOrderDialogOpen(true)} className="w-full h-10">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('New Order')}
                </Button>
            </div>
          </div>
        </header>

        <div className="grid flex-grow gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {allStatuses.filter(status => activeStatuses.has(status)).map(status => (
            <div key={status} className="bg-muted/50 rounded-lg flex flex-col">
              <h2 className="p-3 text-sm font-semibold tracking-wider border-b">{t(status)} ({ordersByStatus[status].length})</h2>
              <ScrollArea className="flex-grow">
                <div className="p-3 space-y-3">
                  {ordersByStatus[status].map(order => (
                    <OrderCard key={order.id} order={order} onSelectOrder={handleSelectOrder} />
                  ))}
                   {ordersByStatus[status].length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-10">
                          {t('No {status} orders.', { status: t(status).toLowerCase() })}
                      </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
      
      <OrderDetailsDialog 
          order={selectedOrder}
          open={!!selectedOrderId}
          onOpenChange={(open) => { if (!open) setSelectedOrderId(null) }}
          onPayBill={handlePayBill}
      />

      {selectedOrder && (
        <PaymentDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            totalAmount={selectedOrder.totalAmount}
            itemCount={selectedOrder.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
            onPaymentSuccess={handlePaymentSuccess}
            customer={selectedOrder.customer}
        />
      )}

      <PaymentSuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        onNewSale={handleNewSale}
        onPrint={() => handlePrint('receipt')}
      />

      <div className="hidden print:block">
        {lastPaidOrder && printType === 'receipt' && (
            <div className="printable-receipt">
                <Receipt order={{
                    ...lastPaidOrder,
                    subtotal: lastPaidOrder.totalAmount - lastPaidOrder.taxes + lastPaidOrder.discountAmount - (lastPaidOrder.serviceCharge || 0),
                    taxes: lastPaidOrder.taxes,
                    discount: lastPaidOrder.discountAmount,
                    total: lastPaidOrder.totalAmount,
                    serviceCharge: lastPaidOrder.serviceCharge,
                }} />
            </div>
        )}
        {lastPaidOrder && printType === 'invoice' && (
            <div className="printable-invoice">
                <Invoice 
                    order={{
                        ...lastPaidOrder,
                        subtotal: lastPaidOrder.totalAmount - lastPaidOrder.taxes + lastPaidOrder.discountAmount - (lastPaidOrder.serviceCharge || 0),
                        taxes: lastPaidOrder.taxes,
                        discount: lastPaidOrder.discountAmount,
                        total: lastPaidOrder.totalAmount,
                        serviceCharge: lastPaidOrder.serviceCharge,
                    }} 
                    storeName={storeName}
                    customerName={lastPaidOrder.customerName || t('Walk-in Customer')}
                />
            </div>
        )}
      </div>

       <NewOrderDialog
        open={isNewOrderDialogOpen}
        onOpenChange={setIsNewOrderDialogOpen}
        onOrderCreated={handleOrderCreated}
      />
    </>
  );
}
