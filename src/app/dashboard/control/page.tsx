
'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { getControlPanelColumns } from './columns';
import { DataTable } from '../components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditStoreDialog } from '../stores/edit-store-dialog';
import type { Organization } from '@/lib/types';
import { PaySubscriptionDialog } from './pay-subscription-dialog';
import { Users as UsersIcon, Building, CreditCard, ShieldCheck } from 'lucide-react';

export default function ControlPage() {
  const { 
    t, 
    users, 
    organizations, 
    isLoading, 
    processSubscriptionPayment, 
    updateUserRole, 
    userProfile, 
    updateOrganization, 
    pricingPlans, 
    formatCurrency,
    rooms
  } = useStore();
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [orgToPayFor, setOrgToPayFor] = useState<Organization | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleProcessPayment = useCallback(async (organizationId: string, billingCycle?: 'monthly' | 'yearly') => {
    await processSubscriptionPayment(organizationId, billingCycle);
    toast({ title: t('Payment Processed'), description: t('Subscription has been updated.') });
  }, [processSubscriptionPayment, t, toast]);

  const handleOpenEditDialog = useCallback((org: Organization) => {
    setOrgToEdit(org);
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenPayDialog = useCallback((org: Organization) => {
    setOrgToPayFor(org);
    setIsPayDialogOpen(true);
  }, []);

  const handleSaveSubscription = useCallback(async (orgId: string, data: any) => {
    try {
        await updateOrganization(orgId, data);
        toast({
            title: t('Subscription Updated'),
            description: t('The subscription details have been successfully updated.'),
        });
        setIsEditDialogOpen(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: t('Update Failed'),
            description: t('There was a problem updating the subscription details.'),
        });
    }
  }, [updateOrganization, t, toast]);

  const columns = useMemo(() => {
      if (!organizations || !users || !pricingPlans) return [];
      return getControlPanelColumns(t, organizations, users, pricingPlans, rooms, formatCurrency, isClient, handleOpenPayDialog, updateUserRole, userProfile, handleOpenEditDialog);
  }, [t, organizations, users, isClient, handleOpenPayDialog, updateUserRole, userProfile, handleOpenEditDialog, pricingPlans, formatCurrency, rooms]);
  
  const allUsers = useMemo(() => {
    return users || [];
  }, [users]);

  const stats = useMemo(() => {
    const totalUsers = users?.length || 0;
    const totalStores = organizations?.length || 0;
    const activeSubs = organizations?.filter(o => o.subscriptionStatus === 'paid').length || 0;
    return { totalUsers, totalStores, activeSubs };
  }, [users, organizations]);

  const handleFilterChange = useCallback((id: string, value: string | null) => {
    setColumnFilters(prev => {
        const otherFilters = prev.filter(f => f.id !== id);
        if (value) {
            return [...otherFilters, { id, value }];
        }
        return otherFilters;
    });
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (userProfile?.role !== 'super-admin') {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-20" />
            <h1 className="text-2xl font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Master Control')}</h1>
          <p className="text-muted-foreground">{t('Global platform management and user oversight.')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Platform Users</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStores}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeSubs}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{t('User Oversight')}</CardTitle>
                <CardDescription>{t('A complete list of all users across all properties.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <>
                  <div className="flex items-center gap-4 py-4">
                      <Input
                        placeholder={t('Filter by name...')}
                        value={(columnFilters.find(f => f.id === 'displayName')?.value as string) ?? ""}
                        onChange={(event) =>
                          handleFilterChange('displayName', event.target.value)
                        }
                        className="max-w-sm"
                      />
                      <Select
                          value={(columnFilters.find(f => f.id === 'role')?.value as string) ?? "all"}
                          onValueChange={(value) => handleFilterChange('role', value === 'all' ? null : value)}
                      >
                          <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={t('Filter by role...')} />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">{t('All Roles')}</SelectItem>
                              <SelectItem value="super-admin">{t('super-admin')}</SelectItem>
                              <SelectItem value="admin">{t('admin')}</SelectItem>
                              <SelectItem value="cashier">{t('cashier')}</SelectItem>
                              <SelectItem value="pending">{t('pending')}</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <DataTable 
                      columns={columns} 
                      data={allUsers}
                      columnFilters={columnFilters}
                      onColumnFiltersChange={setColumnFilters}
                  />
              </>
            </CardContent>
        </Card>
      </div>
      <EditStoreDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        organization={orgToEdit}
        onSave={handleSaveSubscription}
      />
      <PaySubscriptionDialog
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        organization={orgToPayFor}
        onConfirm={handleProcessPayment}
       />
    </>
  );
}
