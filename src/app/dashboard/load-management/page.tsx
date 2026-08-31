'use client';

import { useState, useMemo, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Load, LoadItem, Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { File, PlusCircle, Package, DollarSign, Truck, Trash2 } from 'lucide-react';
import { DataTable } from '../components/data-table';
import { getLoadColumns } from './load-columns';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleManager } from './vehicle-manager';
import { AddLoadDialog } from './add-load-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LoadManagementPage() {
    const { loads, addLoad, updateLoad, deleteLoad, formatCurrency, products, t, userProfile, users, vehicles } = useStore();
    const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
    const [isAddLoadOpen, setIsAddLoadOpen] = useState(false);
    const { toast } = useToast();
    const [productSearch, setProductSearch] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loadToDelete, setLoadToDelete] = useState<Load | null>(null);

    const canAccess = userProfile?.role === 'super-admin' || userProfile?.cashierPermissions?.loadManagement;

    const selectedLoad = useMemo(() => {
        if (!selectedLoadId) return null;
        return loads.find(l => l.id === selectedLoadId) || null;
    }, [selectedLoadId, loads]);

    const handleSaveLoad = async (data: Omit<Load, 'id' | 'createdAt' | 'status' | 'items' | 'totalValue'>) => {
        const newLoadData = {
            ...data,
            createdAt: new Date(),
            status: 'planning' as const,
            items: [],
            totalValue: 0,
        };
        const newLoad = await addLoad(newLoadData);
        toast({ title: t('Load Created'), description: t('New load has been created successfully.') });
        setSelectedLoadId(newLoad.id);
        setIsAddLoadOpen(false);
    };

    const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
        if (!selectedLoad) return;

        const updatedItems = selectedLoad.items
            .map(item => item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item)
            .filter(item => item.quantity > 0);
            
        const totalValue = updatedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);

        updateLoad(selectedLoad.id, { items: updatedItems, totalValue, totalItems });
    }, [selectedLoad, updateLoad]);

    const handleRemoveItem = useCallback((productId: string) => {
        if (!selectedLoad) return;
        handleUpdateQuantity(productId, 0);
    }, [selectedLoad, handleUpdateQuantity]);

    const availableProducts = useMemo(() => {
        if (!productSearch || !selectedLoad) return [];
        const lowerCaseSearch = productSearch.toLowerCase();
        const existingProductIds = new Set(selectedLoad.items.map(i => i.productId));
        return products.filter(
            p => (p.name.toLowerCase().includes(lowerCaseSearch) || p.id.toLowerCase().includes(lowerCaseSearch)) && !existingProductIds.has(p.id)
        );
    }, [productSearch, products, selectedLoad]);

    const handleAddItem = (product: Product) => {
        if (!selectedLoad) return;

        const newItem: LoadItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.buyingPrice || product.price,
            emoji: product.emoji,
            rackLocation: product.rackLocation
        };

        const updatedItems = [...selectedLoad.items, newItem];
        const totalValue = updatedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const totalItems = updatedItems.reduce((acc, item) => acc + item.quantity, 0);

        updateLoad(selectedLoad.id, { items: updatedItems, totalValue, totalItems });
        setProductSearch('');
    };

    const handleOpenDeleteDialog = useCallback((load: Load) => {
        setLoadToDelete(load);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleDeleteLoad = useCallback(async () => {
        if (!loadToDelete) return;
        await deleteLoad(loadToDelete.id);
        toast({
            title: t('Load Deleted'),
            description: t('The load has been successfully deleted.'),
        });
        setIsDeleteDialogOpen(false);
        if (selectedLoadId === loadToDelete.id) {
            setSelectedLoadId(null);
        }
        setLoadToDelete(null);
    }, [loadToDelete, deleteLoad, toast, t, selectedLoadId]);

    const columns = useMemo(() => getLoadColumns(formatCurrency, handleUpdateQuantity, handleRemoveItem, t), [formatCurrency, handleUpdateQuantity, handleRemoveItem, t]);

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
                    <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Load Management')}</h1>
                    <p className="text-muted-foreground">{t('Manage product loads for your vehicles.')}</p>
                </div>

                <Tabs defaultValue="planning">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="planning">{t('Load Planning')}</TabsTrigger>
                        <TabsTrigger value="vehicles">{t('Manage Vehicles')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="planning">
                        <div className="h-full grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <div className='flex justify-between items-center'>
                                        <CardTitle>{t('Loads')}</CardTitle>
                                        <Button onClick={() => setIsAddLoadOpen(true)} size="icon">
                                            <PlusCircle className="h-4 w-4" />
                                            <span className="sr-only">{t('Create Load')}</span>
                                        </Button>
                                    </div>
                                    <CardDescription>{t('Select a load to view details.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow p-0">
                                    <ScrollArea className="h-full">
                                        <div className="space-y-1 p-2">
                                            {(loads || []).map(load => {
                                                const vehicle = vehicles.find(v => v.id === load.vehicleId);
                                                return (
                                                    <div key={load.id} className="flex items-center gap-1 group/item">
                                                        <Button
                                                            variant={selectedLoadId === load.id ? 'secondary' : 'ghost'}
                                                            className="w-full justify-start h-auto py-3 min-h-[4rem] flex-grow"
                                                            onClick={() => setSelectedLoadId(load.id)}
                                                        >
                                                            <div className="text-left">
                                                                <p className="font-semibold">{vehicle?.name || t('Unknown Vehicle')}</p>
                                                                <p className="text-xs text-muted-foreground font-mono">{load.id.slice(0, 8)}</p>
                                                            </div>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={() => handleOpenDeleteDialog(load)}>
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">{t('Delete Load')}</span>
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {selectedLoad ? (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{t('Load Details')}</CardTitle>
                                                <CardDescription>
                                                    {t('Vehicle')}: {vehicles.find(v => v.id === selectedLoad.vehicleId)?.name || 'N/A'} | {t('User')}: {users.find(u => u.id === selectedLoad.userId)?.displayName || 'N/A'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid gap-4 md:grid-cols-3">
                                                 <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Truck className="h-4 w-4"/> {t('Status')}</p>
                                                    <p className="text-xl font-bold capitalize text-center">{selectedLoad.status}</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Package className="h-4 w-4"/> {t('Total Items')}</p>
                                                    <p className="text-xl font-bold text-center">{selectedLoad.totalItems || 0}</p>
                                                </div>
                                                <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><DollarSign className="h-4 w-4"/> {t('Total Value')}</p>
                                                    <p className="text-xl font-bold text-center">{formatCurrency(selectedLoad.totalValue)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>{t('Load Items')}</CardTitle>
                                                <CardDescription>{t('Products included in this load.')}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 mb-4">
                                                    <Label htmlFor="product-search" className="text-xs">{t('Add Product')}</Label>
                                                    <Input id="product-search" placeholder={t("Search by name or barcode...")} value={productSearch} onChange={e => setProductSearch(e.target.value)} className="h-9" />
                                                    {productSearch && (
                                                        <div className="relative">
                                                            <Card className="absolute top-full mt-1 w-full z-10 max-h-60 overflow-y-auto">
                                                                <CardContent className="p-1">
                                                                    {availableProducts.length > 0 ? (
                                                                        availableProducts.map(p => (
                                                                            <Button key={p.id} variant="ghost" className="w-full justify-start h-auto" onClick={() => handleAddItem(p)}>
                                                                                <span className="text-2xl mr-4">{p.emoji}</span>
                                                                                <div>
                                                                                    <p className="font-semibold text-sm">{p.name}</p>
                                                                                    <p className="text-xs text-muted-foreground text-left">{formatCurrency(p.buyingPrice || p.price)}</p>
                                                                                </div>
                                                                            </Button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-2 text-sm text-muted-foreground text-center">{t('No products found')}</div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </div>
                                                <DataTable columns={columns} data={selectedLoad.items || []} columnFilters={[]} onColumnFiltersChange={() => {}} paginated={false} />
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center border-2 border-dashed rounded-lg">
                                        <div>
                                            <p className="text-lg font-semibold">{t('No Load Selected')}</p>
                                            <p className="text-muted-foreground">{t('Please select a load from the list to see its details.')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="vehicles">
                       <VehicleManager />
                    </TabsContent>
                </Tabs>
            </div>
            <AddLoadDialog 
                open={isAddLoadOpen}
                onOpenChange={setIsAddLoadOpen}
                onSave={handleSaveLoad}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('This action cannot be undone. This will permanently delete the load with ID "{loadId}".', { loadId: loadToDelete?.id.slice(0, 8) })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setLoadToDelete(null)}>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteLoad} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
