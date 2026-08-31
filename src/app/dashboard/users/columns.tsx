
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserProfile, Sale } from "@/lib/types"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Shield, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const getUsersColumns = (
  t: (key: string) => string,
  currentUser: UserProfile | null,
  onEdit: (user: UserProfile) => void,
  onEditPermissions: (user: UserProfile) => void,
  sales: Sale[],
  formatCurrency: (amount: number) => string,
  onDelete: (user: UserProfile) => void
): ColumnDef<UserProfile>[] => {
  const columns: ColumnDef<UserProfile>[] = [
    {
        accessorKey: "displayName",
        header: t('Name'),
    },
    {
        accessorKey: "email",
        header: t('Email'),
    },
    {
        accessorKey: "role",
        header: t('Role'),
        cell: ({ row }) => {
            const role: string = row.getValue("role");
            const roleKey = role || 'pending';
            return <Badge variant={roleKey === 'super-admin' ? 'destructive' : roleKey === 'admin' ? 'default' : 'secondary'} className="capitalize">{t(roleKey)}</Badge>
        }
    },
    {
        id: 'totalSales',
        header: () => <div className="text-right">{t('Total Sales')}</div>,
        cell: ({ row }) => {
            const user = row.original;
            const userSales = sales.filter(sale => sale.userId === user.uid && sale.status === 'Completed');
            const total = userSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

            return <div className="text-right font-medium">{formatCurrency(total)}</div>
        },
    },
  ];

  if (currentUser?.role === 'super-admin') {
    columns.push({
        accessorKey: "organizationId",
        header: t('Store ID'),
        cell: ({ row }) => {
            const id: string | null = row.getValue("organizationId");
            return <span className="font-mono text-xs">{id || '—'}</span>
        }
    });
  }

  columns.push({
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        if (user.role === 'super-admin' || user.uid === currentUser?.uid) {
            return null;
        }
        return (
          <div className="text-right">
              <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(user); }}
              >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{t('Delete User')}</span>
              </Button>
          </div>
        )
      },
  });
  
  return columns;
}
