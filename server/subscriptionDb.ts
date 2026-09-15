import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Firestore 
} from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

let firestoreInstance: Firestore | null = null;

export function getServerDb(): Firestore | null {
  try {
    if (!firestoreInstance) {
      const app = !getApps().length ? initializeApp(appletConfig) : getApp();
      const dbId = appletConfig.firestoreDatabaseId;
      firestoreInstance = (dbId && dbId !== '(default)') 
        ? getFirestore(app, dbId) 
        : getFirestore(app);
    }
    return firestoreInstance;
  } catch (err) {
    console.warn('Failed to initialize server-side Firestore:', err);
    return null;
  }
}

export interface UserSubscriptionUpdate {
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  updatedAt: Date;
}

/**
 * Grants subscriber access and records Stripe IDs in Firestore.
 */
export async function updateUserSubscriptionStatus(
  userId: string | undefined, 
  data: UserSubscriptionUpdate
): Promise<void> {
  const db = getServerDb();
  const dateIso = data.updatedAt instanceof Date ? data.updatedAt.toISOString() : new Date().toISOString();

  console.log(`[Stripe Webhook] Updating subscription status for user: ${userId || 'church_ministry'}, status: ${data.status}`);

  if (db) {
    try {
      // 1. Update general church subscription document
      const currentSubRef = doc(db, 'subscriptions', 'current_church_subscription');
      await setDoc(currentSubRef, {
        status: data.status,
        stripeCustomerId: data.stripeCustomerId || null,
        stripeSubscriptionId: data.stripeSubscriptionId || null,
        isTrial: false,
        updatedAt: dateIso,
        tierId: 'pro',
        planName: 'Sanctuary Pro',
      }, { merge: true });

      // 2. If userId provided, update specific subscriber records
      if (userId) {
        const subscriberRef = doc(db, 'subscribers', userId);
        await setDoc(subscriberRef, {
          status: data.status,
          hasPaid: data.status === 'active',
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          updatedAt: dateIso
        }, { merge: true });

        const userSubRef = doc(db, 'subscriptions', `sub_${userId}`);
        await setDoc(userSubRef, {
          status: data.status,
          stripeCustomerId: data.stripeCustomerId || null,
          stripeSubscriptionId: data.stripeSubscriptionId || null,
          updatedAt: dateIso
        }, { merge: true });
      }
      console.log(`[Stripe Webhook] Successfully updated Firestore for user: ${userId || 'current_church_subscription'}`);
    } catch (err: any) {
      console.error('[Stripe Webhook] Failed to update Firestore subscription status:', err.message);
    }
  }
}

/**
 * Revokes subscriber access upon subscription deletion or cancellation.
 */
export async function revokeUserSubscriptionStatus(subscriptionId: string): Promise<void> {
  const db = getServerDb();
  const dateIso = new Date().toISOString();

  console.log(`[Stripe Webhook] Revoking subscription access for Stripe Subscription ID: ${subscriptionId}`);

  if (db) {
    try {
      // 1. Update current church subscription
      const currentSubRef = doc(db, 'subscriptions', 'current_church_subscription');
      await setDoc(currentSubRef, {
        status: 'canceled',
        updatedAt: dateIso
      }, { merge: true });

      // 2. Query subscribers collection for matching subscriptionId
      const subscribersCol = collection(db, 'subscribers');
      const q = query(subscribersCol, where('stripeSubscriptionId', '==', subscriptionId));
      const querySnap = await getDocs(q);

      for (const subscriberDoc of querySnap.docs) {
        await updateDoc(subscriberDoc.ref, {
          status: 'canceled',
          hasPaid: false,
          updatedAt: dateIso
        });
        console.log(`[Stripe Webhook] Revoked status for subscriber document: ${subscriberDoc.id}`);
      }
    } catch (err: any) {
      console.error('[Stripe Webhook] Failed to revoke subscription in Firestore:', err.message);
    }
  }
}

export interface UserDatabaseRecord {
  id: string;
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | 'expired' | 'none';
  hasPaid?: boolean;
  email?: string;
  name?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Retrieves a user record from Firestore and determines their subscription status.
 */
export async function getUserFromDatabase(userId: string): Promise<UserDatabaseRecord | null> {
  const db = getServerDb();
  if (!db || !userId) return null;

  try {
    const { getDoc } = await import('firebase/firestore');

    // 1. Check direct subscriber document
    const subDocRef = doc(db, 'subscribers', userId);
    const subSnap = await getDoc(subDocRef);
    if (subSnap.exists()) {
      const data = subSnap.data();
      const status = (data.status === 'active' || data.hasPaid) ? 'active' : (data.status || 'none');
      return {
        id: userId,
        subscriptionStatus: status,
        hasPaid: data.hasPaid,
        email: data.email,
        name: data.name,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
      };
    }

    // 2. Check user-specific subscription document
    const userSubRef = doc(db, 'subscriptions', `sub_${userId}`);
    const userSubSnap = await getDoc(userSubRef);
    if (userSubSnap.exists()) {
      const data = userSubSnap.data();
      return {
        id: userId,
        subscriptionStatus: data.status || 'none',
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
      };
    }

    // 3. Fallback: check general church ministry subscription
    const currentSubRef = doc(db, 'subscriptions', 'current_church_subscription');
    const currentSubSnap = await getDoc(currentSubRef);
    if (currentSubSnap.exists()) {
      const data = currentSubSnap.data();
      if (data.status === 'active') {
        return {
          id: userId,
          subscriptionStatus: 'active',
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
        };
      }
    }

    return null;
  } catch (err: any) {
    console.error('Error fetching user from database:', err.message);
    return null;
  }
}

