
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/context/StoreContext";
import { useMemo } from "react";
import { Package } from "lucide-react";

type ProductSales = {
    productId: string;
    name: string;
    quantity: number;
};

export function TopSellingProducts() {
    const { sales, t } = useStore();

    const topProducts = useMemo(() => {
        const productSales: { [key: string]: ProductSales } = {};

        (sales || []).forEach(sale => {
            sale.items?.forEach(item => {
                if (productSales[item.productId]) {
                    productSales[item.productId].quantity += item.quantity;
                } else {
                    productSales[item.productId] = {
                        productId: item.productId,
                        name: item.productName,
                        quantity: item.quantity,
                    };
                }
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

    }, [sales]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Top Selling Products')}</CardTitle>
                <CardDescription>{t('Top 10 products by quantity sold.')}</CardDescription>
            </CardHeader>
            <CardContent>
                {topProducts.length > 0 ? (
                    <ol className="space-y-4">
                        {topProducts.map((product, index) => (
                            <li key={`${product.productId}-${index}`} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                                    <p className="font-medium">{product.name}</p>
                                </div>
                                <p className="font-bold">{product.quantity} sold</p>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-8">
                        <Package className="w-12 h-12 mb-4" />
                        <p>{t('No sales data available to determine top products.')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
