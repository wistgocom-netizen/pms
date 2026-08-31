
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from "react";
import type { Sale } from "@/lib/types";
import { useStore } from "@/context/StoreContext";

export function RecentTransactions() {
  const [isClient, setIsClient] = useState(false);
  const { formatCurrency, sales, t } = useStore();
  useEffect(() => {
    setIsClient(true);
  }, [])
  
  const recentSales = (sales || [])
    .filter(sale => sale.status === 'Completed')
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Recent Transactions')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentSales.map((sale: Sale, index: number) => {
            const totalItems = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
            return (
                <div key={sale.id} className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-muted">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{t('{count} items', { count: totalItems })}</p>
                        <p className="text-sm text-muted-foreground">{isClient && sale.saleDate ? formatDistanceToNow(sale.saleDate, { addSuffix: true }) : '...'}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="font-medium">{formatCurrency(sale.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground capitalize">{t(sale.paymentMethod)}</p>
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  )
}
