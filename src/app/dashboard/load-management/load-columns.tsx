
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { LoadItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"

export const getLoadColumns = (
  formatCurrency: (amount: number) => string,
  onUpdateQuantity: (productId: string, quantity: number) => void,
  onRemoveItem: (productId: string) => void,
  t: (key: string) => string,
): ColumnDef<LoadItem>[] => [
    {
      accessorKey: "productName",
      header: t("Product"),
    },
    {
      accessorKey: "rackLocation",
      header: t("Rack/Shelf Location"),
      cell: ({ row }) => row.original.rackLocation || 'N/A'
    },
    {
      accessorKey: 'quantity',
      header: () => <div className="text-right">{t('QTY')}</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                <Input type="number" value={item.quantity} onChange={(e) => onUpdateQuantity(item.productId, parseFloat(e.target.value) || 0)} className="h-7 w-14 text-center px-1" step="1" min="0"/>
                <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
        )
      }
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-right">{t('Price')}</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.unitPrice)}</div>,
    },
    {
        id: "total",
        header: () => <div className="text-right">{t('Total')}</div>,
        cell: ({ row }) => {
          const item = row.original;
          const total = item.unitPrice * item.quantity;
          return <div className="text-right font-semibold">{formatCurrency(total)}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center">
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          )
        },
    },
]
