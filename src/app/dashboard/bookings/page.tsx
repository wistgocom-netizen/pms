'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Plus, 
    Edit, 
    LogOut, 
    CheckCircle2, 
    XCircle, 
    ReceiptText, 
    Trash2, 
    Printer, 
    Wallet, 
    CreditCard, 
    Clock, 
    Calendar as CalendarIcon, 
    Info, 
    AlertTriangle, 
    UserCircle, 
    CreditCardIcon, 
    Search, 
    Filter, 
    X, 
    QrCode, 
    Package,
    ChevronLeft,
    ChevronRight,
    LayoutList,
    CalendarDays,
    Brush,
    Sparkles,
    Droplets,
    PlusCircle,
    MoreVertical
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, subDays, startOfDay, isSameDay, eachDayOfInterval, differenceInDays, isBefore, isAfter, max, min } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';

const HOURS = [
    "12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
];

const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
};

/**
 * Parses YYYY-MM-DD strings into Date objects representing Local Midnight.
 * Crucial for consistent calculations in the timeline view.
 */
const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default function BookingsPage() {
  const { 
    bookings, 
    rooms, 
    products, 
    addBooking, 
    updateBooking, 
    updateBookingStatus, 
    updateRoom, 
    addExtraCharge, 
    removeExtraCharge, 
    formatCurrency, 
    isLoading, 
    storeName, 
    storeAddress, 
    storePhone,
    roomDatePricing,
    printFontScale,
    hotelLogo,
    reviewQrCode
  } = useStore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [calendarStartDate, setCalendarStartDate] = useState<Date | null>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [isGuestOrdersOpen, setIsGuestOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isStayActionsOpen, setIsStayActionsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  // States for date picker popovers
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isHourlyDateOpen, setIsHourlyDateOpen] = useState(false);
  const [isListDatePickerOpen, setIsListDatePickerOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [listDateFilter, setListDateFilter] = useState<Date | null>(null);

  const uniqueRoomTypes = useMemo(() => {
    return [...new Set(rooms.map(r => r.type))];
  }, [rooms]);

  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const [newBooking, setNewBooking] = useState({
    roomId: '',
    selectedRoomIds: [] as string[],
    roomSelections: {} as Record<string, { pricingTierId: string; bookingType: string }>,
    guestName: '',
    guestIdPassport: '',
    phone: '',
    email: '',
    checkIn: '',
    checkOut: '',
    checkInTime: '12:00 PM',
    checkOutTime: '12:00 PM',
    guests: 1,
    advance: 0,
    bookingType: '',
    pricingTierId: '',
    stayMode: 'daily' as 'daily' | 'hourly',
    durationUnits: 1,
    timeRange: '',
    source: 'Direct',
    externalId: '',
    customSource: ''
  });

  const [newCharge, setNewCharge] = useState({ description: '', amount: 0 });
  const [productSearch, setProductSearch] = useState('');
  const [checkoutPaymentAmount, setCheckoutPaymentAmount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const today = startOfDay(new Date());
    setCalendarStartDate(today);
    setNewBooking(prev => ({
        ...prev,
        checkIn: format(today, 'yyyy-MM-dd'),
        checkOut: format(addDays(today, 1), 'yyyy-MM-dd')
    }));
  }, []);

  useEffect(() => {
    if (newBooking.stayMode === 'hourly') {
        const combined = (fromTime && toTime) ? `${fromTime} - ${toTime}` : (fromTime || toTime || "");
        if (combined !== newBooking.timeRange) {
            setNewBooking(prev => ({ ...prev, timeRange: combined }));
        }
    }
  }, [fromTime, toTime, newBooking.stayMode, newBooking.timeRange]);

  const activeBooking = useMemo(() => {
    if (!selectedBookingId || !bookings) return null;
    return bookings.find(b => b.id === selectedBookingId);
  }, [bookings, selectedBookingId]);

  const guestOrders = useMemo(() => {
    if (!activeBooking) return [];
    return activeBooking.extraCharges?.filter(c => c.source === 'guest') || [];
  }, [activeBooking]);

  const filteredBookingsList = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           b.phone.includes(searchTerm) || 
                           b.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      
      const matchesRoomType = roomTypeFilter === 'all' || rooms.find(r => r.id === b.roomId)?.type === roomTypeFilter;
      
      let matchesDate = true;
      if (listDateFilter) {
        const targetDateStr = format(listDateFilter, 'yyyy-MM-dd');
        // Logic: Show any booking that overlaps with the selected date
        if (b.stayMode === 'daily') {
            matchesDate = targetDateStr >= b.checkIn && targetDateStr <= b.checkOut;
        } else {
            matchesDate = b.checkIn === targetDateStr;
        }
      }

      return matchesSearch && matchesStatus && matchesRoomType && matchesDate;
    }).sort((a, b) => b.id.localeCompare(a.id));
  }, [bookings, rooms, searchTerm, statusFilter, roomTypeFilter, listDateFilter]);

  const availableRoomsList = useMemo(() => {
    const baseRooms = rooms.filter(r => r.status !== 'maintenance' || (editingBookingId && r.id === bookings.find(b => b.id === editingBookingId)?.roomId));
    if (!newBooking.checkIn) return baseRooms;
    return baseRooms;
  }, [rooms, bookings, newBooking.checkIn, editingBookingId]);

  const roomDateConflict = (roomId: string, skipSelf = false) => {
    if (!newBooking.checkIn) return false;
    const targetStart = parseLocalDate(newBooking.checkIn)!;
    const targetEnd = newBooking.stayMode === 'daily' ? (parseLocalDate(newBooking.checkOut) || targetStart) : targetStart;

    return bookings.some(b => {
        if (b.status === 'cancelled' || b.status === 'completed') return false;
        if (b.roomId !== roomId) return false;
        if (skipSelf && editingBookingId && b.id === editingBookingId) return false;

        const bStart = parseLocalDate(b.checkIn)!;
        const bEnd = parseLocalDate(b.checkOut || b.checkIn)!;

        // Daily mode: any overlapping stay blocks the room.
        if (newBooking.stayMode === 'daily') {
            return (targetStart < bEnd && targetEnd > bStart);
        }
        // Hourly mode: a daily stay covering the selected date blocks the room;
        // fine-grained hourly slot conflicts are surfaced separately via availabilityConflicts.
        if (newBooking.stayMode === 'hourly') {
            return (b.stayMode === 'daily' && targetStart >= bStart && targetStart < bEnd);
        }
        return false;
    });
  };

  const availabilityConflicts = useMemo(() => {
    const selected = newBooking.selectedRoomIds?.length ? newBooking.selectedRoomIds : [newBooking.roomId].filter(Boolean);
    if (selected.length === 0 || !newBooking.checkIn) return [];

    return bookings.filter(b => {
        if (b.status === 'cancelled' || b.status === 'completed') return false;
        if (!selected.includes(b.roomId)) return false;
        if (editingBookingId && b.id === editingBookingId) return false;

        const bStart = parseLocalDate(b.checkIn)!;
        const bEnd = parseLocalDate(b.checkOut || b.checkIn)!;
        const targetStart = parseLocalDate(newBooking.checkIn)!;
        const targetEnd = newBooking.stayMode === 'daily' ? (parseLocalDate(newBooking.checkOut) || targetStart) : targetStart;

        if (newBooking.stayMode === 'daily') {
            return (targetStart < bEnd && targetEnd > bStart);
        }

        if (newBooking.stayMode === 'hourly') {
            if (b.stayMode === 'daily') {
                return (targetStart >= bStart && targetStart < bEnd);
            }
            if (b.stayMode === 'hourly' && b.checkIn === newBooking.checkIn) {
                if (!b.timeRange || !newBooking.timeRange) return false;
                const [bS, bE] = b.timeRange.split(' - ').map(parseTime);
                const [nS, nE] = newBooking.timeRange.split(' - ').map(parseTime);
                return (nS < bE && nE > bS);
            }
        }
        return false;
    });
  }, [bookings, newBooking, editingBookingId]);

  const selectedRoomIds = useMemo(() => {
    return newBooking.selectedRoomIds?.length ? newBooking.selectedRoomIds : ([newBooking.roomId].filter(Boolean) as string[]);
  }, [newBooking.selectedRoomIds, newBooking.roomId]);

  const occupiedSlotsToday = useMemo(() => {
    const ids = selectedRoomIds;
    if (newBooking.stayMode !== 'hourly' || ids.length === 0 || !newBooking.checkIn) return [];
    return bookings
        .filter(b =>
            ids.includes(b.roomId) &&
            b.checkIn === newBooking.checkIn &&
            b.stayMode === 'hourly' &&
            b.status !== 'cancelled' &&
            b.status !== 'completed' &&
            (!editingBookingId || b.id !== editingBookingId)
        )
        .map(b => b.timeRange);
  }, [bookings, selectedRoomIds, newBooking, editingBookingId]);

  const availableHoursFrom = useMemo(() => {
    const ids = selectedRoomIds;
    if (ids.length === 0 || !newBooking.checkIn || newBooking.stayMode !== 'hourly') return HOURS;

    return HOURS.filter(h => {
        const hourMins = parseTime(h);
        return !occupiedSlotsToday.some(range => {
            const [s, e] = range.split(' - ').map(parseTime);
            return hourMins >= s && hourMins < e;
        });
    });
  }, [selectedRoomIds, newBooking.checkIn, newBooking.stayMode, occupiedSlotsToday]);

  const availableHoursTo = useMemo(() => {
    const ids = selectedRoomIds;
    if (ids.length === 0 || !newBooking.checkIn || newBooking.stayMode !== 'hourly') return HOURS;

    let baseHours = HOURS;
    const fromMins = fromTime ? parseTime(fromTime) : -1;

    if (fromMins !== -1) {
        baseHours = HOURS.filter(h => parseTime(h) > fromMins);
    }

    return baseHours.filter(h => {
        const hourMins = parseTime(h);

        return !occupiedSlotsToday.some(range => {
            const [s, e] = range.split(' - ').map(parseTime);

            if (fromMins !== -1) {
                return s >= fromMins && s < hourMins;
            }
            return hourMins > s && hourMins <= e;
        });
    });
  }, [selectedRoomIds, newBooking.checkIn, newBooking.stayMode, occupiedSlotsToday, fromTime]);

  useEffect(() => {
    const poolIds = new Set(availableRoomsList.map(r => r.id));
    if (newBooking.roomId && !poolIds.has(newBooking.roomId)) {
        setNewBooking(prev => ({ ...prev, roomId: '', pricingTierId: '', bookingType: '', selectedRoomIds: [], roomSelections: {} }));
    } else if (newBooking.selectedRoomIds?.length) {
        const stillValid = newBooking.selectedRoomIds.filter(id => poolIds.has(id));
        if (stillValid.length !== newBooking.selectedRoomIds.length) {
            const selections = { ...newBooking.roomSelections };
            newBooking.selectedRoomIds.forEach(id => { if (!poolIds.has(id)) delete selections[id]; });
            setNewBooking(prev => ({ ...prev, selectedRoomIds: stillValid, roomSelections: selections }));
        }
    }
  }, [availableRoomsList, newBooking.roomId, newBooking.selectedRoomIds, newBooking.roomSelections]);

  const selectedRoomForBooking = useMemo(() => {
    return rooms.find(r => r.id === newBooking.roomId);
  }, [rooms, newBooking.roomId]);

  const roomUnitPrice = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const sel = newBooking.roomSelections?.[roomId];
    const tier = room?.pricingTiers?.find(t => t.id === (sel?.pricingTierId || newBooking.pricingTierId));
    return { room, tier, unitPrice: tier?.price || room?.price || 0, isBaseRate: !tier || tier.price === (room?.price || 0) };
  };

  const getPricePreview = () => {
    const ids = selectedRoomIds;
    if (ids.length === 0 || !newBooking.checkIn) return null;

    let subtotal = 0;
    let units = 0;
    const lines: { label: string; unitPrice: number; subtotal: number }[] = [];

    if (newBooking.stayMode === 'daily') {
        const ci = parseLocalDate(newBooking.checkIn);
        const co = parseLocalDate(newBooking.checkOut);
        const nNights = (ci && co && !isNaN(ci.getTime()) && !isNaN(co.getTime())) ? Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / 86400000)) : 1;
        units = nNights;
        for (const roomId of ids) {
            const { room, unitPrice, isBaseRate } = roomUnitPrice(roomId);
            let roomSub = 0;
            for (let i = 0; i < nNights; i++) {
                const date = addDays(ci as Date, i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const overridePrice = roomDatePricing?.[roomId]?.[dateStr];
                roomSub += isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
            }
            subtotal += roomSub;
            lines.push({ label: room?.id || roomId, unitPrice, subtotal: roomSub });
        }
    } else {
        const qty = newBooking.durationUnits || 1;
        units = qty;
        for (const roomId of ids) {
            const { room, unitPrice } = roomUnitPrice(roomId);
            const roomSub = unitPrice * qty;
            subtotal += roomSub;
            lines.push({ label: room?.id || roomId, unitPrice, subtotal: roomSub });
        }
    }

    const advance = newBooking.advance || 0;
    return { subtotal, units, advance, balance: subtotal - advance, stayMode: newBooking.stayMode, lines, roomCount: ids.length };
  };


  const computeRoomSubtotal = useCallback((b: Booking) => {
    const room = rooms.find(r => r.id === b.roomId);
    let unitPrice = room?.price || 0;
    let tier = null;
    if (b.pricingTierId && room?.pricingTiers) {
        tier = room.pricingTiers.find(t => t.id === b.pricingTierId);
        if (tier) unitPrice = tier.price;
    }
    const isBaseRate = !tier || tier.price === room?.price;
    let roomSubtotal = 0;
    let units = 0;

    if (b.stayMode === 'hourly') {
        units = b.durationUnits || 1;
        const checkIn = parseLocalDate(b.checkIn);
        if (checkIn && !isNaN(checkIn.getTime())) {
            const dateStr = format(checkIn, 'yyyy-MM-dd');
            const overridePrice = roomDatePricing?.[room?.id || '']?.[dateStr];
            roomSubtotal = (isBaseRate ? (overridePrice ?? unitPrice) : unitPrice) * units;
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
                const overridePrice = roomDatePricing?.[room?.id || '']?.[dateStr];
                roomSubtotal += isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
            }
        } else {
            units = 1;
            roomSubtotal = unitPrice;
        }
    }
    return { room, unitPrice, roomSubtotal, units };
  }, [rooms, roomDatePricing]);

  // Bookings belonging to the same guest stay are grouped so that multiple rooms booked
  // by one guest appear in a single bill/receipt.
  // - Same guest NAME is the primary key (so grouping survives blank or differently
  //   formatted phone numbers, which commonly happens when booking several rooms).
  // - Phone (normalized digits) is strongly preferred when it matches.
  // - Bookings are only grouped when their stay overlaps, so unrelated past stays by the
  //   same guest are not merged into one bill.
  // - Completed bookings are included too (the receipt is printed from a completed booking).
  const groupSiblings = useMemo(() => {
    if (!activeBooking) return [];
    const nm = activeBooking.guestName?.trim().toLowerCase();
    const idp = activeBooking.guestIdPassport?.trim().toLowerCase();
    if (!nm) return [activeBooking];

    const normPhone = (p?: string) => (p || '').replace(/[^\d]/g, '');
    const ph = normPhone(activeBooking.phone);

    const targetStart = parseLocalDate(activeBooking.checkIn);
    const targetEnd = parseLocalDate(activeBooking.checkOut || activeBooking.checkIn);

    const overlaps = (b: Booking) => {
      if (!targetStart || !targetEnd || isNaN(targetStart.getTime()) || isNaN(targetEnd.getTime())) return true;
      const bStart = parseLocalDate(b.checkIn);
      const bEnd = parseLocalDate(b.checkOut || b.checkIn);
      if (!bStart || !bEnd || isNaN(bStart.getTime()) || isNaN(bEnd.getTime())) return true;
      return targetStart <= bEnd && targetEnd >= bStart;
    };

    const matching = bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      if (b.guestName?.trim().toLowerCase() !== nm) return false;
      // Strong link: a non-empty ID/passport matches.
      if (idp && b.guestIdPassport?.trim().toLowerCase() === idp) return true;
      // Strong link: phone digits match.
      if (ph && normPhone(b.phone) === ph) return true;
      // Fallback for blank/differing phones: same name within an overlapping stay.
      return overlaps(b);
    });
    return matching.length ? matching : [activeBooking];
  }, [activeBooking, bookings]);

  const groupBilling = useMemo(() => {
    if (!activeBooking) return null;
    const lines = groupSiblings.map(b => {
        const calc = computeRoomSubtotal(b);
        const extrasSubtotal = b.extraCharges?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0;
        return {
            bookingId: b.id,
            room: calc.room,
            roomId: b.roomId,
            bookingType: b.bookingType,
            units: calc.units,
            unitPrice: calc.unitPrice,
            roomSubtotal: calc.roomSubtotal,
            extras: b.extraCharges || [],
            extrasSubtotal,
            lineTotal: calc.roomSubtotal + extrasSubtotal
        };
    });
    const roomSubtotal = lines.reduce((s, l) => s + l.roomSubtotal, 0);
    const extrasSubtotal = lines.reduce((s, l) => s + l.extrasSubtotal, 0);
    // Advance is applied once across the whole guest stay.
    const advance = activeBooking.advance || 0;
    const total = roomSubtotal + extrasSubtotal;
    const balance = total - advance;
    return { lines, roomSubtotal, extrasSubtotal, extras: lines.flatMap(l => l.extras), advance, total, balance, roomCount: lines.length };
  }, [activeBooking, groupSiblings, computeRoomSubtotal]);

  useEffect(() => {
    if (isCheckoutOpen && groupBilling) {
        setCheckoutPaymentAmount(Math.max(0, groupBilling.balance));
    }
  }, [isCheckoutOpen, groupBilling]);

  const handleAddOrEditBooking = () => {
      const resolvedSource = newBooking.source === 'Other' ? (newBooking.customSource || 'Other') : (newBooking.source || 'Direct');
      const { customSource: _, selectedRoomIds: __, roomSelections: ___, ...bookingData } = newBooking;
      const sanitizedBooking = {
          ...bookingData,
          guests: isNaN(newBooking.guests) ? 1 : newBooking.guests,
          advance: isNaN(newBooking.advance) ? 0 : newBooking.advance,
          durationUnits: isNaN(newBooking.durationUnits) ? 1 : Math.max(1, newBooking.durationUnits),
          checkOut: newBooking.stayMode === 'hourly' ? newBooking.checkIn : newBooking.checkOut,
          source: resolvedSource,
          externalId: resolvedSource === 'Direct' ? '' : newBooking.externalId
      };

      if (editingBookingId) {
          updateBooking(editingBookingId, sanitizedBooking as any);
      } else {
          const roomIds = newBooking.selectedRoomIds?.length ? newBooking.selectedRoomIds : [newBooking.roomId].filter(Boolean);
          for (const roomId of roomIds) {
              const sel = newBooking.roomSelections?.[roomId];
              addBooking({
                  ...sanitizedBooking,
                  roomId,
                  pricingTierId: sel?.pricingTierId || newBooking.pricingTierId || 'default',
                  bookingType: sel?.bookingType || newBooking.bookingType || 'Per Day',
              } as any);
          }
      }

      setIsAddOpen(false);
      setEditingBookingId(null);
      setFromTime("");
      setToTime("");
      setNewBooking({ roomId: '', selectedRoomIds: [], roomSelections: {}, guestName: '', guestIdPassport: '', phone: '', email: '', checkIn: format(new Date(), 'yyyy-MM-dd'), checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'), checkInTime: '12:00 PM', checkOutTime: '12:00 PM', guests: 1, advance: 0, bookingType: '', pricingTierId: '', stayMode: 'daily', durationUnits: 1, timeRange: '', source: 'Direct', externalId: '', customSource: '' });
  };

  const handleOpenEdit = (booking: Booking) => {
      setEditingBookingId(booking.id);

      const times = (booking.timeRange || "").split(" - ");
      setFromTime(times[0] || "");
      setToTime(times[1] || "");

      setNewBooking({
          roomId: booking.roomId,
          selectedRoomIds: [booking.roomId],
          roomSelections: { [booking.roomId]: { pricingTierId: booking.pricingTierId || 'default', bookingType: booking.bookingType || '' } },
          guestName: booking.guestName,
          guestIdPassport: booking.guestIdPassport || '',
          phone: booking.phone,
          email: booking.email,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          checkInTime: booking.checkInTime || '12:00 PM',
          checkOutTime: booking.checkOutTime || '12:00 PM',
          guests: booking.guests,
          advance: booking.advance,
          bookingType: booking.bookingType || '',
          pricingTierId: booking.pricingTierId || 'default',
          stayMode: booking.stayMode || 'daily',
          durationUnits: booking.durationUnits || 1,
          timeRange: booking.timeRange || '',
          source: booking.source || 'Direct',
          externalId: booking.externalId || '',
          customSource: ''
      });
      setIsAddOpen(true);
  };

  const handleCellClick = (roomId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const room = rooms.find(r => r.id === roomId);
    const firstTier = room?.pricingTiers?.[0];
    
    setNewBooking({
        roomId: roomId,
        selectedRoomIds: [roomId],
        roomSelections: { [roomId]: { pricingTierId: firstTier?.id || 'default', bookingType: firstTier?.label || 'Per Night' } },
        guestName: '',
        guestIdPassport: '',
        phone: '',
        email: '',
        checkIn: dateStr,
        checkOut: format(addDays(date, 1), 'yyyy-MM-dd'),
        checkInTime: '12:00 PM',
        checkOutTime: '12:00 PM',
        guests: 1,
        advance: 0,
        bookingType: firstTier?.label || 'Per Night',
        pricingTierId: firstTier?.id || 'default',
        stayMode: 'daily',
        durationUnits: 1,
        timeRange: '',
        source: 'Direct',
        externalId: '',
        customSource: ''
    });
    setIsAddOpen(true);
  };

  const handleAddCharge = () => {
      if (selectedBookingId && newCharge.description && newCharge.amount > 0) {
          addExtraCharge(selectedBookingId, {
              description: newCharge.description,
              amount: newCharge.amount,
              source: 'staff'
          });
          setNewCharge({ description: '', amount: 0 });
          setIsChargeOpen(false);
          toast({ title: "Service Added", description: "The item has been added to the guest's bill." });
      }
  };

  const handleAddProductCharge = (product: any) => {
    if (selectedBookingId) {
        addExtraCharge(selectedBookingId, {
            description: product.name,
            amount: product.price,
            source: 'staff'
        });
        setProductSearch('');
        setIsChargeOpen(false);
        toast({ title: "Product Added", description: `${product.name} added to bill.` });
    }
  };

  const filteredChargeProducts = useMemo(() => {
    if (!productSearch) return [];
    return (products || []).filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.id.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);
  }, [products, productSearch]);

  const handleCompleteCheckout = useCallback((paymentMethod?: string) => {
    if (selectedBookingId && activeBooking) {
        // Complete every booking in the guest's stay (multiple rooms = one checkout).
        // Skip siblings already checked out to avoid re-marking their rooms dirty.
        groupSiblings.forEach(b => {
            if (b.id === selectedBookingId) return;
            if (b.status === 'completed') return;
            updateBookingStatus(b.id, 'completed');
            if (b.roomId) updateRoom(b.roomId, { status: 'available', hkStatus: 'dirty' });
        });
        updateBookingStatus(selectedBookingId, 'completed');
        updateRoom(activeBooking.roomId, { status: 'available', hkStatus: 'dirty' });
        setIsCheckoutOpen(false);
        setSelectedBookingId(null);
    }
  }, [selectedBookingId, activeBooking, groupSiblings, updateBookingStatus, updateRoom]);

  const billPublicUrl = useMemo(() => {
    if (typeof window === 'undefined' || !selectedBookingId) return '';
    return `${window.location.origin}/bill/${selectedBookingId}`;
  }, [selectedBookingId]);

  // Calendar View Helpers
  const calendarDates = useMemo(() => {
    if (!calendarStartDate) return [];
    return eachDayOfInterval({
        start: calendarStartDate,
        end: addDays(calendarStartDate, 13)
    });
  }, [calendarStartDate]);

  const filteredCalendarRooms = useMemo(() => {
    if (roomTypeFilter === 'all') return rooms;
    return rooms.filter(r => r.type === roomTypeFilter);
  }, [rooms, roomTypeFilter]);

  const getEffectivePrice = (roomId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    return roomDatePricing?.[roomId]?.[dateStr] ?? room.price;
  };

  const handlePrevRange = () => {
      if (calendarStartDate) setCalendarStartDate(subDays(calendarStartDate, 14));
  };
  const handleNextRange = () => {
      if (calendarStartDate) setCalendarStartDate(addDays(calendarStartDate, 14));
  };
  const handleJumpToToday = () => setCalendarStartDate(startOfDay(new Date()));

  const handlePrintReceipt = () => {
    const el = document.getElementById('hotel-receipt');
    if (!el) { window.print(); return; }
    const prevZoom = el.style.zoom;
    el.style.zoom = '1';
    const contentH = el.getBoundingClientRect().height;
    const targetH = 1080;
    const scale = contentH > targetH ? targetH / contentH : 1;
    el.style.zoom = String(Math.max(0.35, scale));
    requestAnimationFrame(() => {
      window.print();
      el.style.zoom = prevZoom || '1';
    });
  };

  if (!mounted || isLoading) return null;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page { size: auto; margin: 0; }
            html, body { margin: 0 !important; padding: 0 !important; background: white !important; height: auto !important; overflow: visible !important; }
            body * { visibility: hidden !important; }
            #hotel-receipt, #hotel-receipt * { visibility: visible !important; }
            #hotel-receipt {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                background: white !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0.5rem !important;
                z-index: 999999 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-column-break-inside: avoid !important;
            }
            .non-printable { visibility: hidden !important; }
        }
      `}} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 non-printable">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage arrivals, departures, and active reservations.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-muted p-1 rounded-lg flex gap-1 flex-1 md:flex-none">
                <Button 
                    variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 flex-1 md:flex-none gap-2 px-3 font-bold text-xs"
                    onClick={() => setViewMode('calendar')}
                >
                    <CalendarDays className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Calendar</span>
                </Button>
                <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 flex-1 md:flex-none gap-2 px-3 font-bold text-xs"
                    onClick={() => setViewMode('list')}
                >
                    <LayoutList className="h-3.5 w-3.5" /> <span className="hidden sm:inline">List</span>
                </Button>
            </div>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) {
                    setEditingBookingId(null);
                    setFromTime("");
                    setToTime("");
                }
            }}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-10 gap-2 shrink-0" onClick={() => {
                    setFromTime("");
                    setToTime("");
                    setNewBooking({ roomId: '', selectedRoomIds: [], roomSelections: {}, guestName: '', guestIdPassport: '', phone: '', email: '', checkIn: format(new Date(), 'yyyy-MM-dd'), checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'), checkInTime: '12:00 PM', checkOutTime: '12:00 PM', guests: 1, advance: 0, bookingType: '', pricingTierId: '', stayMode: 'daily', durationUnits: 1, timeRange: '', source: 'Direct', externalId: '', customSource: '' });
                }}>
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Booking</span><span className="sm:hidden">New</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="p-6 pb-0 shrink-0">
                    <DialogTitle>{editingBookingId ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto min-h-0 px-6 py-4">
                    <div className="grid gap-6 py-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                <div className="h-4 w-1 bg-primary rounded-full" />
                                Schedule & Stay
                            </div>
                            {newBooking.stayMode === 'daily' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Check-in Date</Label>
                                            <Popover modal={true} open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left h-9 text-[11px] font-medium">
                                                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                        {newBooking.checkIn || "Select Date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden z-[60]" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseLocalDate(newBooking.checkIn)}
                                                        onSelect={(d) => {
                                                            if (d) {
                                                                const newCheckIn = format(d, 'yyyy-MM-dd');
                                                                // Advance check-out if it's same or before check-in
                                                                const currentCheckOut = parseLocalDate(newBooking.checkOut);
                                                                let updatedCheckOut = newBooking.checkOut;
                                                                if (currentCheckOut && !isAfter(currentCheckOut, d)) {
                                                                    updatedCheckOut = format(addDays(d, 1), 'yyyy-MM-dd');
                                                                }
                                                                setNewBooking({ ...newBooking, checkIn: newCheckIn, checkOut: updatedCheckOut });
                                                                setIsCheckInOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Check-out Date</Label>
                                            <Popover modal={true} open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left h-9 text-[11px] font-medium">
                                                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                        {newBooking.checkOut || "Select Date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden z-[60]" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseLocalDate(newBooking.checkOut)}
                                                        onSelect={(d) => {
                                                            if (d) {
                                                                setNewBooking({...newBooking, checkOut: format(d, 'yyyy-MM-dd')});
                                                                setIsCheckOutOpen(false);
                                                            }
                                                        }}
                                                        disabled={(d) => !!newBooking.checkIn && !isAfter(d, parseLocalDate(newBooking.checkIn)!)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Check-in Time</Label>
                                        <Select value={newBooking.checkInTime} onValueChange={(v) => setNewBooking({...newBooking, checkInTime: v})}>
                                            <SelectTrigger className="h-9 text-[11px]">
                                                <SelectValue placeholder="Select Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Check-out Time</Label>
                                        <Select value={newBooking.checkOutTime} onValueChange={(v) => setNewBooking({...newBooking, checkOutTime: v})}>
                                            <SelectTrigger className="h-9 text-[11px]">
                                                <SelectValue placeholder="Select Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Booking Date</Label>
                                            <Popover modal={true} open={isHourlyDateOpen} onOpenChange={setIsHourlyDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left h-9 text-[11px] font-medium">
                                                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                        {newBooking.checkIn || "Select Date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden z-[60]" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseLocalDate(newBooking.checkIn)}
                                                        onSelect={(d) => {
                                                            if (d) {
                                                                setNewBooking({...newBooking, checkIn: format(d, 'yyyy-MM-dd'), checkOut: format(d, 'yyyy-MM-dd')});
                                                                setIsHourlyDateOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Time Range</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Select value={fromTime} onValueChange={setFromTime}>
                                                    <SelectTrigger className="h-9 text-[10px]">
                                                        <SelectValue placeholder="From" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableHoursFrom.map(h => <SelectItem key={`from-${h}`} value={h} className="text-[10px]">{h}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Select value={toTime} onValueChange={setToTime}>
                                                    <SelectTrigger className="h-9 text-[10px]">
                                                        <SelectValue placeholder="To" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableHoursTo.map(h => <SelectItem key={`to-${h}`} value={h} className="text-[10px]">{h}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Duration Multiplier (Qty)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            className="h-9"
                                            value={isNaN(newBooking.durationUnits) ? "" : (newBooking.durationUnits === 0 ? "" : newBooking.durationUnits)}
                                            onChange={e => setNewBooking({...newBooking, durationUnits: parseInt(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                <div className="h-4 w-1 bg-primary rounded-full" />
                                Stay Type & Room
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Stay Mode</Label>
                                    <Select value={newBooking.stayMode} onValueChange={(v: any) => {
                                        const updated = { ...newBooking, stayMode: v };
                                        const room = selectedRoomForBooking;
                                        const nextSelections = { ...(newBooking.roomSelections || {}) };
                                        let tierForAll: { pricingTierId: string; bookingType: string } | null = null;
                                        if (room) {
                                            const tiers = room.pricingTiers || [];
                                            if (v === 'hourly') {
                                                const hourlyTier = tiers.find(t => t.label.toLowerCase() !== 'per night' && t.label.toLowerCase() !== 'per day') || tiers[tiers.length - 1] || tiers[0];
                                                if (hourlyTier) tierForAll = { pricingTierId: hourlyTier.id, bookingType: hourlyTier.label };
                                            } else {
                                                const dailyTier = tiers.find(t => t.label.toLowerCase() === 'per night' || t.label.toLowerCase() === 'per day') || tiers[0];
                                                if (dailyTier) tierForAll = { pricingTierId: dailyTier.id, bookingType: dailyTier.label };
                                            }
                                        }
                                        const selectedIds = selectedRoomIds;
                                        if (tierForAll) {
                                            selectedIds.forEach(id => { nextSelections[id] = { ...tierForAll! }; });
                                            const primary = selectedRoomForBooking?.id || selectedIds[0];
                                            const ps = nextSelections[primary];
                                            updated.pricingTierId = ps?.pricingTierId || 'default';
                                            updated.bookingType = ps?.bookingType || '';
                                        }
                                        updated.roomSelections = nextSelections;
                                        setNewBooking(updated);
                                    }}>
                                        <SelectTrigger className="h-9 text-[11px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily" className="text-xs">Daily (Nights)</SelectItem>
                                            <SelectItem value="hourly" className="text-xs">Hourly / Slot</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs">Select Room(s) — select one or more rooms</Label>
                                    {!newBooking.checkIn ? (
                                        <p className="text-xs text-muted-foreground italic py-2">Select a check-in date first to see available rooms.</p>
                                    ) : availableRoomsList.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic py-2">No available rooms for the selected dates.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                            {availableRoomsList.filter(r => !!r.id).map(r => {
                                                const isSel = selectedRoomIds.includes(r.id);
                                                const firstTier = r.pricingTiers?.[0];
                                                const tierPrice = firstTier?.price ?? r.price;
                                                const conflicted = !editingBookingId && roomDateConflict(r.id, true);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={r.id}
                                                        onClick={() => {
                                                            const isSelected = selectedRoomIds.includes(r.id);
                                                            let nextRoomIds: string[];
                                                            let nextSelections = { ...(newBooking.roomSelections || {}) };
                                                            if (isSelected) {
                                                                nextRoomIds = selectedRoomIds.filter(id => id !== r.id);
                                                                delete nextSelections[r.id];
                                                            } else {
                                                                nextRoomIds = [...selectedRoomIds, r.id];
                                                                nextSelections[r.id] = { pricingTierId: firstTier?.id || 'default', bookingType: firstTier?.label || 'Per Day' };
                                                            }
                                                            const primary = nextRoomIds[0] || '';
                                                            const primarySel = nextSelections[primary];
                                                            setNewBooking({
                                                                ...newBooking,
                                                                roomId: primary,
                                                                selectedRoomIds: nextRoomIds,
                                                                roomSelections: nextSelections,
                                                                pricingTierId: primarySel?.pricingTierId || 'default',
                                                                bookingType: primarySel?.bookingType || 'Per Day'
                                                            });
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                                                            isSel ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted hover:border-muted-foreground/40",
                                                            conflicted && !isSel && "opacity-60"
                                                        )}
                                                        disabled={conflicted && !isSel}
                                                        title={conflicted ? "Room already booked for these dates" : `${r.id} — ${r.type}`}
                                                    >
                                                        <div className="flex w-full items-center justify-between gap-1">
                                                            <span className="font-black text-xs">{r.id}</span>
                                                            {isSel && (
                                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase text-muted-foreground">{r.type}</span>
                                                        <div className="flex w-full items-center justify-between gap-1">
                                                            <span className="text-[10px] font-bold text-primary">{formatCurrency(tierPrice)}</span>
                                                            {r.hkStatus === 'dirty' && <span className="text-[8px] font-bold text-destructive uppercase">Dirty</span>}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {selectedRoomIds.length > 1 && (
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide">{selectedRoomIds.length} rooms selected</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                <div className="h-4 w-1 bg-primary rounded-full" />
                                Guest Information
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Guest Full Name</Label>
                                    <Input placeholder="John Doe" className="h-9" value={newBooking.guestName} onChange={e => setNewBooking({...newBooking, guestName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Pricing Tier{selectedRoomIds.length > 1 ? <span className="text-muted-foreground"> (per room)</span> : ""}</Label>
                                    {selectedRoomIds.length <= 1 ? (
                                        <Select value={newBooking.pricingTierId || 'default'} onValueChange={v => {
                                            const room = selectedRoomForBooking;
                                            const tier = room?.pricingTiers?.find(t => t.id === v);
                                            const nextSelections = { ...(newBooking.roomSelections || {}) };
                                            selectedRoomIds.forEach(id => {
                                                nextSelections[id] = { pricingTierId: v, bookingType: tier?.label || 'Per Day' };
                                            });
                                            setNewBooking({
                                                ...newBooking,
                                                pricingTierId: v,
                                                bookingType: tier?.label || 'Per Day',
                                                roomSelections: nextSelections
                                            });
                                        }}>
                                            <SelectTrigger className="h-9 text-[11px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {(selectedRoomForBooking?.pricingTiers?.length ? selectedRoomForBooking.pricingTiers : [{ id: 'default', label: 'Default', price: selectedRoomForBooking?.price || 0 }]).map(t => (
                                                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.label} — {formatCurrency(t.price)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedRoomIds.map(rid => {
                                                const room = rooms.find(r => r.id === rid);
                                                const sel = newBooking.roomSelections?.[rid];
                                                const selTierId = sel?.pricingTierId || 'default';
                                                const tiers = (room && room.pricingTiers && room.pricingTiers.length) ? room.pricingTiers : (room ? [{ id: 'default', label: 'Default', price: room.price || 0 }] : []);
                                                return (
                                                    <div key={rid} className="flex items-center gap-2">
                                                        <span className="font-black text-xs w-14 shrink-0">{rid}</span>
                                                        <Select value={selTierId} onValueChange={v => {
                                                            const tier = room?.pricingTiers?.find(t => t.id === v);
                                                            const bookingType = tier?.label || sel?.bookingType || 'Per Day';
                                                            setNewBooking(prev => {
                                                                const selections = { ...(prev.roomSelections || {}), [rid]: { pricingTierId: v, bookingType } };
                                                                const primary = prev.selectedRoomIds?.[0] || rid;
                                                                const primarySel = selections[primary];
                                                                return {
                                                                    ...prev,
                                                                    roomSelections: selections,
                                                                    pricingTierId: primarySel?.pricingTierId || v,
                                                                    bookingType: primarySel?.bookingType || bookingType
                                                                };
                                                            });
                                                        }}>
                                                            <SelectTrigger className="h-9 text-[11px] flex-1"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {tiers.map(t => (
                                                                    <SelectItem key={t.id} value={t.id} className="text-xs">{t.label} — {formatCurrency(t.price)}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">ID / Passport No.</Label>
                                    <Input placeholder="ID Card or Passport" className="h-9" value={newBooking.guestIdPassport} onChange={e => setNewBooking({...newBooking, guestIdPassport: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Phone Number</Label>
                                    <Input placeholder="Mobile No" className="h-9" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Email Address</Label>
                                    <Input type="email" placeholder="guest@example.com" className="h-9" value={newBooking.email} onChange={e => setNewBooking({...newBooking, email: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                <div className="h-4 w-1 bg-primary rounded-full" />
                                Booking Source
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Source / Platform</Label>
                                    <Select value={newBooking.source || 'Direct'} onValueChange={v => setNewBooking({...newBooking, source: v, externalId: v === 'Direct' ? '' : newBooking.externalId, customSource: v !== 'Other' ? '' : newBooking.customSource})}>
                                        <SelectTrigger className="h-9 text-[11px]">
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Direct" className="text-xs">Direct (Walk-in / Phone)</SelectItem>
                                            <SelectItem value="Booking.com" className="text-xs">Booking.com</SelectItem>
                                            <SelectItem value="Agoda" className="text-xs">Agoda</SelectItem>
                                            <SelectItem value="Trip.com" className="text-xs">Trip.com</SelectItem>
                                            <SelectItem value="Expedia" className="text-xs">Expedia</SelectItem>
                                            <SelectItem value="Airbnb" className="text-xs">Airbnb</SelectItem>
                                            <SelectItem value="Other" className="text-xs">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newBooking.source === 'Other' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs">Custom Source Name</Label>
                                        <Input placeholder="e.g. MakeMyTrip" className="h-9" value={newBooking.customSource} onChange={e => setNewBooking({...newBooking, customSource: e.target.value})} />
                                    </div>
                                )}
                                {newBooking.source && newBooking.source !== 'Direct' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs">External Reference / Confirmation ID</Label>
                                        <Input placeholder="OTA confirmation #" className="h-9" value={newBooking.externalId} onChange={e => setNewBooking({...newBooking, externalId: e.target.value})} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4 pb-4">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                                <div className="h-4 w-1 bg-primary rounded-full" />
                                Summary & Payment
                            </div>
                            {(() => {
                                const p = getPricePreview();
                                if (!p) return null;
                                return (
                                <div key={p.stayMode + p.roomCount} className="p-4 bg-muted/20 rounded-xl space-y-3">
                                    {p.lines.map(line => (
                                        <div key={line.label} className="flex justify-between text-[11px]">
                                            <span className="font-medium text-muted-foreground">{line.label} · {p.units} {p.stayMode === 'hourly' ? 'slot(s)' : 'night(s)'}</span>
                                            <span className="font-black">{formatCurrency(line.subtotal)}</span>
                                        </div>
                                    ))}
                                    <Separator className="my-1" />
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold">Room Total ({p.roomCount} {p.roomCount > 1 ? 'rooms' : 'room'})</span>
                                        <span className="font-black text-primary">{formatCurrency(p.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-medium text-muted-foreground">Advance</span>
                                        <span className="font-black text-muted-foreground">− {formatCurrency(p.advance)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold">Balance Due</span>
                                        <span className={cn("font-black", p.balance > 0 ? "text-destructive" : "text-green-600")}>{formatCurrency(Math.max(0, p.balance))}</span>
                                    </div>
                                </div>
                                );
                            })()}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Number of Guests</Label>
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={isNaN(newBooking.guests) ? "" : (newBooking.guests === 0 ? "" : newBooking.guests)}
                                        onChange={e => setNewBooking({...newBooking, guests: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Advance Received (₹)</Label>
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={isNaN(newBooking.advance) ? "" : (newBooking.advance === 0 ? "" : newBooking.advance)}
                                        onChange={e => setNewBooking({...newBooking, advance: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="bg-muted/10 p-4 border-t shrink-0">
                    <Button onClick={handleAddOrEditBooking} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs" disabled={selectedRoomIds.length === 0 || availabilityConflicts.length > 0}>
                        {editingBookingId ? 'Update Reservation' : 'Confirm Reservation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-4 non-printable items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search guest or ID..." 
                        className="pl-9 h-10 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    <Popover open={isListDatePickerOpen} onOpenChange={setIsListDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("h-10 text-xs gap-2 shrink-0 px-3", listDateFilter && "border-primary text-primary bg-primary/5")}>
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {listDateFilter ? format(listDateFilter, 'PP') : 'Filter by Date'}
                                {listDateFilter && (
                                    <X className="h-3 w-3 ml-1 hover:text-destructive" onClick={(e) => {
                                        e.stopPropagation();
                                        setListDateFilter(null);
                                    }} />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden z-[60]" align="end">
                            <Calendar
                                mode="single"
                                selected={listDateFilter || undefined}
                                onSelect={(d) => {
                                    setListDateFilter(d || null);
                                    setIsListDatePickerOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px] sm:w-[140px] h-10 text-xs shrink-0">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Status</SelectItem>
                            <SelectItem value="active" className="text-xs">Active</SelectItem>
                            <SelectItem value="upcoming" className="text-xs">Upcoming</SelectItem>
                            <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                            <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                        <SelectTrigger className="w-[120px] sm:w-[140px] h-10 text-xs shrink-0">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3 w-3" />
                                <SelectValue placeholder="Room Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Types</SelectItem>
                            {uniqueRoomTypes.map(t => (
                                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="non-printable overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-24">ID</TableHead>
                                <TableHead>Guest Detail</TableHead>
                                <TableHead className="hidden sm:table-cell">Room</TableHead>
                                <TableHead>Stay Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookingsList.map(b => (
                                <TableRow key={b.id} className="group h-16">
                                    <TableCell className="font-mono text-[10px] font-bold text-primary">{b.id.slice(-6).toUpperCase()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">{b.guestName}</span>
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">{b.phone}</span>
                                            {b.source && b.source !== 'Direct' && (
                                                <span className={cn(
                                                    "inline-flex items-center mt-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full w-fit",
                                                    b.source === 'Booking.com' && "bg-blue-100 text-blue-700",
                                                    b.source === 'Agoda' && "bg-orange-100 text-orange-700",
                                                    b.source === 'Trip.com' && "bg-indigo-100 text-indigo-700",
                                                    b.source === 'Expedia' && "bg-yellow-100 text-yellow-700",
                                                    b.source === 'Airbnb' && "bg-pink-100 text-pink-700",
                                                    b.source !== 'Booking.com' && b.source !== 'Agoda' && b.source !== 'Trip.com' && b.source !== 'Expedia' && b.source !== 'Airbnb' && "bg-gray-100 text-gray-700"
                                                )}>
                                                    {b.source}{b.externalId ? ` #${b.externalId}` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs">Room {b.roomId}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase">{b.bookingType || 'Base'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-[10px]">
                                            <span className="font-bold">{b.checkIn} {b.checkInTime || ''}</span>
                                            <span className="text-muted-foreground hidden sm:inline">{b.stayMode === 'hourly' ? b.timeRange : `to ${b.checkOut} ${b.checkOutTime || ''}`}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={b.status === 'active' ? 'default' : b.status === 'upcoming' ? 'secondary' : 'outline'} className="capitalize text-[8px] sm:text-[9px] h-5 px-1.5">
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-blue-600 hidden sm:flex"
                                                onClick={() => {
                                                    setSelectedBookingId(b.id);
                                                    setIsQrOpen(true);
                                                }}
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </Button>

                                            {(b.status === 'active' || b.status === 'upcoming') && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-primary"
                                                    onClick={() => {
                                                        setSelectedBookingId(b.id);
                                                        setIsChargeOpen(true);
                                                    }}
                                                    title="Add Service/Product"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleOpenEdit(b)}
                                                title="Edit Reservation"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            
                                            {b.status === 'active' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 border-blue-200 text-blue-700 text-[9px] sm:text-[10px] font-bold"
                                                    onClick={() => {
                                                        setSelectedBookingId(b.id);
                                                        setIsCheckoutOpen(true);
                                                    }}
                                                >
                                                    <LogOut className="h-3 w-3 mr-1" /> <span className="hidden sm:inline">Checkout</span>
                                                </Button>
                                            ) : b.status === 'upcoming' ? (
                                                <Button size="sm" variant="outline" className="h-8 px-2 border-primary/20 text-primary text-[9px] sm:text-[10px] font-bold" onClick={() => updateBookingStatus(b.id, 'active')}>
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> <span className="hidden sm:inline">Check-In</span>
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-emerald-600"
                                                    onClick={() => {
                                                        setSelectedBookingId(b.id);
                                                        setIsPrintOpen(true);
                                                    }}
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredBookingsList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic text-sm">
                                        No bookings found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-3 bg-card border rounded-xl shadow-sm non-printable">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-full text-xs" onClick={handleJumpToToday}>Today</Button>
                    <div className="flex gap-1 flex-grow sm:flex-none justify-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrevRange}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNextRange}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    {calendarDates.length > 0 && (
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap bg-muted/50 px-3 py-1.5 rounded-full">
                            {format(calendarDates[0], 'MMM dd')} — {format(calendarDates[13], 'MMM dd')}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input 
                            placeholder="Jump to guest..." 
                            className="pl-9 h-8 text-xs rounded-full bg-muted/30 border-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-muted/30 border-none [&>svg:last-child]:hidden">
                            <MoreVertical className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="all" className="text-xs">All Types</SelectItem>
                            {uniqueRoomTypes.map(t => (
                                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="border rounded-2xl overflow-hidden bg-card shadow-lg relative">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[1000px] lg:min-w-[1200px]">
                        {/* Header Dates */}
                        <div className="flex border-b bg-muted/5">
                            <div className="w-28 sm:w-36 md:w-48 shrink-0 p-4 border-r bg-muted/10 font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-center sticky left-0 z-30">Room / Timeline</div>
                            <div className="flex flex-1">
                                {calendarDates.map(date => {
                                    const isToday = isSameDay(date, new Date());
                                    return (
                                        <div key={date.toISOString()} className={cn(
                                            "flex-1 min-w-[70px] p-3 text-center border-r last:border-r-0 flex flex-col items-center gap-1",
                                            isToday && "bg-primary/[0.03]"
                                        )}>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-tighter",
                                                isToday ? "text-primary" : "text-muted-foreground"
                                            )}>{format(date, 'eee')}</span>
                                            <span className={cn(
                                                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-black",
                                                isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                                            )}>{format(date, 'dd')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Timeline Grid */}
                        <div className="relative">
                            <div className="relative">
                                {filteredCalendarRooms.map(room => (
                                    <div key={room.id} className="flex border-b last:border-b-0 min-h-[85px] group/row relative">
                                        {/* Room Sidebar Info */}
                                        <div className="w-28 sm:w-36 md:w-48 shrink-0 p-4 border-r bg-card flex flex-col justify-center gap-1.5 z-30 sticky left-0 shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
                                            <div>
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="font-black text-sm">{room.id}</p>
                                                    <p className="text-[10px] font-black text-primary">{formatCurrency(room.price)}</p>
                                                </div>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">{room.type}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {room.hkStatus === 'dirty' ? (
                                                    <Badge variant="destructive" className="h-4 px-1.5 text-[8px] gap-1 font-black uppercase tracking-tighter">
                                                        <Droplets className="h-2 w-2" /> Dirty
                                                    </Badge>
                                                ) : room.hkStatus === 'inspecting' ? (
                                                    <Badge variant="secondary" className="h-4 px-1.5 text-[8px] gap-1 font-black uppercase tracking-tighter">
                                                        <Search className="h-2 w-2" /> Inspecting
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="success" className="h-4 px-1.5 text-[8px] gap-1 font-black uppercase tracking-tighter bg-green-500/10 text-green-600 border-green-200">
                                                        <Sparkles className="h-2 w-2" /> Clean
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Background Day Cells */}
                                        <div className="flex flex-1 relative">
                                            {calendarDates.map(date => {
                                                const isToday = isSameDay(date, new Date());
                                                const price = getEffectivePrice(room.id, date);
                                                const isOverridden = roomDatePricing?.[room.id]?.[format(date, 'yyyy-MM-dd')] !== undefined;
                                                return (
                                                    <div 
                                                        key={`${room.id}-${date.toISOString()}`} 
                                                        className={cn(
                                                            "flex-1 min-w-[70px] border-r last:border-r-0 h-full cursor-pointer transition-colors relative flex flex-col items-center justify-center",
                                                            isToday ? "bg-primary/[0.01]" : "hover:bg-muted/30",
                                                            isOverridden && "bg-amber-50/50 dark:bg-amber-950/10"
                                                        )}
                                                        onClick={() => handleCellClick(room.id, date)}
                                                    >
                                                        <p className={cn(
                                                            "text-[9px] font-bold leading-tight",
                                                            isOverridden ? "text-amber-600 dark:text-amber-400" : "text-primary/70"
                                                        )}>
                                                            {formatCurrency(price)}
                                                        </p>
                                                    </div>
                                                );
                                            })}

                                            {/* Spanning Booking Bars */}
                                            {calendarDates.length > 0 && bookings
                                                .filter(b => b.roomId === room.id && b.status !== 'cancelled' && b.status !== 'completed')
                                                .map(b => {
                                                    // Robust date parsing using local midnight reference
                                                    const startDate = parseLocalDate(b.checkIn)!;
                                                    const endDate = b.stayMode === 'hourly' ? startDate : parseLocalDate(b.checkOut)!;
                                                    
                                                    const rangeStart = calendarDates[0];
                                                    const rangeEnd = calendarDates[13];

                                                    if (isAfter(startDate, rangeEnd) || isBefore(endDate, rangeStart)) return null;

                                                    const visibleStart = max([startDate, rangeStart]);
                                                    const visibleEnd = min([endDate, rangeEnd]);

                                                    const offsetDays = differenceInDays(visibleStart, rangeStart);
                                                    
                                                    // Daily stay: occupies check-in through check-out day.
                                                    // Hourly stay: occupies the specific check-in day column.
                                                    const rawDuration = differenceInDays(visibleEnd, visibleStart);
                                                    const durationDays = b.stayMode === 'hourly' ? 1 : Math.max(1, rawDuration + 1);
                                                    
                                                    const leftPercent = (offsetDays / 14) * 100;
                                                    const widthPercent = (durationDays / 14) * 100;

                                                    return (
                                                        <div 
                                                            key={b.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBookingId(b.id);
                                                                setIsStayActionsOpen(true);
                                                            }}
                                                            className={cn(
                                                                "absolute top-4 h-[55px] rounded-xl border shadow-sm cursor-pointer z-20 transition-all hover:scale-[1.02] hover:shadow-md px-3 py-2 flex flex-col justify-center overflow-hidden",
                                                                b.status === 'active' 
                                                                    ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-100" 
                                                                    : "bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-100"
                                                            )}
                                                            style={{ 
                                                                // Use a small 4px "click gutter" to ensure the cell boundary remains clickable
                                                                left: `calc(${leftPercent}% + 2px)`, 
                                                                width: `calc(${widthPercent}% - 4px)` 
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                                <span className="text-[10px] font-black uppercase truncate">{b.guestName}</span>
                                                                {b.stayMode === 'hourly' && <Clock className="h-3 w-3 shrink-0" />}
                                                            </div>
                                                            <p className="text-[8px] font-bold opacity-70 truncate">
                                                                {b.stayMode === 'hourly' ? b.timeRange : `${differenceInDays(parseLocalDate(b.checkOut)!, parseLocalDate(b.checkIn)!)} Nts`}
                                                            </p>
                                                            <p className="text-[7px] font-medium opacity-50 truncate">
                                                                {b.checkInTime} - {b.checkOutTime}
                                                            </p>
                                                            {b.source && b.source !== 'Direct' && (
                                                                <p className="text-[6px] font-bold opacity-60 truncate">{b.source}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Visual horizontal scroll indicator for mobile */}
                <div className="absolute bottom-2 right-4 bg-primary/20 backdrop-blur px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-primary animate-pulse pointer-events-none sm:hidden">
                    Scroll for more &rarr;
                </div>
            </Card>
        </div>
      )}

      {/* Stay Actions Dialog (From Calendar) */}
      <div className="non-printable">
      <Dialog open={isStayActionsOpen} onOpenChange={setIsStayActionsOpen}>
        <DialogContent className="sm:max-w-sm flex flex-col p-0 overflow-hidden rounded-[2rem]">
            <DialogHeader className="p-6 bg-primary text-primary-foreground shrink-0">
                <DialogTitle className="text-xl font-black uppercase tracking-tight truncate">
                    {activeBooking?.guestName}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                    Room {activeBooking?.roomId} • Booking #{activeBooking?.id.slice(-6).toUpperCase()}
                </DialogDescription>
            </DialogHeader>
            <div className="p-4 grid grid-cols-1 gap-3">
                {(activeBooking?.status === 'active' || activeBooking?.status === 'upcoming') && (
                    <Button 
                        size="lg" 
                        className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                        onClick={() => {
                            setIsStayActionsOpen(false);
                            setIsChargeOpen(true);
                        }}
                    >
                        <PlusCircle className="h-5 w-5" /> Add Service / Product
                    </Button>
                )}
                
                {activeBooking?.status === 'upcoming' && (
                    <Button 
                        variant="default" 
                        size="lg" 
                        className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                        onClick={() => {
                            updateBookingStatus(activeBooking.id, 'active');
                            setIsStayActionsOpen(false);
                            toast({ title: "Checked In", description: `${activeBooking.guestName} is now active.` });
                        }}
                    >
                        <CheckCircle2 className="h-5 w-5" /> Check-In Guest
                    </Button>
                )}

                <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                    onClick={() => {
                        setIsStayActionsOpen(false);
                        handleOpenEdit(activeBooking!);
                    }}
                >
                    <Edit className="h-5 w-5" /> Edit Reservation
                </Button>

                <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                    onClick={() => {
                        setIsStayActionsOpen(false);
                        setIsQrOpen(true);
                    }}
                >
                    <QrCode className="h-5 w-5" /> View Digital Bill QR
                </Button>
                <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                    onClick={() => {
                        setIsStayActionsOpen(false);
                        setIsPrintOpen(true);
                    }}
                >
                    <Printer className="h-5 w-5" /> Print Proforma Bill
                </Button>
                {activeBooking?.status === 'active' && (
                    <Button 
                        variant="secondary" 
                        size="lg" 
                        className="h-14 rounded-xl gap-3 font-bold text-sm justify-start"
                        onClick={() => {
                            setIsStayActionsOpen(false);
                            setIsCheckoutOpen(true);
                        }}
                    >
                        <LogOut className="h-5 w-5" /> Checkout Guest
                    </Button>
                )}
            </div>
            <DialogFooter className="p-4 bg-muted/30">
                <Button variant="ghost" className="w-full font-bold" onClick={() => setIsStayActionsOpen(false)}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Add Extra Charge Dialog */}
      <div className="non-printable">
      <Dialog open={isChargeOpen} onOpenChange={setIsChargeOpen}>
        <DialogContent className="sm:max-w-md h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle>Add Service / Product</DialogTitle>
            <DialogDescription>Add items to {activeBooking?.guestName}'s bill.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto min-h-0 px-6 py-4">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Search Catalog</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Find product..." 
                            className="pl-9 h-11 bg-muted/20 border-none rounded-xl"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>
                    {productSearch && (
                        <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2">
                            {filteredChargeProducts.map(p => (
                                <Button 
                                    key={p.id} 
                                    variant="outline" 
                                    className="w-full justify-between h-10 px-3 rounded-lg text-xs"
                                    onClick={() => handleAddProductCharge(p)}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-lg">{p.emoji}</span>
                                        <span className="font-bold">{p.name}</span>
                                    </span>
                                    <span className="font-black text-primary">{formatCurrency(p.price)}</span>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex items-center gap-2 py-2">
                    <Separator className="flex-1" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Or Manual Entry</span>
                    <Separator className="flex-1" />
                </div>

                <div className="space-y-4 bg-muted/10 p-4 rounded-2xl border border-dashed">
                    <div className="space-y-2">
                        <Label className="text-xs">Description</Label>
                        <Input 
                            placeholder="e.g. Extra Laundry" 
                            className="h-10"
                            value={newCharge.description}
                            onChange={e => setNewCharge({...newCharge, description: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input 
                            type="number"
                            placeholder="0.00"
                            className="h-10 font-bold"
                            value={newCharge.amount || ''}
                            onChange={e => setNewCharge({...newCharge, amount: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter className="p-4 bg-muted/10 border-t shrink-0">
            <Button 
                onClick={handleAddCharge} 
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                disabled={!newCharge.description || !newCharge.amount}
            >
                Add to Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Checkout Dialog */}
      <div className="non-printable">
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle>Final Bill & Check-Out</DialogTitle>
          </DialogHeader>
          {activeBooking && groupBilling && (
            <div className="flex-grow overflow-y-auto min-h-0 px-6 py-4">
                <div className="space-y-6 py-1">
                    <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 p-4 rounded-xl">
                        <div className="col-span-2">
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Guest</p>
                            <p className="font-bold truncate">{activeBooking.guestName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Room(s)</p>
                            <p className="font-bold">{groupBilling.lines.map(l => l.roomId).join(', ')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Rooms</p>
                            <p className="font-bold">{groupBilling.roomCount} {groupBilling.roomCount > 1 ? 'Rooms' : 'Room'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Check-In</p>
                            <p className="font-bold">{activeBooking.checkIn} {activeBooking.checkInTime}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Check-Out</p>
                            <p className="font-bold">{activeBooking.checkOut} {activeBooking.checkOutTime}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Total Units</p>
                            <p className="font-bold">{groupBilling.lines.reduce((s, l) => s + l.units, 0)} Units</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-[9px] uppercase font-black tracking-wider">Subtotal</p>
                            <p className="font-black text-primary">{formatCurrency(groupBilling.total)}</p>
                        </div>
                    </div>

                    <div className="border rounded-xl p-4 space-y-3 bg-card shadow-sm">
                        {groupBilling.lines.map((l, idx) => (
                            <div key={l.bookingId} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        {l.roomId} · Room Stay ({l.unitPrice ? `${formatCurrency(l.unitPrice)}` : ''}{l.units} unit{l.units !== 1 ? 's' : ''})
                                    </span>
                                    <span className="font-medium">{formatCurrency(l.roomSubtotal)}</span>
                                </div>
                                {l.extras.map(c => (
                                    <div key={c.id} className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground truncate mr-4">• {l.roomId}: {c.description}</span>
                                        <span className="shrink-0">{formatCurrency(c.amount)}</span>
                                    </div>
                                ))}
                                {idx < groupBilling.lines.length - 1 && <Separator className="my-1" />}
                            </div>
                        ))}
                        <div className="flex justify-between text-xs pt-1 border-t border-dashed">
                            <span className="text-muted-foreground">Combined Room Charges</span>
                            <span className="font-medium">{formatCurrency(groupBilling.roomSubtotal)}</span>
                        </div>
                        {groupBilling.extras.length > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Extra Charges</span>
                                <span className="font-medium">{formatCurrency(groupBilling.extrasSubtotal)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-xs text-green-600 font-bold">
                            <span>Advance Paid</span>
                            <span className="font-mono">-{formatCurrency(groupBilling.advance)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black border-t pt-2 mt-2 text-primary">
                            <span className="text-sm uppercase tracking-tighter">Net Balance</span>
                            <span className="font-mono">{formatCurrency(groupBilling.balance)}</span>
                        </div>
                    </div>

                    <div className="space-y-2 p-4 border-2 border-blue-100 bg-blue-50/30 rounded-xl">
                        <Label className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Final Collection</Label>
                        <Input
                            type="number"
                            value={checkoutPaymentAmount === 0 ? '' : checkoutPaymentAmount}
                            onChange={(e) => setCheckoutPaymentAmount(parseFloat(e.target.value) || 0)}
                            className="text-2xl font-black border-blue-200 focus-visible:ring-blue-500 h-14 bg-white"
                        />
                    </div>
                </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2 bg-muted/10 p-4 border-t shrink-0">
            <div className="flex flex-wrap gap-2 justify-center w-full">
                <Button variant="destructive" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => handleCompleteCheckout()}>
                    <Brush className="h-3.5 w-3.5 mr-2" /> Mark Dirty & Checkout
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* Interim Bill Preview */}
      <div className="non-printable">
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="sm:max-w-2xl h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle>Guest Bill Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto min-h-0 px-6 py-4">
                {activeBooking && groupBilling && (
                <div id="hotel-receipt" className="font-mono text-black print-container bg-white mb-4 text-xs" style={{ fontSize: `${Math.round(10 * printFontScale)}px`, border: '3px solid #000', borderRadius: '12px', padding: '0.5rem' }}>
                    <div className="text-center mb-3">
                        {hotelLogo && (
                            <div className="flex justify-center mb-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={hotelLogo} alt="Hotel Logo" style={{ maxHeight: `${Math.round(50 * printFontScale)}px`, maxWidth: '80%', objectFit: 'contain' }} className="mx-auto" />
                            </div>
                        )}
                        <h1 className="font-bold uppercase tracking-tighter mb-1" style={{ fontSize: `${Math.round(16 * printFontScale)}px` }}>{storeName}</h1>
                        <p style={{ fontSize: `${Math.round(8.5 * printFontScale)}px` }}>{storeAddress}</p>
                        <p style={{ fontSize: `${Math.round(8.5 * printFontScale)}px` }}>Tel: {storePhone}</p>
                        <div className="my-2 py-1" style={{ borderTop: '3px solid #000', borderBottom: '3px solid #000', marginLeft: '-0.5rem', marginRight: '-0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                            <h2 className="font-bold uppercase" style={{ fontSize: `${Math.round(13 * printFontScale)}px` }}>Proforma Bill</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-0.5 mb-3" style={{ fontSize: `${Math.round(8.5 * printFontScale)}px` }}>
                        <p className="font-bold">Bill No:</p><p className="text-right">BK-{activeBooking.id.slice(-6).toUpperCase()}</p>
                        <p className="font-bold">Date:</p><p className="text-right">{new Date().toLocaleDateString()}</p>
                        <p className="font-bold">Guest:</p><p className="text-right">{activeBooking.guestName}</p>
                        <p className="font-bold">Rooms:</p><p className="text-right">{groupBilling.lines.map(l => l.roomId).join(', ')}</p>
                        <p className="font-bold">Stay:</p><p className="text-right">{activeBooking.checkIn} {activeBooking.checkInTime} — {activeBooking.checkOut} {activeBooking.checkOutTime}</p>
                        <p className="font-bold">Units:</p><p className="text-right">{groupBilling.lines.reduce((s, l) => s + l.units, 0)} {activeBooking.stayMode === 'hourly' ? 'Slots' : 'Nights'}</p>
                    </div>
                    <table className="w-full mb-3 border-collapse" style={{ fontSize: `${Math.round(8.5 * printFontScale)}px`, marginLeft: '-0.5rem', marginRight: '-0.5rem', width: 'calc(100% + 1rem)' }}>
                        <thead className="border-b border-black">
                            <tr>
                                <th className="text-left py-1 uppercase tracking-tighter">Description</th>
                                <th className="text-right py-1 uppercase tracking-tighter">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupBilling.lines.map(l => (
                                <Fragment key={l.bookingId}>
                                    <tr>
                                        <td className="py-1">Room {l.roomId} Stay ({l.units} @ {formatCurrency(l.unitPrice)})</td>
                                        <td className="text-right py-1">{formatCurrency(l.roomSubtotal)}</td>
                                    </tr>
                                    {l.extras.map(c => (
                                        <tr key={c.id}>
                                            <td className="py-0.5 text-black truncate mr-2">• {l.roomId}: {c.description}</td>
                                            <td className="text-right py-0.5">{formatCurrency(c.amount)}</td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                            {groupBilling.lines.length > 1 && (
                                <tr style={{ borderTop: '3px solid #000' }}>
                                    <td className="py-1 font-bold">Combined Room Charges</td>
                                    <td className="text-right py-1 font-bold">{formatCurrency(groupBilling.roomSubtotal)}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t border-black font-bold pt-1">
                            <tr><td className="py-0.5">Gross Total</td><td className="text-right py-0.5">{formatCurrency(groupBilling.total)}</td></tr>
                            <tr className="text-black"><td className="py-0.5">Less: Advance Paid</td><td className="text-right py-0.5">-{formatCurrency(groupBilling.advance)}</td></tr>
                            <tr className="font-black" style={{ fontSize: `${Math.round(13 * printFontScale)}px` }}><td className="py-1">Net Payable</td><td className="text-right py-1">{formatCurrency(groupBilling.balance)}</td></tr>
                        </tfoot>
                    </table>
                    <div className="text-center py-2" style={{ fontSize: `${Math.round(8.5 * printFontScale)}px` }}>
                        <p className="font-black uppercase tracking-tighter">How was your Experience?</p>
                        <p>Scan the QR Code to leave a review and let us know</p>
                        {reviewQrCode && (
                            <div className="pt-1">
                                <p className="font-bold uppercase tracking-widest mb-0.5">Scan me!</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={reviewQrCode} alt="Google Review QR" className="inline-block bg-white" style={{ width: `${Math.round(75 * printFontScale)}px`, height: `${Math.round(75 * printFontScale)}px`, objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                    <div className="text-center text-black" style={{ fontSize: `${Math.round(7.5 * printFontScale)}px`, borderTop: '3px solid #000', paddingTop: '0.4rem', marginLeft: '-0.5rem', marginRight: '-0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                        <p>This is an interim bill summary.</p>
                    </div>
                </div>
                )}
          </div>
          <DialogFooter className="p-6 border-t bg-muted/10 flex flex-row gap-2 shrink-0">
            <Button variant="outline" className="flex-1" onClick={() => setIsPrintOpen(false)}>Close</Button>
            <Button className="flex-1" onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      {/* QR Code Modal */}
      <div className="non-printable">
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-sm flex flex-col p-6 overflow-hidden rounded-[2rem]">
          <DialogHeader className="mb-4 shrink-0">
            <DialogTitle className="text-center">Mobile Bill QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="p-6 bg-white rounded-[2rem] shadow-inner border-2 border-muted/50">
              <QRCodeSVG 
                value={billPublicUrl} 
                size={180} 
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="font-black text-sm uppercase tracking-widest text-primary">{activeBooking?.guestName}</p>
              <Badge variant="outline" className="text-[10px] font-mono lowercase">{billPublicUrl.replace(/^https?:\/\//, '')}</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-6 h-12 rounded-xl font-bold" onClick={() => setIsQrOpen(false)}>Done</Button>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}