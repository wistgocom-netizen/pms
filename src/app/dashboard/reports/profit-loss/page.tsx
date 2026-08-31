'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, TrendingDown, Receipt, Hotel, ShoppingCart, ArrowLeft, Calendar as CalendarIcon, X, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProfitLossPage() {
  const { bookings, rooms, sales, expenses, formatCurrency, userProfile } = useStore();
  const [filterMode, setFilterMode] = useState<'daily' | 'monthly'>('daily');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  const reportData = useMemo(() => {
    const completed = (bookings || []).filter(b => b.status === 'completed');
    const allExpenses = expenses || [];

    const matchFilter = (dateStr: string) => {
      if (!dateFilter) return true;
      if (filterMode === 'monthly') return dateStr.startsWith(format(dateFilter, 'yyyy-MM'));
      return dateStr === format(dateFilter, 'yyyy-MM-dd');
    };

    const filteredBookings = dateFilter ? completed.filter(b => b.checkOut && matchFilter(b.checkOut)) : completed;
    const filteredExpenses = dateFilter ? allExpenses.filter(e => e.date && matchFilter(e.date)) : allExpenses;
    const filteredSales = dateFilter ? sales.filter(s => s.saleDate && matchFilter(format(new Date(s.saleDate), 'yyyy-MM-dd'))) : sales;

    const roomRevenue = filteredBookings.reduce((sum, b) => {
      const room = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
      return sum + (room?.price || 0) * Math.max(1, b.durationUnits || 1);
    }, 0);

    const extraRevenue = filteredBookings.reduce((sum, b) => {
      return sum + ((b.extraCharges || []).reduce((s, c) => s + (Number(c.amount) || 0), 0));
    }, 0);

    const salesRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

    const totalIncome = roomRevenue + extraRevenue + salesRevenue;

    const expensesByCategory = filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    const incomeSources = [
      { label: 'Room Revenue', amount: roomRevenue, icon: Hotel, color: 'text-blue-600' },
      { label: 'Extra Charges', amount: extraRevenue, icon: Receipt, color: 'text-purple-600' },
      { label: 'Sales Revenue', amount: salesRevenue, icon: ShoppingCart, color: 'text-cyan-600' },
    ];

    const expenseCategories = Object.entries(expensesByCategory).map(([cat, amount]) => ({
      category: cat, amount,
    })).sort((a, b) => b.amount - a.amount);

    const chartData = { incomeSources, expenseCategories };
    const hasData = filteredBookings.length > 0 || filteredExpenses.length > 0 || filteredSales.length > 0;

    return {
      totalIncome, totalExpenses, netProfit,
      bookingCount: filteredBookings.length,
      expenseCount: filteredExpenses.length,
      salesCount: filteredSales.length,
      chartData, hasData, expenseCategories,
    };
  }, [bookings, rooms, sales, expenses, dateFilter]);

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.reports;

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/reports"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profit & Loss</h1>
            <p className="text-muted-foreground text-xs md:text-sm">Income vs expenses overview.</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex p-0.5 bg-muted/50 rounded-lg">
            <button
              onClick={() => { setFilterMode('daily'); setDateFilter(null); }}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", filterMode === 'daily' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >
              <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />Daily
            </button>
            <button
              onClick={() => { setFilterMode('monthly'); setDateFilter(null); }}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-colors", filterMode === 'monthly' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
            >
              <CalendarDays className="h-3.5 w-3.5 inline mr-1" />Monthly
            </button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-10 text-xs gap-2 shrink-0", dateFilter && "border-primary text-primary bg-primary/5")}>
                {filterMode === 'monthly' ? <CalendarDays className="h-3.5 w-3.5" /> : <CalendarIcon className="h-3.5 w-3.5" />}
                {dateFilter ? (filterMode === 'monthly' ? format(dateFilter, 'MMMM yyyy') : format(dateFilter, 'PP')) : (filterMode === 'monthly' ? 'Select Month' : 'Select Date')}
                {dateFilter && (
                  <X className="h-3 w-3 ml-1 hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDateFilter(null); }} />
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
      </div>

      {!reportData.hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Data Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {dateFilter ? 'No data found for the selected date.' : 'Complete bookings and add expenses to see profit & loss data.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Net Profit/Loss Card */}
          <Card className={`border-none shadow-sm ${reportData.netProfit >= 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
            <CardContent className="p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
                {dateFilter ? `Net Profit / Loss — ${format(dateFilter, 'PP')}` : 'Net Profit / Loss — All Time'}
              </p>
              <p className={`text-4xl font-black ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(reportData.netProfit))}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {reportData.netProfit >= 0 ? <><TrendingUp className="h-3 w-3 text-green-600" /> Profit</> : <><TrendingDown className="h-3 w-3 text-red-600" /> Loss</>}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income */}
            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-green-700">Income</CardTitle>
                    <CardDescription className="text-xs">Revenue from all sources.</CardDescription>
                  </div>
                  <p className="text-xl font-black text-green-600">{formatCurrency(reportData.totalIncome)}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2">
                  {reportData.chartData.incomeSources.map(s => (
                    <div key={s.label} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                        <span className="text-sm">{s.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(s.amount)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{reportData.bookingCount} bookings, {reportData.salesCount} sales</span>
                  <span className="font-bold text-green-600">Total: {formatCurrency(reportData.totalIncome)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight text-red-700">Expenses</CardTitle>
                    <CardDescription className="text-xs">Operating costs by category.</CardDescription>
                  </div>
                  <p className="text-xl font-black text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {reportData.expenseCategories.length > 0 ? (
                  <div className="space-y-2">
                    {reportData.expenseCategories.map(({ category, amount }) => (
                      <div key={category} className="flex items-center justify-between py-1.5">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded.</p>
                )}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{reportData.expenseCount} expense(s)</span>
                  <span className="font-bold text-red-600">Total: {formatCurrency(reportData.totalExpenses)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total Income</p>
                  <p className="text-2xl font-black text-green-600">{formatCurrency(reportData.totalIncome)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total Expenses</p>
                  <p className="text-2xl font-black text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{reportData.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                  <p className={`text-2xl font-black ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(reportData.netProfit))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
