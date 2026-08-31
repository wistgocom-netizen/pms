
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { Loan } from "@/lib/types"
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";


export const getColumns = (
  formatCurrency: (amount: number) => string,
  onDelete: (loan: Loan) => void,
  t: (key: string) => string,
  isClient: boolean,
): ColumnDef<Loan>[] => [
    {
        accessorKey: "date",
        header: t('Date'),
        cell: ({ row }) => {
            const date: Date | null = row.getValue("date");
            if (!isClient) {
                return <span>...</span>;
            }
            return <span>{date ? date.toLocaleDateString() : t('N/A')}</span>
        },
    },
    {
        accessorKey: "saleId",
        header: t('Invoice / Loan ID'),
        cell: ({ row }) => {
            const id: string = row.getValue("saleId");
            return <span className="font-mono">{id.slice(0, 7).toUpperCase()}</span>
        }
    },
    {
        accessorKey: "originalAmount",
        header: () => <div className="text-right">{t('Original Amount')}</div>,
        cell: function OriginalAmountCell({ row }) {
          const amount = parseFloat(row.getValue("originalAmount"))
          return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "paidAmount",
        header: () => <div className="text-right">{t('Paid')}</div>,
        cell: function PaidAmountCell({ row }) {
            const amount = parseFloat(row.getValue("paidAmount"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
        footer: () => <div className="text-right font-bold text-muted-foreground">{t('Total Balance')}</div>,
    },
    {
        accessorKey: "balance",
        header: () => <div className="text-right">{t('Balance')}</div>,
        cell: ({ row }) => {
          const loan = row.original;
          const balance = loan.originalAmount - loan.paidAmount;
          return <div className="text-right font-medium">{formatCurrency(balance)}</div>
        },
        footer: ({ table }) => {
            const total = table
              .getCoreRowModel()
              .rows.reduce((total, row) => {
                const loan = row.original;
                const balance = loan.originalAmount - loan.paidAmount;
                return total + balance;
              }, 0);
   
            return <div className="text-right font-bold">{formatCurrency(total)}</div>;
        },
    },
    {
        accessorKey: "status",
        header: t('Status'),
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            const variant = status === 'Paid' ? 'secondary' : status === 'Partial' ? 'default' : 'destructive';
            return <Badge variant={variant} className="capitalize">{t(status)}</Badge>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const loan = row.original
          return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(loan); }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t('Delete Loan')}</span>
                </Button>
            </div>
          )
        },
    },
]
