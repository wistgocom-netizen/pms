'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Home, Clock, Hash, ChevronDown, ChevronUp, Calendar as CalendarIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function CompletedHistoryPage() {
  const { bookings, rooms, formatCurrency, isLoading } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const completedBookings = useMemo(() => {
    let list = (bookings || [])
      .filter(b => b.status === 'completed')
      .map(b => {
        const room = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
        const extrasTotal = (b.extraCharges || []).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
        const roomSubtotal = b.totalAmount - extrasTotal;
        const total = b.totalAmount;
        const balance = total - (Number(b.advance) || 0);
        return { ...b, roomName: room?.name || b.roomId, roomSubtotal, extrasTotal, total, balance };
      });

    if (dateFilter) {
      const target = format(dateFilter, 'yyyy-MM-dd');
      list = list.filter(b => b.checkOut === target);
    }

    return list.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [bookings, rooms, dateFilter]);

  const totals = useMemo(() => {
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total, 0);
    const totalAdvance = completedBookings.reduce((sum, b) => sum + (Number(b.advance) || 0), 0);
    const totalBalance = completedBookings.reduce((sum, b) => sum + b.balance, 0);
    return { totalRevenue, totalAdvance, totalBalance };
  }, [completedBookings]);

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Completed History</h1>
          <p className="text-muted-foreground text-sm">View all checked-out guests and their final bills.</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("h-10 text-xs gap-2 shrink-0", dateFilter && "border-primary text-primary bg-primary/5")}>
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateFilter ? format(dateFilter, 'PP') : 'Filter by Date'}
              {dateFilter && (
                <X className="h-3 w-3 ml-1 hover:text-destructive" onClick={(e) => {
                  e.stopPropagation();
                  setDateFilter(null);
                }} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden z-[60]" align="end">
            <Calendar
              mode="single"
              selected={dateFilter || undefined}
              onSelect={(d) => setDateFilter(d || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-primary">{formatCurrency(totals.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{completedBookings.length} completed booking(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Advance Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-600">{formatCurrency(totals.totalAdvance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">{formatCurrency(totals.totalBalance)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Completed Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            {completedBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No completed bookings{dateFilter ? ' for this date' : ''} yet.
              </div>
            ) : (
              <div className="divide-y">
                {completedBookings.map(b => (
                  <div key={b.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{b.guestName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">#{b.id.slice(-6).toUpperCase()}</span>
                            {b.source && b.source !== 'Direct' && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-[10px]">{b.source}</span>
                              </>
                            )}
                            <span>•</span>
                            <Home className="h-3 w-3" />
                            <span>{b.roomName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-black text-primary">{formatCurrency(b.total)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs gap-1"
                          onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                        >
                          {expandedId === b.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          Details
                        </Button>
                      </div>
                    </div>

                    {expandedId === b.id && (
                      <div className="mt-4 pl-13 space-y-3 bg-muted/20 rounded-lg p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground font-medium">Check-In</p>
                            <p className="font-semibold flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground" /> {b.checkIn} {b.checkInTime || ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Check-Out</p>
                            <p className="font-semibold flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground" /> {b.checkOut} {b.checkOutTime || ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Duration</p>
                            <p className="font-semibold mt-0.5">{b.durationUnits} {b.stayMode === 'hourly' ? 'Slots' : 'Nights'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Room Type</p>
                            <p className="font-semibold mt-0.5">{b.bookingType || 'Standard'}</p>
                          </div>
                          {b.source && b.source !== 'Direct' && (
                            <div>
                              <p className="text-muted-foreground font-medium">Source</p>
                              <p className="font-semibold mt-0.5">{b.source}{b.externalId ? ` — #${b.externalId}` : ''}</p>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Room Charges ({b.durationUnits} units)</span>
                            <span className="font-medium">{formatCurrency(b.roomSubtotal)}</span>
                          </div>
                          {(b.extraCharges || []).length > 0 && (
                            <div className="space-y-1 pt-1">
                              <p className="text-muted-foreground font-medium">Extra Charges</p>
                              {(b.extraCharges || []).map(c => (
                                <div key={c.id} className="flex justify-between pl-4">
                                  <span className="text-muted-foreground">• {c.description}</span>
                                  <span>{formatCurrency(c.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total Charges</span>
                            <span>{formatCurrency(b.total)}</span>
                          </div>
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>Advance Paid</span>
                            <span>-{formatCurrency(b.advance)}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-primary pt-1 border-t border-dashed">
                            <span>Net Balance</span>
                            <span>{formatCurrency(b.balance)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono">Booking ID: {b.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
