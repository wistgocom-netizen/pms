
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';
import { Badge } from '@/components/ui/badge';

interface Tax {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
}

export default function TaxesPage() {
  const taxes: Tax[] = [
    { id: '1', name: 'Sales Tax', rate: 0.07, isActive: true },
    { id: '2', name: 'VAT', rate: 0.15, isActive: true },
  ];

  const columns = [
    { header: 'Tax Name', accessorKey: 'name' as const },
    { 
      header: 'Rate (%)', 
      accessorKey: 'rate' as const,
      cell: (t: Tax) => `${(t.rate * 100).toFixed(1)}%`
    },
    { 
      header: 'Status', 
      accessorKey: 'isActive' as const,
      cell: (t: Tax) => <Badge variant={t.isActive ? 'default' : 'secondary'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tax Configuration</h1>
      <EntityTable
        title="Tax Rates"
        description="Configure standard tax rates applicable to sales."
        entities={taxes}
        columns={columns}
        searchKey="name"
        onAdd={() => console.log('Add tax')}
        onEdit={(t) => console.log('Edit', t)}
        onDelete={(t) => console.log('Delete', t)}
      />
    </div>
  );
}
