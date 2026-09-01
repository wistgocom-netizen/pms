'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Save, X, DollarSign, CheckSquare, Square, CalendarDays } from 'lucide-react';
import { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function DynamicPricingPage() {
  const { rooms, roomDatePricing, setRoomDatePrice, clearRoomDatePrice, setBulkRoomDatePrices, formatCurrency, isLoading } = useStore();
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [editingCell, setEditingCell] = useState<{ roomId: string; date: string } | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [selectedPricingTierId, setSelectedPricingTierId] = useState<string | null>(null);
  const [editPricingTierId, setEditPricingTierId] = useState<string | null>(null);

  const [selectedCells, setSelectedCells2] = useState<Set<string>>(new Set());
  const [isBulkDialogOpen, setIsBulkDialogOpen2] = useState(false);
  const [bulkPrice, setBulkPrice2] = useState('');
  const [editingCell, setEditingCell2] = useState<{ roomId: string; date: string } | null>(null);
  const [editPrice, setEditPrice2] = useState('');
  const [selectedPricingTierId2, setSelectedPricingTierId2] = useState<string | null>(null);
  const [editPricingTierId2, setEditPricingTierId2] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDay = getDay(startOfMonth(currentMonth));

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getPriceForDate = useCallback((roomId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return roomDatePricing?.[roomId]?.[dateStr];
  }, [roomDatePricing]);

  const getEffectivePrice = useCallback((roomId: string, date: Date) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    return getPriceForDate(roomId, date) ?? room.price;
  }, [rooms, getPriceForDate]);

  const cellKey = (roomId: string, dateStr: string) => `${roomId}|${dateStr}`;

  const isCellSelected = (roomId: string, dateStr: string) => selectedCells.has(cellKey(roomId, dateStr));

  const toggleCell = (roomId: string, dateStr: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      const key = cellKey(roomId, dateStr);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectRoomRow = (roomId: string) => {
    setSelectedCells(prev => {
      const next = new Set(prev);
      const roomCells = daysInMonth.map(d => cellKey(roomId, format(d, 'yyyy-MM-dd')));
      const allSelected = roomCells.every(c => next.has(c));
      if (allSelected) {
        roomCells.forEach(c => next.delete(c));
      } else {
        roomCells.forEach(c => next.add(c));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedCells(new Set());

  const selectAll = () => {
    if (selectedCells.size === rooms.length * daysInMonth.length) {
      setSelectedCells(new Set());
    } else {
      const all = new Set<string>();
      rooms.forEach(r => daysInMonth.forEach(d => all.add(cellKey(r.id, format(d, 'yyyy-MM-dd')))));
      setSelectedCells(all);
    }
  };

  const selectedRoomIds = useMemo(() => {
    const ids = new Set<string>();
    selectedCells.forEach(key => ids.add(key.split('|')[0]));
    return ids;
  }, [selectedCells]);

  const selectedDates = useMemo(() => {
    const dates = new Set<string>();
    selectedCells.forEach(key => dates.add(key.split('|')[1]));
    return dates;
  }, [selectedCells]);

  const handleCellClick = (roomId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    toggleCell(roomId, dateStr);
  };

  const handleCellDoubleClick = (roomId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const current = getPriceForDate(roomId, date);
    setEditingCell({ roomId, date: dateStr });
    setEditPrice(current !== undefined ? String(current) : String(getEffectivePrice(roomId, date)));
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: 'Invalid Price', description: 'Please enter a valid price.', variant: 'destructive' });
      return;
    }
    setRoomDatePrice(editingCell.roomId, editingCell.date, price);
    toast({ title: 'Price Updated', description: `Price set to ${formatCurrency(price)}.` });
    setEditingCell(null);
  };

  const handleClearCell = () => {
    if (!editingCell) return;
    clearRoomDatePrice(editingCell.roomId, editingCell.date);
    toast({ title: 'Price Cleared', description: 'Reverted to default room price.' });
    setEditingCell(null);
  };

  const handleBulkUpdate = () => {
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: 'Invalid Price', description: 'Please enter a valid price.', variant: 'destructive' });
      return;
    }
    const roomIds = selectedRoomIds.size > 0 ? Array.from(selectedRoomIds) : rooms.map(r => r.id);
    const dates = selectedDates.size > 0 ? Array.from(selectedDates) : daysInMonth.map(d => format(d, 'yyyy-MM-dd'));
    setBulkRoomDatePrices(roomIds, dates, price);
    toast({ title: 'Bulk Update Complete', description: `${roomIds.length} room(s) × ${dates.length} date(s) updated to ${formatCurrency(price)}.` });
    setIsBulkDialogOpen(false);
    setBulkPrice('');
  };

  const hasSelection = selectedCells.size > 0;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dynamic Pricing</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Adjust room rates based on demand, season, or events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="text-xs gap-1">
            {selectedCells.size > 0 ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
            {selectedCells.size > 0 ? 'Clear All' : 'Select All'}
          </Button>
          <Button size="sm" className="text-xs gap-1" disabled={!hasSelection} onClick={() => setIsBulkDialogOpen(true)}>
            <DollarSign className="h-3.5 w-3.5" /> Set Price
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-card rounded-lg p-3 shadow-sm border">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
        <h2 className="text-lg font-black uppercase tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      {/* Pricing Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-[140px_repeat(7,1fr)] bg-muted/50 border-b">
              <div className="p-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> Room / Date
              </div>
              {weekDays.map(d => (
                <div key={d} className="p-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider text-center">{d}</div>
              ))}
            </div>

            {/* Week Rows */}
            {rooms.map(room => {
              const weeks: Date[][] = [];
              let week: (Date | null)[] = [];
              for (let i = 0; i < startDay; i++) week.push(null);
              daysInMonth.forEach((day, i) => {
                week.push(day);
                if (week.length === 7 || i === daysInMonth.length - 1) {
                  while (week.length < 7) week.push(null);
                  weeks.push(week);
                  week = [];
                }
              });

              const roomAllDates = daysInMonth.map(d => cellKey(room.id, format(d, 'yyyy-MM-dd')));
              const roomFullySelected = roomAllDates.every(k => selectedCells.has(k));
              const roomPartiallySelected = roomAllDates.some(k => selectedCells.has(k));
              return (
                <div key={room.id} className={cn("border-b last:border-b-0", roomPartiallySelected && "bg-green-50 dark:bg-green-950/10")}>
                  {/* Room Label Row */}
                  <div className="grid grid-cols-[140px_repeat(7,1fr)]">
                    <div
                      className={cn(
                        "p-2 flex items-center gap-2 border-r cursor-pointer hover:bg-muted/30 sticky left-0 bg-card",
                        roomPartiallySelected && "bg-green-100 dark:bg-green-950/20"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                        roomFullySelected ? "bg-green-600 border-green-600 text-white" : roomPartiallySelected ? "bg-green-400/50 border-green-500 text-white" : "border-muted-foreground/30"
                      )}>
                        {(roomFullySelected || roomPartiallySelected) && <span className="text-[9px] font-black">✓</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{room.name || room.id}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">Base: {formatCurrency(room.price)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date Cells */}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isOverridden = roomDatePricing?.[room.id]?.[dateStr] !== undefined;
                    const effectivePrice = getEffectivePrice(room.id, day);
                    const isSelected = isCellSelected(room.id, dateStr);

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "p-1.5 text-center border-l border-b border-muted/20 cursor-pointer transition-colors relative group",
                          isToday(day) && "bg-primary/5",
                          isSelected && "bg-green-100 dark:bg-green-950/30 ring-1 ring-green-500/50",
                          isOverridden && "bg-amber-50 dark:bg-amber-950/20",
                          editingCell?.roomId === room.id && editingCell?.date === dateStr && "ring-2 ring-primary z-10"
                        )}
                        onClick={() => handleCellClick(room.id, day)}
                        onDoubleClick={() => handleCellDoubleClick(room.id, day)}
                      >
                        <p className={cn(
                          "text-[9px] font-medium",
                          isToday(day) && "text-primary font-bold"
                        })>
                          {format(day, 'd')}
                        </p>
                        <p className={cn(
                          "text-[10px] font-black",
                          isOverridden ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                        )}>
                          {formatCurrency(effectivePrice)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center">
        <span className="inline-block w-3 h-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-muted/20 align-middle mr-1" /> Overridden price
        <span className="mx-2">•</span>
        Click date to select • Double-click to edit price • Select room + dates then Set Price
      </p>

      {/* Edit Cell Dialog */}
      <Dialog open={!!editingCell} onOpenChange={(o) => { if (!o) setEditingCell(null); }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-tight">Set Price</DialogTitle>
          </DialogHeader>
          {editingCell && (() => {
            const room = rooms.find(r => r.id === editingCell.roomId);
            return (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <p><span className="font-medium">Room:</span> {room?.name || editingCell.roomId}</p>
                  <p><span className="font-medium">Date:</span> {format(new Date(editingCell.date), 'PPPP')}</p>
                  <p><span className="font-medium">Base Price:</span> {formatCurrency(room?.price || 0)}</p>
                </div>
                <div>
                  <Label htmlFor="edit-price" className="text-xs">New Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="text-lg font-bold h-12 mt-1"
                    autoFocus
                  />
                </div>
              </div>
            );
          })()}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={handleClearCell}>Clear</Button>
            <Button size="sm" onClick={handleSaveCell}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-tight">Bulk Set Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Rooms:</span> {selectedRoomIds.size > 0 ? `${selectedRoomIds.size} selected` : 'All rooms'}</p>
              <p><span className="font-medium">Dates:</span> {selectedDates.size > 0 ? `${selectedDates.size} selected` : `All ${daysInMonth.length} days`}</p>
            </div>
            <div>
              <Label htmlFor="bulk-price" className="text-xs">Set Price To</Label>
              <Input
                id="bulk-price"
                type="number"
                step="0.01"
                min="0"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="text-lg font-bold h-12 mt-1"
                placeholder="Enter price..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleBulkUpdate}><Save className="h-3.5 w-3.5 mr-1" /> Apply to All Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}