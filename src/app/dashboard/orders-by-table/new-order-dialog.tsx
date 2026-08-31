'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useStore } from '@/context/StoreContext';
import type { Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: (order: Sale) => void;
}

export function NewOrderDialog({ open, onOpenChange, onOrderCreated }: NewOrderDialogProps) {
  const { createNewOrder, t, rooms, bookings } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('none');

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    if (roomId === 'none') {
      setCustomerName('');
      setTableNumber('');
      return;
    }

    // Set table number to room ID as default
    setTableNumber(roomId);

    // Find if there's an active booking for this room to auto-identify guest
    const activeBooking = bookings.find(b => b.roomId === roomId && b.status === 'active');
    if (activeBooking) {
      setCustomerName(activeBooking.guestName);
    } else {
      setCustomerName('');
    }
  };

  const handleCreateOrder = async () => {
    try {
      const newOrder = await createNewOrder('walk-in', tableNumber, customerName.trim() || undefined, 'dine-in');
      onOrderCreated(newOrder);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create new order:", error);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setTableNumber('');
    setSelectedRoomId('none');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            resetForm();
        }
    }}>
      <DialogContent className="rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('Create New Order')}</DialogTitle>
          <DialogDescription>{t('Select a room or enter order details below.')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-select">{t('Select Room (Optional)')}</Label>
            <Select value={selectedRoomId} onValueChange={handleRoomSelect}>
              <SelectTrigger id="room-select">
                <SelectValue placeholder={t('Select a room')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('None / Walk-in')}</SelectItem>
                {rooms.filter(room => !!room.id).map(room => {
                  const booking = bookings.find(b => b.roomId === room.id && b.status === 'active');
                  return (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.id} {booking ? `(${booking.guestName})` : ''}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-number">{t('Table / Room Number')}</Label>
            <Input
              id="table-number"
              placeholder="e.g. 5, Patio-2"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-name">{t('Customer Name')}</Label>
            <Input
              id="customer-name"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
            <Button onClick={handleCreateOrder}>{t('Create Order')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}