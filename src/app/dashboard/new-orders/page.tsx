'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { DataTable } from '../components/data-table';
import { getColumns, type Order } from './columns';
import { OrderDetailsDialog } from './order-details-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ColumnFiltersState, RowSelectionState } from '@tanstack/react-table';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

export default function OrdersPage() {
  const { sales, customers, products, formatCurrency, t, isLoading, updateSaleDetails, deleteSale } = useStore();
  const { toast } = useToast();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ordersData = useMemo(() => {
    const allowedStatuses = ['New', 'Approved', 'Cancelled'];
    return (sales || [])
      .filter(sale => allowedStatuses.includes(sale.status))
      .map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const customerName = sale.customerName || (customer ? (customer.name || `${customer.firstName} ${customer.lastName}`) : t('Walk-in Customer'));
      const itemCount = (sale.items || []).reduce((acc, item) => acc + item.quantity, 0);

      return {
        ...sale,
        customerName,
        itemCount,
      } as Order;
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales, customers, t]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return ordersData.find(o => o.id === selectedOrderId) || null;
  }, [selectedOrderId, ordersData]);

  const handleRowClick = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
  }, []);

  const columns = useMemo(() => 
    getColumns(formatCurrency, products, t, isClient, updateSaleDetails, deleteSale), 
    [formatCurrency, products, t, isClient, updateSaleDetails, deleteSale]
  );

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    selectedIds.forEach(id => deleteSale(id));
    setRowSelection({});
    toast({
      title: t('Orders Deleted'),
      description: t('Deleted {count} order(s).', { count: selectedIds.length }),
    });
  };

  const handleExport = () => {
    toast({
      title: t('Export Started'),
      description: t('Generating your order CSV report...'),
    });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Orders</h1>
          <p className="text-muted-foreground text-sm">Browse and manage all new orders across your property.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="h-10">
            <Download className="mr-2 h-4 w-4" /> {t('Export')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>New Orders</CardTitle>
          <CardDescription>A comprehensive list of new POS, Wholesale, and Dine-in transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
            <div className="flex flex-1 items-center gap-2 w-full md:max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('Filter by order ID...')}
                  value={(columnFilters.find(f => f.id === 'id')?.value as string) ?? ""}
                  onChange={(event) =>
                    setColumnFilters([{ id: 'id', value: event.target.value }])
                  }
                  className="pl-9"
                />
              </div>
              <Select
                value={(columnFilters.find(f => f.id === 'status')?.value as string) ?? "all"}
                onValueChange={(value) =>
                  setColumnFilters(value === "all" ? [] : [{ id: 'status', value }])
                }
              >
                <SelectTrigger className="w-[140px] h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="w-full md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('Delete ({count})', { count: Object.keys(rowSelection).length })}
              </Button>
            )}
          </div>

          <DataTable 
            columns={columns} 
            data={ordersData} 
            onRowClick={handleRowClick}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
          />
        </CardContent>
      </Card>

      <OrderDetailsDialog 
        order={selectedOrder}
        open={!!selectedOrderId}
        onOpenChange={(open) => { if(!open) setSelectedOrderId(null); }}
      />
    </div>
  );
}
