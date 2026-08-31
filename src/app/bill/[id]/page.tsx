'use client';

import { useStore } from '@/context/StoreContext';
import { useParams } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
    Hotel, MapPin, Phone, Mail, Clock, Calendar, Receipt, 
    User, ChefHat, Plus, Minus, ShoppingCart,
    RefreshCcw, Home, AlertCircle, Info, LogOut, CheckCircle, FileText, Wallet
} from 'lucide-react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';

import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentDialog } from '@/app/dashboard/components/payment-dialog';

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function PublicBillPage() {
  const params = useParams();
  const id = params?.id;
  
  const { 
    bookings, 
    rooms, 
    products, 
    createNewOrder,
    updateSaleDetails,
    updateBookingStatus,
    updateRoom,
    categories,
    formatCurrency, 
    storeName, 
    storeAddress, 
    storePhone, 
    storeEmail, 
    isLoading,
    roomDatePricing
  } = useStore();
  const { toast } = useToast();

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [guestCart, setGuestCart] = useState<Record<string, number>>({});

  // Real-time synchronization for multi-tab testing
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
        if (e.key === 'hotelmaster_local_db') {
            window.location.reload();
        }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Subscribe to extra_charges changes for this booking (cross-tab real-time)
  useEffect(() => {
    const bookingId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');
    if (!bookingId) return;

    const channel = supabase
      .channel(`bill-extra-charges-${bookingId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'extra_charges', filter: `booking_id=eq.${bookingId}` },
        () => {
          window.location.reload();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Poll booking data every 30s as fallback when Realtime is not enabled
  useEffect(() => {
    const bookingId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');
    if (!bookingId) return;
    const interval = setInterval(() => window.location.reload(), 30000);
    return () => clearInterval(interval);
  }, [id]);

  const booking = useMemo(() => {
    if (!id || !bookings) return null;
    
    // Robustly extract and normalize the ID from params
    const rawId = typeof id === 'string' ? id : (Array.isArray(id) ? id[0] : '');
    if (!rawId) return null;
    
    const normalizedTarget = decodeURIComponent(rawId).trim().toLowerCase();
    
    // Stage 1: Try exact match
    let found = (bookings || []).find(b => b.id && b.id.toLowerCase() === normalizedTarget);
    if (found) return found;

    // Stage 2: Try permissive match (substrings) for prototype resilience
    return (bookings || []).find(b => {
        if (!b.id) return false;
        const bId = b.id.trim().toLowerCase();
        return bId.includes(normalizedTarget) || normalizedTarget.includes(bId);
    });
  }, [bookings, id]);

  const room = useMemo(() => {
    if (!booking) return null;
    return rooms.find(r => r.id.toLowerCase() === booking.roomId.toLowerCase());
  }, [booking, rooms]);

  const computeBookingBill = useCallback((b: Booking) => {
    const bRoom = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
    let unitPrice = bRoom?.price || 0;
    let tier = null;
    if (b.pricingTierId && bRoom?.pricingTiers) {
        tier = bRoom.pricingTiers.find(t => t.id === b.pricingTierId);
        if (tier) unitPrice = tier.price;
    }

    const isBaseRate = !tier || tier.price === (bRoom?.price || 0);
    let roomSubtotal = 0;
    let units = 0;
    let effectivePrice = unitPrice;

    if (b.stayMode === 'hourly') {
        units = Number(b.durationUnits) || 1;
        const checkIn = parseLocalDate(b.checkIn);
        if (checkIn && !isNaN(checkIn.getTime())) {
            const dateStr = format(checkIn, 'yyyy-MM-dd');
            const overridePrice = roomDatePricing?.[bRoom?.id || '']?.[dateStr];
            effectivePrice = isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
            roomSubtotal = effectivePrice * units;
        } else {
            roomSubtotal = unitPrice * units;
        }
    } else {
        const checkIn = parseLocalDate(b.checkIn);
        const checkOut = parseLocalDate(b.checkOut);
        if (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
            units = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
            for (let i = 0; i < units; i++) {
                const date = addDays(checkIn, i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const overridePrice = roomDatePricing?.[bRoom?.id || '']?.[dateStr];
                const dayPrice = isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
                roomSubtotal += dayPrice;
                if (i === 0) effectivePrice = dayPrice;
            }
        } else {
            units = 1;
            roomSubtotal = unitPrice;
        }
    }

    const extras = b.extraCharges || [];
    const extrasSubtotal = extras.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const total = roomSubtotal + extrasSubtotal;
    const balance = total - (Number(b.advance) || 0);

    return { room: bRoom, booking: b, units, roomSubtotal, extras, extrasSubtotal, total, balance, unitPrice, effectivePrice };
  }, [rooms, roomDatePricing]);

  // Multiple rooms booked by the same guest (name + phone, still in-house) share one bill.
  const groupSiblings = useMemo(() => {
    if (!booking) return [];
    const nm = booking.guestName?.trim().toLowerCase();
    const ph = booking.phone?.trim();
    if (!nm || !ph) return [booking];
    const matching = (bookings || []).filter(b =>
        b.status !== 'cancelled' &&
        b.status !== 'completed' &&
        b.guestName?.trim().toLowerCase() === nm &&
        b.phone?.trim() === ph
    );
    return matching.length ? matching : [booking];
  }, [booking, bookings]);

  const billing = useMemo(() => {
    if (!booking) return null;
    const lines = groupSiblings.map(b => computeBookingBill(b));
    const roomSubtotal = lines.reduce((s, l) => s + l.roomSubtotal, 0);
    const extrasSubtotal = lines.reduce((s, l) => s + l.extrasSubtotal, 0);
    const extras = lines.flatMap(l => l.extras);
    // Advance is applied once across the whole guest stay.
    const advance = Number(booking.advance) || 0;
    const total = roomSubtotal + extrasSubtotal;
    const balance = total - advance;
    return { lines, roomSubtotal, extrasSubtotal, extras, total, balance, advance, roomCount: lines.length, unitPrice: lines[0]?.unitPrice || 0, effectivePrice: lines[0]?.effectivePrice || 0, units: lines.reduce((s, l) => s + l.units, 0) };
  }, [booking, groupSiblings, computeBookingBill]);

  const menuCategories = useMemo(() => {
    const catSet = new Set(products.map(p => p.category));
    return categories.filter(c => catSet.has(c.name));
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) {
        list = list.filter(p => p.category === selectedCategory);
    }
    return list;
  }, [products, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, typeof products> = {};
    filteredProducts.forEach(p => {
        const key = p.category;
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const cartTotal = useMemo(() => {
    return Object.entries(guestCart).reduce((sum, [pid, qty]) => {
        const product = products.find(p => p.id === pid);
        return sum + (product?.price || 0) * qty;
    }, 0);
  }, [guestCart, products]);

  const updateCart = (productId: string, delta: number) => {
    setGuestCart(prev => {
        const current = prev[productId] || 0;
        const next = current + delta;
        if (next <= 0) {
            const { [productId]: _, ...rest } = prev;
            return rest;
        }
        return { ...prev, [productId]: next };
    });
  };

  const handlePlaceOrder = async () => {
    if (!booking) return;

    const cartItems = Object.entries(guestCart).map(([pid, qty]) => {
        const product = products.find(p => p.id === pid);
        return { product, qty };
    }).filter((item): item is { product: NonNullable<typeof item.product>; qty: number } => !!item.product);

    if (cartItems.length === 0) return;

    // Create the order as dine-in so status changes sync with booking charges
    const newOrder = await createNewOrder(booking.id, booking.roomId, booking.guestName, 'dine-in', booking.organizationId);
    if (!newOrder) return;

    // Update items & set orderType — the sync logic in updateSaleDetails
    // automatically adds/removes booking extra charges when status changes
    updateSaleDetails(newOrder.id, {
        items: cartItems.map(({ product, qty }) => ({
            productId: product.id,
            productName: product.name,
            quantity: qty,
            unitPrice: product.price,
        })),
        subtotal: cartItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0),
        totalAmount: cartItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0),
        customerId: booking.id,
        customerName: booking.guestName,
        tableNumber: booking.roomId,
        orderType: 'dine-in',
    });

    setGuestCart({});
    setIsOrderOpen(false);
    toast({
        title: "Order Placed!",
        description: "Your request has been sent to our staff.",
    });
  };

  const handlePaymentSuccess = (paymentMethod: string, customerId: string) => {
    if (!booking) return;
    // Complete every booking in the guest's stay (multiple rooms = one checkout)
    groupSiblings.forEach(b => {
      if (b.id !== booking!.id) updateBookingStatus(b.id, 'completed');
      if (b.roomId) updateRoom(b.roomId, { status: 'available', hkStatus: 'dirty' });
    });
    updateBookingStatus(booking.id, 'completed');
    if (booking.roomId) {
      updateRoom(booking.roomId, { status: 'available', hkStatus: 'dirty' });
    }
    setIsPaymentOpen(false);
    setIsCheckoutOpen(false);
    setIsCheckoutComplete(true);
    toast({
      title: "Check-Out Complete!",
      description: "Payment received. Thank you for staying with us.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="h-10 w-10 text-primary animate-spin" />
            <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Loading Bill...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-background">
        <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black font-brand tracking-tight uppercase mb-2 text-foreground">Bill Not Found</h1>
        <p className="text-muted-foreground max-w-xs mx-auto mb-6 text-sm">
            The requested digital bill could not be located on this device.
        </p>
        
        <Alert className="mb-8 max-w-sm text-left border-blue-200 bg-blue-50/50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-xs font-bold text-blue-800">Prototyping Note</AlertTitle>
            <AlertDescription className="text-[11px] text-blue-700 leading-normal">
                Because this is a local prototype, data is stored in your current browser. To view the bill for booking <strong>{typeof id === 'string' ? id : 'the requested ID'}</strong>, please open this link in a new tab on the same computer where you created the booking.
            </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button asChild variant="outline" className="rounded-full px-8 py-6 h-auto gap-2">
                <Link href="/"><Home className="h-4 w-4" /> Return to Home</Link>
            </Button>
            <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => window.location.reload()}>
                Try Refreshing
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4 sm:p-6 pb-32">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-4 shadow-lg">
          <Hotel className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black font-brand tracking-tighter uppercase">{storeName}</h1>
        <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground font-medium">
          <p className="flex items-center justify-center gap-1.5"><MapPin className="h-3 w-3" /> {storeAddress}</p>
          <div className="flex items-center justify-center gap-4">
            <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {storePhone}</p>
            <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {storeEmail}</p>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-none mb-8">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg text-center pb-8">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mb-1">Current Balance Due</p>
          <CardTitle className="text-4xl font-black font-mono">
            {formatCurrency(billing?.balance || 0)}
          </CardTitle>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
              Booking #{booking.id.slice(-6).toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 -mt-4 bg-card rounded-t-3xl shadow-inner">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Guest</p>
                <p className="font-semibold flex items-center gap-2"><User className="h-3.5 w-3.5" /> {booking.guestName}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Room</p>
                <p className="font-semibold">{groupSiblings.length > 1 ? groupSiblings.map(b => b.roomId).join(', ') : (booking.roomId + ' (' + (room?.type || '—') + ')')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Stay Type</p>
                <p className="font-semibold flex items-center gap-2">
                  {booking.stayMode === 'hourly' ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                  {booking.bookingType || 'Standard'}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Duration</p>
                <p className="font-semibold">{billing?.units} {booking.stayMode === 'hourly' ? 'Slot(s)' : 'Night(s)'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Check-In</p>
                <p className="font-semibold">{booking.checkIn} {booking.checkInTime || ''}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Check-Out</p>
                <p className="font-semibold">{booking.checkOut} {booking.checkOutTime || ''}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Bill Summary</h3>
              
              <div className="space-y-2">
                {billing?.lines.map(l => (
                  <div key={l.booking.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Room {l.room?.id || l.booking.roomId} ({l.units} x {formatCurrency(l.unitPrice)})</span>
                      <span className="font-bold">{formatCurrency(l.roomSubtotal)}</span>
                    </div>
                    {l.extras.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-muted/20">
                        {l.extras.map(charge => (
                          <div key={charge.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">• {charge.description}</span>
                            <span className="font-bold">{formatCurrency(charge.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {billing && billing.lines.length > 1 && (
                  <div className="flex justify-between text-sm pt-1 border-t border-dashed">
                    <span className="text-muted-foreground">Combined Room Charges</span>
                    <span className="font-bold">{formatCurrency(billing.roomSubtotal)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Charges</span>
                  <span className="font-bold">{formatCurrency(billing?.total || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Advance Paid</span>
                  <span className="font-bold">-{formatCurrency(billing?.advance || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 flex flex-col p-6 rounded-b-lg gap-4">
          <div className="flex justify-between w-full items-center">
            <span className="text-sm font-black uppercase tracking-wider">Net Payable</span>
            <span className="text-2xl font-black text-primary font-mono">{formatCurrency(billing?.balance || 0)}</span>
          </div>
          <p className="text-[10px] text-center text-muted-foreground italic leading-relaxed">
            This is a live digital bill. Any services added by the property staff will appear here instantly.
          </p>
        </CardFooter>
      </Card>

      {/* Checkout Complete State */}
      {isCheckoutComplete ? (
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto">
          <Card className="shadow-2xl border-2 border-green-200 bg-green-50">
            <CardContent className="p-6 text-center space-y-3">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight text-green-800">Check-Out Complete</h3>
              <p className="text-sm text-green-700">Thank you for staying with us!</p>
              <Button 
                size="lg" 
                className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-wider"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-5 w-5" /> Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Bottom Actions */
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto flex gap-3">
          {/* Order Service Button */}
          <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
              <DialogTrigger asChild>
                  <Button size="lg" className="flex-1 h-16 rounded-2xl gap-3 shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 bg-primary text-primary-foreground border-none">
                      <ChefHat className="h-6 w-6" />
                      <div className="text-left">
                          <p className="font-black text-sm uppercase tracking-wider">Order Service</p>
                          <p className="text-[10px] opacity-80 font-bold">Food, Drinks & Amenities</p>
                      </div>
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md h-[90vh] flex flex-col p-0 overflow-hidden rounded-t-[2.5rem]">
                  <DialogHeader className="p-6 bg-primary text-primary-foreground shrink-0">
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight">Service Menu</DialogTitle>
                      <DialogDescription className="text-white/70">Browse and add items to your bill.</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4 bg-muted/30 shrink-0">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                          <button
                              onClick={() => setSelectedCategory(null)}
                              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border'}`}
                          >
                              All
                          </button>
                          {menuCategories.map(cat => (
                              <button
                                  key={cat.id}
                                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedCategory === cat.name ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground border'}`}
                              >
                                  {cat.emoji && <span>{cat.emoji}</span>}
                                  {cat.name}
                              </button>
                          ))}
                      </div>
                  </div>
                  <ScrollArea className="flex-grow">
                      <div className="p-6 space-y-8">
                          {Object.entries(groupedProducts).map(([catKey, catProducts]) => (
                              <div key={catKey}>
                                  <h3 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                                      {categories.find(c => c.id === catKey || c.name === catKey)?.emoji} {catKey}
                                  </h3>
                                  <div className="space-y-4">
                                      {catProducts.map(product => (
                                          <div key={product.id} className="flex items-center justify-between gap-4">
                                              <div className="flex items-center gap-4 min-w-0">
                                                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                                                      {product.emoji}
                                                  </div>
                                                  <div className="min-w-0">
                                                      <p className="font-bold text-sm truncate">{product.name}</p>
                                                      <p className="text-xs text-primary font-black">{formatCurrency(product.price)}</p>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0">
                                                  {guestCart[product.id] ? (
                                                      <>
                                                          <Button 
                                                              variant="outline" 
                                                              size="icon" 
                                                              className="h-8 w-8 rounded-full"
                                                              onClick={() => updateCart(product.id, -1)}
                                                          >
                                                              <Minus className="h-3 w-3" />
                                                          </Button>
                                                          <span className="font-black text-sm w-4 text-center">{guestCart[product.id]}</span>
                                                          <Button 
                                                              variant="outline" 
                                                              size="icon" 
                                                              className="h-8 w-8 rounded-full"
                                                              onClick={() => updateCart(product.id, 1)}
                                                          >
                                                              <Plus className="h-3 w-3" />
                                                          </Button>
                                                      </>
                                                  ) : (
                                                      <Button 
                                                          variant="secondary" 
                                                          size="sm" 
                                                          className="h-8 px-4 font-bold rounded-full"
                                                          onClick={() => updateCart(product.id, 1)}
                                                      >
                                                          Add
                                                      </Button>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                          {Object.keys(groupedProducts).length === 0 && (
                              <div className="text-center py-12">
                                  <p className="text-muted-foreground text-sm">No items available in this category.</p>
                              </div>
                          )}
                      </div>
                  </ScrollArea>
                  <DialogFooter className="p-6 border-t bg-background shrink-0">
                      <Button 
                          className="w-full h-14 rounded-xl gap-2 font-black uppercase tracking-widest text-sm"
                          disabled={Object.keys(guestCart).length === 0}
                          onClick={handlePlaceOrder}
                      >
                          <ShoppingCart className="h-4 w-4" />
                          Confirm Order ({formatCurrency(cartTotal)})
                      </Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

        </div>
      )}

      {/* Check-Out Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-t-[2.5rem]">
          <DialogHeader className="p-6 bg-green-600 text-white shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <FileText className="h-6 w-6" /> Final Bill & Check-Out
            </DialogTitle>
            <DialogDescription className="text-white/70">Review your bill before completing checkout.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Guest</p>
                  <p className="font-semibold">{booking?.guestName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Room</p>
                  <p className="font-semibold">{groupSiblings.length > 1 ? groupSiblings.map(b => b.roomId).join(', ') : booking?.roomId}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Bill Summary</p>
                {billing?.lines.map(l => (
                  <div key={l.booking.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Room {l.room?.id || l.booking.roomId} ({l.units} x {formatCurrency(l.unitPrice)})</span>
                      <span className="font-bold">{formatCurrency(l.roomSubtotal)}</span>
                    </div>
                    {l.extras.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-muted/20">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Extra Charges</p>
                        {l.extras.map(charge => (
                          <div key={charge.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">• {charge.description}</span>
                            <span className="font-bold">{formatCurrency(charge.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Charges</span>
                  <span className="font-bold">{formatCurrency(billing?.total || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Advance Paid</span>
                  <span className="font-bold">-{formatCurrency(billing?.advance || 0)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-wider">Net Payable</span>
                  <span className="text-2xl font-black text-primary font-mono">{formatCurrency(billing?.balance || 0)}</span>
                </div>
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-xl gap-2 font-black uppercase tracking-widest text-sm bg-green-600 hover:bg-green-700"
                  onClick={() => setIsPaymentOpen(true)}
                >
                  <Wallet className="h-5 w-5" /> Pay {formatCurrency(billing?.balance || 0)}
                </Button>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 border-t bg-background shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        totalAmount={billing?.balance || 0}
        itemCount={(booking?.extraCharges?.length || 0) + 1}
        onPaymentSuccess={handlePaymentSuccess}
        allowedPaymentMethods={['qr', 'loan', 'split']}
      />

      <footer className="mt-12 text-center">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-4">Powered by</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm">
          <div className="h-5 w-5 bg-black rounded-md flex items-center justify-center text-[10px] text-white">AF</div>
          <span className="font-brand text-xs tracking-tighter font-bold">ADYFIRE (PMS)</span>
        </div>
      </footer>
    </div>
  );
}
