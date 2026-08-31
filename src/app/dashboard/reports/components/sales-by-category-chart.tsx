
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { useStore } from "@/context/StoreContext";
import { Package } from "lucide-react";

interface SalesByCategoryChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4ddbff'];

export function SalesByCategoryChart({ data }: SalesByCategoryChartProps) {
  const { formatCurrency, t } = useStore();
  
  if (!data || data.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
            <Package className="w-12 h-12 mb-4" />
            <p>{t('No sales data available for categories.')}</p>
        </div>
     )
  }

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length]
    };
    return acc;
  }, {} as any);

  return (
    <div className="h-96 w-full">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Tooltip
                        cursor={{ fill: "hsl(var(--muted))" }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            if (percent < 0.05) return null;
                            return (
                                <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                    {`${name} ${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    </div>
  )
}
