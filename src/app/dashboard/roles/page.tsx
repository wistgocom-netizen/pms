
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';
import { Badge } from '@/components/ui/badge';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function RolesPage() {
  const roles: Role[] = [
    { id: '1', name: 'Admin', description: 'Full system access', permissions: ['manage_products', 'manage_users', 'view_reports'] },
    { id: '2', name: 'Cashier', description: 'Sales operations only', permissions: ['process_sales'] },
    { id: '3', name: 'Manager', description: 'Store-level management', permissions: ['view_reports', 'manage_products'] },
  ];

  const columns = [
    { header: 'Role Name', accessorKey: 'name' as const },
    { header: 'Description', accessorKey: 'description' as const },
    { 
      header: 'Permissions', 
      accessorKey: 'permissions' as const,
      cell: (r: Role) => (
        <div className="flex flex-wrap gap-1">
          {r.permissions.map((p, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User Roles</h1>
      <EntityTable
        title="Roles & Permissions"
        description="Define access levels for your staff."
        entities={roles}
        columns={columns}
        searchKey="name"
        onAdd={() => console.log('Add role')}
        onEdit={(r) => console.log('Edit', r)}
        onDelete={(r) => console.log('Delete', r)}
      />
    </div>
  );
}
