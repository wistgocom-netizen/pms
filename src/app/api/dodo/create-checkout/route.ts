import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/dodo-payments';

export async function POST(req: NextRequest) {
  try {
    const { planName, billingCycle, organizationId, customerEmail, customerName } = await req.json();

    if (!customerEmail) {
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO;
    if (!productId) {
      return NextResponse.json({ error: 'Dodo Payments product not configured' }, { status: 500 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${origin}/dashboard/subscription?session_id={CHECKOUT_SESSION_ID}`;

    const result = await createCheckoutSession({
      productId,
      customerEmail,
      customerName,
      metadata: {
        organization_id: organizationId || '',
        plan_name: planName || 'Pro',
        billing_cycle: billingCycle || 'monthly',
      },
      returnUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Dodo create-checkout error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
