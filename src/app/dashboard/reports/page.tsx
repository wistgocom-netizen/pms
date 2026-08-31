'use client';

import { useMemo } from 'react';
import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CalendarCheck, LogOut, Hotel, Bed, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, sub }: { title: string, value: string, icon: React.ElementType, sub?: string }) {
  return (
    <Card className="border-none shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-black">{value}</div>
        {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const COLORS = ['hsl(var(--primary))', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ReportsPage() {
  const { bookings, rooms, formatCurrency, userProfile } = useStore();

  const reportData = useMemo(() => {
    const completed = (bookings || []).filter(b => b.status === 'completed');
    const active = (bookings || []).filter(b => b.status === 'active');
    const cancelled = (bookings || []).filter(b => b.status === 'cancelled');

    const totalRevenue = completed.reduce((sum, b) => {
      const room = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
      const roomCharge = (room?.price || 0) * Math.max(1, b.durationUnits || 1);
      const extras = (b.extraCharges || []).reduce((s, c) => s + (Number(c.amount) || 0), 0);
      return sum + roomCharge + extras;
    }, 0);

    const totalAdvance = completed.reduce((sum, b) => sum + (Number(b.advance) || 0), 0);
    const avgStay = completed.length > 0
      ? completed.reduce((sum, b) => sum + (b.durationUnits || 1), 0) / completed.length
      : 0;

    const revenueByMonth: Record<string, number> = {};
    completed.forEach(b => {
      if (!b.checkOut) return;
      const month = b.checkOut.slice(0, 7);
      const room = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
      const roomCharge = (room?.price || 0) * Math.max(1, b.durationUnits || 1);
      const extras = (b.extraCharges || []).reduce((s, c) => s + (Number(c.amount) || 0), 0);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + roomCharge + extras;
    });

    const monthlyChart = Object.entries(revenueByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => {
        const [y, m] = month.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return { month: `${months[parseInt(m)-1]} ${y}`, revenue };
      });

    const roomTypeRevenue: Record<string, number> = {};
    completed.forEach(b => {
      const room = rooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
      const type = room?.type || 'Unknown';
      const roomCharge = (room?.price || 0) * Math.max(1, b.durationUnits || 1);
      const extras = (b.extraCharges || []).reduce((s, c) => s + (Number(c.amount) || 0), 0);
      roomTypeRevenue[type] = (roomTypeRevenue[type] || 0) + roomCharge + extras;
    });

    const pieData = Object.entries(roomTypeRevenue).map(([name, value]) => ({ name, value }));

    const hasData = completed.length > 0;

    return {
      totalRevenue, totalAdvance, totalCheckouts: completed.length,
      activeGuests: active.length, cancelledBookings: cancelled.length,
      avgStay, monthlyChart, pieData, hasData,
    };
  }, [bookings, rooms]);

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.reports;

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Booking and revenue analytics.</p>
      </div>



      {!reportData.hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No Completed Bookings Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Reports populate as guests check out. Create a booking and process checkout to see data here.
            </p>
            <Button asChild variant="default">
              <Link href="/dashboard/bookings"><Hotel className="h-4 w-4 mr-2" /> Go to Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Revenue" value={formatCurrency(reportData.totalRevenue)} icon={DollarSign} sub={`from ${reportData.totalCheckouts} checkouts`} />
            <StatCard title="Advance Collected" value={formatCurrency(reportData.totalAdvance)} icon={TrendingUp} />
            <StatCard title="Active Guests" value={String(reportData.activeGuests)} icon={Hotel} sub="currently checked in" />
            <StatCard title="Avg Stay" value={`${reportData.avgStay.toFixed(1)} ${reportData.avgStay === 1 ? 'night' : 'nights'}`} icon={Bed} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue by Month</CardTitle>
                <CardDescription className="text-xs">Monthly booking revenue trend.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4">
                {reportData.monthlyChart.length > 0 ? (
                  <ChartContainer config={{}} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.monthlyChart}>
                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v).replace(/\.\d+$/, '')} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No monthly data yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue by Room Type</CardTitle>
                <CardDescription className="text-xs">Which room types generate the most revenue.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-4 flex items-center justify-center">
                {reportData.pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={reportData.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {reportData.pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Summary</CardTitle>
              <CardDescription className="text-xs">Key booking metrics at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Completed</p>
                  <p className="text-2xl font-black text-green-600">{reportData.totalCheckouts}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Active</p>
                  <p className="text-2xl font-black text-blue-600">{reportData.activeGuests}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Cancelled</p>
                  <p className="text-2xl font-black text-red-600">{reportData.cancelledBookings}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Avg Stay</p>
                  <p className="text-2xl font-black">{reportData.avgStay.toFixed(1)} <span className="text-sm font-medium text-muted-foreground">nights</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
