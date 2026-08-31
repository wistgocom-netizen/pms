'use client';

import { useState, useMemo, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Product, CartItem, Sale } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Save, PlusCircle, Search, Barcode, List, ShoppingCart as CartIcon, Loader2 } from 'lucide-react';
import { WholesalePaymentDialog } from './wholesale-payment-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PaymentSuccessDialog } from '../components/payment-success-dialog';
import { Receipt } from '../components/receipt';
import { DataTable } from '../components/data-table';
import { getWholesaleCartColumns } from './columns';
import { SavedOrdersDialog } from './saved-orders-dialog';
import { ProductCard } from '../components/product-card';
import { BarcodeScannerDialog } from '../components/barcode-scanner-dialog';
import { cn } from '@/lib/utils';
import { Invoice } from './invoice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type CompletedOrder = {
    items: CartItem[];
    total: number;
    subtotal: number;
    taxes: number;
    discount: number;
    saleDate: Date;
    paymentMethod: string;
    paymentDetails: any;
};

export default function WholesalePage() {
  const { products, formatCurrency, t, addWholesaleSale, userProfile, organizations, deleteSale, customers, taxRate, isLoading } = useStore();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderDiscountPercentage, setOrderDiscountPercentage] = useState(0);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [lastPaidOrder, setLastPaidOrder] = useState<CompletedOrder | null>(null);
  const [isSavedListOpen, setIsSavedListOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('walk-in');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [printType, setPrintType] = useState<'receipt' | 'invoice' | null>(null);

  const stats = useMemo(() => {
    let calculatedSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let calculatedItemDiscount = cartItems.reduce((acc, item) => acc + (item.price * (item.discount || 0) / 100) * item.quantity, 0);
    
    const amountAfterItemDiscounts = Math.max(0, calculatedSubtotal - calculatedItemDiscount);
    const calculatedOrderDiscountAmount = amountAfterItemDiscounts * (orderDiscountPercentage / 100);
    
    const calculatedTotalDiscount = calculatedItemDiscount + calculatedOrderDiscountAmount;
    const taxableAmount = Math.max(0, calculatedSubtotal - calculatedTotalDiscount);
    const calculatedTaxes = taxableAmount * (taxRate / 100);
    const calculatedTotal = taxableAmount + calculatedTaxes;

    return { 
        subtotal: calculatedSubtotal, 
        taxes: calculatedTaxes, 
        itemDiscount: calculatedItemDiscount,
        orderDiscountAmount: calculatedOrderDiscountAmount,
        totalDiscount: calculatedTotalDiscount, 
        total: calculatedTotal 
    };
  }, [cartItems, taxRate, orderDiscountPercentage]);

  const { subtotal, taxes, totalDiscount, total } = stats;

  const proformaOrder = useMemo(() => ({
    id: `DRAFT-${Date.now()}`,
    items: cartItems,
    subtotal: subtotal,
    taxes: taxes,
    discount: totalDiscount,
    total: total,
    saleDate: new Date(),
  }), [cartItems, subtotal, taxes, totalDiscount, total]);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);
  const customerName = useMemo(() => selectedCustomer ? (selectedCustomer.name || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`) : t('Walk-in Customer'), [selectedCustomer, t]);
  const storeName = useMemo(() => userProfile?.organizationId ? (organizations.find(o => o.id === userProfile.organizationId)?.name || 'Adyfire') : 'Adyfire', [userProfile, organizations]);

  const handleUpdateQuantity = useCallback((lineItemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => item.lineItemId === lineItemId ? { ...item, quantity: newQuantity } : item).filter(item => item.quantity > 0));
  }, []);

  const handleUpdateDiscount = useCallback((lineItemId: string, newDiscountPercentage: number) => {
    setCartItems(prev => prev.map(item => item.lineItemId === lineItemId ? { ...item, discount: newDiscountPercentage } : item));
  }, []);

  const handleRemoveItem = useCallback((lineItemId: string) => {
    setCartItems(prev => prev.filter(item => item.lineItemId !== lineItemId));
  }, []);

  const handleAddItemToCart = useCallback((item: Omit<CartItem, 'lineItemId'>) => {
    setCartItems(prev => {
        const existingItemIndex = prev.findIndex(
            i => i.id === item.id && i.price === item.price && (i.discount || 0) === (item.discount || 0)
        );

        if (existingItemIndex > -1) {
            const newCart = [...prev];
            const existingItem = newCart[existingItemIndex];
            newCart[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + item.quantity };
            return newCart;
        } else {
            const newCartItem: CartItem = {
                ...item,
                lineItemId: `cart-item-${Date.now()}-${Math.random()}`
            };
            return [...prev, newCartItem];
        }
    });
    toast({
        title: t("Item Added"),
        description: t('{quantity} x {name} added to cart.', { quantity: item.quantity, name: item.name }),
    });
  }, [toast, t]);

  const columns = useMemo(() => getWholesaleCartColumns(formatCurrency, handleUpdateQuantity, handleUpdateDiscount, handleRemoveItem, t), [formatCurrency, handleUpdateQuantity, handleUpdateDiscount, handleRemoveItem, t]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
        const lowercasedSearchTerm = productSearchTerm.toLowerCase();
        return !productSearchTerm || 
                product.name.toLowerCase().includes(lowercasedSearchTerm) || 
                product.id.toLowerCase().includes(lowercasedSearchTerm);
    });
  }, [productSearchTerm, products]);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setOrderDiscountPercentage(0);
    setSelectedCustomerId('walk-in');
    toast({
      title: t('New Order'),
      description: t('The cart has been cleared.'),
    });
  }, [t, toast]);

  const handlePrint = useCallback((type: 'receipt' | 'invoice' = 'receipt') => {
    setPrintType(type);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintType(null), 1000);
    }, 250);
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentData: any, shouldPrint = false) => {
    const saleData = {
      items: cartItems,
      subtotal,
      taxes,
      total,
      discountAmount: totalDiscount,
      ...paymentData,
    };
    await addWholesaleSale(saleData);
    
    const completedOrder: CompletedOrder = {
        items: [...cartItems],
        total: total,
        subtotal: subtotal,
        taxes: taxes,
        discount: totalDiscount,
        saleDate: new Date(),
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: paymentData.paymentDetails,
    };
    
    setLastPaidOrder(completedOrder);
    toast({ title: t('Sale Completed'), description: t('The wholesale order has been recorded.') });
    setIsPaymentOpen(false);
    
    setCartItems([]);
    setOrderDiscountPercentage(0);
    setSelectedCustomerId('walk-in');

    if (shouldPrint) {
        handlePrint('receipt');
    } else {
        setIsSuccessDialogOpen(true);
    }
  }, [cartItems, subtotal, taxes, total, totalDiscount, addWholesaleSale, t, toast, handlePrint]);

  const handleSaveDraftSuccess = useCallback(() => {
    setCartItems([]);
    setOrderDiscountPercentage(0);
    setSelectedCustomerId('walk-in');
  }, []);

  const handleNewSale = useCallback(() => {
    setIsSuccessDialogOpen(false);
    setLastPaidOrder(null);
  }, []);

  const handleLoadOrder = useCallback((order: Sale) => {
    const loadedCartItems: CartItem[] = (order.items || []).map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
            ...(product || {} as Product),
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            quantity: item.quantity,
            discount: item.discount,
            lineItemId: `cart-item-${Date.now()}-${Math.random()}`,
        }
    });
    setCartItems(loadedCartItems);
    setSelectedCustomerId(order.customerId || 'walk-in');

    const itemDiscountTotalAmount = (order.items || []).reduce((acc, item) => acc + (item.unitPrice * (item.discount || 0) / 100) * item.quantity, 0);
    const orderDiscountAmt = Math.max(0, order.discountAmount - itemDiscountTotalAmount);
    
    const loadedSubtotal = loadedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const amountAfterItems = Math.max(0, loadedSubtotal - itemDiscountTotalAmount);
    
    if (amountAfterItems > 0) {
        setOrderDiscountPercentage((orderDiscountAmt / amountAfterItems) * 100);
    } else {
        setOrderDiscountPercentage(0);
    }

    deleteSale(order.id);
    toast({ title: t('Order Loaded'), description: t('The saved order has been loaded into the cart.') });
  }, [products, deleteSale, t, toast]);

  const handleAddToCartFromGrid = useCallback((product: Product) => {
    handleAddItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        discount: 0,
        emoji: product.emoji,
        category: product.category,
        stock: product.stock,
    });
  }, [handleAddItemToCart]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.wholesale;

  if (!canAccess) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  const ProductListContent = (
    <div className="flex flex-col space-y-4 h-full min-h-0 overflow-hidden">
        <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder={t('Search products...')} 
                className="pl-10 pr-12"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
            />
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" 
                onClick={() => setIsScannerOpen(true)}
            >
                <Barcode className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex-grow min-h-0 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 pb-4">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={() => handleAddToCartFromGrid(product)}
                        className="scale-95 sm:scale-100"
                    />
                ))}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        <p>{t('No products found.')}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const OrderSummaryContent = (
    <Card className="flex flex-col w-full h-full min-h-0 overflow-hidden">
        <CardHeader className="shrink-0 p-4 md:p-6">
            <CardTitle className="font-headline text-xl md:text-2xl">{t('Current Order')}</CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground">{t('Customer')}: <span className="font-semibold">{customerName}</span></p>
        </CardHeader>
        <CardContent className="p-0 flex-grow min-h-0 overflow-hidden">
            {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 h-full">
                    <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-4">
                        <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold">{t('Cart is empty')}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{t('Add products from the grid or use the bar below.')}</p>
                </div>
            ) : (
                <div className="h-full overflow-auto">
                    <DataTable
                        columns={columns}
                        data={cartItems}
                        columnFilters={[]}
                        onColumnFiltersChange={() => {}}
                        paginated={false}
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex-col items-end p-4 md:p-6 border-t shrink-0 bg-card">
            <div className="w-full max-w-sm space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span className="font-mono">{(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <Label htmlFor="order-discount" className="cursor-pointer text-xs md:text-sm">{t('Order Discount (%)')}</Label>
                    <div className="flex items-center gap-1">
                        <Input 
                            id="order-discount" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            max="100"
                            value={orderDiscountPercentage > 0 ? orderDiscountPercentage : ''} 
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setOrderDiscountPercentage(isNaN(val) || val < 0 ? 0 : (val > 100 ? 100 : val));
                            }} 
                            className="h-7 w-20 md:h-8 md:w-24 text-right pr-2 text-xs" 
                            placeholder="0" 
                        />
                        <span className="text-xs font-medium">%</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span>{t('Tax')} ({taxRate}%)</span>
                    <span className="font-mono">{(taxes).toFixed(2)}</span>
                </div>
                <Separator className="my-1 md:my-2" />
                <div className="flex justify-between font-bold text-base md:text-lg">
                    <span>{t('Total')}</span>
                    <span className="font-mono">{(total).toFixed(2)}</span>
                </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-6 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none h-10" onClick={() => handlePrint('invoice')}>
                    {t('Print Invoice')}
                </Button>
                <Button className="flex-1 sm:flex-none min-w-[100px] md:min-w-[120px] h-10" onClick={() => setIsPaymentOpen(true)} disabled={cartItems.length === 0}>
                    {t('Pay')} {(total).toFixed(2)}
                </Button>
            </div>
        </CardFooter>
    </Card>
  );

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page { margin: 0 !important; size: auto; }
            body { margin: 0 !important; padding: 0 !important; background: white !important; width: 100% !important; visibility: hidden !important; }
            
            .non-printable, header, nav, footer, aside, button { 
                display: none !important; 
                visibility: hidden !important; 
            }

            ${printType === 'receipt' ? `
                @page { size: 80mm auto !important; }
                .printable-receipt { 
                    visibility: visible !important; 
                    display: block !important;
                    position: absolute !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 80mm !important; 
                    z-index: 999999 !important;
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
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
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .printable-invoice * { 
                    visibility: visible !important; 
                }
            ` : ''}
        }
    `}} />

    <div className="h-[calc(100vh-160px)] flex flex-col overflow-hidden non-printable">
      <div className="flex justify-between items-center mb-4 shrink-0 px-1">
        <h1 className="text-xl md:text-3xl font-headline font-bold truncate pr-2">{t('Wholesale Checkout')}</h1>
        <div className="flex items-center gap-1.5 md:gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsSavedListOpen(true)} className="h-8 md:h-10 px-2 md:px-4">
                <Save className="md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('Saved List')}</span>
            </Button>
            <Button size="sm" onClick={handleClearCart} className="h-8 md:h-10 px-2 md:px-4">
                <PlusCircle className="md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('New Order')}</span>
            </Button>
        </div>
      </div>
      
      <div className="flex-grow min-h-0 overflow-hidden">
          {/* Mobile and Tablet (up to xl) view */}
          <div className="h-full flex flex-col xl:hidden">
              <Tabs defaultValue="products" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                      <TabsTrigger value="products" className="gap-2">
                          <List className="h-4 w-4" />
                          {t('Products')}
                      </TabsTrigger>
                      <TabsTrigger value="cart" className="gap-2">
                          <CartIcon className="h-4 w-4" />
                          {t('Order')} {cartItems.length > 0 && <span className="bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5">{cartItems.length}</span>}
                      </TabsTrigger>
                  </TabsList>
                  <TabsContent value="products" className="flex-grow min-h-0 focus-visible:outline-none data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                      {ProductListContent}
                  </TabsContent>
                  <TabsContent value="cart" className="flex-grow min-h-0 focus-visible:outline-none data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                      {OrderSummaryContent}
                  </TabsContent>
              </Tabs>
          </div>

          {/* Desktop view (xl and above) */}
          <div className="hidden xl:grid grid-cols-2 gap-6 h-full min-h-0 overflow-hidden">
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  {ProductListContent}
              </div>
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                  {OrderSummaryContent}
              </div>
          </div>
      </div>
    </div>
    
    <WholesalePaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        totalAmount={total}
        subtotal={subtotal}
        taxes={taxes}
        totalDiscount={totalDiscount}
        onPaymentSuccess={handlePaymentSuccess}
        customerId={selectedCustomerId}
        items={cartItems}
        storeName={storeName}
        onSaveDraftSuccess={handleSaveDraftSuccess}
        onPrint={handlePrint}
    />
    
    <PaymentSuccessDialog 
        open={isSuccessDialogOpen} 
        onOpenChange={setIsSuccessDialogOpen} 
        onNewSale={handleNewSale} 
        onPrint={() => handlePrint('receipt')}
    />

    <SavedOrdersDialog 
        open={isSavedListOpen} 
        onOpenChange={setIsSavedListOpen} 
        onLoadOrder={handleLoadOrder} 
    />
    
    <div className={cn("hidden print:block")}>
        {printType === 'receipt' && (
            <div className="printable-receipt">
                <Receipt order={(lastPaidOrder || proformaOrder) as any} />
            </div>
        )}
        {printType === 'invoice' && (
            <div className="printable-invoice">
                <Invoice 
                    order={proformaOrder as any} 
                    storeName={storeName} 
                    customerName={customerName}
                    customerAddress={selectedCustomer?.address}
                />
            </div>
        )}
    </div>

    <BarcodeScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScan={handleAddToCartFromGrid}
    />
    </>
  );
}
