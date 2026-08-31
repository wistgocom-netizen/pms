'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface OverviewCardsProps {
    totalRevenue: number;
    totalSales: number;
    totalProductsSold: number;
}

export function OverviewCards({ totalRevenue, totalSales, totalProductsSold }: OverviewCardsProps) {
    const { formatCurrency, t } = useStore();
    
    const overviewData = [
        {
          title: t("Total Revenue"),
          value: formatCurrency(totalRevenue),
          icon: DollarSign,
          description: t("Total revenue from all sales"),
        },
        {
          title: t("Total Sales"),
          value: `+${totalSales}`,
          icon: ShoppingCart,
          description: t("Total number of transactions"),
        },
        {
          title: t("Products Sold"),
          value: `+${totalProductsSold}`,
          icon: Package,
          description: t("Total items sold"),
        },
      ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {overviewData.map((data) => (
          <Card key={data.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
              <data.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.value}</div>
              <p className="text-xs text-muted-foreground">
                {data.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
}
