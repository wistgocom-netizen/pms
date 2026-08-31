
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function BranchesPage() {
  const { t } = useStore();
  
  // Mock data for prototype
  const branches: Branch[] = [
    { id: '1', name: 'Main Street Store', address: '123 Main St', phone: '555-0101', email: 'main@adyfire.com', createdAt: '2023-01-01' },
    { id: '2', name: 'Downtown Branch', address: '456 Center Ave', phone: '555-0102', email: 'downtown@adyfire.com', createdAt: '2023-02-15' },
  ];

  const columns = [
    { header: 'Name', accessorKey: 'name' as const },
    { header: 'Address', accessorKey: 'address' as const },
    { header: 'Phone', accessorKey: 'phone' as const },
    { header: 'Email', accessorKey: 'email' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
      <EntityTable
        title="Manage Branches"
        description="View and manage physical store locations."
        entities={branches}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search branches..."
        onAdd={() => console.log('Add branch')}
        onEdit={(branch) => console.log('Edit', branch)}
        onDelete={(branch) => console.log('Delete', branch)}
      />
    </div>
  );
}
