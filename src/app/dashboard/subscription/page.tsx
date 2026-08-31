
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CreditCard, Bed, CheckCircle2, Package, Loader2, CalendarClock, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


export default function SubscriptionPage() {
  const { 
    t, 
    pricingPlans, 
    isLoadingPricingPlans, 
    userProfile, 
    formatCurrency, 
    isLoading, 
    organization, 
    rooms,
    processSubscriptionPayment,
  } = useStore();
  
  const [isClient, setIsClient] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && organization?.id) {
      toast({
        title: 'Payment Successful',
        description: 'Your subscription has been updated.',
      });
      processSubscriptionPayment(organization.id);
      const url = new URL(window.location.href);
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  const handleSelectPlan = useCallback(async () => {
    if (!userProfile?.email) {
      toast({
        title: 'Account Required',
        description: 'Please sign in to purchase a subscription.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingCheckout(true);
    try {
      const res = await fetch('/api/dodo/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: 'Pro',
          billingCycle: organization?.billingCycle || 'monthly',
          organizationId: organization?.id || userProfile.organizationId,
          customerEmail: userProfile.email,
          customerName: userProfile.displayName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');

      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  }, [userProfile, organization, toast]);

  const daysLeft = useMemo(() => {
    if (!isClient || !organization?.subscriptionEndDate) return null;
    const diffTime = new Date(organization.subscriptionEndDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  }, [isClient, organization]);

  const expireDate = useMemo(() => {
    if (!organization?.subscriptionEndDate) return null;
    return new Date(organization.subscriptionEndDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }, [organization]);

  const currentPlanDetails = useMemo(() => {
    if (!organization?.subscriptionPlan) return null;
    return pricingPlans.find(p => p.name.toLowerCase() === organization.subscriptionPlan!.toLowerCase());
  }, [organization, pricingPlans]);

  const proPlan = useMemo(() => {
    const plan = pricingPlans.find(p => p.name.toLowerCase() === 'pro');
    if (!plan) return null;
    return { ...plan, priceMonthly: 1950, priceYearly: 21060 };
  }, [pricingPlans]);

  const { activeRooms, roomLimit } = useMemo(() => {
    if (!userProfile || !rooms || !pricingPlans) return { activeRooms: 0, roomLimit: 0 };
    if (userProfile.role === 'super-admin') return { activeRooms: rooms.length, roomLimit: Infinity };
    
    const planName = organization?.subscriptionPlan || 'Pro';
    const planDetails = pricingPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    const limit = planDetails?.rooms ?? 5;
    return { activeRooms: rooms.length, roomLimit: limit };
  }, [userProfile, rooms, organization, pricingPlans]);

  const isSuperAdmin = userProfile?.role === 'super-admin';

  if (isLoading || isLoadingPricingPlans) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('Subscription Plans')}</h1>
                <p className="text-muted-foreground">{t('Manage and view available subscription plans.')}</p>
            </div>
        </div>

        {organization && (
           <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t('Current Plan')}
                  {organization.subscriptionStatus === 'paid' ? (
                    <Badge variant="success" className="uppercase text-[10px]">{t('Active')}</Badge>
                  ) : (
                    <Badge variant="destructive" className="uppercase text-[10px]">{t(organization.subscriptionStatus || 'unpaid')}</Badge>
                  )}
                </CardTitle>
                <CardDescription>{t('Your current subscription plan and usage.')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-background border flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t('Plan')}</p>
                      <p className="text-xl font-black text-primary uppercase">{organization?.subscriptionPlan || 'Basic'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background border flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t('Billing')}</p>
                      <p className="text-xl font-black capitalize">{organization?.billingCycle || 'Monthly'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background border flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t('Expire Date')}</p>
                      <p className="text-xl font-black">{expireDate || '-'}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background border flex flex-col justify-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{t('Days Left')}</p>
                      <p className="text-xl font-black">{daysLeft ?? '-'}</p>
                  </div>
              </div>
              {currentPlanDetails && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 py-2 px-3 bg-background border rounded-lg">
                    <Bed className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{t('Rooms')}: <strong>{currentPlanDetails.rooms >= 999 ? 'Unlimited' : currentPlanDetails.rooms}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 bg-background border rounded-lg">
                    <Package className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{t('Products')}: <strong>{currentPlanDetails.products >= 999 ? 'Unlimited' : currentPlanDetails.products}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 bg-background border rounded-lg">
                    <span className="text-sm">{t('Used Rooms')}: <strong>{activeRooms}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 bg-background border rounded-lg">
                    <CalendarClock className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{t('Expires')}: <strong>{expireDate || '-'}</strong></span>
                  </div>
                </div>
              )}
            </CardContent>
            {organization?.subscriptionStatus !== 'paid' && (
                <CardFooter className="pt-6 border-t bg-destructive/5 rounded-b-lg">
                    <div className="flex justify-between items-center w-full">
                        <p className="text-sm text-destructive font-medium">{t('Your subscription has expired or is pending payment.')}</p>
                        <Button variant="outline" onClick={handleSelectPlan} disabled={isCreatingCheckout}>
                          {isCreatingCheckout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {t('Renew Now')}
                        </Button>
                    </div>
                </CardFooter>
            )}
            {organization?.subscriptionStatus === 'paid' && (
                <CardFooter className="pt-6 border-t bg-green-50/50 dark:bg-green-950/20 rounded-b-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4 text-green-600" />
                        <span>{t('Your {plan} plan is active until {date}.', { plan: organization.subscriptionPlan || 'Basic', date: expireDate || '...' })}</span>
                    </div>
                </CardFooter>
            )}
          </Card>
        )}
        
        {proPlan && (
            <div className="grid md:grid-cols-1 gap-6 max-w-md mx-auto">
                <Card key={proPlan.id} className="relative flex flex-col border-primary shadow-lg ring-1 ring-primary">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">{t('POPULAR')}</div>
                    <CardHeader>
                        <CardTitle>{proPlan.name}</CardTitle>
                        <CardDescription>{proPlan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black">{formatCurrency(proPlan.priceMonthly)}</span>
                            <span className="text-xs text-muted-foreground">/{t('mo')}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
                                <Bed className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold">{proPlan.rooms === 999 ? 'Unlimited' : proPlan.rooms} {t('Rooms Allowed')}</span>
                            </div>
                            <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold">{proPlan.products === 999 ? 'Unlimited' : proPlan.products} {t('Products Allowed')}</span>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {proPlan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="pt-6 border-t">
                        <Button className="w-full" variant="default" onClick={handleSelectPlan} disabled={isCreatingCheckout}>
                          {isCreatingCheckout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          {t('Select Plan')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )}
      </div>
    </>
  );
}
