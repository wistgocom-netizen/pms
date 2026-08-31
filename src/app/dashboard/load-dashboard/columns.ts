
"use client"

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table"
import type { LoadItem } from "@/lib/types"

export const getLoadDashboardColumns = (
  formatCurrency: (amount: number) => string,
  t: (key: string) => string,
): ColumnDef<LoadItem>[] => [
    {
      accessorKey: "productName",
      header: t("Product"),
    },
    {
      accessorKey: 'quantity',
      header: () => React.createElement('div', { className: "text-right" }, t('Loaded QTY')),
      cell: ({ row }) => React.createElement('div', { className: "text-right font-medium" }, row.original.quantity)
    },
    {
      accessorKey: "unitPrice",
      header: () => React.createElement('div', { className: "text-right" }, t('Buying Price')),
      cell: ({ row }) => React.createElement('div', { className: "text-right" }, formatCurrency(row.original.unitPrice)),
    },
    {
        id: "total",
        header: () => React.createElement('div', { className: "text-right" }, t('Total Value')),
        cell: ({ row }) => {
          const item = row.original;
          const total = item.unitPrice * item.quantity;
          return React.createElement('div', { className: "text-right font-semibold" }, formatCurrency(total));
        },
    },
]
