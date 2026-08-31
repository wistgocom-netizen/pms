
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { UserProfile, Organization, PricingPlan, Room } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch";
import * as React from 'react';

export const getControlPanelColumns = (
  t: (key: string, params?: Record<string, string | number>) => string,
  organizations: Organization[],
  allUsers: UserProfile[],
  pricingPlans: PricingPlan[],
  allRooms: Room[],
  formatCurrency: (amount: number) => string,
  isClient: boolean,
  onPay: (organization: Organization) => void,
  updateUserRole: (userId: string, role: 'admin' | 'pending') => void,
  currentUser: UserProfile | null,
  onEditOrg: (organization: Organization) => void
): ColumnDef<UserProfile>[] => {
  const columns: ColumnDef<UserProfile>[] = [
    {
        accessorKey: "displayName",
        header: t('Name'),
    },
    {
        accessorKey: "email",
        header: t('Email'),
    },
    {
        accessorKey: "role",
        header: t('Role'),
        cell: ({ row }) => {
            const role: string = row.getValue("role");
            const roleKey = role || 'pending';
            return <Badge variant={roleKey === 'super-admin' ? 'destructive' : roleKey === 'admin' ? 'default' : 'secondary'} className="capitalize">{t(roleKey)}</Badge>
        }
    },
    {
        id: 'organizationName',
        header: t('Property'),
        cell: ({ row }) => {
            const user = row.original;
            const org = organizations.find(o => o.id === user.organizationId);
            return org ? org.name : t('N/A');
        }
    },
    {
        id: 'plan',
        header: t('Plan'),
        cell: ({ row }) => {
            const user = row.original;
            if (!user.organizationId) return t('N/A');
            const org = organizations.find(o => o.id === user.organizationId);
            const plan: string = org?.subscriptionPlan || 'N/A';

            if (plan.toLowerCase() === 'trial') {
                return <Badge variant="outline" className="capitalize">{t('Trial')} (7 {t('days')})</Badge>;
            }
            
            const cycle: string | undefined = org?.billingCycle;
            const cycleText = cycle ? ` (${t(cycle)})` : '';
            return <Badge variant={plan === 'business' ? 'default' : plan === 'pro' ? 'secondary' : 'outline'} className="capitalize">{t(plan)}{cycleText}</Badge>
        }
    },
    {
        id: 'amount',
        header: () => <div className="text-right">{t('Price')}</div>,
        cell: ({ row }) => {
            const user = row.original;
            if (!user.organizationId) return <div className="text-right">{t('N/A')}</div>;
            const org = organizations.find(o => o.id === user.organizationId);
            if (!org || !org.subscriptionPlan) return <div className="text-right">{t('N/A')}</div>;

            const planDetails = pricingPlans.find(p => p.name.toLowerCase() === org.subscriptionPlan!.toLowerCase());
            if (!planDetails) return <div className="text-right">{t('N/A')}</div>;

            const billingCycle = org.billingCycle || 'monthly';
            let amount = planDetails.priceMonthly;

            if (billingCycle === 'yearly') {
                amount = planDetails.priceMonthly * 12 * (1 - (planDetails.yearlyDiscount / 100));
            }
            
            return <div className="text-right">{formatCurrency(amount)}</div>;
        }
    },
    {
        id: 'rooms',
        header: t('Rooms (Used/Limit)'),
        cell: ({ row }) => {
            const user = row.original;
            if (user.role !== 'admin') return <span className="text-center w-full block">—</span>;

            const propertyRooms = allRooms.filter(r => r.id.startsWith('R')); // Simple mock filter
            const org = organizations.find(o => o.id === user.organizationId);
            const plan = org?.subscriptionPlan || 'basic';
            
            const planDetails = pricingPlans.find(p => p.name.toLowerCase() === plan.toLowerCase());
            const limit = planDetails?.rooms || 5;
            
            return `${propertyRooms.length} / ${limit === 999 ? '∞' : limit}`;
        }
    },
    {
        accessorKey: "subscriptionStatus",
        header: t('Status'),
        cell: ({ row }) => {
            const user = row.original;
            if (!user.organizationId) return <Badge variant="outline">{t('N/A')}</Badge>;
            const org = organizations.find(o => o.id === user.organizationId);
            const status: string | undefined = org?.subscriptionStatus;
            
            if (!isClient || !status) return <Badge variant="outline">{t('N/A')}</Badge>
            
            return <Badge variant={status === 'paid' ? 'success' : 'destructive'} className="capitalize">{t(status)}</Badge>
        }
    },
    {
        id: 'expireDate',
        header: t('Expire Date'),
        cell: ({ row }) => {
            const user = row.original;
            if (!user.organizationId) return t('N/A');
            const org = organizations.find(o => o.id === user.organizationId);
            const endDate = org?.subscriptionEndDate;
            if (!isClient || !endDate) return '...';
            return <span>{new Date(endDate).toLocaleDateString()}</span>;
        }
    },
    {
        id: 'daysLeft',
        header: t('Days Left'),
        cell: ({ row }) => {
            const user = row.original;
            if (!user.organizationId) return <span className="text-center w-full block">—</span>;
            const org = organizations.find(o => o.id === user.organizationId);
            const endDate = org?.subscriptionEndDate;
            
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
      id: 'active',
      header: t('Active'),
      cell: ({ row }) => {
        const user = row.original;
        if (user.role === 'super-admin' || user.uid === currentUser?.uid) {
          return null;
        }

        if (user.role !== 'admin' && user.role !== 'pending') {
            return null;
        }

        const handleToggle = (checked: boolean) => {
          const newRole = checked ? 'admin' : 'pending';
          updateUserRole(user.uid, newRole);
        };
        
        const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

        return (
          <div onClick={stopPropagation} onKeyDown={stopPropagation} className="flex justify-center">
            <Switch
              checked={user.role !== 'pending'}
              onCheckedChange={handleToggle}
              aria-label={t('Toggle account activation')}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">{t('Actions')}</div>,
      cell: function ActionsCell({ row }) {
        const user = row.original;
        const org = organizations.find(o => o.id === user.organizationId);

        if (!org) return null;

        const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

        return (
          <div onClick={stopPropagation} className="flex justify-center gap-2">
            <Button size="sm" onClick={() => onPay(org)}>{t('Pay')}</Button>
            {currentUser?.role === 'super-admin' && (
              <Button size="sm" variant="outline" onClick={() => onEditOrg(org)}>
                {t('Edit')}
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  
  return columns;
}
