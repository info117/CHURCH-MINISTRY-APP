import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Returns an initialized Stripe client instance lazily.
 * Fails gracefully if STRIPE_SECRET_KEY is not configured in the environment.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not configured. Please configure it in your Settings panel.');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

/**
 * Checks whether Stripe is configured on the backend.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '');
}

export interface CreateCheckoutSessionParams {
  billingCycle: 'monthly' | 'yearly';
  userId?: string;
  customerEmail?: string;
  churchName?: string;
  taxExemptId?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout Session for recurring Church Sanctuary Pro subscription.
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const stripe = getStripe();

  const isMonthly = params.billingCycle === 'monthly';
  const configuredPriceId = isMonthly 
    ? process.env.STRIPE_PRICE_ID_MONTHLY 
    : process.env.STRIPE_PRICE_ID_YEARLY;

  // Amount in cents ($19.99 = 1999, $199.99 = 19999)
  const unitAmount = isMonthly ? 1999 : 19999;
  const interval = isMonthly ? 'month' : 'year';
  const planName = isMonthly 
    ? 'Sanctuary Pro - Monthly ($19.99/mo)' 
    : 'Sanctuary Pro - Annual Stewardship ($199.99/yr)';

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

  // If a valid price ID is provided (e.g. price_...), use it; otherwise provide inline price_data
  if (configuredPriceId && configuredPriceId.startsWith('price_')) {
    lineItems = [
      {
        price: configuredPriceId,
        quantity: 1,
      },
    ];
  } else {
    lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: planName,
            description: `Church Ministry App Sanctuary Pro with unlimited AI, sermons, worship planner & team management. (Tax Exempt 501(c)(3) Eligible)`,
            metadata: {
              planType: 'sanctuary_pro',
              billingCycle: params.billingCycle,
              churchName: params.churchName || 'Church Ministry',
            },
          },
          unit_amount: unitAmount,
          recurring: {
            interval: interval,
          },
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: params.customerEmail,
    client_reference_id: params.userId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      billingCycle: params.billingCycle,
      churchName: params.churchName || '',
      taxExemptId: params.taxExemptId || '',
    },
    subscription_data: {
      metadata: {
        billingCycle: params.billingCycle,
        churchName: params.churchName || '',
      },
    },
    allow_promotion_codes: true,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Creates a Stripe Customer Portal session for managing payments and subscriptions.
 */
export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: portalSession.url,
  };
}

/**
 * Validates Stripe Webhook event signatures.
 */
export function constructWebhookEvent(payload: Buffer | string, signature: string, secret: string) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
