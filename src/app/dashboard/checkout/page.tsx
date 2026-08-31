'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Product, CartItem, Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Barcode, 
    Search, 
    List, 
    ShoppingCart as CartIcon, 
    Loader2, 
    Bed, 
    User,
    Package,
    X
} from 'lucide-react';
import { ProductCard } from '../components/product-card';
import { BarcodeScannerDialog } from '../components/barcode-scanner-dialog';
import { Cart } from '../components/cart';
import { useToast } from '@/hooks/use-toast';
import { useCustomerDisplay } from '@/hooks/use-customer-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const { products, categories: allCategories, taxRate, t, userProfile, isLoading, rooms, bookings, storeName } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    document.title = `POS - ${storeName || 'Adyfire'}`;
  }, [storeName]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  
  const [orderDiscountPercentage, setOrderDiscountPercentage] = useState(0);
  const { updateDisplay } = useCustomerDisplay();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const activeBooking = useMemo(() => {
    if (!selectedRoomId) return null;
    return (bookings || []).find(b => b.roomId === selectedRoomId && b.status === 'active');
  }, [selectedRoomId, bookings]);

  const stats = useMemo(() => {
    let calculatedSubtotal = 0;
    let calculatedItemDiscount = 0;

    cartItems.forEach(item => {
        calculatedSubtotal += item.price * item.quantity;
        if (item.discount) {
            calculatedItemDiscount += (item.price * (item.discount || 0) / 100) * item.quantity;
        }
    });

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

  useEffect(() => {
    updateDisplay({ items: cartItems, subtotal, taxes, totalDiscount, total });
  }, [cartItems, subtotal, taxes, totalDiscount, total, updateDisplay]);


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
  
  const handleAddToCart = useCallback((product: Product) => {
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

  const handleHIDScan = useCallback((scannedCode: string) => {
    const product = (products || []).find(p => p.id === scannedCode);
    if (product) {
        handleAddToCart(product);
    } else {
        if (scannedCode) {
            toast({
                variant: 'destructive',
                title: t('Product Not Found'),
                description: t('No product found with barcode: {scannedCode}.', { scannedCode }),
            });
        }
    }
  }, [products, handleAddToCart, toast, t]);

  useEffect(() => {
    let barcode = '';
    let timer: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') return;
        
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) return;
        
        if (event.key === 'Enter') {
            if (barcode.length > 2) handleHIDScan(barcode);
            barcode = '';
            return;
        }

        if(event.key.length === 1) barcode += event.key;

        clearTimeout(timer);
        timer = setTimeout(() => { barcode = ''; }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
    };
  }, [handleHIDScan]);

  const handleUpdateQuantity = useCallback((lineItemId: string, newQuantity: number) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.lineItemId === lineItemId ? { ...item, quantity: newQuantity } : item
        )
        .filter(item => item.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((lineItemId: string) => {
    setCartItems(prev => prev.filter(item => item.lineItemId !== lineItemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setOrderDiscountPercentage(0);
    setSelectedRoomId(null);
  }, []);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(product => {
      const matchesCategory = activeCategory === null || product.category === activeCategory;
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(lowercasedSearchTerm) || product.id.toLowerCase().includes(lowercasedSearchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, products]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.ordering;

  if (!canAccess) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  const ProductSelectionContent = (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0 px-1">
            <h1 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">POS</h1>
            <Badge variant="outline" className="font-mono text-[10px] h-6 px-2">{filteredProducts.length} Items</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 shrink-0 px-1">
            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <Bed className="h-3 w-3" /> {t('Select Room')}
                </Label>
                <Select value={selectedRoomId || 'none'} onValueChange={v => setSelectedRoomId(v === 'none' ? null : v)}>
                    <SelectTrigger className="h-10 bg-card shadow-sm border-none text-xs font-bold ring-1 ring-border/50">
                        <SelectValue placeholder={t('Walk-in (Retail)')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" className="text-xs">{t('Walk-in (Retail)')}</SelectItem>
                        {rooms.map(room => {
                            const booking = bookings.find(b => b.roomId === room.id && b.status === 'active');
                            return (
                                <SelectItem key={room.id} value={room.id} className="text-xs">
                                    Room {room.id} {booking ? `(${booking.guestName})` : ''}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <Search className="h-3 w-3" /> {t('Quick Find')}
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={t('Name or SKU...')} 
                        className="pl-9 pr-12 h-10 bg-card shadow-sm border-none text-xs font-medium ring-1 ring-border/50" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {searchTerm && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSearchTerm('')}>
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setIsScannerOpen(true)}>
                            <Barcode className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {activeBooking && (
            <div className="px-1 mb-4">
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-primary tracking-tighter leading-none mb-1">Billing to Guest</p>
                            <p className="font-black text-xs">{activeBooking.guestName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Booking ID</p>
                        <p className="font-mono text-[10px] font-bold text-primary">{activeBooking.id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-2 no-scrollbar mb-4 shrink-0">
            {(allCategories || []).map((category: Category) => {
                const isAllItems = category.name === 'All Items';
                const currentCategoryName = isAllItems ? null : category.name;
                return (
                    <Button
                        key={category.id}
                        variant={activeCategory === currentCategoryName ? 'default' : 'secondary'}
                        onClick={() => setActiveCategory(currentCategoryName)}
                        className={cn(
                            "shrink-0 h-9 text-[11px] font-black uppercase tracking-wider rounded-full px-5 border-none shadow-sm",
                            activeCategory === currentCategoryName ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {isAllItems ? (
                            <List className="mr-2 h-3.5 w-3.5" />
                        ) : category.emoji ? (
                            <span className="mr-2 text-sm" role="img" aria-label={category.name}>{category.emoji}</span>
                        ) : (
                            <Package className="mr-2 h-3.5 w-3.5" />
                        )}
                        {category.name}
                    </Button>
                );
            })}
        </div>

        <ScrollArea className="flex-grow">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-10 px-1">
            {filteredProducts.map((product) => (
                <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                className="scale-95 sm:scale-100 h-full"
                />
            ))}
            {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                    <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold text-sm">No items found matching your search.</p>
                </div>
            )}
            </div>
        </ScrollArea>
    </div>
  );

  const OrderSummaryContent = (
    <div className="h-full min-h-0 overflow-hidden flex flex-col">
        <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            subtotal={subtotal}
            taxes={taxes}
            itemDiscount={0}
            totalDiscount={totalDiscount}
            total={total}
            orderDiscountPercentage={orderDiscountPercentage}
            setOrderDiscountPercentage={setOrderDiscountPercentage}
            orderDiscountAmount={0}
            tableNumber={selectedRoomId || undefined}
            customerName={activeBooking?.guestName}
            customerId={activeBooking?.id}
        />
    </div>
  );

  return (
    <>
      <div className="h-[calc(100vh-160px)] flex flex-col overflow-hidden">
          {/* Mobile and Tablet view */}
          <div className="flex-grow min-h-0 xl:hidden overflow-hidden non-printable">
              <Tabs defaultValue="products" className="h-full flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0 bg-muted/50 p-1 rounded-xl">
                      <TabsTrigger value="products" className="gap-2 rounded-lg text-xs font-black uppercase tracking-tight data-[state=active]:shadow-lg">
                          <List className="h-3.5 w-3.5" />
                          {t('Products')}
                      </TabsTrigger>
                      <TabsTrigger value="cart" className="gap-2 rounded-lg text-xs font-black uppercase tracking-tight data-[state=active]:shadow-lg">
                          <CartIcon className="h-3.5 w-3.5" />
                          {t('Cart')} {cartItems.length > 0 && <Badge variant="default" className="h-4 min-w-[1rem] px-1 text-[9px] font-black">{cartItems.length}</Badge>}
                      </TabsTrigger>
                  </TabsList>
                  <TabsContent value="products" className="flex-grow min-h-0 focus-visible:outline-none data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                      {ProductSelectionContent}
                  </TabsContent>
                  <TabsContent value="cart" className="flex-grow min-h-0 focus-visible:outline-none data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                      {OrderSummaryContent}
                  </TabsContent>
              </Tabs>
          </div>

          {/* Desktop view */}
          <div className="hidden xl:grid grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
              <div className="col-span-2 flex flex-col overflow-hidden non-printable">
                  {ProductSelectionContent}
              </div>
              <div className="col-span-1 flex flex-col overflow-hidden">
                  {OrderSummaryContent}
              </div>
          </div>
      </div>
      <div className="non-printable">
        <BarcodeScannerDialog
            open={isScannerOpen}
            onOpenChange={setIsScannerOpen}
            onScan={handleAddToCart}
        />
      </div>
    </>
  );
}
