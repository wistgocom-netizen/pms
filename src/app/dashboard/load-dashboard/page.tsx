'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Load, Sale, Product, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataTable } from '../components/data-table';
import { getLoadDashboardColumns } from './columns';
import { Package, Truck, User, DollarSign, ShoppingCart, MapPin, Navigation } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function LoadDashboardPage() {
    const { loads, users, sales, products, userProfile, formatCurrency, t, updateUserLocation } = useStore();
    const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const { toast } = useToast();

    const filteredLoads = useMemo(() => {
        if (!userProfile || !loads) return [];
        if (userProfile.role === 'super-admin' || userProfile.role === 'admin') {
            return loads;
        }
        return loads.filter(load => load.userId === userProfile.uid);
    }, [loads, userProfile]);
    
    const selectedLoad = useMemo(() => {
        if (!selectedLoadId) return null;
        return filteredLoads.find(l => l.id === selectedLoadId) || null;
    }, [selectedLoadId, filteredLoads]);

    const assignedUser = useMemo(() => {
        if (!selectedLoad) return null;
        return users.find(u => u.uid === selectedLoad.userId) || null;
    }, [selectedLoad, users]);

    const cashierSalesStats = useMemo(() => {
        if (!selectedLoad || !sales) {
            return { totalRevenue: 0, totalTransactions: 0, totalItemsSold: 0 };
        }
        
        const cashierSales = sales.filter(sale => sale.userId === selectedLoad.userId && sale.status === 'Completed');
        
        const totalRevenue = cashierSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalTransactions = cashierSales.length;
        const totalItemsSold = cashierSales.reduce((acc, sale) => acc + (sale.items?.reduce((iAcc, i) => iAcc + i.quantity, 0) || 0), 0);
        
        return { totalRevenue, totalTransactions, totalItemsSold };
    }, [selectedLoad, sales]);
    
    const columns = useMemo(() => getLoadDashboardColumns(formatCurrency, t), [formatCurrency, t]);

    const handleToggleTracking = () => {
        if (!isTracking) {
            if (!navigator.geolocation) {
                toast({
                    variant: 'destructive',
                    title: t('Not Supported'),
                    description: t('Geolocation is not supported by your browser.')
                });
                return;
            }

            setIsTracking(true);
            toast({
                title: t('Tracking Started'),
                description: t('Your location is now being shared.')
            });
        } else {
            setIsTracking(false);
            toast({
                title: t('Tracking Stopped'),
                description: t('Location sharing paused.')
            });
        }
    };

    useEffect(() => {
        let watchId: number;
        if (isTracking && userProfile) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    updateUserLocation(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Tracking error:", error);
                    setIsTracking(false);
                },
                { enableHighAccuracy: true }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking, userProfile, updateUserLocation]);

    if (!userProfile || (userProfile.role !== 'super-admin' && !userProfile.cashierPermissions?.loadManagement)) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-headline font-bold">{t('Access Denied')}</h1>
                <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
            </div>
        );
    }

    return (
        <div className="h-full grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>{t('All Loads')}</CardTitle>
                    <CardDescription>{t('Select a load to view its details and sales performance.')}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-1 p-2">
                            {filteredLoads.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map(load => {
                                const user = users.find(u => u.uid === load.userId);
                                return (
                                    <Button
                                        key={load.id}
                                        variant={selectedLoadId === load.id ? 'secondary' : 'ghost'}
                                        className="w-full justify-start h-auto py-3 min-h-[4rem]"
                                        onClick={() => setSelectedLoadId(load.id)}
                                    >
                                        <div className="text-left">
                                            <p className="font-semibold">{user?.displayName || t('Unknown User')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(load.createdAt, 'PPpp')}
                                            </p>
                                        </div>
                                    </Button>
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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{t('Load Details')}</CardTitle>
                                    <CardDescription>
                                        {t('Load ID')}: <span className="font-mono">{selectedLoad.id.slice(0, 8)}</span>
                                    </CardDescription>
                                </div>
                                {userProfile.uid === selectedLoad.userId && (
                                    <Button 
                                        variant={isTracking ? 'destructive' : 'default'}
                                        onClick={handleToggleTracking}
                                        className="gap-2"
                                    >
                                        <Navigation className={isTracking ? 'animate-pulse' : ''} size={16} />
                                        {isTracking ? t('Stop Tracking') : t('Share Location')}
                                    </Button>
                                )}
                            </CardHeader>
                             <CardContent className="grid gap-4 md:grid-cols-3">
                                 <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Truck className="h-4 w-4"/> {t('Vehicle')}</p>
                                    <p className="text-lg font-bold text-center">{users.find(u => u.id === selectedLoad.vehicleId)?.displayName || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><User className="h-4 w-4"/> {t('Cashier')}</p>
                                    <p className="text-lg font-bold capitalize text-center">{assignedUser?.displayName || 'N/A'}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Package className="h-4 w-4"/> {t('Total Items')}</p>
                                    <p className="text-lg font-bold text-center">{selectedLoad.totalItems || 0}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {assignedUser?.lastLocation && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="text-primary" />
                                        {t('Cashier Tracking')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Last seen')}: {formatDistanceToNow(new Date(assignedUser.lastLocation.timestamp), { addSuffix: true })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4">
                                        <div className="w-full aspect-video rounded-md overflow-hidden border shadow-inner bg-muted">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps?q=${assignedUser.lastLocation.lat},${assignedUser.lastLocation.lng}&z=15&output=embed`}
                                            ></iframe>
                                        </div>
                                        <div className="p-4 rounded-lg border bg-muted/30">
                                            <p className="text-sm font-medium">{t('Coordinates')}</p>
                                            <p className="text-lg font-mono">
                                                {assignedUser.lastLocation.lat.toFixed(6)}, {assignedUser.lastLocation.lng.toFixed(6)}
                                            </p>
                                        </div>
                                        <Button asChild className="w-full">
                                            <a 
                                                href={`https://www.google.com/maps/search/?api=1&query=${assignedUser.lastLocation.lat},${assignedUser.lastLocation.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {t('Open in Full Maps')}
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("Cashier's Sales Performance")}</CardTitle>
                                <CardDescription>{t('Total sales data for the assigned cashier.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4"/> {t('Total Revenue')}</p>
                                    <p className="text-2xl font-bold">{formatCurrency(cashierSalesStats.totalRevenue)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><ShoppingCart className="h-4 w-4"/> {t('Total Transactions')}</p>
                                    <p className="text-2xl font-bold">{cashierSalesStats.totalTransactions}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Package className="h-4 w-4"/> {t('Total Items Sold')}</p>
                                    <p className="text-2xl font-bold">{cashierSalesStats.totalItemsSold}</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Load Inventory')}</CardTitle>
                                <CardDescription>{t('Products included in this load.')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable columns={columns} data={selectedLoad.items || []} paginated={false} columnFilters={[]} onColumnFiltersChange={() => {}}/>
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
    );
}
