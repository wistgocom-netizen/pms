"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { PricingPlan } from "@/lib/types"
import { Input } from "@/components/ui/input"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
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

const EditableCell = ({
    row,
    accessorKey,
    updatePricingPlan,
}: {
    row: any,
    accessorKey: 'name' | 'priceMonthly' | 'yearlyDiscount' | 'rooms' | 'products' | 'durationDays',
    updatePricingPlan: (planId: string, data: Partial<PricingPlan>) => void
}) => {
    const plan = row.original as PricingPlan;
    const initialValue = plan[accessorKey as keyof PricingPlan];
    const [value, setValue] = useState<string | number | undefined>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleBlur = () => {
        let newValue: number | string;
        if (typeof initialValue === 'number') {
            newValue = parseFloat(String(value));
            if (isNaN(newValue)) newValue = 0;
        } else {
            newValue = String(value);
        }
        
        if (newValue !== initialValue) {
            updatePricingPlan(plan.id, { [accessorKey]: newValue });
        } else {
            setValue(initialValue);
        }
    };

    return (
        <Input
            type={typeof initialValue === 'number' ? 'number' : 'text'}
            className="bg-transparent border-dashed border rounded-md px-2 ring-offset-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 h-8"
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
            step={typeof initialValue === 'number' ? '0.01' : undefined}
            onClick={(e) => e.stopPropagation()}
        />
    );
};

export const getSubscriptionColumns = (
  formatCurrency: (amount: number) => string,
  updatePricingPlan: (planId: string, data: Partial<PricingPlan>) => void,
  isSuperAdmin: boolean,
  t: (key: string) => string,
  onDelete: (plan: PricingPlan) => void,
  onSelect: (plan: PricingPlan) => void,
  currentPlanName?: string,
): ColumnDef<PricingPlan>[] => {
  
  const columns: ColumnDef<PricingPlan>[] = [
    {
      accessorKey: "name",
      header: t("Plan Name"),
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="name" updatePricingPlan={updatePricingPlan} /> : row.getValue("name"),
    },
    {
      accessorKey: "rooms",
      header: () => <div className="text-right">{t('Rooms')}</div>,
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="rooms" updatePricingPlan={updatePricingPlan} /> : <div className="text-right font-medium">{row.getValue("rooms")}</div>,
    },
    {
      accessorKey: "products",
      header: () => <div className="text-right">{t('Products')}</div>,
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="products" updatePricingPlan={updatePricingPlan} /> : <div className="text-right font-medium">{row.original.products || row.getValue("rooms")}</div>,
    },
    {
      accessorKey: "durationDays",
      header: () => <div className="text-right">{t('Duration (Days)')}</div>,
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="durationDays" updatePricingPlan={updatePricingPlan} /> : <div className="text-right font-medium">{row.original.durationDays || '30'}</div>,
    },
    {
      accessorKey: "priceMonthly",
      header: () => <div className="text-right">{t('Monthly Price')}</div>,
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="priceMonthly" updatePricingPlan={updatePricingPlan} /> : <div className="text-right font-medium">{formatCurrency(row.getValue("priceMonthly"))}</div>,
    },
    {
      accessorKey: "yearlyDiscount",
      header: () => <div className="text-right">{t('Yearly Discount (%)')}</div>,
      cell: ({ row }) => isSuperAdmin ? <EditableCell row={row} accessorKey="yearlyDiscount" updatePricingPlan={updatePricingPlan} /> : <div className="text-right font-medium">{row.getValue("yearlyDiscount")}%</div>,
    },
    {
        accessorKey: "priceYearly",
        header: () => <div className="text-right">{t('Yearly Price')}</div>,
        cell: function PriceYearlyCell({ row }) {
          const plan = row.original;
          const yearlyPrice = plan.priceMonthly * 12 * (1 - plan.yearlyDiscount / 100);
          return <div className="text-right font-medium">{formatCurrency(yearlyPrice)}</div>
        },
    },
  ];
  
  if (isSuperAdmin) {
    columns.push({
        id: "actions",
        cell: ({ row }) => {
            const plan = row.original;
            return (
                <div className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); }}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t('Delete Plan')}</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('This action cannot be undone. This will permanently delete the "{planName}" plan.', { planName: plan.name })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(plan)} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    });
  } else {
    columns.push({
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;
        const isCurrent = plan.name.toLowerCase() === currentPlanName?.toLowerCase();

        return (
          <div className="text-right">
            <Button
              onClick={() => onSelect(plan)}
              disabled={isCurrent}
            >
              {isCurrent ? t('Current Plan') : t('Select Plan')}
            </Button>
          </div>
        );
      },
    });
  }

  return columns;
}