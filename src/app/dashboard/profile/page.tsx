'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { User, CreditCard, Bed, Fingerprint, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { userProfile, t, isLoading, organization, isLoadingOrganization, rooms, products, pricingPlans } = useStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const daysLeft = useMemo(() => {
    if (!isClient || !organization?.subscriptionEndDate) return null;
    const diffTime = new Date(organization.subscriptionEndDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  }, [isClient, organization]);

  const { activeRoomsCount, roomLimit, activeProductsCount, productLimit } = useMemo(() => {
    if (!userProfile || !rooms || !pricingPlans) {
        return { activeRoomsCount: 0, roomLimit: 0, activeProductsCount: 0, productLimit: 0 };
    }
    if (userProfile.role === 'super-admin') {
        return { activeRoomsCount: rooms.length, roomLimit: Infinity, activeProductsCount: products.length, productLimit: Infinity };
    }
    if (userProfile.role === 'admin' && organization) {
        const planName = organization.subscriptionPlan || 'basic';
        const planDetails = pricingPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
        const limit = planDetails?.rooms ?? 10;
        const pLimit = planDetails?.products ?? 50;
        return { activeRoomsCount: rooms.length, roomLimit: limit, activeProductsCount: products.length, productLimit: pLimit };
    }
    return { activeRoomsCount: 0, roomLimit: 0, activeProductsCount: 0, productLimit: 0 };
  }, [userProfile, rooms, products, organization, pricingPlans]);

  const effectiveLoading = isLoading || isLoadingOrganization;

  if (effectiveLoading) {
    return (
        <div className="space-y-6">
        <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Card>
            <CardHeader className="flex flex-row items-start gap-4">
                <Skeleton className="p-3 rounded-lg h-12 w-12" />
                <div>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="mt-1 h-4 w-52" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return <div>User not found.</div>;
  }

  const userInitial = userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U';
  const storeId = userProfile.organizationId || organization?.id || '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Profile')}</h1>
        <p className="text-muted-foreground">{t('View and manage your profile details.')}</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle>{t('My Profile')}</CardTitle>
                <CardDescription>{t('Your personal information.')}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userProfile.photoURL || ''} alt="User avatar" />
              <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">{userProfile.displayName}</h2>
              <p className="text-muted-foreground">{userProfile.email}</p>
              <Badge variant={userProfile.role === 'super-admin' ? 'destructive' : userProfile.role === 'admin' ? 'default' : 'secondary'}>
                {t(userProfile.role || 'user')}
              </Badge>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('Display Name')}</Label>
              <Input id="displayName" value={userProfile.displayName || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('Email')}</Label>
              <Input id="email" value={userProfile.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('Role')}</Label>
              <Input id="role" value={t(userProfile.role || 'user')} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgId" className="flex items-center gap-2">
                <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
                {t('Property ID')}
              </Label>
              <Input id="orgId" value={storeId} readOnly className="font-mono text-xs bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{t('Subscription Status')}</CardTitle>
            <CardDescription>{t('Manage your current subscription plan and property limits.')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                  <p className="text-sm font-medium text-muted-foreground">{t('Current Plan')}</p>
                  <p className="text-2xl font-bold capitalize">{organization?.subscriptionPlan || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                  <p className="text-sm font-medium text-muted-foreground">{t('Status')}</p>
                  <div className="mt-1">
                    <Badge variant={organization?.subscriptionStatus === 'paid' || organization?.subscriptionStatus === 'trial' ? 'success' : 'destructive'} className="text-base">{t(organization?.subscriptionStatus || 'n/a')}</Badge>
                  </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center">
                  <p className="text-sm font-medium text-muted-foreground">{t('Days Left')}</p>
                  <div className="text-2xl font-bold">
                    {daysLeft === null ? <Skeleton className="h-6 w-12 mx-auto mt-1" /> : <div>{daysLeft} <span className="text-sm font-normal">{t('days')}</span></div>}
                  </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex flex-col justify-center gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1 uppercase"><Bed className="h-3 w-3"/> {t('Rooms')}</p>
                    <p className="text-lg font-bold">
                        {isClient ? `${activeRoomsCount} / ${roomLimit === 999 ? '∞' : roomLimit}` : <Skeleton className="h-4 w-12 mx-auto" />}
                    </p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1 uppercase"><Package className="h-3 w-3"/> {t('Products')}</p>
                    <p className="text-lg font-bold">
                        {isClient ? `${activeProductsCount} / ${productLimit === 999 ? '∞' : productLimit}` : <Skeleton className="h-4 w-12 mx-auto" />}
                    </p>
                  </div>
              </div>
          </div>
          <div className="flex items-center justify-center pt-6 border-t">
            <Button asChild>
              <Link href="/dashboard/subscription">{t('Manage Subscription')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}