"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { CartItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export const getWholesaleCartColumns = (
  formatCurrency: (amount: number) => string,
  onUpdateQuantity: (lineItemId: string, quantity: number) => void,
  onUpdateDiscount: (lineItemId: string, discount: number) => void,
  onRemoveItem: (lineItemId: string) => void,
  t: (key: string) => string,
): ColumnDef<CartItem>[] => [
    {
      accessorKey: "id",
      header: t("SKU"),
      cell: ({ row }) => <span className="font-mono text-[10px] md:text-xs whitespace-nowrap min-w-[60px] block">{row.original.id}</span>
    },
    {
      accessorKey: "name",
      header: () => <div className="min-w-[120px]">{t("Title")}</div>,
      cell: ({ row }) => <span className="font-medium text-xs md:text-sm line-clamp-2">{row.original.name}</span>
    },
    {
      accessorKey: "category",
      header: () => <div className="hidden md:block">{t("Category")}</div>,
      cell: ({ row }) => <div className="hidden md:block text-xs">{row.original.category}</div>,
    },
    {
      accessorKey: 'quantity',
      header: () => <div className="text-right text-xs md:text-sm min-w-[80px]">{t('QTY')}</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
            <div className="flex items-center justify-end gap-1 md:gap-2">
                <Button type="button" variant="outline" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => onUpdateQuantity(item.lineItemId, item.quantity - 1)}><Minus className="h-3 w-3 md:h-4 md:w-4" /></Button>
                <Input type="number" value={item.quantity} onChange={(e) => onUpdateQuantity(item.lineItemId, parseFloat(e.target.value) || 0)} className="h-6 w-10 md:h-7 md:w-14 text-center px-1 text-xs" step="1" min="0"/>
                <Button type="button" variant="outline" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => onUpdateQuantity(item.lineItemId, item.quantity + 1)}><Plus className="h-3 w-3 md:h-4 md:w-4" /></Button>
            </div>
        )
      }
    },
    {
        accessorKey: "rackLocation",
        header: () => <div className="hidden lg:block">{t("Warehouse")}</div>,
        cell: ({ row }) => <div className="hidden lg:block text-xs">{row.original.rackLocation || 'N/A'}</div>
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right text-xs md:text-sm min-w-[70px]">{t('Price')}</div>,
      cell: ({ row }) => <div className="text-right font-mono text-xs md:text-sm">{(row.original.price).toFixed(2)}</div>,
    },
    {
      accessorKey: "discount",
      header: () => <div className="text-right text-xs md:text-sm min-w-[80px]">{t("Disc %")}</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1">
                <Input
                type="number"
                value={item.discount ?? ''}
                onChange={(e) => onUpdateDiscount(item.lineItemId, parseFloat(e.target.value) || 0)}
                className="h-7 w-12 md:h-8 md:w-16 text-right pr-1 text-xs"
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                />
                <span className="text-[10px] font-medium">%</span>
            </div>
          </div>
        );
      },
    },
    {
        id: "total",
        header: () => <div className="text-right text-xs md:text-sm min-w-[80px]">{t('Total')}</div>,
        cell: ({ row }) => {
          const item = row.original;
          const total = (item.price * (1 - (item.discount || 0) / 100)) * item.quantity;
          return <div className="text-right font-bold font-mono text-xs md:text-sm">{(total).toFixed(2)}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center min-w-[40px]">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.lineItemId)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          )
        },
    },
]