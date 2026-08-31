'use client';

import { useState, useEffect } from 'react';
import type { PricingPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const defaultPlans: PricingPlan[] = [
    {
        id: '2',
        name: 'Pro',
        description: 'Great for growing businesses that need advanced reporting and customer management.',
        priceMonthly: 1950,
        priceYearly: 21060,
        yearlyDiscount: 10,
        durationDays: 7,
        features: [
            'Core POS & Checkout',
            'Product & Inventory Management',
            'Suppliers Management',
            'Customer & Debt Tracking',
            'Advanced Sales Reporting',
            'User Roles & Permissions',
            'Priority Support',
            '1 Admin & 3 Cashier Accounts',
            'Multi-Store Management (1 Store)',
        ],
        isPopular: true,
        rooms: 999,
        products: 999,
        stores: 1,
        cashiers: 3,
    },
];

function PlanCard({ plan, currency }: { plan: PricingPlan; currency: string }) {
  const price = plan.priceMonthly;
  const period = '/month';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <Card className={cn("flex flex-col", plan.isPopular ? "border-primary shadow-lg" : "")}>
      {plan.isPopular && (
        <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1 rounded-t-lg">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">
            {formatCurrency(price)}
          </span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/signup">Get Started</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const [isLoadingPricingPlans, setIsLoadingPricingPlans] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoadingPricingPlans(false), 500);
  }, []);

  const pricingPlans = defaultPlans;

  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-headline">
            Find the perfect plan for your business
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Start for free and scale as you grow. All plans include our core features.
          </p>
        </div>

        {isLoadingPricingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-sm mx-auto">
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-sm mx-auto">
            {pricingPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} currency="LKR" />
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
