
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';

interface InventoryTransaction {
  id: string;
  productName: string;
  transactionType: 'sale' | 'restock' | 'return' | 'adjustment';
  quantityChange: number;
  currentStockQuantity: number;
  transactionDate: string;
}

export default function InventoryPage() {
  const transactions: InventoryTransaction[] = [
    { id: '1', productName: 'Classic Coffee Bean', transactionType: 'restock', quantityChange: 100, currentStockQuantity: 150, transactionDate: '2023-10-25' },
    { id: '2', productName: 'Classic Coffee Bean', transactionType: 'sale', quantityChange: -2, currentStockQuantity: 148, transactionDate: '2023-10-26' },
    { id: '3', productName: 'Espresso Machine', transactionType: 'sale', quantityChange: -1, currentStockQuantity: 11, transactionDate: '2023-10-26' },
  ];

  const columns = [
    { header: 'Product', accessorKey: 'productName' as const },
    { 
      header: 'Type', 
      accessorKey: 'transactionType' as const,
      cell: (t: InventoryTransaction) => <span className="capitalize">{t.transactionType}</span>
    },
    { 
      header: 'Change', 
      accessorKey: 'quantityChange' as const,
      cell: (t: InventoryTransaction) => (
        <span className={t.quantityChange > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
        </span>
      )
    },
    { header: 'New Level', accessorKey: 'currentStockQuantity' as const },
    { header: 'Date', accessorKey: 'transactionDate' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Movement</h1>
      <EntityTable
        title="Stock Transactions"
        description="Detailed log of all inventory adjustments and movements."
        entities={transactions}
        columns={columns}
        searchKey="productName"
        searchPlaceholder="Search by product..."
      />
    </div>
  );
}
