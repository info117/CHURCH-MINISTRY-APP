import React, { useState, useEffect } from 'react';
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
  Info,
  UserPlus,
  LogIn,
  LogOut,
  KeyRound,
  UserCheck,
  User,
  Zap,
  Calculator
} from 'lucide-react';
import { StepReview } from '../StepReview';
import {
  ChurchSubscriptionState,
  BillingCycle,
  SubscriptionTierId,
  SubscriptionPlan,
  BillingInvoice,
  ChurchProfile,
  UserAccount
} from '../../types';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import {
  calculatePriceTag,
  createInvoiceRecord,
  saveLocalSubscription,
  syncSubscriptionToFirestore
} from '../../lib/subscriptionService';
import {
  signUpSubscriber,
  signInSubscriber,
  signOutSubscriber,
  changeSubscriberPassword,
  calculateTrialDaysRemaining,
  isTrialExpired,
  payForSubscription,
  simulateExpiredTrialState,
  getSavedSubscriber
} from '../../lib/subscriberAuth';
import {
  getStripeConfig,
  initiateStripeCheckout,
  openStripeCustomerPortal,
  StripeConfigResponse
} from '../../lib/stripeClient';
import { SubscriptionPlans } from '../SubscriptionPlans';

interface SubscriptionsBillingViewProps {
  subscription: ChurchSubscriptionState;
  churchProfile: ChurchProfile;
  onUpdateSubscription: (newSub: ChurchSubscriptionState) => void;
  onNavigateToTool?: (toolId: string) => void;
  currentUser?: UserAccount | null;
  onUserChange?: (user: UserAccount | null) => void;
}

export const SubscriptionsBillingView: React.FC<SubscriptionsBillingViewProps> = ({
  subscription,
  churchProfile,
  onUpdateSubscription,
  onNavigateToTool,
  currentUser,
  onUserChange
}) => {
  // Billing cycle toggle state: 'monthly' or 'yearly'
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(subscription.billingCycle);
  const [activeTab, setActiveTab] = useState<'plans' | 'payment' | 'invoices' | 'tax-review'>('plans');

  // Subscriber User State (synced from prop or localStorage)
  const [subscriber, setSubscriber] = useState<UserAccount | null>(() => {
    return currentUser || getSavedSubscriber();
  });

  // Stripe State & Configuration
  const [stripeConfig, setStripeConfig] = useState<StripeConfigResponse | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSubscriber(currentUser);
    }
  }, [currentUser]);

  // Load Stripe configuration and handle return redirects from Stripe Checkout
  useEffect(() => {
    getStripeConfig().then((cfg) => {
      setStripeConfig(cfg);
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const checkoutStatus = params.get('checkout');
      const cycleParam = params.get('cycle') as BillingCycle | null;

      if (checkoutStatus === 'success') {
        const chosenCycle: BillingCycle = cycleParam === 'yearly' ? 'yearly' : 'monthly';
        payForSubscription(subscription, chosenCycle, '4242').then((updatedSub) => {
          onUpdateSubscription(updatedSub);
          showToast(
            `Stripe Checkout verified! Sanctuary Pro ${chosenCycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly'} is now active. Receipt generated.`,
            'success'
          );
          window.history.replaceState({}, '', window.location.pathname);
        });
      } else if (checkoutStatus === 'cancel') {
        showToast('Stripe checkout was not completed. You can resume at any time.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Auth Modals
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  // Direct / Post-Trial Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCycle, setPaymentCycle] = useState<BillingCycle>(subscription.billingCycle);
  const [cardholderName, setCardholderName] = useState(
    subscription.paymentMethod.cardholderName || subscriber?.displayName || 'Rev. Dr. David Emmanuel'
  );
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• ' + subscription.paymentMethod.last4);
  const [cardExpiry, setCardExpiry] = useState(
    `${subscription.paymentMethod.expiryMonth}/${subscription.paymentMethod.expiryYear.slice(-2)}`
  );
  const [cardCvc, setCardCvc] = useState('•••');
  const [billingEmail, setBillingEmail] = useState(
    subscription.billingEmail || subscriber?.email || 'pastor@church.org'
  );
  const [isTaxExempt, setIsTaxExempt] = useState(subscription.isTaxExempt);
  const [taxExemptId, setTaxExemptId] = useState(subscription.churchTaxExemptId || 'EXEMPT-501C3-984321');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Invoice viewer modal
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  // Cancel subscription modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Toast / notification feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Trial state calculations
  const isTrial = Boolean(subscription.isTrial || subscription.status === 'trialing' || subscription.status === 'trial_expired');
  const trialDaysRemaining = calculateTrialDaysRemaining(subscription.trialEndDate);
  const isExpired = subscription.status === 'trial_expired' || (isTrial && trialDaysRemaining <= 0);

  // Handle Subscriber Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please verify.');
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }

    setSignUpLoading(true);
    try {
      const result = await signUpSubscriber(signUpName, signUpEmail, signUpPassword);
      setSubscriber(result.user);
      if (onUserChange) onUserChange(result.user);
      onUpdateSubscription(result.subscription);
      setBillingEmail(result.user.email || signUpEmail);
      setCardholderName(result.user.displayName || signUpName);

      setIsSignUpModalOpen(false);
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpConfirmPassword('');
      showToast(`Welcome ${result.user.displayName}! Your 7-Day Free Sanctuary Pro Trial is now active.`, 'success');
    } catch (err: any) {
      setSignUpError(err.message || 'Failed to complete sign up. Please try again.');
    } finally {
      setSignUpLoading(false);
    }
  };

  // Handle Subscriber Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setSignInLoading(true);

    try {
      const result = await signInSubscriber(signInEmail, signInPassword);
      setSubscriber(result.user);
      if (onUserChange) onUserChange(result.user);
      onUpdateSubscription(result.subscription);
      setBillingEmail(result.user.email || signInEmail);
      if (result.user.displayName) setCardholderName(result.user.displayName);

      setIsSignInModalOpen(false);
      setSignInEmail('');
      setSignInPassword('');
      showToast(`Signed in successfully as ${result.user.displayName || result.user.email}.`, 'success');
    } catch (err: any) {
      setSignInError(err.message || 'Sign in failed. Please verify your email and password.');
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    const emailToUse = changePasswordEmail.trim() || subscriber?.email || '';
    if (!emailToUse) {
      setChangePasswordError('Please enter your account email address.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setChangePasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setChangePasswordError('Passwords do not match.');
      return;
    }

    setChangePasswordLoading(true);
    try {
      await changeSubscriberPassword(emailToUse, newPasswordInput, currentPasswordInput);
      setChangePasswordSuccess('Password updated successfully! You can now use your new password.');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
      showToast('Subscriber password has been changed successfully.', 'success');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setChangePasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setChangePasswordError(err.message || 'Failed to change password. Please verify account details.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Handle Subscriber Sign Out
  const handleSignOut = async () => {
    try {
      await signOutSubscriber();
      setSubscriber(null);
      if (onUserChange) onUserChange(null);
      showToast('You have been signed out from your ministry subscriber account.', 'info');
    } catch (err: any) {
      showToast('Error during sign out.', 'error');
    }
  };

  // Open Payment Modal for either Monthly or Yearly
  const handleOpenPaymentModal = (cycle: BillingCycle) => {
    setPaymentCycle(cycle);
    setIsPaymentModalOpen(true);
  };

  // Handle Pay and Activate Subscription (either Monthly or Yearly)
  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const cleanLast4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      const updatedSub = await payForSubscription(
        {
          ...subscription,
          billingEmail,
          isTaxExempt,
          churchTaxExemptId: taxExemptId,
          paymentMethod: {
            ...subscription.paymentMethod,
            cardholderName,
            last4: cleanLast4,
            expiryMonth: cardExpiry.split('/')[0] || '12',
            expiryYear: cardExpiry.split('/')[1] ? `20${cardExpiry.split('/')[1]}` : '2028'
          }
        },
        paymentCycle,
        cleanLast4
      );

      onUpdateSubscription(updatedSub);
      setIsPaymentModalOpen(false);
      showToast(
        `Payment successful! Sanctuary Pro ${paymentCycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly'} is now active. Receipt generated.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Payment processing error. Please retry.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle Stripe Hosted Checkout
  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    try {
      const res = await initiateStripeCheckout({
        billingCycle: paymentCycle,
        planType: paymentCycle,
        userId: subscriber?.uid || 'usr-church-leader',
        customerEmail: billingEmail || subscriber?.email,
        churchName: churchProfile.name,
        taxExemptId: isTaxExempt ? taxExemptId : undefined
      });

      if (!res.success) {
        showToast(res.error || 'Unable to initiate Stripe checkout. You can also complete payment directly below.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Stripe checkout error.', 'error');
    } finally {
      setIsStripeLoading(false);
    }
  };

  // Handle Stripe Customer Portal
  const handleOpenCustomerPortal = async () => {
    setIsStripeLoading(true);
    try {
      const customerId = 'cus_church_subscriber';
      const res = await openStripeCustomerPortal(customerId);
      if (!res.success) {
        showToast(res.error || 'Stripe Customer Portal will open once your first Stripe subscription invoice is active.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Customer portal unavailable', 'error');
    } finally {
      setIsStripeLoading(false);
    }
  };

  // Test simulation helper: Fast-forward to expired trial
  const handleSimulateTrialExpired = () => {
    const expiredSub = simulateExpiredTrialState(subscription);
    onUpdateSubscription(expiredSub);
    showToast('Simulation: 7-Day Free Trial marked as Expired. You can now test paying for Monthly or Yearly.', 'info');
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

  const proPlan = SUBSCRIPTION_PLANS[0];

  return (
    <div id="subscriptions-billing-view" className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div
          id="billing-feedback-toast"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/30'
              : feedbackToast.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-500/30'
              : 'bg-slate-900/95 text-slate-100 border-[#7D3AC1]/40'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : feedbackToast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
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
              <span className={`inline-flex items-center gap-1 font-semibold uppercase text-[11px] ${
                isExpired ? 'text-rose-400' : isTrial ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  isExpired ? 'bg-rose-400' : isTrial ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                {isExpired ? 'Trial Expired' : isTrial ? '7-Day Free Trial' : subscription.status}
              </span>
            </div>

            <div className="text-lg font-bold font-serif-cinzel text-white flex items-center justify-between">
              <span>Sanctuary Pro</span>
              <span className="text-sm font-sans text-[#D4AF37] font-bold">
                {isExpired ? 'Action Required' : isTrial ? 'Free Trial' : subscription.priceTag}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/10">
              <span>{isTrial ? 'Trial Ends:' : 'Next Renewal:'}</span>
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

      {/* SUBSCRIBER ACCOUNT BAR: Sign Up, Sign In, Sign Out, and Change Password */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {subscriber ? (
          /* Signed In State */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B1F4D] to-[#7D3AC1] text-[#D4AF37] font-serif-cinzel font-bold text-lg flex items-center justify-center border border-[#D4AF37]/30 shadow-sm shrink-0">
                {subscriber.displayName ? subscriber.displayName.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {subscriber.displayName || 'Authorized Ministry Leader'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7D3AC1]/10 dark:bg-[#7D3AC1]/30 text-[#7D3AC1] dark:text-[#D4AF37] border border-[#7D3AC1]/20">
                    Subscriber
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {subscriber.email}
                </p>
              </div>
            </div>

            {/* Subscriber Action Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Change Password Button */}
              <button
                id="subscriber-change-password-btn"
                onClick={() => {
                  setChangePasswordEmail(subscriber.email || '');
                  setIsChangePasswordModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Change Password</span>
              </button>

              {/* Sign Out Button */}
              <button
                id="subscriber-sign-out-btn"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-900/50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Signed In State: Prominent Sign Up and Sign In buttons */
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wide">
                  7-Day Complimentary Trial
                </span>
                <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Subscriber Account & Access
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign up with your Name, Email, and Password to unlock a <strong>7-Day Free Trial</strong> of Sanctuary Pro. Already registered? Sign in below.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Sign In Button */}
              <button
                id="subscriber-sign-in-btn"
                onClick={() => setIsSignInModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <LogIn className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Sign In</span>
              </button>

              {/* Sign Up Button */}
              <button
                id="subscriber-sign-up-btn"
                onClick={() => setIsSignUpModalOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md transition-all active:scale-95 border border-[#D4AF37]/30"
              >
                <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                <span>Sign Up (7-Day Free Trial)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7-DAY FREE TRIAL & EXPIRATION STATUS BANNER */}
      {isExpired ? (
        /* Trial Expired Alert Banner */
        <div
          id="trial-expired-alert-banner"
          className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-slate-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  7-Day Free Trial Expired
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ended on {new Date(subscription.trialEndDate || subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-serif-cinzel font-bold text-sm sm:text-base">
                Easily Pay to Continue Your Sanctuary Pro Access
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Choose either <strong>Monthly ($19.99/Monthly)</strong> or <strong>Yearly ($199.99/yearly — Save ~17%)</strong> to immediately restore unrestricted AI sermon generation and cloud sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="trial-expired-pay-monthly-btn"
              onClick={() => handleOpenPaymentModal('monthly')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
            >
              Pay Monthly ($19.99)
            </button>

            <button
              id="trial-expired-pay-yearly-btn"
              onClick={() => handleOpenPaymentModal('yearly')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md transition-all active:scale-95 border border-[#D4AF37]/40"
            >
              Pay Yearly ($199.99 — Save 17%)
            </button>
          </div>
        </div>
      ) : isTrial ? (
        /* Trial Active Banner */
        <div
          id="trial-active-banner"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#7D3AC1]/10 to-emerald-500/10 border border-emerald-500/30 text-slate-900 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                  Active Free Trial
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              </div>
              <h4 className="font-serif-cinzel font-bold text-sm">
                Full Sanctuary Pro Capabilities Unlocked
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your trial expires on <strong>{new Date(subscription.trialEndDate || subscription.currentPeriodEnd).toLocaleDateString()}</strong>. When it ends, you can easily pay for either Monthly or Yearly subscription.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Developer / Tester Helper: Simulate Expired Trial */}
            <button
              id="simulate-trial-expire-btn"
              onClick={handleSimulateTrialExpired}
              title="Test the post-trial expiration flow"
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 underline px-2 py-1"
            >
              Simulate Trial Expiry
            </button>

            <button
              id="trial-lock-in-btn"
              onClick={() => handleOpenPaymentModal(selectedCycle)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Lock In {selectedCycle === 'monthly' ? '$19.99/mo' : '$199.99/yr'}</span>
            </button>
          </div>
        </div>
      ) : null}

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

        <button
          id="billing-tab-tax-review"
          onClick={() => setActiveTab('tax-review')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === 'tax-review'
              ? 'bg-[#7D3AC1] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Tax Insights & Step Review</span>
        </button>
      </div>

      {/* TAB 1: PLANS & PRICING (ONLY Sanctuary Pro: $19.99/mo and $199.99/yr) */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Direct Stripe Subscription Plans Checkout Cards */}
          <SubscriptionPlans userId={subscriber?.uid || currentUser?.id} />

          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Choose Your Ministry Cadence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch anytime. Annual subscriptions include 2 months complimentary ministry stewardship (~17% discount).
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

          {/* Pricing Card: Sanctuary Pro (Centered, Elegant Single Plan) */}
          <div className="max-w-2xl mx-auto">
            <div
              id="plan-card-pro"
              className="flex flex-col justify-between rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-2 border-[#7D3AC1] shadow-xl dark:shadow-[#7D3AC1]/10 relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] border-b border-l border-[#D4AF37]/40 shadow-sm">
                Official Sanctuary Plan
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
                      Complete Ministry Suite
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      7-Day Free Trial Included
                    </span>
                  </div>

                  <h4 className="font-serif-cinzel text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {proPlan.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {proPlan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif-cinzel text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                        {selectedCycle === 'monthly' ? '$19.99' : '$199.99'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {selectedCycle === 'monthly' ? '/ Month' : '/ Year (Stewardship Plan)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedCycle === 'monthly'
                        ? 'Billed monthly ($19.99/Monthly) · Cancel or upgrade anytime'
                        : 'Billed annually ($199.99/yearly) · Includes 2 months free'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" />
                      <span>501(c)(3) 0% Sales Tax</span>
                    </span>
                  </div>
                </div>

                {/* Limits & Capacities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Members:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Unlimited</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">AI Exegesis:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Unrestricted</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Cloud Storage:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">25 GB Firestore</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Campuses:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">All Campuses</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Included Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {proPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {!subscriber ? (
                    <button
                      id="plan-signup-cta-btn"
                      onClick={() => setIsSignUpModalOpen(true)}
                      className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#D4AF37]/40"
                    >
                      <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Sign Up to Start 7-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isExpired ? (
                    <button
                      id="plan-expired-pay-cta-btn"
                      onClick={() => handleOpenPaymentModal(selectedCycle)}
                      className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-amber-200" />
                      <span>
                        Activate Sanctuary Pro Now ({selectedCycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly'})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : isTrial ? (
                    <div className="space-y-2">
                      <button
                        id="plan-trial-pay-cta-btn"
                        onClick={() => handleOpenPaymentModal(selectedCycle)}
                        className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#D4AF37]/40"
                      >
                        <Zap className="w-4 h-4 text-[#D4AF37]" />
                        <span>
                          Pay & Lock In {selectedCycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-center text-[11px] text-slate-400">
                        Trial active ({trialDaysRemaining} days remaining). You can pay anytime to guarantee continuity.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Active Paid Subscription ({subscription.priceTag})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  id="update-payment-method-btn"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] transition-colors"
                >
                  Update Payment Details
                </button>

                <button
                  type="button"
                  onClick={handleOpenCustomerPortal}
                  disabled={isStripeLoading}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-[#635BFF]/30 text-[#635BFF] dark:text-indigo-400 hover:bg-[#635BFF]/10 flex items-center gap-1.5 transition-colors"
                >
                  <span>Stripe Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

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

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">501(c)(3) Tax Exemption Number:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {subscription.churchTaxExemptId || 'EXEMPT-501C3-984321'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Tax Exempt (0% Tax)
                  </span>
                  <button
                    onClick={() => setActiveTab('tax-review')}
                    id="view-tax-insights-btn"
                    className="text-[11px] text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View Tax Insights Table</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
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

      {/* TAB 4: STEP REVIEW & TAX INSIGHTS */}
      {activeTab === 'tax-review' && (
        <div className="space-y-4">
          <StepReview
            onBack={() => setActiveTab('payment')}
            onConfirm={() => {
              showToast('Tax review verified and confirmed for administrative filing.', 'success');
              setActiveTab('payment');
            }}
          />
        </div>
      )}

      {/* MODAL 1: SUBSCRIBER SIGN UP (NAME, EMAIL, PASSWORD) */}
      {isSignUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="subscriber-signup-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Subscriber Registration
                </span>
                <button
                  onClick={() => setIsSignUpModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                Start 7-Day Free Trial
              </h3>
              <p className="text-xs text-slate-200">
                Unlock full access to Sanctuary Pro immediately. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="p-6 space-y-4">
              {signUpError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Pastoral Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor David Emmanuel"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ministry Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="pastor@church.org"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password (minimum 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Includes 7 days complimentary trial of Sanctuary Pro</span>
                </div>
                <p>After your trial expires, you can easily pay for either Monthly ($19.99) or Yearly ($199.99) of your choice.</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpModalOpen(false);
                    setIsSignInModalOpen(true);
                  }}
                  className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline"
                >
                  Already registered? Sign In
                </button>

                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  {signUpLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{signUpLoading ? 'Creating Account...' : 'Sign Up & Start Trial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBSCRIBER SIGN IN (EMAIL, PASSWORD & CHANGE PASSWORD LINK) */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="subscriber-signin-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Subscriber Portal
                </span>
                <button
                  onClick={() => setIsSignInModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                Sign In to Your Account
              </h3>
              <p className="text-xs text-slate-200">
                Manage your church subscription, invoices, and ministry settings.
              </p>
            </div>

            <form onSubmit={handleSignInSubmit} className="p-6 space-y-4">
              {signInError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="pastor@church.org"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setChangePasswordEmail(signInEmail);
                      setIsSignInModalOpen(false);
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="text-[11px] text-[#7D3AC1] dark:text-[#D4AF37] hover:underline"
                  >
                    Change / Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignInModalOpen(false);
                    setIsSignUpModalOpen(true);
                  }}
                  className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline"
                >
                  Need an account? Sign Up
                </button>

                <button
                  type="submit"
                  disabled={signInLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white hover:opacity-95 shadow-md flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  {signInLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>{signInLoading ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE SUBSCRIBER PASSWORD */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="subscriber-change-password-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Account Security
                </span>
                <button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                Change Subscriber Password
              </h3>
              <p className="text-xs text-slate-200">
                Update your account password anytime as you wish.
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {changePasswordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              {changePasswordError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="pastor@church.org"
                  value={changePasswordEmail}
                  onChange={(e) => setChangePasswordEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password (Optional if reset)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7D3AC1] text-white hover:bg-[#682e9f] shadow-md flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                >
                  {changePasswordLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{changePasswordLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAY & ACTIVATE SUBSCRIPTION (POST-TRIAL OR DIRECT PAYMENT) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="checkout-payment-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Sanctuary Pro Checkout
                </span>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                Activate Sanctuary Pro
              </h3>
              <p className="text-xs text-slate-200">
                Select your payment cadence: Monthly ($19.99) or Yearly ($199.99).
              </p>
            </div>

            <form onSubmit={handleExecutePayment} className="p-6 space-y-4">
              {/* Cadence Selection Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Subscription Frequency:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentCycle('monthly')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col justify-between ${
                      paymentCycle === 'monthly'
                        ? 'bg-[#7D3AC1] text-white border-[#7D3AC1] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>Monthly</span>
                    <span className="text-sm font-mono font-bold mt-0.5">$19.99/mo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCycle('yearly')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex flex-col justify-between relative ${
                      paymentCycle === 'yearly'
                        ? 'bg-[#7D3AC1] text-white border-[#7D3AC1] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>Yearly</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37] text-slate-950 font-extrabold uppercase">
                        Save 17%
                      </span>
                    </span>
                    <span className="text-sm font-mono font-bold mt-0.5">$199.99/yr</span>
                  </button>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Sanctuary Pro ({paymentCycle === 'monthly' ? 'Monthly' : 'Annual'})</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {paymentCycle === 'monthly' ? '$19.99' : '$199.99'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>501(c)(3) Ministry Tax Exemption:</span>
                  <span className="text-emerald-500 font-semibold">$0.00 (0% Tax)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Due Today:</span>
                  <span className="font-mono text-[#7D3AC1] dark:text-[#D4AF37]">
                    {paymentCycle === 'monthly' ? '$19.99' : '$199.99'}
                  </span>
                </div>
              </div>

              {/* Stripe Checkout Option */}
              <div className="p-3.5 rounded-xl border border-[#635BFF]/30 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#635BFF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      S
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                        Stripe Hosted Checkout
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Apple Pay, Google Pay, Credit Card & instant 501(c)(3) invoice
                      </span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#635BFF]/10 text-[#635BFF] dark:text-indigo-300 border border-[#635BFF]/20 shrink-0">
                    Fast & Secure
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={isStripeLoading}
                  className="w-full py-2 px-3.5 rounded-xl bg-[#635BFF] hover:bg-[#5248e3] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isStripeLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  <span>
                    {isStripeLoading
                      ? 'Redirecting to Stripe...'
                      : `Pay with Stripe (${paymentCycle === 'monthly' ? '$19.99/mo' : '$199.99/yr'})`}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-2.5 text-[10px] uppercase font-bold text-slate-400">
                  Or Direct Card Payment
                </span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Payment Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cardholder Name
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
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CVC
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Church Tax Exemption ID
                  </label>
                  <input
                    type="text"
                    value={taxExemptId}
                    onChange={(e) => setTaxExemptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95 shadow-md flex items-center gap-1.5 disabled:opacity-50 active:scale-95 border border-[#D4AF37]/30"
                >
                  {paymentLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>
                    {paymentLoading
                      ? 'Processing...'
                      : `Pay & Activate (${paymentCycle === 'monthly' ? '$19.99' : '$199.99'})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: OFFICIAL RECEIPT VIEWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="invoice-receipt-modal"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A145A] to-[#7D3AC1] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Official Ecclesiastical Receipt
                </span>
                <h3 className="font-serif-cinzel text-xl font-bold mt-1">
                  Invoice {selectedInvoice.invoiceNumber}
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

      {/* MODAL 6: CANCEL CONFIRMATION */}
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
