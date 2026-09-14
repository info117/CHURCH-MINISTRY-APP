import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Download,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Receipt,
  FileText,
  Building,
  CheckCircle2,
  Lock,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  ChurchSubscriptionState,
  BillingCycle,
  SubscriptionTierId,
  SubscriptionPlan,
  BillingInvoice,
  ChurchProfile
} from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import {
  calculatePriceTag,
  createInvoiceRecord,
  saveLocalSubscription,
  syncSubscriptionToFirestore
} from '../../lib/subscriptionService';

interface SubscriptionsBillingViewProps {
  subscription: ChurchSubscriptionState;
  churchProfile: ChurchProfile;
  onUpdateSubscription: (newSub: ChurchSubscriptionState) => void;
  onNavigateToTool?: (toolId: string) => void;
}

export const SubscriptionsBillingView: React.FC<SubscriptionsBillingViewProps> = ({
  subscription,
  churchProfile,
  onUpdateSubscription,
  onNavigateToTool
}) => {
  // Billing cycle toggle state: 'monthly' or 'yearly'
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(subscription.billingCycle);
  const [activeTab, setActiveTab] = useState<'plans' | 'payment' | 'invoices'>('plans');

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [pendingCycle, setPendingCycle] = useState<BillingCycle>(subscription.billingCycle);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardholderName, setCardholderName] = useState(subscription.paymentMethod.cardholderName);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• ' + subscription.paymentMethod.last4);
  const [cardExpiry, setCardExpiry] = useState(
    `${subscription.paymentMethod.expiryMonth}/${subscription.paymentMethod.expiryYear.slice(-2)}`
  );
  const [cardCvc, setCardCvc] = useState('•••');
  const [billingEmail, setBillingEmail] = useState(subscription.billingEmail);
  const [isTaxExempt, setIsTaxExempt] = useState(subscription.isTaxExempt);
  const [taxExemptId, setTaxExemptId] = useState(subscription.churchTaxExemptId || 'EXEMPT-501C3-984321');

  // Invoice viewer modal
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  // Cancel subscription modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Toast / notification feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4500);
  };

  // Helper to trigger plan selection modal
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === subscription.tierId && selectedCycle === subscription.billingCycle) {
      showToast(`You are already subscribed to ${plan.name} (${subscription.priceTag}).`, 'info');
      return;
    }
    setPendingPlan(plan);
    setPendingCycle(selectedCycle);
    setIsPlanModalOpen(true);
  };

  // Confirm plan change / subscription
  const handleConfirmPlanChange = async () => {
    if (!pendingPlan) return;

    const newPriceTag = calculatePriceTag(pendingPlan.id, pendingCycle);
    const now = new Date();
    const periodEnd = new Date(now);
    if (pendingCycle === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Generate a new invoice record
    const newInvoice = createInvoiceRecord(
      pendingPlan.id,
      pendingCycle,
      subscription.paymentMethod.last4
    );

    const updated: ChurchSubscriptionState = {
      ...subscription,
      tierId: pendingPlan.id,
      planName: pendingPlan.name,
      billingCycle: pendingCycle,
      priceTag: newPriceTag,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      status: 'active',
      cancelAtPeriodEnd: false,
      invoices: [newInvoice, ...subscription.invoices]
    };

    onUpdateSubscription(updated);
    saveLocalSubscription(updated);
    await syncSubscriptionToFirestore(updated);

    setIsPlanModalOpen(false);
    setPendingPlan(null);
    showToast(
      `Plan successfully updated to ${pendingPlan.name} at ${newPriceTag}! Renewal date: ${periodEnd.toLocaleDateString()}`
    );
  };

  // Update payment method
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLast4 = cardNumber.replace(/\D/g, '').slice(-4) || subscription.paymentMethod.last4 || '4242';
    const [expM = '12', expY = '28'] = cardExpiry.split('/');

    const updated: ChurchSubscriptionState = {
      ...subscription,
      billingEmail,
      isTaxExempt,
      churchTaxExemptId: taxExemptId,
      paymentMethod: {
        ...subscription.paymentMethod,
        cardholderName,
        last4: cleanLast4,
        expiryMonth: expM.padStart(2, '0'),
        expiryYear: expY.length === 2 ? `20${expY}` : expY,
        isDefault: true
      }
    };

    onUpdateSubscription(updated);
    saveLocalSubscription(updated);
    await syncSubscriptionToFirestore(updated);

    setIsPaymentModalOpen(false);
    showToast('Payment method & church billing credentials updated successfully.');
  };

  // Toggle cancellation at period end
  const handleToggleCancelSubscription = async () => {
    const updated: ChurchSubscriptionState = {
      ...subscription,
      cancelAtPeriodEnd: !subscription.cancelAtPeriodEnd,
      status: subscription.cancelAtPeriodEnd ? 'active' : 'canceled'
    };
    onUpdateSubscription(updated);
    saveLocalSubscription(updated);
    await syncSubscriptionToFirestore(updated);

    setIsCancelModalOpen(false);
    if (updated.cancelAtPeriodEnd) {
      showToast(
        `Subscription will cancel on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}. Access continues until then.`,
        'info'
      );
    } else {
      showToast('Subscription renewal successfully reactivated!');
    }
  };

  return (
    <div id="subscriptions-billing-view" className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          id="billing-feedback-toast"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30'
              : 'bg-slate-900/95 text-slate-100 border-[#7D3AC1]/40'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Top Banner & Overview */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ecclesiastical Ministry Billing</span>
              </span>
              <span className="text-xs text-slate-300">
                {churchProfile.churchName}
              </span>
            </div>

            <h1 className="font-serif-cinzel text-2xl md:text-3xl font-bold tracking-tight">
              Subscriptions & Billing Center
            </h1>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Equip your pastoral staff with unrestricted AI sermon preparation, computer vision sanctuary analytics, and real-time cloud data. Choose between flexible monthly billing or save with annual stewardship.
            </p>
          </div>

          {/* Current Active Plan Status Pill */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold uppercase text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {subscription.status}
              </span>
            </div>

            <div className="text-lg font-bold font-serif-cinzel text-white flex items-center justify-between">
              <span>{subscription.planName}</span>
              <span className="text-sm font-sans text-[#D4AF37] font-bold">
                {subscription.priceTag}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/10">
              <span>Next Renewal:</span>
              <span className="text-slate-200">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          id="billing-tab-plans"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'plans'
              ? 'bg-[#7D3AC1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Plans & Pricing</span>
        </button>

        <button
          id="billing-tab-payment"
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'payment'
              ? 'bg-[#7D3AC1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment & Tax Exemption</span>
        </button>

        <button
          id="billing-tab-invoices"
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'invoices'
              ? 'bg-[#7D3AC1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts ({subscription.invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Choose Your Ministry Cadence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch anytime. Annual subscriptions include 2 months complimentary ministry stewardship.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                id="billing-cycle-monthly-btn"
                onClick={() => setSelectedCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly ($19.99/mo)
              </button>

              <button
                id="billing-cycle-yearly-btn"
                onClick={() => setSelectedCycle('yearly')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedCycle === 'yearly'
                    ? 'bg-[#7D3AC1] text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Yearly ($199.99/yr)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#D4AF37] text-slate-950 uppercase tracking-tight">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent =
                plan.id === subscription.tierId && selectedCycle === subscription.billingCycle;
              const isPopular = plan.isPopular;

              // Price tag based on selected cycle
              const displayPrice =
                selectedCycle === 'monthly' ? plan.monthlyDisplay : plan.yearlyDisplay;
              const subtext =
                plan.priceMonthly === 0
                  ? 'Free forever'
                  : selectedCycle === 'monthly'
                  ? 'Billed monthly ($19.99/Monthly)'
                  : 'Billed annually ($199.99/yearly · save $40/yr)';

              return (
                <div
                  key={plan.id}
                  id={`plan-card-${plan.id}`}
                  className={`flex flex-col justify-between rounded-2xl p-6 transition-all relative ${
                    isPopular
                      ? 'bg-white dark:bg-slate-900 border-2 border-[#7D3AC1] shadow-xl dark:shadow-[#7D3AC1]/10'
                      : 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Popular / Recommended Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-md bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] border border-[#D4AF37]/40">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <h4 className="font-serif-cinzel text-lg font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price Tag Highlight */}
                    <div className="pt-2 pb-3 border-y border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif-cinzel text-3xl font-extrabold text-slate-900 dark:text-white">
                          {displayPrice}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {subtext}
                      </p>
                    </div>

                    {/* Quota & Limits Snapshot */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Members:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {plan.limits.members}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">AI Studio:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {plan.limits.aiGenerations}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Cloud Store:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {plan.limits.cloudStorage}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Campuses:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {plan.limits.campuses}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Included In This Plan:
                      </span>
                      <ul className="space-y-2">
                        {plan.features.map((feat, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}

                        {plan.omittedFeatures?.map((om, idx) => (
                          <li
                            key={`om-${idx}`}
                            className="flex items-start gap-2 text-xs text-slate-400 line-through opacity-60"
                          >
                            <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>{om}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                    {isCurrent ? (
                      <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Current Active Plan ({subscription.priceTag})</span>
                      </div>
                    ) : (
                      <button
                        id={`select-plan-${plan.id}-btn`}
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                          isPopular
                            ? 'bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 border border-[#D4AF37]/30'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                        }`}
                      >
                        <span>
                          {plan.priceMonthly === 0
                            ? 'Downgrade to Starter'
                            : `Select ${plan.name} (${
                                selectedCycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly'
                              })`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ministry Trust & Non-Profit Guarantee */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7D3AC1]/10 dark:bg-[#D4AF37]/15 flex items-center justify-center text-[#7D3AC1] dark:text-[#D4AF37] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif-cinzel font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  501(c)(3) Ministry Assurance & PCI Compliance
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Church tithes and ministry resources are processed via 256-bit AES encryption with zero sales tax on verified tax-exempt organizations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Verify Tax Exemption
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT METHOD & CHURCH BILLING INFO */}
      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Active Payment Method */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Primary Payment Method</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Default
              </span>
            </div>

            {/* Visual Credit Card Preview */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white shadow-lg space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-serif-cinzel font-bold text-xs text-[#D4AF37]">
                  SanctuaryOS Ministry Card
                </span>
                <span className="font-bold text-xs uppercase tracking-widest text-slate-300">
                  {subscription.paymentMethod.brand || 'Visa'}
                </span>
              </div>

              <div className="text-lg font-mono tracking-widest text-slate-100 pt-2">
                •••• •••• •••• {subscription.paymentMethod.last4}
              </div>

              <div className="flex items-end justify-between text-xs pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Cardholder</span>
                  <span className="font-semibold text-slate-200">
                    {subscription.paymentMethod.cardholderName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Expires</span>
                  <span className="font-mono text-slate-200">
                    {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                id="update-payment-method-btn"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] transition-colors"
              >
                Update Payment Details
              </button>

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>256-bit SSL Encrypted</span>
              </span>
            </div>
          </div>

          {/* Card 2: Church Tax Exemption & Billing Contact */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Church Entity & Tax Status</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Ecclesiastical Legal Entity:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {churchProfile.churchName}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Billing Invoicing Email:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {subscription.billingEmail}
                  </span>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="text-[11px] text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">501(c)(3) Tax Exemption Number:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {subscription.churchTaxExemptId || 'EXEMPT-501C3-984321'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Tax Exempt (0% Tax)
                </span>
              </div>
            </div>

            {/* Cancel / Pause Subscription Control */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Recurring Subscription
                </span>
                <span className="text-[11px] text-slate-400">
                  {subscription.cancelAtPeriodEnd
                    ? 'Scheduled to expire at end of cycle'
                    : 'Auto-renews at next cycle'}
                </span>
              </div>

              <button
                id="cancel-subscription-btn"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline"
              >
                {subscription.cancelAtPeriodEnd ? 'Reactivate Renewal' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICES & RECEIPTS */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Ecclesiastical Billing Receipts & Past Invoices
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official financial documentation for church board accounting, audit records, and 501(c)(3) tax files.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Total Paid (Lifetime):{' '}
                  <strong className="text-slate-800 dark:text-white font-mono">
                    $
                    {subscription.invoices
                      .reduce((sum, inv) => sum + inv.amount, 0)
                      .toFixed(2)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subscription.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {inv.date}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {inv.planName}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.formattedAmount}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CHECKOUT & CONFIRM PLAN SELECTION */}
      {isPlanModalOpen && pendingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="plan-checkout-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Confirm Plan Selection
                </span>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                {pendingPlan.name}
              </h3>
              <p className="text-xs text-slate-200">
                {calculatePriceTag(pendingPlan.id, pendingCycle)}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Cadence selection in modal */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Billing Frequency:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPendingCycle('monthly')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      pendingCycle === 'monthly'
                        ? 'bg-[#7D3AC1] text-white border-[#7D3AC1]'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Monthly: $19.99/Monthly
                  </button>

                  <button
                    onClick={() => setPendingCycle('yearly')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      pendingCycle === 'yearly'
                        ? 'bg-[#7D3AC1] text-white border-[#7D3AC1]'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Yearly: $199.99/yearly
                  </button>
                </div>
              </div>

              {/* Order summary breakdown */}
              <div className="space-y-2 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{pendingPlan.name} ({pendingCycle})</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {calculatePriceTag(pendingPlan.id, pendingCycle)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>501(c)(3) Tax Exemption</span>
                  <span className="text-emerald-500 font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Due Today:</span>
                  <span className="font-mono text-[#7D3AC1] dark:text-[#D4AF37]">
                    {pendingCycle === 'monthly' ? '$19.99' : '$199.99'}
                  </span>
                </div>
              </div>

              {/* Payment method summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
                <CreditCard className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37] shrink-0" />
                <span>
                  Will be charged to <strong>{subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}</strong>.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="confirm-plan-change-btn"
                  onClick={handleConfirmPlanChange}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-sm active:scale-95"
                >
                  Confirm & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE PAYMENT METHOD */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="update-payment-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Church Payment Method
                </span>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                Update Billing Credentials
              </h3>
            </div>

            <form onSubmit={handleSavePaymentMethod} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cardholder / Ministry Officer Name
                </label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CVC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  501(c)(3) Tax Exemption Number
                </label>
                <input
                  type="text"
                  value={taxExemptId}
                  onChange={(e) => setTaxExemptId(e.target.value)}
                  placeholder="EXEMPT-501C3-XXXXXX"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-payment-method-submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] shadow-sm active:scale-95"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW OFFICIAL CHURCH INVOICE RECEIPT */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            id="invoice-receipt-modal"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-slate-950 text-white flex items-start justify-between border-b border-slate-800">
              <div>
                <span className="font-serif-cinzel text-xs text-[#D4AF37] font-bold tracking-wider uppercase block">
                  Official Ecclesiastical Receipt
                </span>
                <h3 className="font-serif-cinzel text-lg font-bold text-white mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <span className="text-xs text-slate-400">Date: {selectedInvoice.date}</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Church & Vendor Details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{churchProfile.churchName}</p>
                  <p className="text-slate-500">{subscription.billingEmail}</p>
                  <p className="text-slate-500 text-[11px]">501(c)(3) ID: {subscription.churchTaxExemptId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Provider:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">SanctuaryOS Church Platform</p>
                  <p className="text-slate-500">Google Cloud Enterprise Infrastructure</p>
                  <p className="text-slate-500">support@sanctuaryos.org</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Items:</span>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 text-slate-700 dark:text-slate-300">{item.description}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Church Tax Exemption:</span>
                  <span className="text-emerald-500 font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Paid:</span>
                  <span className="font-mono text-[#7D3AC1] dark:text-[#D4AF37]">
                    {selectedInvoice.formattedAmount}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Payment Method:</span>
                  <span>{selectedInvoice.paymentMethodSummary}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-2">
                Thank you for your ministry partnership and dedication to the Kingdom of God.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>

              <button
                id="print-receipt-btn"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white hover:opacity-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CANCEL CONFIRMATION */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="cancel-sub-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-cinzel text-lg font-bold text-slate-900 dark:text-white">
                {subscription.cancelAtPeriodEnd
                  ? 'Reactivate Church Subscription?'
                  : 'Pause or Cancel Church Subscription?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {subscription.cancelAtPeriodEnd
                  ? 'Reactivating will maintain uninterrupted access to AI sermon generation, Firestore cloud sync, and sanctuary vision analytics.'
                  : `Canceling means your active subscription will end on ${new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}. Your data will remain safely archived.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Go Back
              </button>

              <button
                id="confirm-cancel-subscription-btn"
                onClick={handleToggleCancelSubscription}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 ${
                  subscription.cancelAtPeriodEnd
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {subscription.cancelAtPeriodEnd ? 'Confirm Reactivation' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
