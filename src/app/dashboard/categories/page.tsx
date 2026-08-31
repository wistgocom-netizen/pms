
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const { t } = useStore();
  
  const categories: Category[] = [
    { id: '1', name: 'Beverages', description: 'Hot and cold drinks', createdAt: '2023-01-01' },
    { id: '2', name: 'Snacks', description: 'Small meals and appetizers', createdAt: '2023-01-01' },
    { id: '3', name: 'Bakery', description: 'Freshly baked goods', createdAt: '2023-01-01' },
  ];

  const columns = [
    { header: 'Name', accessorKey: 'name' as const },
    { header: 'Description', accessorKey: 'description' as const },
    { header: 'Created At', accessorKey: 'createdAt' as const },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Product Categories</h1>
      <EntityTable
        title="Product Categories"
        description="Organize your products into logical groups."
        entities={categories}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search categories..."
        onAdd={() => console.log('Add category')}
        onEdit={(cat) => console.log('Edit', cat)}
        onDelete={(cat) => console.log('Delete', cat)}
      />
    </div>
  );
}
