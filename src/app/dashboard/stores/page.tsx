'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Briefcase, Building } from 'lucide-react';
import { DataTable } from '../components/data-table';
import { getStoresColumns } from './columns';
import { AddStoreDialog } from './add-store-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Organization } from '@/lib/types';
import { EditStoreDialog } from './edit-store-dialog';

export default function StoresPage() {
    const { t, userProfile, organizations, users, isLoadingOrganizations, createStoreByAdmin, createStoreAndAdmin, organization, updateOrganization, pricingPlans } = useStore();
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isClient, setIsClient] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);
    
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const canAccess = userProfile?.role === 'super-admin' || (userProfile?.role === 'admin' && userProfile?.cashierPermissions?.stores);
    
    const handleOpenEditDialog = useCallback((org: Organization) => {
        setOrgToEdit(org);
        setIsEditDialogOpen(true);
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

    const handleSaveStore = useCallback(async (data: any) => {
        if (userProfile?.role === 'super-admin') {
            const result = await createStoreAndAdmin(data);
             if (result?.success) {
                toast({
                    title: t('Store Created'),
                    description: t('The new store and admin account have been created successfully.'),
                });
                setIsAddDialogOpen(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: t('Error Creating Store'),
                    description: result?.error?.message || t('An unexpected error occurred.'),
                });
            }
        } else if (userProfile?.role === 'admin') {
            const result = await createStoreByAdmin(data);
            if (result?.success) {
                toast({
                    title: t('Store Created'),
                    description: t('The new store has been created successfully.'),
                });
                setIsAddDialogOpen(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: t('Error Creating Store'),
                    description: result?.error?.message || t('An unexpected error occurred.'),
                });
            }
        }
    }, [createStoreByAdmin, createStoreAndAdmin, t, toast, userProfile]);
    
    const columns = useMemo(() => getStoresColumns(t, users, organizations, isClient, userProfile, handleOpenEditDialog), [t, users, organizations, isClient, userProfile, handleOpenEditDialog]);

    const ownedOrganizations = useMemo(() => {
        if (!organizations || !userProfile) return [];
        if (userProfile.role === 'super-admin') {
            return organizations;
        }
        if (userProfile.role === 'admin') {
            return organizations.filter(o => o.ownerUid === userProfile.uid);
        }
        return [];
    }, [organizations, userProfile]);

    const { activeStoresCount, storeLimit } = useMemo(() => {
        if (!userProfile || !organizations || !pricingPlans) {
            return { activeStoresCount: 0, storeLimit: 0 };
        }
        if (userProfile.role === 'super-admin') {
            return { activeStoresCount: organizations.length, storeLimit: Infinity };
        }
        if (userProfile.role === 'admin' && organization) {
            const planName = organization.subscriptionPlan || 'basic';
            const planDetails = pricingPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
            const limit = planDetails?.stores ?? 1;
            return { activeStoresCount: ownedOrganizations.length, storeLimit: limit };
        }
        return { activeStoresCount: 0, storeLimit: 0 };

    }, [userProfile, organizations, organization, ownedOrganizations, pricingPlans]);

    const canCreateMoreStores = useMemo(() => {
        if (userProfile?.role === 'super-admin') return true;
        if (storeLimit === Infinity) return true;
        return activeStoresCount < storeLimit;
    }, [activeStoresCount, storeLimit, userProfile]);

    if (!canAccess) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
                <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
            </div>
        );
    }
    
    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Stores')}</h1>
                    <p className="text-muted-foreground">{t('Manage all stores in the system.')}</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('Active Stores')}</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{isLoadingOrganizations ? <Skeleton className="h-8 w-16" /> : activeStoresCount}</div>
                            <p className="text-xs text-muted-foreground">{t('Number of stores you are managing.')}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('Store Limit')}</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{storeLimit === Infinity ? t('Unlimited') : storeLimit}</div>
                            <p className="text-xs text-muted-foreground">{t('Based on your current subscription plan.')}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{t('All Stores')}</CardTitle>
                            {canCreateMoreStores && (userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && (
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    {t('Create Store')}
                                </Button>
                            )}
                        </div>
                        <CardDescription>{t('List of all registered stores.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoadingOrganizations ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                         ) : (
                            <DataTable
                                columns={columns}
                                data={ownedOrganizations || []}
                                columnFilters={[]}
                                onColumnFiltersChange={() => {}}
                            />
                         )}
                    </CardContent>
                </Card>
            </div>
            <AddStoreDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSave={handleSaveStore}
                userProfile={userProfile}
            />
            <EditStoreDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                organization={orgToEdit}
                onSave={handleSaveSubscription}
            />
        </>
    );
}
