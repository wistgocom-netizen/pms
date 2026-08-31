
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/context/StoreContext';
import { Sale } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type OrderStatus = 'Approved' | 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

const statusColors: Record<OrderStatus, string> = {
    Approved: 'bg-emerald-500',
    New: 'bg-blue-500',
    Preparing: 'bg-yellow-500',
    Ready: 'bg-green-500',
    Completed: 'bg-gray-500',
    Cancelled: 'bg-red-500',
};

const allStatuses: OrderStatus[] = ['Approved', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

interface OrderCardProps {
  order: Sale & { customerName?: string };
  onSelectOrder: (order: Sale) => void;
}

export function OrderCard({ order, onSelectOrder }: OrderCardProps) {
  const { formatCurrency, updateSaleDetails, toggleOrderItemStatus, t } = useStore();
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (order.saleDate) {
        setTimeAgo(formatDistanceToNow(new Date(order.saleDate), { addSuffix: true }));
        const interval = setInterval(() => {
            if (order.saleDate) {
                setTimeAgo(formatDistanceToNow(new Date(order.saleDate), { addSuffix: true }));
            }
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }
  }, [order.saleDate]);

  const customerInitial = order.customerName ? (order.customerName.split(' ').map(n => n[0]).join('').toUpperCase() || 'W') : 'W';

  return (
    <Card className="shadow-sm transition-all duration-200 hover:shadow-md flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between p-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar>
            <AvatarFallback>{customerInitial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold">{order.customerName || t('Walk-in Customer')}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">#{order.id.slice(-6)}</span>
                {order.tableNumber && (
                    <>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="font-medium">{t('Table')} {order.tableNumber}</span>
                    </>
                )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allStatuses.map(status => (
              <DropdownMenuItem
                key={status}
                onSelect={() => {
                  updateSaleDetails(order.id, { status });
                  toast({
                    title: t('Status Updated'),
                    description: t('Order') + ' #' + order.id.slice(-6) + ' ' + t('set to') + ' ' + t(status),
                    duration: 2000,
                  });
                }}
              >
                {t('Set to') + ' ' + t(status)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusColors[order.status]}`} />
                <span className="text-xs font-semibold">{t(order.status)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                    {timeAgo}
                </span>
            </div>
        </div>
        <Separator className="mb-3" />
        <div className="space-y-1 text-xs text-muted-foreground">
          {(order.items || []).map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-2">
              <span className={cn("flex-1 min-w-0 pr-1 break-words", item.isPrepared && "line-through text-muted-foreground")}>
                {item.quantity}x {item.productName}
              </span>
              <div className="flex items-center gap-1">
                <span className={cn("font-mono text-right whitespace-nowrap text-foreground", item.isPrepared && "line-through text-muted-foreground")}>
                    {formatCurrency(item.unitPrice * item.quantity)}
                </span>
                <Button 
                    variant={item.isPrepared ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-6 w-6 shrink-0 -mr-2"
                    onClick={() => toggleOrderItemStatus(order.id, item.productId)}
                >
                    <Check className={cn("h-4 w-4", item.isPrepared ? "text-green-500" : "text-muted-foreground")} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-muted/50 flex justify-between items-center mt-auto">
        <div className="font-bold text-sm truncate">
          {t('Total')}: {formatCurrency(order.totalAmount)}
        </div>
        <Button size="sm" variant="outline" onClick={() => onSelectOrder(order)} className="shrink-0">{t('See Details')}</Button>
      </CardFooter>
    </Card>
  );
}
