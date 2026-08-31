
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

export default function CustomersPage() {
  const customers: Customer[] = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-1234', loyaltyPoints: 120 },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '555-5678', loyaltyPoints: 450 },
  ];

  const columns = [
    { 
      header: 'Name', 
      accessorKey: 'firstName' as const,
      cell: (c: Customer) => `${c.firstName} ${c.lastName}`
    },
    { header: 'Email', accessorKey: 'email' as const },
    { header: 'Phone', accessorKey: 'phone' as const },
    { header: 'Points', accessorKey: 'loyaltyPoints' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Customer Database</h1>
      <EntityTable
        title="Customers"
        description="Manage customer profiles and loyalty points."
        entities={customers}
        columns={columns}
        searchKey="firstName" // Note: searching simple firstName for prototype
        searchPlaceholder="Search customers..."
        onAdd={() => console.log('Add customer')}
        onEdit={(c) => console.log('Edit', c)}
        onDelete={(c) => console.log('Delete', c)}
      />
    </div>
  );
}
