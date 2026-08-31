
'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import type { CartItem } from '@/lib/types';
import { CUSTOMER_DISPLAY_KEY } from '@/hooks/use-customer-display';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type CustomerDisplayData = {
    items: CartItem[];
    subtotal: number;
    taxes: number;
    totalDiscount: number;
    total: number;
};

export default function CustomerDisplayPage() {
    const { formatCurrency, storeName, theme } = useStore();
    const [data, setData] = useState<CustomerDisplayData | null>(null);
    const endOfListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateData = () => {
            const storedData = localStorage.getItem(CUSTOMER_DISPLAY_KEY);
            if (storedData) {
                try {
                    setData(JSON.parse(storedData));
                } catch (e) {
                    console.error("Failed to parse customer display data", e);
                    setData(null);
                }
            } else {
                setData(null);
            }
        };
        
        const applyTheme = (newThemeVal: string | null) => {
            const themeToApply = (newThemeVal === 'light' || newThemeVal === 'dark' || newThemeVal === 'midnight' || newThemeVal === 'blue' || newThemeVal === 'coinlytix' || newThemeVal === 'green') ? newThemeVal : theme;
            document.documentElement.classList.remove('light', 'dark', 'midnight', 'blue', 'coinlytix', 'green');
            document.documentElement.classList.add(themeToApply);
            if (themeToApply !== 'light') document.documentElement.classList.add('dark');
        };

        updateData();
        applyTheme(localStorage.getItem('theme'));


        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === CUSTOMER_DISPLAY_KEY) {
                updateData();
            }
            if (e.key === 'theme') {
                applyTheme(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check if the window opener is closed
        const interval = setInterval(() => {
            if(window.opener && window.opener.closed) {
                window.close();
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [theme]);

    useEffect(() => {
        endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [data?.items]);

    return (
        <div className="h-screen w-screen bg-secondary flex items-center justify-center p-4">
            <Card className="w-full h-full flex flex-col">
                <CardHeader className="text-center border-b py-2">
                    <CardTitle className="font-headline text-2xl">{storeName}</CardTitle>
                    <p className="text-xs text-muted-foreground">Thank you for shopping with us!</p>
                </CardHeader>
                <CardContent className="flex-grow p-0 flex flex-col min-h-0">
                    {data && data.items.length > 0 ? (
                        <ScrollArea className="flex-grow">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60%] pl-4 text-xs">Product</TableHead>
                                        <TableHead className="text-center text-xs">Qty</TableHead>
                                        <TableHead className="text-right text-xs">Price</TableHead>
                                        <TableHead className="text-right pr-4 text-xs">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <TableRow key={item.lineItemId} className="text-sm">
                                            <TableCell className="font-medium pl-4 py-1">{item.name}</TableCell>
                                            <TableCell className="text-center py-1">{item.quantity}</TableCell>
                                            <TableCell className="text-right py-1">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right font-bold pr-4 py-1">
                                                {formatCurrency((item.price - (item.discount || 0)) * item.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div ref={endOfListRef} />
                        </ScrollArea>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center h-full py-12 text-muted-foreground">
                            <ShoppingBag className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-semibold">Welcome!</h3>
                            <p className="text-lg mt-1">Your items will appear here as they are scanned.</p>
                        </div>
                    )}
                </CardContent>
                {data && data.items.length > 0 && (
                    <CardFooter className="flex-col p-3 border-t text-base space-y-1">
                        <div className="flex justify-between w-full">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{formatCurrency(data.subtotal)}</span>
                        </div>
                         {data.totalDiscount > 0 && (
                            <div className="flex justify-between w-full text-destructive text-sm">
                                <span className="">Discount</span>
                                <span className="font-medium">-{formatCurrency(data.totalDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between w-full">
                            <span className="text-muted-foreground">Taxes</span>
                            <span className="font-medium">{formatCurrency(data.taxes)}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between w-full font-bold text-2xl text-primary pt-1">
                            <span>Total</span>
                            <span>{formatCurrency(data.total)}</span>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
