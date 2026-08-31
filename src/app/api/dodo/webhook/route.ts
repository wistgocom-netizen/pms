import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-dodo-signature') || '';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(payload);
    } catch {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const eventType = event.type || event.event_type || '';

    if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
      const session = event.data || event;
      const metadata = session.metadata || {};
      const orgId = metadata.organization_id;

      if (orgId) {
        const { data: org } = await supabaseAdmin
          .from('organizations')
          .select('subscription_end_date, billing_cycle')
          .eq('id', orgId)
          .single();

        const effectiveCycle = metadata.billing_cycle || org?.billing_cycle || 'monthly';
        const durationDays = effectiveCycle === 'yearly' ? 365 : 30;

        const currentEnd = org?.subscription_end_date
          ? new Date(org.subscription_end_date)
          : new Date();
        const baseDate = currentEnd > new Date() ? currentEnd : new Date();
        const newEnd = new Date(baseDate.getTime() + durationDays * 86400000);

        const subscriptionId = session.subscription_id || session.subscription?.id || null;

        const updateData: Record<string, any> = {
          subscription_status: 'paid',
          subscription_end_date: newEnd.toISOString(),
          last_payment_date: new Date().toISOString(),
          billing_cycle: effectiveCycle,
        };

        if (subscriptionId) {
          updateData.dodo_subscription_id = subscriptionId;
        }

        await supabaseAdmin.from('organizations').update(updateData).eq('id', orgId);
      }
    }

    if (eventType === 'subscription.updated' || eventType === 'subscription.cancelled') {
      const subscription = event.data || event;
      const subStatus = subscription.status;

      const orgMetadata = subscription.metadata || {};
      const orgId = orgMetadata.organization_id;

      if (orgId) {
        const statusMap: Record<string, string> = {
          active: 'paid',
          past_due: 'pending',
          cancelled: 'unpaid',
          expired: 'unpaid',
          on_hold: 'pending',
        };

        await supabaseAdmin
          .from('organizations')
          .update({
            subscription_status: statusMap[subStatus] || 'pending',
          })
          .eq('id', orgId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Dodo webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
