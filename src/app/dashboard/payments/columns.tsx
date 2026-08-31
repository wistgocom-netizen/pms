"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Cheque, ChequeStatus, Customer, Sale } from "@/lib/types"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const EditableStatusCell = ({
    row,
    updateChequeStatus,
    t
}: {
    row: any,
    updateChequeStatus: (chequeId: string, status: ChequeStatus) => void,
    t: (key: string) => string
}) => {
    const cheque = row.original as Cheque;
    const initialValue = cheque.status;

    const handleStatusChange = (newValue: ChequeStatus) => {
        if (newValue && newValue !== initialValue) {
            updateChequeStatus(cheque.id, newValue);
        }
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    const statusOptions: ChequeStatus[] = ["Pending", "Success", "Returned", "Cleared"];

    return (
        <div onClick={stopPropagation}>
            <Select value={initialValue} onValueChange={handleStatusChange}>
                <SelectTrigger className={cn(
                    "bg-transparent border-dashed border rounded-md px-2 ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 h-8 w-32",
                     initialValue === 'Success' && 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800/50 dark:text-green-300',
                     initialValue === 'Returned' && 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800/50 dark:text-red-300',
                     initialValue === 'Cleared' && 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800/50 dark:text-blue-300',
                )}>
                    <SelectValue placeholder={t('Select status')} />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                           <Badge variant={
                                status === 'Success' ? 'success' :
                                status === 'Returned' ? 'destructive' :
                                status === 'Cleared' ? 'default' : 'secondary'
                           } className="capitalize">{t(status)}</Badge>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};


export const getColumns = (
  formatCurrency: (amount: number) => string,
  updateChequeStatus: (chequeId: string, status: ChequeStatus) => void,
  deleteCheque: (chequeId: string) => void,
  t: (key: string) => string,
  isClient: boolean,
  customers: Customer[],
  sales: Sale[]
): ColumnDef<Cheque>[] => [
    {
        accessorKey: "date",
        header: t('Date'),
        cell: ({ row }) => {
            const date = row.getValue("date") as any;
            if (!isClient) {
                return <span>...</span>;
            }
            return <span>{date ? new Date(date).toLocaleString() : t('N/A')}</span>
        },
    },
    {
        accessorKey: "invoiceNo",
        header: t('Invoice'),
    },
    {
        id: 'customerName',
        header: t('Customer Name'),
        cell: ({ row }) => {
            const cheque = row.original;
            const sale = sales.find(s => s.id === cheque.invoiceNo);
            if (!sale) {
                return t('N/A');
            }

            if (sale.customerName) {
                return sale.customerName;
            }

            if (sale.customerId) {
                const customer = customers.find(c => c.id === sale.customerId);
                if (customer) {
                    return customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                }
            }

            return t('Walk-in Customer');
        }
    },
    {
        accessorKey: "chequeNo",
        header: t('Cheque No'),
    },
    {
        accessorKey: "chequeIssueDate",
        header: t('Cheque Issue Date'),
        cell: ({ row }) => row.getValue("chequeIssueDate") || t('N/A'),
    },
    {
        accessorKey: "chequePrintedDate",
        header: t('Cheque Printed Date'),
        cell: ({ row }) => row.getValue("chequePrintedDate") || t('N/A'),
    },
    {
        accessorKey: "chequeClearDate",
        header: t('Cheque Clear Date'),
        cell: ({ row }) => row.getValue("chequeClearDate") || t('N/A'),
    },
    {
        accessorKey: "duration",
        header: t('Duration (days)'),
        cell: ({ row }) => row.getValue("duration") ?? t('N/A'),
    },
    {
        accessorKey: "bank",
        header: t('Bank'),
    },
    {
        accessorKey: "chequeAmount",
        header: () => <div className="text-right">{t('Cheque Amount')}</div>,
        cell: function ChequeAmountCell({ row }) {
          const amount = parseFloat(row.getValue("chequeAmount"))
          return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: t('Cheque Status'),
        cell: ({ row }) => <EditableStatusCell row={row} updateChequeStatus={updateChequeStatus} t={t} />,
    },
    {
        id: "actions",
        cell: ({ row }) => {
          const cheque = row.original
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
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive focus:text-destructive-foreground focus:bg-destructive p-2 h-auto font-normal">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('Delete Cheque')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('This action cannot be undone. This will permanently delete the cheque record.')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteCheque(cheque.id)} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )
        },
    },
]
