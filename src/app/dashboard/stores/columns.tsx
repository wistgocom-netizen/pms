"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Organization, UserProfile } from "@/lib/types"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const getStoresColumns = (
  t: (key: string) => string,
  users: UserProfile[],
  organizations: Organization[],
  isClient: boolean,
  userProfile: UserProfile | null,
  onEdit: (organization: Organization) => void
): ColumnDef<Organization>[] => {
    const columns: ColumnDef<Organization>[] = [
    {
        accessorKey: "name",
        header: t('Store Name'),
    },
    {
        id: 'owner',
        header: t('Owner'),
        cell: ({ row }) => {
            const organization = row.original;
            const owner = users.find(u => u.uid === organization.ownerUid);
            return owner ? owner.displayName : t('N/A');
        }
    },
    {
        id: 'cashiers',
        header: t('Cashiers'),
        cell: ({ row }) => {
            const organization = row.original;
            const cashiers = users.filter(
                u => u.organizationId === organization.id && u.role === 'cashier'
            );

            if (cashiers.length === 0) {
                return <Badge variant="outline">{t('No cashiers')}</Badge>;
            }

            return (
                <div className="flex flex-col">
                    {cashiers.map(cashier => (
                        <span key={cashier.uid}>{cashier.displayName}</span>
                    ))}
                </div>
            );
        }
    },
    {
        accessorKey: "subscriptionPlan",
        header: t('Plan'),
        cell: ({ row }) => {
            const organization = row.original;
            const plan: string = organization.subscriptionPlan || 'basic';
            if (plan.toLowerCase() === 'trial') {
                return <Badge variant="outline" className="capitalize">{t('Trial')} (7 {t('days')})</Badge>;
            }
            return <Badge variant={plan === 'business' ? 'default' : plan === 'pro' ? 'secondary' : 'outline'} className="capitalize">{t(plan)}</Badge>
        }
    },
    {
        accessorKey: "subscriptionStatus",
        header: t('Payment Status'),
        cell: ({ row }) => {
            const organization = row.original;
            const status: string | undefined = organization.subscriptionStatus;

            if (!isClient || !status) return <Badge variant="outline">{t('N/A')}</Badge>
            return <Badge variant={status === 'paid' ? 'success' : 'destructive'} className="capitalize">{t(status)}</Badge>
        }
    },
    {
        accessorKey: "lastPaymentDate",
        header: t('Last Paid'),
        cell: ({ row }) => {
            const organization = row.original;
            const lastPaymentDate = organization.lastPaymentDate;
            if (!isClient || !lastPaymentDate) return <span>...</span>
            return <span>{new Date(lastPaymentDate).toLocaleDateString()}</span>
        },
    },
    {
        id: 'daysLeft',
        header: t('Days Left'),
        cell: ({ row }) => {
            const organization = row.original;
            const endDate = organization.subscriptionEndDate;
            
            if (!isClient || !endDate) return <span className="text-center w-full block">...</span>;
            
            const diffTime = new Date(endDate).getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                return <span className="text-destructive font-medium">{t('Expired')}</span>
            }
            if (diffDays <= 7) {
                return <span className="text-yellow-500 font-medium">{diffDays} {t('days')}</span>
            }

            return <span>{diffDays} {t('days')}</span>;
        }
    },
    {
        accessorKey: "createdAt",
        header: t('Created At'),
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt") as any;
            if (!isClient || !createdAt) return <span>...</span>
            return <span>{new Date(createdAt).toLocaleDateString()}</span>
        },
    },
    {
        accessorKey: "id",
        header: t('Store ID'),
        cell: ({ row }) => {
            const id: string = row.getValue("id");
            return <span className="font-mono text-xs">{id}</span>
        }
    }
    ];

    if (userProfile?.role === 'super-admin') {
        columns.push({
            id: 'actions',
            cell: ({ row }) => {
                const organization = row.original;
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
                                <DropdownMenuItem onClick={() => onEdit(organization)}>
                                    {t('Edit Subscription')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            }
        });
    }

    return columns;
}
