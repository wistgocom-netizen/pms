
'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Calendar, History, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export default function GuestsPage() {
  const { bookings, formatCurrency } = useStore();

  const guestProfiles = useMemo(() => {
    const profiles: Record<string, any> = {};
    
    bookings.forEach(b => {
      if (!profiles[b.email]) {
        profiles[b.email] = {
          name: b.guestName,
          email: b.email,
          phone: b.phone,
          bookings: [],
          totalSpent: 0
        };
      }
      profiles[b.email].bookings.push(b);
      profiles[b.email].totalSpent += b.totalAmount;
    });

    return Object.values(profiles);
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guest Profiles</h1>
        <p className="text-muted-foreground text-sm">Comprehensive list of guests and their stay history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {guestProfiles.map(guest => (
          <Card key={guest.email} className="h-fit">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {guest.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{guest.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3" /> {guest.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-bold uppercase tracking-wider">Phone</p>
                  <p className="flex items-center gap-1.5 font-medium"><Phone className="h-3 w-3" /> {guest.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-bold uppercase tracking-wider">Visits</p>
                  <p className="flex items-center gap-1.5 font-medium"><History className="h-3 w-3" /> {guest.bookings.length} times</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-muted-foreground font-bold uppercase tracking-wider">Total Value</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(guest.totalSpent)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3 tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Booking History
                </p>
                <div className="space-y-2">
                  {guest.bookings.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <span>Room {b.roomId}</span>
                      <span className="text-muted-foreground">{b.checkIn}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1">{b.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
