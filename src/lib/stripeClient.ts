import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface StripeConfigResponse {
  configured: boolean;
  publishableKey: string;
  hasPublishableKey: boolean;
  hasMonthlyPriceId: boolean;
  hasYearlyPriceId: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
}

let stripePromise: Promise<Stripe | null> | null = null;

export async function getStripePromise(publishableKey?: string): Promise<Stripe | null> {
  const key = publishableKey || (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    return null;
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Fetches Stripe availability and configuration from backend.
 */
export async function getStripeConfig(): Promise<StripeConfigResponse> {
  try {
    const res = await fetch('/api/stripe/config');
    if (!res.ok) {
      throw new Error(`Failed to fetch Stripe config: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      publishableKey: (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '',
      hasPublishableKey: Boolean((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY),
      hasMonthlyPriceId: false,
      hasYearlyPriceId: false,
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      currency: 'USD'
    };
  }
}

export interface InitiateCheckoutParams {
  billingCycle: 'monthly' | 'yearly';
  planType?: 'monthly' | 'yearly';
  userId?: string;
  customerEmail?: string;
  churchName?: string;
  taxExemptId?: string;
}

/**
 * Initiates a Stripe Checkout session by calling the backend and redirecting.
 */
export async function initiateStripeCheckout(params: InitiateCheckoutParams): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const payload = {
      ...params,
      planType: params.planType || params.billingCycle,
    };
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to initialize Stripe checkout session');
    }

    if (data.url) {
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    throw new Error('No checkout URL returned from server.');
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error communicating with Stripe server',
    };
  }
}

/**
 * Opens Stripe Customer Portal for managing active subscriptions and payment methods.
 */
export async function openStripeCustomerPortal(customerId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to open customer portal');
    }

    if (data.url) {
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    throw new Error('No customer portal URL returned');
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Error opening Stripe customer portal',
    };
  }
}
