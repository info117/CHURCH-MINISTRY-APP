import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  signOut as fbSignOut, 
  updatePassword as fbUpdatePassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getDb } from './firebase';
import { UserAccount, ChurchSubscriptionState, BillingCycle, SubscriptionStatus } from '../types';
import { initialChurchSubscription } from '../data/subscriptionPlans';
import { saveLocalSubscription, syncSubscriptionToFirestore } from './subscriptionService';

const SUBSCRIBER_STORAGE_KEY = 'church_current_subscriber_v1';
const SUBSCRIBER_ACCOUNTS_KEY = 'church_subscribers_directory_v1';

export interface SubscriberAccountRecord {
  uid: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  trialStartDate: string;
  trialEndDate: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  hasPaid: boolean;
}

// 7 days in milliseconds
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Helper to get remaining days in trial
export function calculateTrialDaysRemaining(trialEndDateStr?: string): number {
  if (!trialEndDateStr) return 0;
  const end = new Date(trialEndDateStr).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

// Check if 7-day trial has expired
export function isTrialExpired(trialEndDateStr?: string): boolean {
  if (!trialEndDateStr) return false;
  return Date.now() > new Date(trialEndDateStr).getTime();
}

// Local subscriber directory helpers for robust persistence
function getLocalSubscribers(): Record<string, SubscriberAccountRecord> {
  try {
    const raw = localStorage.getItem(SUBSCRIBER_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalSubscriberRecord(record: SubscriberAccountRecord) {
  try {
    const all = getLocalSubscribers();
    all[record.email.toLowerCase()] = record;
    localStorage.setItem(SUBSCRIBER_ACCOUNTS_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Failed to cache subscriber record locally', err);
  }
}

// Sign Up Subscriber with Name, Email, Password -> Starts 7-Day Free Trial
export async function signUpSubscriber(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserAccount; subscription: ChurchSubscriptionState }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error('Please enter your full name or ministry title.');
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + SEVEN_DAYS_MS);

  let uid = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let fbUser: FirebaseUser | null = null;

  try {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    fbUser = cred.user;
    uid = fbUser.uid;
    await updateProfile(fbUser, { displayName: cleanName });
  } catch (fbErr: any) {
    console.warn('Firebase Auth sign up fallback:', fbErr.message || fbErr);
    // Check if error is email-already-in-use
    if (fbErr.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please Sign In instead.');
    }
    // For other network/offline issues, proceed with offline-resilient account
  }

  const subscriberRecord: SubscriberAccountRecord = {
    uid,
    name: cleanName,
    email: cleanEmail,
    passwordHash: btoa(password), // Obfuscated client-side store
    createdAt: now.toISOString(),
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    status: 'trialing',
    billingCycle: 'monthly',
    hasPaid: false
  };

  saveLocalSubscriberRecord(subscriberRecord);

  // Sync to Firestore subscribers collection
  try {
    const db = getDb();
    if (db) {
      const subDoc = doc(db, 'subscribers', uid);
      await setDoc(subDoc, subscriberRecord, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore subscriber save error:', err);
  }

  const userAccount: UserAccount = {
    uid,
    email: cleanEmail,
    displayName: cleanName,
    photoURL: null,
    role: 'Pastor/Minister',
    isBiometricEnrolled: true,
    lastLoginMethod: 'email-password',
    createdAt: now.toISOString(),
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isTrialActive: true,
    hasPaidSubscription: false
  };

  // Configure church subscription state with active 7-day trial
  const subscription: ChurchSubscriptionState = {
    ...initialChurchSubscription,
    id: `sub_${uid}`,
    status: 'trialing',
    planName: 'Sanctuary Pro',
    tierId: 'pro',
    billingCycle: 'monthly',
    priceTag: '$19.99/Monthly',
    billingEmail: cleanEmail,
    subscriberName: cleanName,
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isTrial: true,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: trialEnd.toISOString()
  };

  // Save session
  localStorage.setItem(SUBSCRIBER_STORAGE_KEY, JSON.stringify(userAccount));
  localStorage.setItem('church_auth_account', JSON.stringify(userAccount));
  saveLocalSubscription(subscription);
  await syncSubscriptionToFirestore(subscription);

  return { user: userAccount, subscription };
}

// Sign In Subscriber with Email and Password
export async function signInSubscriber(
  email: string,
  password: string
): Promise<{ user: UserAccount; subscription: ChurchSubscriptionState }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  let uid = '';
  let displayName = 'Ministry Subscriber';

  try {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    uid = cred.user.uid;
    displayName = cred.user.displayName || displayName;
  } catch (fbErr: any) {
    console.warn('Firebase Auth sign in fallback:', fbErr.message || fbErr);
    // Check local directory
    const all = getLocalSubscribers();
    const record = all[cleanEmail];
    if (!record) {
      if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      if (fbErr.code === 'auth/user-not-found') {
        throw new Error('No subscriber found with this email. Please Sign Up for a 7-Day Free Trial.');
      }
      throw new Error('Invalid email or password. If you are new, please Sign Up first.');
    }
    if (record.passwordHash && record.passwordHash !== btoa(password)) {
      throw new Error('Incorrect password. Please re-enter or change your password.');
    }
    uid = record.uid;
    displayName = record.name;
  }

  // Load subscriber record
  const all = getLocalSubscribers();
  let record = all[cleanEmail];

  // Try Firestore fetch
  try {
    const db = getDb();
    if (db && uid) {
      const snap = await getDoc(doc(db, 'subscribers', uid));
      if (snap.exists()) {
        record = snap.data() as SubscriberAccountRecord;
        saveLocalSubscriberRecord(record);
      }
    }
  } catch (err) {
    console.warn('Could not fetch subscriber from firestore:', err);
  }

  const now = new Date();
  const trialEnd = record ? new Date(record.trialEndDate) : new Date(now.getTime() + SEVEN_DAYS_MS);
  const trialExpired = !record?.hasPaid && now > trialEnd;
  const status: SubscriptionStatus = record?.hasPaid
    ? 'active'
    : trialExpired
    ? 'trial_expired'
    : 'trialing';

  const userAccount: UserAccount = {
    uid: uid || `sub_${cleanEmail}`,
    email: cleanEmail,
    displayName: record ? record.name : displayName,
    photoURL: null,
    role: 'Pastor/Minister',
    isBiometricEnrolled: true,
    lastLoginMethod: 'email-password',
    createdAt: record ? record.createdAt : now.toISOString(),
    trialStartDate: record ? record.trialStartDate : now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isTrialActive: !trialExpired && !record?.hasPaid,
    hasPaidSubscription: Boolean(record?.hasPaid)
  };

  const subscription: ChurchSubscriptionState = {
    ...initialChurchSubscription,
    id: `sub_${userAccount.uid}`,
    status,
    planName: 'Sanctuary Pro',
    tierId: 'pro',
    billingCycle: record ? record.billingCycle : 'monthly',
    priceTag: (record ? record.billingCycle : 'monthly') === 'yearly' ? '$199.99/yearly' : '$19.99/Monthly',
    billingEmail: cleanEmail,
    subscriberName: userAccount.displayName || cleanEmail,
    trialStartDate: record ? record.trialStartDate : now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    isTrial: !record?.hasPaid,
    currentPeriodStart: record ? record.trialStartDate : now.toISOString(),
    currentPeriodEnd: trialEnd.toISOString()
  };

  localStorage.setItem(SUBSCRIBER_STORAGE_KEY, JSON.stringify(userAccount));
  localStorage.setItem('church_auth_account', JSON.stringify(userAccount));
  saveLocalSubscription(subscription);

  return { user: userAccount, subscription };
}

// Change Subscriber Password as they wish
export async function changeSubscriberPassword(
  email: string,
  newPassword: string,
  _currentPassword?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  let updated = false;

  // Try Firebase Auth
  try {
    const auth = getFirebaseAuth();
    if (auth.currentUser && auth.currentUser.email === cleanEmail) {
      await fbUpdatePassword(auth.currentUser, newPassword);
      updated = true;
    } else {
      // Send official password reset email link as well
      await sendPasswordResetEmail(auth, cleanEmail);
      updated = true;
    }
  } catch (fbErr: any) {
    console.warn('Firebase update password error, updating local/Firestore record:', fbErr.message || fbErr);
  }

  // Update local record
  const all = getLocalSubscribers();
  if (all[cleanEmail]) {
    all[cleanEmail].passwordHash = btoa(newPassword);
    localStorage.setItem(SUBSCRIBER_ACCOUNTS_KEY, JSON.stringify(all));
    updated = true;
  }

  if (!updated) {
    throw new Error('Unable to locate account to change password. Please ensure email is correct.');
  }
}

// Sign Out Subscriber
export async function signOutSubscriber(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Firebase signOut notice:', err);
  }
  localStorage.removeItem(SUBSCRIBER_STORAGE_KEY);
  localStorage.removeItem('church_auth_account');
}

// Check stored subscriber session
export function getSavedSubscriber(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SUBSCRIBER_STORAGE_KEY) || localStorage.getItem('church_auth_account');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Helper to mark subscription as paid after trial expires (or during trial)
export async function payForSubscription(
  currentSubscription: ChurchSubscriptionState,
  cycle: BillingCycle,
  cardLast4: string = '4242'
): Promise<ChurchSubscriptionState> {
  const now = new Date();
  const nextPeriod = new Date();
  if (cycle === 'monthly') {
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);
  } else {
    nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
  }

  const amount = cycle === 'monthly' ? 19.99 : 199.99;
  const priceTag = cycle === 'monthly' ? '$19.99/Monthly' : '$199.99/yearly';
  const planName = `Sanctuary Pro - ${cycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`;

  const newInvoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber: `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`,
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dueDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    planName,
    billingCycle: cycle,
    amount,
    formattedAmount: `$${amount.toFixed(2)}`,
    status: 'paid' as const,
    paymentMethodSummary: `Visa ending in ${cardLast4}`,
    items: [
      {
        description: `Sanctuary Pro Ecclesiastical License (${cycle === 'monthly' ? 'Monthly Access' : 'Yearly Stewardship - 2 Mos Free'})`,
        amount
      }
    ]
  };

  const updatedSubscription: ChurchSubscriptionState = {
    ...currentSubscription,
    status: 'active',
    billingCycle: cycle,
    priceTag,
    isTrial: false,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextPeriod.toISOString(),
    invoices: [newInvoice, ...(currentSubscription.invoices || [])]
  };

  // Update subscriber record
  if (currentSubscription.billingEmail) {
    const cleanEmail = currentSubscription.billingEmail.toLowerCase();
    const all = getLocalSubscribers();
    if (all[cleanEmail]) {
      all[cleanEmail].hasPaid = true;
      all[cleanEmail].status = 'active';
      all[cleanEmail].billingCycle = cycle;
      localStorage.setItem(SUBSCRIBER_ACCOUNTS_KEY, JSON.stringify(all));
    }
  }

  saveLocalSubscription(updatedSubscription);
  await syncSubscriptionToFirestore(updatedSubscription);
  return updatedSubscription;
}

// Simulation helper to test expired trial scenario
export function simulateExpiredTrialState(
  currentSubscription: ChurchSubscriptionState
): ChurchSubscriptionState {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const updated: ChurchSubscriptionState = {
    ...currentSubscription,
    status: 'trial_expired',
    isTrial: true,
    trialEndDate: pastDate,
    currentPeriodEnd: pastDate
  };
  saveLocalSubscription(updated);
  return updated;
}
