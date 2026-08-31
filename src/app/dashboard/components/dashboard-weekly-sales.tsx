
"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { useStore } from "@/context/StoreContext";

export function WeeklySales() {
    const { sales, formatCurrency, t } = useStore();

    const salesByDay = (sales || []).reduce((acc, sale) => {
        if (!sale.saleDate) return acc;
        const day = sale.saleDate.toLocaleString('en-us', { weekday: 'short' });
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day] += sale.totalAmount;
        return acc;
      }, {} as Record<string, number>);
    
      const chartData = Object.keys(salesByDay).map(day => ({
        name: day,
        total: salesByDay[day],
      }));

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sortedChartData = chartData.sort((a,b) => daysOfWeek.indexOf(a.name) - daysOfWeek.indexOf(b.name));

  const chartConfig = {
    total: {
      label: t("Sales"),
      color: "hsl(var(--primary))",
    },
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Weekly Sales')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
              <AreaChart data={sortedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/\.00$/, '')} />
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <div className="font-medium">{label}</div>
                          <div className="flex w-full items-center items-stretch gap-2">
                            <div className="shrink-0 rounded-[2px] h-2.5 w-2.5" style={{ backgroundColor: payload[0].color || 'hsl(var(--primary))' }} />
                            <div className="flex flex-1 justify-between leading-none">
                              <span className="text-muted-foreground">{t('Sales')}</span>
                              <span className="font-mono font-medium tabular-nums text-foreground">
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
