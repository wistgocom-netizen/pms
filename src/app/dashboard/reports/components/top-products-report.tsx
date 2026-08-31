
'use client';

import { useStore } from "@/context/StoreContext";
import type { Sale } from '@/lib/types';
import { useMemo } from "react";
import { Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ProductSales = {
    productId: string;
    name: string;
    quantity: number;
    emoji: string;
};

export function TopProductsReport({ sales }: { sales: Sale[] }) {
    const { t, products } = useStore();

    const topProducts = useMemo(() => {
        const productSales: { [key: string]: Omit<ProductSales, 'emoji'> & { emoji?: string } } = {};

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
            .map(p => {
                const productInfo = products.find(prod => prod.id === p.productId);
                return {
                    ...p,
                    emoji: productInfo?.emoji || '📦'
                }
            })
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

    }, [sales, products]);

    return (
        <ScrollArea className="h-96">
            {topProducts.length > 0 ? (
                <ol className="space-y-4 pr-4">
                    {topProducts.map((product, index) => (
                        <li key={`${product.productId}-${index}`} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                                <Avatar className="h-10 w-10 border">
                                    <AvatarFallback className="text-xl bg-muted">{product.emoji}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium">{product.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg">{product.quantity}</p>
                                <span className="text-xs text-muted-foreground">{t('sold')}</span>
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-8">
                    <Package className="w-12 h-12 mb-4" />
                    <p>{t('No sales data available to determine top products.')}</p>
                </div>
            )}
        </ScrollArea>
    );
}
