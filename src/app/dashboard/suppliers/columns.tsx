
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import type { Supplier } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Trash2, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const getColumns = (
  onDelete: (supplier: Supplier) => void,
  t: (key: string, params?: Record<string, string | number>) => string
): ColumnDef<Supplier>[] => [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
      accessorKey: "name",
      header: t('Name'),
    },
    {
      accessorKey: "contactPerson",
      header: t('Contact Person'),
    },
    {
      accessorKey: "email",
      header: t('Email'),
    },
    {
      accessorKey: "phone",
      header: t('Phone'),
      cell: ({ row }) => {
        const phoneNumbers: string[] | undefined = row.getValue("phone");
        if (!phoneNumbers || phoneNumbers.length === 0) {
          return <span>{t('N/A')}</span>;
        }
        return (
          <div className="flex flex-col">
            {phoneNumbers.map((phone, index) => (
              <span key={index}>{phone}</span>
            ))}
          </div>
        );
      },
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const supplier = row.original
          return (
            <div className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('Actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(supplier.id)}}>
                            {t('Copy supplier ID')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                            onClick={(e) => { e.stopPropagation(); onDelete(supplier); }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('Delete Supplier')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )
        },
    },
]
