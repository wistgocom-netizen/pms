
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';
import { Badge } from '@/components/ui/badge';

interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function DiscountsPage() {
  const { formatCurrency } = useStore();
  
  const discounts: Discount[] = [
    { id: '1', name: 'Holiday Sale', type: 'percentage', value: 0.20, isActive: true, startDate: '2023-12-01', endDate: '2023-12-31' },
    { id: '2', name: 'New User Coupon', type: 'fixed_amount', value: 500, isActive: true, startDate: '2023-01-01', endDate: '2024-12-31' },
  ];

  const columns = [
    { header: 'Offer Name', accessorKey: 'name' as const },
    { 
      header: 'Value', 
      accessorKey: 'value' as const,
      cell: (d: Discount) => d.type === 'percentage' ? `${d.value * 100}%` : formatCurrency(d.value)
    },
    { header: 'Expires', accessorKey: 'endDate' as const },
    { 
      header: 'Status', 
      accessorKey: 'isActive' as const,
      cell: (d: Discount) => <Badge variant={d.isActive ? 'default' : 'secondary'}>{d.isActive ? 'Active' : 'Expired'}</Badge>
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Discounts & Promos</h1>
      <EntityTable
        title="Promotional Offers"
        description="Define sales and vouchers for your store."
        entities={discounts}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search offers..."
        onAdd={() => console.log('Add discount')}
        onEdit={(d) => console.log('Edit', d)}
        onDelete={(d) => console.log('Delete', d)}
      />
    </div>
  );
}
