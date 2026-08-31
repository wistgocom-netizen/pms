
'use client';

import { useState, useEffect, useMemo } from 'react';
import { KITCHEN_DISPLAY_KEY } from '@/hooks/use-kitchen-display';
import type { Sale } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, ChefHat, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useStore } from '@/context/StoreContext';

// --- KitchenOrderCard Component ---
type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

const statusColors: Record<OrderStatus, string> = {
    New: 'bg-blue-500',
    Preparing: 'bg-yellow-500',
    Ready: 'bg-green-500',
    Completed: 'bg-gray-500',
    Cancelled: 'bg-red-500',
};

interface KitchenOrderCardProps {
  order: Sale & { customerName?: string };
}

function KitchenOrderCard({ order }: KitchenOrderCardProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // This effect will only run on the client, preventing hydration mismatch.
    if (order.saleDate) {
      const date = new Date(order.saleDate);
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
      const interval = setInterval(() => {
        if (order.saleDate) {
          const date = new Date(order.saleDate);
          setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
        }
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [order.saleDate]);

  const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Card className="shadow-sm flex flex-col bg-card border">
      <CardHeader className="flex flex-row items-start justify-between p-2 sm:p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold">{order.tableNumber ? `Table ${order.tableNumber}`: `#${order.id.slice(-6)}`}</CardTitle>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <p>{order.customerName}</p>
            </div>
          </div>
        </div>
         <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${statusColors[order.status]}`} />
            <span className="text-sm font-semibold">{order.status}</span>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 pt-0 flex-grow">
        <div className="flex justify-end items-center mb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
            </div>
        </div>
        <Separator className="mb-3" />
        <div className="space-y-1.5 text-sm sm:text-base">
          {(order.items || []).map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-3">
              <div>
                <span className="font-bold text-foreground">{item.quantity}x </span>
                <span className="break-words text-foreground">{item.productName}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Check className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-2 sm:p-3 bg-muted/50 flex justify-between items-center mt-auto">
        <div className="font-bold text-sm sm:text-base truncate">
          Total Items: {totalItems}
        </div>
      </CardFooter>
    </Card>
  );
}


// --- KitchenDisplayPage Component ---
const displayStatuses: OrderStatus[] = ['New', 'Preparing', 'Ready'];

type KitchenDisplayData = {
    orders: (Sale & { customerName?: string })[];
};

export default function KitchenDisplayPage() {
    const { theme } = useStore();
    const [data, setData] = useState<KitchenDisplayData | null>(null);

    useEffect(() => {
        const updateData = () => {
            const storedData = localStorage.getItem(KITCHEN_DISPLAY_KEY);
            if (storedData) {
                try {
                    const parsedData = JSON.parse(storedData);
                     if (parsedData.orders) {
                        parsedData.orders.forEach((order: any) => {
                            if (order.saleDate) {
                                order.saleDate = new Date(order.saleDate);
                            }
                        });
                    }
                    setData(parsedData);
                } catch (e) {
                    console.error("Failed to parse kitchen display data", e);
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
            if (e.key === KITCHEN_DISPLAY_KEY) {
                updateData();
            }
            if (e.key === 'theme') {
                applyTheme(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
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

    const ordersByStatus = useMemo(() => {
        const grouped: Record<OrderStatus, (Sale & { customerName?: string })[]> = { New: [], Preparing: [], Ready: [], Completed: [], Cancelled: [] };
        if (data?.orders) {
            data.orders
                .filter(order => displayStatuses.includes(order.status))
                .forEach(order => {
                    if (grouped[order.status]) {
                        grouped[order.status].push(order);
                    }
                });
        }
        return grouped;
    }, [data]);

    return (
        <div className="h-screen w-screen bg-muted/30 p-2 sm:p-4 flex flex-col">
            <div className="grid flex-grow gap-2 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-0">
                {displayStatuses.map(status => (
                    <div key={status} className="bg-card rounded-lg flex flex-col border shadow-sm">
                    <h2 className="p-2 sm:p-3 text-base sm:text-lg font-semibold tracking-wider border-b">{status} ({ordersByStatus[status].length})</h2>
                    <ScrollArea className="flex-grow">
                        <div className="p-2 sm:p-3 space-y-3">
                        {ordersByStatus[status].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()).map(order => (
                            <KitchenOrderCard key={order.id} order={order} />
                        ))}
                        {ordersByStatus[status].length === 0 && (
                            <div className="text-center text-sm text-muted-foreground py-10">
                                No {status.toLowerCase()} orders.
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                    </div>
                ))}
            </div>
        </div>
    );
}
