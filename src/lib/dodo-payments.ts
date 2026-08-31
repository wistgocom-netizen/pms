import DodoPayments from 'dodopayments';

const apiKey = process.env.DODO_PAYMENTS_API_KEY || '';
const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode') as 'test_mode' | 'live_mode';

export const dodoClient = new DodoPayments({
  bearerToken: apiKey,
  environment,
});

export async function createCheckoutSession(params: {
  productId: string;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, string>;
  returnUrl: string;
}) {
  const { productId, customerEmail, customerName, metadata, returnUrl } = params;

  const session = await dodoClient.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: {
      email: customerEmail,
      name: customerName,
    },
    return_url: returnUrl,
    metadata,
  });

  return {
    checkoutUrl: session.checkout_url,
    sessionId: session.session_id,
  };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) return false;

  const crypto = require('crypto');
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    const parsed = JSON.parse(payload);
    const receivedSig = parsed.signature || signature;
    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(receivedSig));
  } catch {
    return expectedSig === signature;
  }
}
