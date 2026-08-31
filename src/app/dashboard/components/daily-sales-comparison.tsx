
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { useStore } from "@/context/StoreContext";
import { useMemo } from "react";
import type { Sale } from "@/lib/types";

export function DailySalesComparison() {
    const { sales, products, formatCurrency, t } = useStore();

    const { todaySalesByCategory, yesterdaySalesByCategory } = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(todayStart.getDate() - 1);
        
        const getSalesByCategory = (salesData: Sale[]) => {
             return salesData.reduce((acc, sale) => {
                sale.items?.forEach(item => {
                    const product = products.find(p => p.id === item.productId);
                    const category = product?.category || 'Uncategorized';
                    if (!acc[category]) {
                        acc[category] = 0;
                    }
                    acc[category] += item.unitPrice * item.quantity;
                });
                return acc;
            }, {} as Record<string, number>);
        };
        
        const todaysSales = sales.filter(sale => sale.saleDate && sale.saleDate >= todayStart && sale.status === 'Completed');
        const yesterdaysSales = sales.filter(sale => sale.saleDate && sale.saleDate >= yesterdayStart && sale.saleDate < todayStart && sale.status === 'Completed');

        return {
            todaySalesByCategory: getSalesByCategory(todaysSales),
            yesterdaySalesByCategory: getSalesByCategory(yesterdaysSales),
        };
    }, [sales, products]);

    const chartData = useMemo(() => {
        const categories = new Set([...Object.keys(todaySalesByCategory), ...Object.keys(yesterdaySalesByCategory)]);
        return Array.from(categories).map(category => ({
            category,
            today: todaySalesByCategory[category] || 0,
            yesterday: yesterdaySalesByCategory[category] || 0,
        }));
    }, [todaySalesByCategory, yesterdaySalesByCategory]);

    const chartConfig = {
        today: {
            label: t("Today"),
            color: "hsl(var(--primary))",
        },
        yesterday: {
            label: t("Yesterday"),
            color: "hsl(var(--muted-foreground))",
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Today vs. Yesterday Sales')}</CardTitle>
                <CardDescription>{t('Sales comparison by category')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/\.00$/, '')} />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted))" }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                                                <div className="font-medium">{label}</div>
                                                <div className="grid gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />
                                                        <div className="flex flex-1 justify-between">
                                                            <span className="text-muted-foreground">{t('Today')}</span>
                                                            <span className="font-mono font-medium">{formatCurrency(payload.find(p => p.dataKey === 'today')?.value as number || 0)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--muted-foreground))" }} />
                                                        <div className="flex flex-1 justify-between">
                                                            <span className="text-muted-foreground">{t('Yesterday')}</span>
                                                            <span className="font-mono font-medium">{formatCurrency(payload.find(p => p.dataKey === 'yesterday')?.value as number || 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar dataKey="yesterday" fill="var(--color-yesterday)" radius={4} />
                            <Bar dataKey="today" fill="var(--color-today)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
