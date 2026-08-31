"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { 
    ChartContainer,
 } from "@/components/ui/chart"
import { useStore } from "@/context/StoreContext";

interface SalesChartProps {
  data: {
    date: string;
    sales: number;
  }[];
}

export function SalesChart({ data }: SalesChartProps) {
  const { formatCurrency, t } = useStore();

  const chartConfig = {
    sales: {
      label: t("Sales"),
      color: "hsl(var(--primary))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value as number).replace(/\.\d+$/, '')}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    formatter={(value: number) => [formatCurrency(value), t("Sales")]}
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
