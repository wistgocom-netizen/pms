'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    Edit, 
    Plus, 
    Minus,
    Wrench,
    CheckCircle2,
    Lock,
    Trash2,
    Calendar as CalendarIcon,
    X,
    Sparkles,
    Droplets,
    AlertTriangle
} from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PricingTier, Room, RoomStatus, HousekeepingStatus } from '@/lib/types';

export default function RoomsPage() {
  const { rooms, bookings, addRoom, removeRoom, updateRoom, updateRoomStatus, formatCurrency, isLoading, organization, pricingPlans, userProfile, roomDatePricing, roomTypes, addRoomType, removeRoomType } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  const [activeSearchDate, setActiveSearchDate] = useState<Date | null>(null);
  const [tempSearchDate, setTempSearchDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const presetAmenities = ['AC', 'TV', 'WiFi', 'Hot Water', 'Mini Bar', 'Safe', 'Balcony', 'Ocean View', 'Pool Access', 'Gym'];

  const defaultPricingTiers = (price: number): PricingTier[] => [
    { id: 'default', label: 'Per Night', price }
  ];

  const [newRoom, setNewRoom] = useState({
    id: '',
    type: 'Standard' as any,
    floor: 1,
    capacity: 2,
    price: 0,
    amenities: [] as string[],
    pricingTiers: defaultPricingTiers(0)
  });

  const [customAmenity, setCustomAmenity] = useState('');
  const [customRoomType, setCustomRoomType] = useState('');

  const [tierInput, setTierInput] = useState({ label: '', price: '' });

  useEffect(() => {
    setMounted(true);
    const today = startOfDay(new Date());
    setActiveSearchDate(today);
    setTempSearchDate(today);
  }, []);

  const roomLimit = useMemo(() => {
    if (userProfile?.role === 'super-admin') return 999;
    const planName = organization?.subscriptionPlan || 'Basic';
    const plan = pricingPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    return plan?.rooms || 10;
  }, [organization, pricingPlans, userProfile]);

  const isLimitReached = rooms.length >= roomLimit;

  const getCalculatedStatus = (room: Room, date: Date): RoomStatus => {
    if (room.status === 'maintenance') return 'maintenance';
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isOccupied = bookings.some(b => {
        if (b.status === 'cancelled' || b.status === 'completed') return false;
        if (b.roomId !== room.id) return false;
        
        if (b.stayMode === 'daily') {
            return dateStr >= b.checkIn && dateStr <= b.checkOut;
        }
        if (b.stayMode === 'hourly') {
            return dateStr === b.checkIn;
        }
        return false;
    });

    return isOccupied ? 'occupied' : 'available';
  };

  const filteredRooms = useMemo(() => {
    if (!activeSearchDate) return [];
    return rooms.filter(r => {
        const calculatedStatus = getCalculatedStatus(r, activeSearchDate);
        return filter === 'all' || calculatedStatus === filter;
    });
  }, [rooms, bookings, filter, activeSearchDate]);

  const handleAddOrEditRoom = () => {
      const perNightPrice = newRoom.pricingTiers.length > 0 ? newRoom.pricingTiers[0].price : newRoom.price;
      const sanitizedRoom = {
          ...newRoom,
          floor: isNaN(newRoom.floor) ? 1 : newRoom.floor,
          capacity: isNaN(newRoom.capacity) ? 2 : newRoom.capacity,
          price: perNightPrice,
          amenities: newRoom.amenities,
          pricingTiers: newRoom.pricingTiers.length > 0 ? newRoom.pricingTiers : [{ id: 'default', label: 'Per Night', price: newRoom.price }],
          hkStatus: 'clean' as HousekeepingStatus,
          lastCleaned: new Date().toISOString().split('T')[0]
      };

      if (editingRoomId) {
          updateRoom(editingRoomId, sanitizedRoom as any);
      } else {
          addRoom({ ...sanitizedRoom, status: 'available' } as any);
      }

      setIsAddOpen(false);
      setEditingRoomId(null);
      setNewRoom({ id: '', type: 'Standard', floor: 1, capacity: 2, price: 0, amenities: [], pricingTiers: defaultPricingTiers(0) });
  };

  const handleOpenEdit = (room: any) => {
      setEditingRoomId(room.id);
      setNewRoom({
          id: room.id,
          type: room.type,
          floor: room.floor,
          capacity: room.capacity,
          price: room.price,
          amenities: room.amenities || [],
          pricingTiers: (room.pricingTiers && room.pricingTiers.length > 0) ? room.pricingTiers : defaultPricingTiers(room.price || 0)
      });
      setIsAddOpen(true);
  };

  const addPricingTier = () => {
    if (tierInput.label && tierInput.price) {
        const tier: PricingTier = {
            id: `tier-${Date.now()}`,
            label: tierInput.label,
            price: parseFloat(tierInput.price) || 0
        };
        setNewRoom({ ...newRoom, pricingTiers: [...newRoom.pricingTiers, tier] });
        setTierInput({ label: '', price: '' });
    }
  };

  const removePricingTier = (id: string) => {
    setNewRoom({ ...newRoom, pricingTiers: newRoom.pricingTiers.filter(t => t.id !== id) });
  };

  const updateHkStatus = (roomId: string, hkStatus: HousekeepingStatus) => {
    updateRoom(roomId, { 
        hkStatus, 
        lastCleaned: hkStatus === 'clean' ? new Date().toISOString().split('T')[0] : rooms.find(r => r.id === roomId)?.lastCleaned 
    });
  };

  function startOfDay(d: Date): Date {
      const res = new Date(d);
      res.setHours(0, 0, 0, 0);
      return res;
  }

  if (!mounted || isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage inventory and time-based pricing.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            {isLimitReached && (
                <Badge variant="destructive" className="h-9 px-3 gap-2 text-[10px] sm:text-xs">
                    <AlertTriangle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Limit Reached</span> ({roomLimit})
                </Badge>
            )}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) {
                    setEditingRoomId(null);
                    setTierInput({ label: '', price: '' });
                    setCustomAmenity('');
                    setCustomRoomType('');
                }
            }}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-10 gap-2 flex-1 md:flex-none" onClick={() => setNewRoom({ id: '', type: 'Standard', floor: 1, capacity: 2, price: 0, amenities: [], pricingTiers: defaultPricingTiers(0) })} disabled={isLimitReached && !editingRoomId}>
                <Plus className="h-4 w-4" /> Add Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="p-6 pb-0 shrink-0">
                  <DialogTitle>{editingRoomId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto min-h-0 px-6 py-4">
                    <div className="grid gap-6 py-1">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                          <Label className="text-xs">Room Number</Label>
                          <Input placeholder="e.g. 101" value={newRoom.id} onChange={e => setNewRoom({...newRoom, id: e.target.value})} disabled={!!editingRoomId} className="h-9" />
                          </div>
                          <div className="space-y-2">
                          <Label className="text-xs">Type</Label>
                          <div className="flex gap-2">
                              <Select value={newRoom.type} onValueChange={v => setNewRoom({...newRoom, type: v as any})}>
                                  <SelectTrigger className="h-9 text-xs flex-1"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                  {roomTypes.map(t => (
                                      <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                  ))}
                                  <Separator className="my-1" />
                                  <div className="px-2 py-1.5 flex gap-1" onPointerDown={e => e.stopPropagation()}>
                                      <Input placeholder="New type..." className="h-7 text-[11px] flex-1" value={customRoomType} onChange={e => setCustomRoomType(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && customRoomType.trim()) { addRoomType(customRoomType.trim()); setNewRoom({...newRoom, type: customRoomType.trim() as any}); setCustomRoomType(''); }}} />
                                      <Button type="button" size="sm" className="h-7 w-7 shrink-0" disabled={!customRoomType.trim()} onClick={() => { addRoomType(customRoomType.trim()); setNewRoom({...newRoom, type: customRoomType.trim() as any}); setCustomRoomType(''); }}>
                                      <Plus className="h-3 w-3" />
                                      </Button>
                                  </div>
                                  </SelectContent>
                              </Select>
                              {!['Standard', 'Deluxe', 'Suite'].includes(newRoom.type) && newRoom.type && (
                                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeRoomType(newRoom.type)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                              )}
                          </div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                          <Label className="text-xs">Floor</Label>
                          <div className="flex items-center gap-1">
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => setNewRoom({...newRoom, floor: Math.max(1, newRoom.floor - 1)})} disabled={newRoom.floor <= 1}>
                                  <Minus className="h-3 w-3" />
                              </Button>
                              <div className="flex-1 text-center font-bold text-sm tabular-nums bg-muted/30 h-9 flex items-center justify-center rounded-lg border">{newRoom.floor}</div>
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => setNewRoom({...newRoom, floor: Math.min(100, newRoom.floor + 1)})} disabled={newRoom.floor >= 100}>
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                          </div>
                          <div className="space-y-2">
                          <Label className="text-xs">Capacity</Label>
                          <div className="flex items-center gap-1">
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => setNewRoom({...newRoom, capacity: Math.max(1, newRoom.capacity - 1)})} disabled={newRoom.capacity <= 1}>
                                  <Minus className="h-3 w-3" />
                              </Button>
                              <div className="flex-1 text-center font-bold text-sm tabular-nums bg-muted/30 h-9 flex items-center justify-center rounded-lg border">{newRoom.capacity}</div>
                              <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => setNewRoom({...newRoom, capacity: Math.min(50, newRoom.capacity + 1)})} disabled={newRoom.capacity >= 50}>
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                          </div>
                      </div>

                      <Separator />
                      
                      <div className="space-y-4">
                          <Label className="text-primary font-bold text-xs">Pricing Options</Label>
                          <div className="space-y-2">
                              {newRoom.pricingTiers.map((tier) => (
                                  <div key={tier.id} className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border">
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs font-semibold">{tier.label}</span>
                                          <Input type="number" placeholder="0.00" value={tier.price || ''} onChange={e => {
                                              const val = parseFloat(e.target.value) || 0;
                                              setNewRoom({ ...newRoom, pricingTiers: newRoom.pricingTiers.map(t => t.id === tier.id ? { ...t, price: val } : t) });
                                          }} className="h-7 w-24 text-[11px] font-bold text-right" />
                                      </div>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removePricingTier(tier.id)}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 items-end">
                              <div className="col-span-2 space-y-1">
                                  <Label className="text-[10px] uppercase">Label</Label>
                                  <Input placeholder="e.g. 6hr" value={tierInput.label} onChange={e => setTierInput({...tierInput, label: e.target.value})} onKeyDown={e => e.key === 'Enter' && addPricingTier()} className="h-8 text-[11px]" />
                              </div>
                              <div className="col-span-2 space-y-1">
                                  <Label className="text-[10px] uppercase">Price</Label>
                                  <Input type="number" placeholder="0.00" value={tierInput.price} onChange={e => setTierInput({...tierInput, price: e.target.value})} onKeyDown={e => e.key === 'Enter' && addPricingTier()} className="h-8 text-[11px]" />
                              </div>
                              <Button type="button" variant="secondary" size="sm" className="h-8 rounded-lg" onClick={addPricingTier}>
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                      </div>

                      <Separator />

                      <div className="space-y-3 pb-4">
                          <Label className="text-xs">Amenities</Label>
                          <div className="flex flex-wrap gap-1.5">
                              {presetAmenities.map(a => (
                                  <Badge key={a} variant={newRoom.amenities.includes(a) ? 'default' : 'secondary'} className="cursor-pointer text-[10px] font-bold px-2.5 py-1 rounded-full border-none transition-all" onClick={() => setNewRoom({...newRoom, amenities: newRoom.amenities.includes(a) ? newRoom.amenities.filter(x => x !== a) : [...newRoom.amenities, a]})}>
                                      {a}
                                  </Badge>
                              ))}
                          </div>
                          <div className="flex items-center gap-2">
                              <Input placeholder="Custom amenity..." value={customAmenity} onChange={e => setCustomAmenity(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && customAmenity.trim()) { setNewRoom({...newRoom, amenities: [...newRoom.amenities, customAmenity.trim()]}); setCustomAmenity(''); }}} className="h-8 text-[11px]" />
                              <Button type="button" variant="secondary" size="sm" className="h-8 rounded-lg shrink-0" disabled={!customAmenity.trim()} onClick={() => { setNewRoom({...newRoom, amenities: [...newRoom.amenities, customAmenity.trim()]}); setCustomAmenity(''); }}>
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </div>
                          {newRoom.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                  {newRoom.amenities.map(a => (
                                      <Badge key={a} variant="outline" className="text-[10px] font-bold px-2.5 py-1 rounded-full gap-1">
                                          {a}
                                          <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setNewRoom({...newRoom, amenities: newRoom.amenities.filter(x => x !== a)})} />
                                      </Badge>
                                  ))}
                              </div>
                          )}
                      </div>
                    </div>
                </div>
                <DialogFooter className="p-6 border-t bg-muted/5 shrink-0">
                    <Button onClick={handleAddOrEditRoom} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs">
                        {editingRoomId ? 'Save Changes' : 'Save Room'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-3 bg-card border rounded-2xl shadow-sm">
        <ScrollArea className="w-full lg:w-auto">
            <div className="flex gap-2 pb-2 lg:pb-0">
                {['all', 'available', 'occupied', 'maintenance'].map(f => (
                <Button 
                    key={f} 
                    variant={filter === f ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setFilter(f)} 
                    className="capitalize h-8 px-4 rounded-full text-[11px] font-bold shrink-0"
                >
                    {f}
                </Button>
                ))}
            </div>
        </ScrollArea>

        <div className="flex items-center gap-2 w-full lg:w-auto">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest whitespace-nowrap">Filter Date:</Label>
            <Popover open={isCalendarOpen} onOpenChange={(open) => {
                if (open) setTempSearchDate(activeSearchDate);
                setIsCalendarOpen(open);
            }} modal={true}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("h-9 justify-start text-left font-bold w-full lg:w-[180px] border rounded-full text-[11px]", activeSearchDate && "border-primary/20")}>
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                        {activeSearchDate ? format(activeSearchDate, "PP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-[2.5rem] overflow-hidden z-[60]" align="end">
                    <Calendar
                        mode="single"
                        selected={tempSearchDate || undefined}
                        onSelect={(d) => d && setTempSearchDate(d)}
                        initialFocus
                    />
                    <div className="p-4 pt-0 flex justify-end gap-3 bg-background">
                        <Button 
                            variant="ghost" 
                            className="text-muted-foreground font-bold text-xs h-9" 
                            onClick={() => {
                                setTempSearchDate(activeSearchDate);
                                setIsCalendarOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="rounded-full px-8 font-black uppercase tracking-wider h-9 text-[10px]" 
                            onClick={() => {
                                setActiveSearchDate(tempSearchDate);
                                setIsCalendarOpen(false);
                            }}
                        >
                            Done
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const calculatedStatus = activeSearchDate ? getCalculatedStatus(room, activeSearchDate) : 'available';
          
          return (
            <Card key={room.id} className={cn(
                "relative overflow-hidden group border-2 transition-all hover:shadow-lg rounded-2xl",
                calculatedStatus === 'available' ? 'hover:border-green-500/50' : calculatedStatus === 'occupied' ? 'hover:border-destructive/50' : 'hover:border-primary/50'
            )}>
              <CardHeader className="pb-2 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-black leading-none">Room {room.id}</CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1.5">{room.type} • Floor {room.floor}</p>
                  </div>
                  <Badge variant={calculatedStatus === 'available' ? 'success' : calculatedStatus === 'occupied' ? 'destructive' : 'default'} className="capitalize rounded-full px-2.5 text-[9px] h-5">
                    {calculatedStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0">
                <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold text-muted-foreground">
                        <Users className="h-3 w-3" /> {room.capacity} Cap.
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">HK:</span>
                        <Select value={room.hkStatus} onValueChange={(v: HousekeepingStatus) => updateHkStatus(room.id, v)}>
                            <SelectTrigger className="h-6 w-24 text-[9px] font-black uppercase border-none bg-muted/50 rounded-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clean" className="text-[9px] uppercase font-bold">Clean</SelectItem>
                                <SelectItem value="dirty" className="text-[9px] uppercase font-bold">Dirty</SelectItem>
                                <SelectItem value="inspecting" className="text-[9px] uppercase font-bold">Inspect</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-xl space-y-1.5">
                  <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Base Rate</p>
                  <div className="flex flex-col gap-1">
                      {(room.pricingTiers || []).slice(0, 2).map((t, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] py-0.5">
                              <span className="font-medium text-muted-foreground truncate mr-2">{t.label}</span>
                              <span className="font-black text-primary shrink-0">{formatCurrency(t.price)}</span>
                          </div>
                      ))}
                      {(!room.pricingTiers || room.pricingTiers.length === 0) && (
                          <div className="flex justify-between text-[11px]">
                              <span className="font-medium text-muted-foreground">Per Day</span>
                              <span className="font-black text-primary">{formatCurrency(room.price)}</span>
                          </div>
                      )}
                  </div>
                  {activeSearchDate && (() => {
                      const dateStr = format(activeSearchDate, 'yyyy-MM-dd');
                      const dynamicPrice = roomDatePricing?.[room.id]?.[dateStr];
                      if (dynamicPrice !== undefined) {
                          return (
                              <div className="mt-2 pt-2 border-t border-dashed border-primary/20">
                                  <div className="flex justify-between text-[11px]">
                                      <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                          <Sparkles className="h-3 w-3" /> {format(activeSearchDate, 'MMM d')}
                                      </span>
                                      <span className="font-black text-amber-600 dark:text-amber-400">{formatCurrency(dynamicPrice)}</span>
                                  </div>
                              </div>
                          );
                      }
                      return null;
                  })()}
                </div>

                <div className="flex flex-wrap gap-1">
                  {room.amenities.map(a => <Badge key={a} variant="secondary" className="text-[8px] font-bold px-1.5 py-0 rounded-md border-none">{a}</Badge>)}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 p-3 grid grid-cols-2 gap-2 bg-muted/5">
                  {room.status === 'available' && (
                      <>
                          <Button variant="outline" size="sm" className="gap-1.5 font-bold rounded-lg h-8 text-[10px] border-green-200 text-green-700" onClick={() => updateRoomStatus(room.id, 'occupied')}>
                              <Lock className="h-3 w-3" /> Book
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 font-bold rounded-lg h-8 text-[10px]" onClick={() => updateRoomStatus(room.id, 'maintenance')}>
                              <Wrench className="h-3 w-3" /> Maint.
                          </Button>
                      </>
                  )}
                  {(room.status === 'occupied' || room.status === 'maintenance') && (
                      <Button variant="outline" size="sm" className="col-span-2 gap-1.5 font-bold rounded-lg h-8 text-[10px]" onClick={() => updateRoomStatus(room.id, 'available')}>
                          <CheckCircle2 className="h-3 w-3" /> Mark Ready
                      </Button>
                  )}
                  <div className="col-span-2 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-1 text-[9px] font-bold uppercase text-muted-foreground" onClick={() => handleOpenEdit(room)}>
                      <Edit className="h-2.5 w-2.5" /> Edit Details
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 gap-1 text-[9px] font-bold uppercase text-destructive/70 hover:text-destructive" onClick={() => { if (confirm(`Delete room ${room.name || room.id}?`)) removeRoom(room.id); }}>
                      <Trash2 className="h-2.5 w-2.5" /> Delete
                  </Button>
                  </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
