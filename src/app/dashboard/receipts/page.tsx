
'use client';

import { EntityTable } from '@/components/dashboard/entity-table';
import { useStore } from '@/context/StoreContext';

interface ReceiptConfig {
  id: string;
  branchName: string;
  headerText: string;
  fontSize: number;
  previewEnabled: boolean;
}

export default function ReceiptsPage() {
  const configs: ReceiptConfig[] = [
    { id: '1', branchName: 'Main Street Store', headerText: 'ADYFIRE COFFEE CO.', fontSize: 12, previewEnabled: true },
    { id: '2', branchName: 'Downtown Branch', headerText: 'ADYFIRE EXPRESS', fontSize: 10, previewEnabled: true },
  ];

  const columns = [
    { header: 'Branch', accessorKey: 'branchName' as const },
    { header: 'Header Text', accessorKey: 'headerText' as const },
    { header: 'Font Size', accessorKey: 'fontSize' as const },
    { 
      header: 'Preview', 
      accessorKey: 'previewEnabled' as const,
      cell: (c: ReceiptConfig) => c.previewEnabled ? 'Enabled' : 'Disabled'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Receipt Settings</h1>
      <EntityTable
        title="Branch Receipt Configs"
        description="Customize receipt layout and content per branch."
        entities={configs}
        columns={columns}
        onEdit={(c) => console.log('Edit config', c)}
      />
    </div>
  );
}
