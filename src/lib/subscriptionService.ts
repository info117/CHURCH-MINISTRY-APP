import { ChurchSubscriptionState, BillingCycle, SubscriptionTierId, BillingInvoice } from '../types';
import { initialChurchSubscription, SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { getDb } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'church_subscription_state_v1';

export function loadLocalSubscription(): ChurchSubscriptionState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cycle: BillingCycle = parsed.billingCycle === 'yearly' ? 'yearly' : 'monthly';
      return {
        ...initialChurchSubscription,
        ...parsed,
        tierId: 'pro',
        planName: 'Sanctuary Pro',
        billingCycle: cycle,
        priceTag: cycle === 'yearly' ? '$199.99/yearly' : '$19.99/Monthly'
      };
    }
  } catch (err) {
    console.error('Failed to load subscription from localStorage:', err);
  }
  return initialChurchSubscription;
}

export function saveLocalSubscription(state: ChurchSubscriptionState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save subscription to localStorage:', err);
  }
}

export async function syncSubscriptionToFirestore(state: ChurchSubscriptionState): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return false;
    const subRef = doc(db, 'subscriptions', 'current_church_subscription');
    await setDoc(subRef, {
      id: state.id,
      tierId: 'pro',
      planName: 'Sanctuary Pro',
      billingCycle: state.billingCycle,
      priceTag: state.priceTag,
      status: state.status,
      billingEmail: state.billingEmail,
      currentPeriodEnd: state.currentPeriodEnd,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore subscription sync warning (will fallback to local cache):', err);
    return false;
  }
}

export async function fetchSubscriptionFromFirestore(): Promise<Partial<ChurchSubscriptionState> | null> {
  try {
    const db = getDb();
    if (!db) return null;
    const subRef = doc(db, 'subscriptions', 'current_church_subscription');
    const snapshot = await getDoc(subRef);
    if (snapshot.exists()) {
      return snapshot.data() as Partial<ChurchSubscriptionState>;
    }
  } catch (err) {
    console.warn('Firestore subscription fetch warning:', err);
  }
  return null;
}

export function calculatePriceTag(_tierId: SubscriptionTierId, cycle: BillingCycle): string {
  const plan = SUBSCRIPTION_PLANS[0];
  return cycle === 'monthly' ? plan.monthlyDisplay : plan.yearlyDisplay;
}

export function createInvoiceRecord(
  _tierId: SubscriptionTierId,
  cycle: BillingCycle,
  cardLast4: string
): BillingInvoice {
  const plan = SUBSCRIPTION_PLANS[0];
  const amount = cycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const invoiceNum = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: `inv_${Date.now()}`,
    invoiceNumber: invoiceNum,
    date: dateStr,
    dueDate: dateStr,
    planName: `${plan.name} - ${cycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
    billingCycle: cycle,
    amount: amount,
    formattedAmount: `$${amount.toFixed(2)}`,
    status: 'paid',
    paymentMethodSummary: `Card ending in ${cardLast4}`,
    items: [
      {
        description: `${plan.name} Plan (${cycle === 'monthly' ? 'Monthly Recurring: $19.99/Monthly' : 'Annual Recurring: $199.99/yearly'})`,
        amount: amount
      }
    ]
  };
}
