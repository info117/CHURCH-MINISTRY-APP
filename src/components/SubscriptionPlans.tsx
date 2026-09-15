import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  CalendarCheck, 
  Check, 
  ShieldCheck, 
  Loader2, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';

export interface SubscriptionPlansProps {
  userId?: string;
  className?: string;
  onSuccess?: () => void;
}

export function SubscriptionPlans({ userId, className = '' }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    setLoading(true);
    setActivePlan(planType);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, userId }),
      });

      const data = await response.json();
      if (data.url) {
        // Redirect member to Stripe Checkout hosted page
        window.location.href = data.url;
      } else if (data.error) {
        setErrorMessage(data.error || 'Failed to initiate checkout. Please verify Stripe configuration.');
      } else {
        setErrorMessage('Unable to retrieve Stripe checkout URL. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err?.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
      setActivePlan(null);
    }
  };

  return (
    <div 
      id="subscription-plans-container"
      className={`subscription-container space-y-6 ${className}`}
    >
      {/* Header section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7D3AC1]/10 dark:bg-[#7D3AC1]/30 text-[#7D3AC1] dark:text-[#D4AF37] border border-[#7D3AC1]/20">
            Sanctuary Pro
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Official Ministry Subscription
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif-cinzel font-bold text-slate-900 dark:text-white">
          Ministry App Subscription
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Equip your church pastoral team with AI theological assistance, responsive bulletin generators, congregation directory, and cloud sync.
        </p>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div 
          id="subscription-error-banner"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Checkout Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <div 
          id="monthly-plan-card"
          className="plan-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-[#7D3AC1]/40 transition-all duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-[#0B1F4D]/5 dark:bg-[#0B1F4D]/40 text-[#0B1F4D] dark:text-indigo-300">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Monthly Cadence
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif-cinzel font-bold text-slate-900 dark:text-white">
                Monthly Plan
              </h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$19.99</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Access AI sermon preparation, bible tools & study helpers.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI Theological Exegesis & Companion</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Church Member Roster</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Cancel or pause anytime</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button 
              id="subscribe-monthly-btn"
              disabled={loading} 
              onClick={() => handleSubscribe('monthly')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#0B1F4D] hover:bg-[#16337a] text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98"
            >
              {loading && activePlan === 'monthly' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>
                {loading && activePlan === 'monthly' ? 'Connecting to Stripe...' : 'Subscribe Monthly ($19.99)'}
              </span>
            </button>
          </div>
        </div>

        {/* Yearly Plan */}
        <div 
          id="yearly-plan-card"
          className="plan-card p-6 rounded-2xl bg-gradient-to-b from-white via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 border-2 border-[#7D3AC1]/40 shadow-md flex flex-col justify-between relative overflow-hidden hover:border-[#7D3AC1] transition-all duration-200"
        >
          {/* Most popular badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] px-3.5 py-1 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>Best Value • Save 17%</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-[#7D3AC1]/10 dark:bg-[#7D3AC1]/30 text-[#7D3AC1] dark:text-[#D4AF37]">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#7D3AC1]/10 text-[#7D3AC1] dark:text-[#D4AF37]">
                Annual Stewardship
              </span>
            </div>

            <div>
              <h3 className="text-lg font-serif-cinzel font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Yearly Plan</span>
              </h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$199.99</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ year (~$16.66/mo)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Save on annual ministry subscription plan. Includes 2 months complimentary.
              </p>
            </div>

            <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Everything in Monthly Plan included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>2 Months Free Stewardship Discount</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Official 501(c)(3) Annual Tax Invoices</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button 
              id="subscribe-yearly-btn"
              disabled={loading} 
              onClick={() => handleSubscribe('yearly')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] hover:opacity-95 text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 border border-[#D4AF37]/30"
            >
              {loading && activePlan === 'yearly' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span>
                {loading && activePlan === 'yearly' ? 'Connecting to Stripe...' : 'Subscribe Yearly ($199.99/yr)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Security and tax exempt reassurance */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Encrypted 256-bit SSL transaction via Stripe PCI-DSS Level 1 certified checkout</span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          501(c)(3) Tax-Exempt Receipts Available
        </span>
      </div>
    </div>
  );
}
