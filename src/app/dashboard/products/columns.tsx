
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Product, Category } from "@/lib/types"
import { Input } from "@/components/ui/input"
import React, { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const EditableCell = ({
    row,
    accessorKey,
    updateProduct,
}: {
    row: any,
    accessorKey: 'price' | 'stock' | 'buyingPrice',
    updateProduct: (productId: string, field: 'price' | 'stock' | 'buyingPrice', value: number) => void
}) => {
    const product = row.original as Product;
    const initialValue = product[accessorKey];
    const [value, setValue] = useState<number | string | undefined>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleBlur = () => {
        let newValue: number;
        if (accessorKey === 'stock') {
            newValue = parseInt(String(value), 10);
            if (isNaN(newValue)) newValue = 0;
        } else {
            newValue = parseFloat(String(value));
            if (isNaN(newValue)) newValue = 0;
        }
        
        if (newValue !== initialValue) {
            updateProduct(product.id, accessorKey, newValue);
        } else {
            setValue(initialValue);
        }
    };

    return (
        <Input
            type="number"
            className="text-right font-medium bg-transparent border-dashed border rounded-md px-2 ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 h-8"
            value={value === undefined ? '' : value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                } else if (e.key === 'Escape') {
                    setValue(initialValue);
                    (e.target as HTMLInputElement).blur();
                }
            }}
            step={accessorKey === 'price' || accessorKey === 'buyingPrice' ? '0.01' : '1'}
            onClick={(e) => e.stopPropagation()}
        />
    );
};

const EditableCategoryCell = ({
    row,
    updateProduct,
    categories,
    t
}: {
    row: any,
    updateProduct: (productId: string, field: 'category', value: string) => void,
    categories: Category[],
    t: (key: string) => string
}) => {
    const product = row.original as Product;
    const initialValue = product.category;

    const handleCategoryChange = (newValue: string) => {
        if (newValue && newValue !== initialValue) {
            updateProduct(product.id, 'category', newValue);
        }
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div onClick={stopPropagation}>
            <Select value={initialValue} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-transparent border-dashed border rounded-md px-2 ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 h-8">
                    <SelectValue placeholder={t('Select category')} />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};


export const getColumns = (
  formatCurrency: (amount: number) => string,
  updateProduct: (productId: string, field: 'price' | 'stock' | 'category' | 'buyingPrice', value: number | string) => void,
  onDelete: (product: Product) => void,
  categories: Category[],
  t: (key: string) => string
): ColumnDef<Product>[] => [
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
      header: t("Name"),
    },
    {
      accessorKey: "category",
      header: t("Category"),
      cell: ({ row }) => <EditableCategoryCell row={row} updateProduct={updateProduct} categories={categories} t={t} />,
    },
    {
      accessorKey: "supplier",
      header: t("Supplier"),
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">{t('Selling Price')}</div>,
      cell: ({ row }) => <EditableCell row={row} accessorKey="price" updateProduct={updateProduct as any} />,
    },
    {
        accessorKey: "buyingPrice",
        header: () => <div className="text-right">{t('Buying Price')}</div>,
        cell: ({ row }) => <EditableCell row={row} accessorKey="buyingPrice" updateProduct={updateProduct as any} />,
    },
    {
        accessorKey: "stock",
        header: () => <div className="text-right">{t('Stock')}</div>,
        cell: ({ row }) => <EditableCell row={row} accessorKey="stock" updateProduct={updateProduct as any} />,
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t('Delete Product')}</span>
                </Button>
            </div>
          )
        },
    },
]
