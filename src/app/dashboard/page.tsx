'use client';

import { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Bed, 
  CalendarCheck, 
  Users, 
  IndianRupee, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShoppingCart,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { WeeklySales } from './components/dashboard-weekly-sales';
import { TopSellingProducts } from './components/dashboard-top-products';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function HotelDashboard() {
  const { rooms, bookings, employees, expenses, sales, formatCurrency, t } = useStore();

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const activeBookingsCount = bookings.filter(b => b.status === 'active').length;
    
    // Revenue Aggregation
    const bookingRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const posRevenue = (sales || []).filter(s => s.status === 'Completed').reduce((sum, s) => sum + s.totalAmount, 0);
    const totalRevenue = bookingRevenue + posRevenue;

    // Financial Health
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const payrollExpenses = employees.reduce((sum, e) => sum + e.salary, 0);
    const combinedExpenses = totalExpenses + payrollExpenses;
    const netProfit = totalRevenue - combinedExpenses;

    return { 
        totalRooms, 
        available, 
        occupied, 
        maintenance, 
        activeBookingsCount, 
        totalRevenue, 
        combinedExpenses, 
        netProfit, 
        bookingRevenue, 
        posRevenue 
    };
  }, [rooms, bookings, sales, expenses, employees]);

  const recentBookings = useMemo(() => {
      return [...bookings].sort((a,b) => b.id.localeCompare(a.id)).slice(0, 5);
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Report Overview</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Property performance, retail sales, and financial health.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} color="text-primary" subValue={`${formatCurrency(stats.bookingRevenue)} from rooms`} />
        <StatCard title="Active Bookings" value={stats.activeBookingsCount} icon={CalendarCheck} color="text-blue-600" />
        <StatCard title="Net Performance" value={formatCurrency(stats.netProfit)} icon={TrendingUp} color={stats.netProfit >= 0 ? "text-green-600" : "text-destructive"} />
        <StatCard title="Room Status" value={stats.available} icon={Bed} subValue={`${stats.occupied} occupied, ${stats.maintenance} in service`} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            {/* Weekly Trend Chart */}
            <WeeklySales />
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Recent Bookings List */}
                <Card className="flex flex-col">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Recent Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-4 sm:p-6 pt-0">
                        <div className="space-y-4">
                        {recentBookings.map((b) => (
                            <div key={b.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="min-w-0 pr-2">
                                <p className="font-semibold text-xs sm:text-sm truncate">{b.guestName}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Room {b.roomId} • {b.checkIn} to {b.checkOut}</p>
                            </div>
                            <Badge variant={b.status === 'active' ? 'default' : 'outline'} className="text-[9px] h-5 px-1.5">{b.status}</Badge>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Occupancy Breakdown */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Scale className="h-5 w-5 text-muted-foreground" />
                            Occupancy by Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-4 sm:p-6 pt-0">
                        {['Standard', 'Deluxe', 'Suite'].map(type => {
                        const total = rooms.filter(r => r.type === type).length;
                        const occupied = rooms.filter(r => r.type === type && r.status === 'occupied').length;
                        const percentage = total > 0 ? (occupied / total) * 100 : 0;
                        return (
                            <div key={type} className="space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="font-medium">{type}</span>
                                <span className="text-muted-foreground">{occupied}/{total} rooms</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            </div>
                        );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            {/* Top Products / Retail Sales Summary */}
            <TopSellingProducts />

            {/* Expenses Summary */}
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                    <CardDescription>Income vs Expenditure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">Gross Revenue</span>
                            <span className="font-bold">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm text-destructive">
                            <span className="text-muted-foreground">Total Expenses</span>
                            <span className="font-bold">-{formatCurrency(stats.combinedExpenses)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-black text-primary">
                            <span>Profit</span>
                            <span>{formatCurrency(stats.netProfit)}</span>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <Button variant="outline" className="w-full gap-2 h-11" asChild>
                            <a href="/dashboard/reports">
                                Detailed Reports <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions / Activity */}
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Live Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingCart size={20} /></div>
                            <div className="text-sm">
                                <p className="font-black text-lg leading-tight">{stats.posRevenue > 0 ? formatCurrency(stats.posRevenue) : '₹0'}</p>
                                <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">POS Sales</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-xl"><CalendarCheck size={20} /></div>
                            <div className="text-sm">
                                <p className="font-black text-lg leading-tight">{stats.activeBookingsCount} Active</p>
                                <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Current Guests</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subValue, color }: any) {
  return (
    <Card className="shadow-sm border-none bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-black">{value}</div>
        {subValue && <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter truncate">{subValue}</p>}
      </CardContent>
    </Card>
  );
}
