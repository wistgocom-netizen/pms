"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Sale, Product, SaleStatus } from "@/lib/types"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type Order = Sale & {
    customerName: string;
    itemCount: number;
};

const EditableStatusCell = ({
    row,
    updateSaleDetails,
    t
}: {
    row: any,
    updateSaleDetails: (orderId: string, data: Partial<Sale>) => void,
    t: (key: string) => string
}) => {
    const order = row.original as Order;
    const initialValue = order.status;

    const handleStatusChange = (newValue: SaleStatus) => {
        if (newValue && newValue !== initialValue) {
            const payload: Partial<Sale> = { status: newValue };
            // When restoring from cancelled, include items so extra charges are re-created
            if (initialValue === 'Cancelled' && newValue !== 'Cancelled' && order.items?.length > 0) {
                payload.items = order.items;
            }
            // When approving from New, include items so extra charges are created on the booking
            if (initialValue === 'New' && newValue !== 'New' && newValue !== 'Cancelled' && order.items?.length > 0) {
                payload.items = order.items;
            }
            updateSaleDetails(order.id, payload);
        }
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    const statusOptions: SaleStatus[] = ["New", "Approved", "Preparing", "Ready", "Completed", "Cancelled"];

    return (
        <div onClick={stopPropagation}>
            <Select value={initialValue} onValueChange={handleStatusChange}>
                <SelectTrigger className={cn(
                    "bg-transparent border-dashed border rounded-md px-2 ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 h-8 w-32 text-xs",
                     initialValue === 'Completed' && 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                     initialValue === 'Cancelled' && 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                     initialValue === 'Approved' && 'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
                     initialValue === 'Preparing' && 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
                     initialValue === 'Ready' && 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
                     initialValue === 'New' && 'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
                )}>
                    <SelectValue placeholder={t('Select status')} />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                           {t(status)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export const getColumns = (
    formatCurrency: (amount: number) => string, 
    products: Product[],
    t: (key: string, params?: Record<string, string | number>) => string,
    isClient: boolean,
    updateSaleDetails: (orderId: string, data: Partial<Sale>) => void,
    deleteSale: (orderId: string) => void
): ColumnDef<Order>[] => [
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
        accessorKey: "id",
        header: t("Order ID"),
        cell: ({ row }) => {
            const id: string = row.getValue("id");
            return <span className="font-mono">{id.slice(-6).toUpperCase()}</span>
        }
    },
    {
        accessorKey: "saleDate",
        header: t("Date"),
        cell: ({ row }) => {
            const saleDate = row.getValue("saleDate") as any;
            if (!isClient) {
                return <span>...</span>;
            }
            return <span>{saleDate ? new Date(saleDate).toLocaleDateString() : 'N/A'}</span>
        },
    },
    {
        accessorKey: "customerName",
        header: t("Customer"),
    },
    {
        accessorKey: "tableNumber",
        header: t("Room / Table"),
        cell: ({ row }) => {
            const tableNumber = row.getValue("tableNumber") as string;
            return <span className="font-medium">{tableNumber || '—'}</span>
        }
    },
    {
        accessorKey: "itemCount",
        header: t("Items"),
        cell: ({ row }) => {
            const order = row.original;
            const itemCount = order.itemCount;
            const items = order.items || [];

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="underline decoration-dotted cursor-pointer">{itemCount}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="p-2 space-y-1 max-w-xs">
                                <p className="font-semibold mb-2">{t('Items in Order')}</p>
                                {items.length > 0 ? (
                                    items.map((item, index) => {
                                        const productName = item.productName || products.find(p => p.id === item.productId)?.name || t('Unknown Product');
                                        return (
                                            <div key={index} className="flex justify-between gap-4 text-xs">
                                                <span>{item.quantity}x {productName}</span>
                                                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-xs text-muted-foreground">{t('No items in this order.')}</p>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">{t('Total')}</div>,
        cell: function TotalCell({ row }) {
          const amount = parseFloat(row.getValue("totalAmount"))
          return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: t("Status"),
        cell: ({ row }) => <EditableStatusCell row={row} updateSaleDetails={updateSaleDetails} t={t} />
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="flex justify-end">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSale(order.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t('Delete order')}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
        }
    },
]