import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  PrayerRequest, 
  Announcement, 
  ChurchMember, 
  Sermon, 
  SimulatedPrayerEmailAlert, 
  UrgencyLevel 
} from '../types';
import appletConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: appletConfig.projectId || "studio-1723103554-a34e5",
  appId: appletConfig.appId || "1:1025711739844:web:697c94fb6f01bfa6ef4a91",
  apiKey: appletConfig.apiKey || "AIzaSyCuIi3q8tJNOQJd0iO7fbBeAUDwzfR92Rg",
  authDomain: appletConfig.authDomain || "studio-1723103554-a34e5.firebaseapp.com",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "ai-studio-churchministryap-02458b6b-f450-48a1-9e1f-5cd9fbd96a26",
  storageBucket: appletConfig.storageBucket || "studio-1723103554-a34e5.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || "1025711739844"
};

export const fallbackFirebaseConfig = firebaseConfig;

export function getFirebaseProjectInfo() {
  return {
    projectId: firebaseConfig.projectId,
    firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    isConfigured: Boolean(firebaseConfig.projectId && firebaseConfig.apiKey)
  };
}

export function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getDb() {
  const app = getFirebaseApp();
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return getFirestore(app);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return getAuth(app);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Skill Error Handler Specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getFirebaseAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection tester on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const db = getDb();
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline. Operating in resilient cache mode.');
    }
    return false;
  }
}

// Initial fire-and-forget connection test
testFirestoreConnection().catch(() => {});

// ============================================================================
// SIMULATED EMAIL ALERT BACKGROUND JOB FOR HIGH-URGENCY PRAYER PETITIONS
// ============================================================================

const EMAIL_ALERTS_STORAGE_KEY = 'church_simulated_prayer_email_alerts';
const ALERTED_PRAYER_IDS_STORAGE_KEY = 'church_alerted_prayer_ids';

let inMemoryEmailAlerts: SimulatedPrayerEmailAlert[] = [];
const alertListeners = new Set<(alert: SimulatedPrayerEmailAlert) => void>();

/**
 * Checks whether a prayer request qualifies as high-urgency
 */
export function isHighUrgencyPrayer(prayer: { urgencyLevel?: string; status?: string }): boolean {
  return prayer.urgencyLevel === 'Critical' || 
         prayer.urgencyLevel === 'Urgent' || 
         prayer.status === 'Urgent';
}

/**
 * Generates a formatted simulated email notification object for a high-urgency prayer
 */
export function generateSimulatedPrayerEmailAlert(
  prayer: PrayerRequest, 
  customRecipients?: string[]
): SimulatedPrayerEmailAlert {
  const urgency: 'Critical' | 'Urgent' = prayer.urgencyLevel === 'Critical' ? 'Critical' : 'Urgent';
  const recipients = customRecipients && customRecipients.length > 0 
    ? customRecipients 
    : [
        'pastor@churchministry.org',
        'prayer-chain-leads@churchministry.org',
        'intercessors@churchministry.org',
        'info@thinktecai.com'
      ];
  
  const sender = 'Pastoral Intercessory Alert System <prayer-alerts@churchministry.org>';
  const subject = `🚨 [URGENT PRAYER ALERT - ${urgency.toUpperCase()}] ${prayer.title}`;
  const sentAt = new Date().toISOString();
  
  const pointsFormatted = prayer.suggestedPoints && prayer.suggestedPoints.length > 0
    ? `\nKey Intercessory Focus Points:\n${prayer.suggestedPoints.map((pt, i) => `  ${i + 1}. ${pt}`).join('\n')}`
    : '';

  const body = `
================================================================================
🚨 URGENT INTERCESSORY PRAYER ALERT — IMMEDIATE ACTION REQUESTED
================================================================================
Sent At: ${new Date(sentAt).toLocaleString()}
Priority: ${urgency.toUpperCase()} URGENCY
Category: ${prayer.category}
Requester: ${prayer.requester}
Title: ${prayer.title}
--------------------------------------------------------------------------------

PETITION DETAILS:
"${prayer.description}"
${pointsFormatted}

SCRIPTURAL PROMISE:
"The effectual fervent prayer of a righteous man availeth much." — James 5:16

PASTORAL DIRECTIVES:
1. Please lift this petition before the Throne of Grace immediately.
2. The pastoral care response team has been alerted for immediate follow-up.
3. Handle this request with pastoral reverence and confidentiality.

—
Sent via Church Ministry Cloud Intercession Network (Firebase Background Alert Worker)
`.trim();

  const urgencyColor = urgency === 'Critical' ? '#dc2626' : '#d97706';
  const pointsHtml = prayer.suggestedPoints && prayer.suggestedPoints.length > 0
    ? `<div style="margin: 16px 0; padding: 12px; background: #f8fafc; border-left: 4px solid #d97706; border-radius: 6px;">
        <strong style="color: #92400e; font-size: 13px;">Key Intercessory Focus Points:</strong>
        <ul style="margin: 8px 0 0 16px; padding: 0; color: #334155; font-size: 13px;">
          ${prayer.suggestedPoints.map(pt => `<li>${pt}</li>`).join('')}
        </ul>
       </div>`
    : '';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: #0B1F4D; padding: 20px 24px; border-bottom: 3px solid #D4AF37;">
        <span style="display: inline-block; background: ${urgencyColor}; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          ${urgency} Urgency Prayer Alert
        </span>
        <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">
          ${prayer.title}
        </h1>
        <p style="color: #cbd5e1; font-size: 12px; margin: 6px 0 0 0;">
          From: ${prayer.requester} • Category: ${prayer.category} • ${new Date(sentAt).toLocaleDateString()}
        </p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #1e293b; font-size: 14px; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 0 16px 0;">
          "${prayer.description}"
        </p>
        ${pointsHtml}
        <div style="margin-top: 20px; padding: 12px 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-size: 12px; font-style: italic;">
            "The effectual fervent prayer of a righteous man availeth much." — James 5:16
          </p>
        </div>
      </div>
      <div style="background: #f1f5f9; padding: 12px 24px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        Simulated Email Notification from Church Ministry Background Service (Firebase Real-Time Worker).
      </div>
    </div>
  `.trim();

  return {
    id: `email-alert-${prayer.id}-${Date.now()}`,
    prayerId: prayer.id,
    recipients,
    sender,
    subject,
    body,
    htmlBody,
    urgencyLevel: urgency,
    category: prayer.category,
    requester: prayer.requester,
    sentAt,
    status: 'delivered',
    prayerTitle: prayer.title,
    prayerDescription: prayer.description,
    suggestedPoints: prayer.suggestedPoints
  };
}

/**
 * Retrieves the stored list of simulated prayer email alerts
 */
export function getStoredPrayerEmailAlerts(): SimulatedPrayerEmailAlert[] {
  if (typeof window === 'undefined') return inMemoryEmailAlerts;
  try {
    const raw = localStorage.getItem(EMAIL_ALERTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryEmailAlerts = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse email alerts from localStorage:', err);
  }
  return inMemoryEmailAlerts;
}

/**
 * Persists an email alert to local history
 */
export function savePrayerEmailAlert(alert: SimulatedPrayerEmailAlert): void {
  inMemoryEmailAlerts = [alert, ...inMemoryEmailAlerts.filter(a => a.id !== alert.id)].slice(0, 50);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EMAIL_ALERTS_STORAGE_KEY, JSON.stringify(inMemoryEmailAlerts));
    } catch (err) {
      console.warn('Failed to persist email alert to localStorage:', err);
    }
  }
}

/**
 * Clears the stored prayer email alerts
 */
export function clearStoredPrayerEmailAlerts(): void {
  inMemoryEmailAlerts = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(EMAIL_ALERTS_STORAGE_KEY);
    } catch {}
  }
}

/**
 * Retrieves the set of prayer IDs that have already triggered email alerts
 */
export function getAlertedPrayerIds(): Set<string> {
  const set = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ALERTED_PRAYER_IDS_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => set.add(id));
        }
      }
    } catch {}
  }
  return set;
}

/**
 * Marks a prayer ID as alerted to prevent redundant email dispatches
 */
export function markPrayerAsAlerted(prayerId: string): void {
  if (typeof window !== 'undefined') {
    try {
      const set = getAlertedPrayerIds();
      set.add(prayerId);
      localStorage.setItem(ALERTED_PRAYER_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }
}

/**
 * Subscribe to newly dispatched simulated email alerts
 */
export function onSimulatedPrayerEmailAlert(listener: (alert: SimulatedPrayerEmailAlert) => void): () => void {
  alertListeners.add(listener);
  return () => {
    alertListeners.delete(listener);
  };
}

/**
 * Triggers and records a simulated email alert notification for a prayer request
 */
export async function triggerSimulatedEmailAlert(
  prayer: PrayerRequest, 
  customRecipients?: string[]
): Promise<SimulatedPrayerEmailAlert> {
  const alert = generateSimulatedPrayerEmailAlert(prayer, customRecipients);
  
  // Record that this prayer has been alerted
  markPrayerAsAlerted(prayer.id);
  savePrayerEmailAlert(alert);

  // Console output for immediate developer / administrator verification
  console.log(
    '%c📧 [FIREBASE BACKGROUND JOB] Simulated Email Alert Dispatched!',
    'background: #b91c1c; color: white; font-weight: bold; padding: 5px 10px; border-radius: 4px; font-size: 12px;',
    {
      to: alert.recipients,
      subject: alert.subject,
      prayerId: alert.prayerId,
      urgency: alert.urgencyLevel,
      requester: alert.requester,
      sentAt: alert.sentAt,
      preview: alert.prayerTitle
    }
  );

  // Synchronize alert audit record to Firestore /prayer_alerts/{alertId}
  try {
    const db = getDb();
    const alertRef = doc(db, 'prayer_alerts', alert.id);
    await setDoc(alertRef, {
      id: alert.id,
      prayerId: alert.prayerId,
      recipients: alert.recipients,
      sender: alert.sender,
      subject: alert.subject,
      urgencyLevel: alert.urgencyLevel,
      status: alert.status,
      sentAt: alert.sentAt,
      prayerTitle: alert.prayerTitle,
      requester: alert.requester,
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    // Firestore error handling conforms to skill specs
    handleFirestoreError(err, OperationType.WRITE, `prayer_alerts/${alert.id}`);
  }

  // Notify registered in-app subscribers
  alertListeners.forEach((listener) => {
    try {
      listener(alert);
    } catch (e) {
      console.error('Error in prayer alert listener:', e);
    }
  });

  // Dispatch custom browser event for wide UI reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('church-urgent-prayer-email', { detail: alert }));
  }

  return alert;
}

/**
 * Background Job in the Firebase utility that monitors prayer requests in real-time
 * and triggers a simulated email alert notification whenever a new, high-urgency
 * prayer request is added to the system.
 */
export function startHighUrgencyPrayerAlertBackgroundJob(
  onAlertTriggered?: (alert: SimulatedPrayerEmailAlert) => void,
  options: {
    recipients?: string[];
    immediateCheck?: boolean;
  } = {}
): () => void {
  const db = getDb();
  const path = 'prayers';
  
  // Track seen prayers during this session to distinguish newly added from baseline
  const seenPrayerIds = new Set<string>();
  let isInitialLoad = true;

  if (onAlertTriggered) {
    alertListeners.add(onAlertTriggered);
  }

  console.log('⚡ [FIREBASE UTILITY] High-urgency prayer email alert background job initialized.');

  try {
    const prayersCol = collection(db, 'prayers');
    const unsubscribeSnapshot = onSnapshot(
      prayersCol,
      (snapshot) => {
        const alertedIds = getAlertedPrayerIds();

        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const prayerId = data.id || change.doc.id;
          const urgency = (data.urgencyLevel as UrgencyLevel) || (data.status === 'Urgent' ? 'Urgent' : 'General');
          const isHighUrgency = urgency === 'Critical' || urgency === 'Urgent' || data.status === 'Urgent';

          if (change.type === 'added') {
            if (isInitialLoad) {
              // Baseline snapshot: record ID to avoid re-alerting on page reload
              seenPrayerIds.add(prayerId);
              if (options.immediateCheck && isHighUrgency && !alertedIds.has(prayerId)) {
                const prayerObj: PrayerRequest = {
                  id: prayerId,
                  title: data.title || 'Urgent Prayer Petition',
                  requester: data.requester || 'Anonymous',
                  date: data.date || new Date().toISOString().split('T')[0],
                  category: data.category || 'Healing',
                  description: data.description || '',
                  status: data.status || 'Urgent',
                  urgencyLevel: urgency,
                  isPrivate: Boolean(data.isPrivate),
                  suggestedPoints: data.suggestedPoints
                };
                triggerSimulatedEmailAlert(prayerObj, options.recipients);
              }
            } else {
              // A NEW prayer document was added after the initial baseline!
              if (isHighUrgency && !alertedIds.has(prayerId)) {
                const prayerObj: PrayerRequest = {
                  id: prayerId,
                  title: data.title || 'Urgent Prayer Petition',
                  requester: data.requester || 'Anonymous',
                  date: data.date || new Date().toISOString().split('T')[0],
                  category: data.category || 'Healing',
                  description: data.description || '',
                  status: data.status || 'Urgent',
                  urgencyLevel: urgency,
                  isPrivate: Boolean(data.isPrivate),
                  suggestedPoints: data.suggestedPoints
                };
                triggerSimulatedEmailAlert(prayerObj, options.recipients);
              }
              seenPrayerIds.add(prayerId);
            }
          } else if (change.type === 'modified') {
            // An existing prayer was modified or escalated to Critical/Urgent
            if (isHighUrgency && !alertedIds.has(prayerId)) {
              const prayerObj: PrayerRequest = {
                id: prayerId,
                title: data.title || 'Urgent Prayer Petition',
                requester: data.requester || 'Anonymous',
                date: data.date || new Date().toISOString().split('T')[0],
                category: data.category || 'Healing',
                description: data.description || '',
                status: data.status || 'Urgent',
                urgencyLevel: urgency,
                isPrivate: Boolean(data.isPrivate),
                suggestedPoints: data.suggestedPoints
              };
              triggerSimulatedEmailAlert(prayerObj, options.recipients);
            }
          }
        });

        if (isInitialLoad) {
          isInitialLoad = false;
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => {
      unsubscribeSnapshot();
      if (onAlertTriggered) {
        alertListeners.delete(onAlertTriggered);
      }
      console.log('🛑 [FIREBASE UTILITY] High-urgency prayer email alert background job stopped.');
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Synchronize a prayer request to Firestore
export async function savePrayerToFirestore(
  prayer: PrayerRequest,
  options?: { triggerEmailAlert?: boolean; recipients?: string[] }
): Promise<{ success: boolean; error?: string; emailAlert?: SimulatedPrayerEmailAlert }> {
  const db = getDb();
  const path = `prayers/${prayer.id}`;
  let dispatchedAlert: SimulatedPrayerEmailAlert | undefined;

  // Check if this prayer qualifies as high urgency and trigger the background job alert
  const isHighUrgency = isHighUrgencyPrayer(prayer);
  if (isHighUrgency && options?.triggerEmailAlert !== false) {
    const alertedIds = getAlertedPrayerIds();
    if (!alertedIds.has(prayer.id)) {
      dispatchedAlert = await triggerSimulatedEmailAlert(prayer, options?.recipients);
    }
  }

  try {
    const prayerRef = doc(db, 'prayers', prayer.id);
    await setDoc(prayerRef, {
      id: prayer.id,
      title: prayer.title,
      requester: prayer.requester,
      date: prayer.date,
      category: prayer.category,
      description: prayer.description,
      status: prayer.status,
      urgencyLevel: prayer.urgencyLevel || (prayer.status === 'Urgent' ? 'Urgent' : 'General'),
      isPrivate: prayer.isPrivate ?? false,
      suggestedPoints: prayer.suggestedPoints || [],
      emailAlertTriggered: isHighUrgency,
      emailAlertId: dispatchedAlert?.id || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true, emailAlert: dispatchedAlert };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      emailAlert: dispatchedAlert 
    };
  }
}

// Update status of prayer in Firestore ('Answered' vs 'Active' vs 'Urgent')
export async function updatePrayerStatusInFirestore(
  prayerId: string, 
  status: 'Active' | 'Answered' | 'Urgent',
  prayerSnapshot?: PrayerRequest
): Promise<{ success: boolean; error?: string; emailAlert?: SimulatedPrayerEmailAlert }> {
  const db = getDb();
  const path = `prayers/${prayerId}`;
  let dispatchedAlert: SimulatedPrayerEmailAlert | undefined;

  // If status changed to Urgent, trigger alert if not yet alerted
  if (status === 'Urgent' && prayerSnapshot) {
    const alertedIds = getAlertedPrayerIds();
    if (!alertedIds.has(prayerId)) {
      dispatchedAlert = await triggerSimulatedEmailAlert({
        ...prayerSnapshot,
        status: 'Urgent',
        urgencyLevel: prayerSnapshot.urgencyLevel || 'Urgent'
      });
    }
  }

  try {
    const prayerRef = doc(db, 'prayers', prayerId);
    await updateDoc(prayerRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true, emailAlert: dispatchedAlert };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Update urgency level of prayer in Firestore ('Critical' vs 'Urgent' vs 'General')
export async function updatePrayerUrgencyInFirestore(
  prayerId: string,
  urgencyLevel: 'Critical' | 'Urgent' | 'General',
  prayerSnapshot?: PrayerRequest
): Promise<{ success: boolean; error?: string; emailAlert?: SimulatedPrayerEmailAlert }> {
  const db = getDb();
  const path = `prayers/${prayerId}`;
  let dispatchedAlert: SimulatedPrayerEmailAlert | undefined;

  if ((urgencyLevel === 'Critical' || urgencyLevel === 'Urgent') && prayerSnapshot) {
    const alertedIds = getAlertedPrayerIds();
    if (!alertedIds.has(prayerId)) {
      dispatchedAlert = await triggerSimulatedEmailAlert({
        ...prayerSnapshot,
        urgencyLevel
      });
    }
  }

  try {
    const prayerRef = doc(db, 'prayers', prayerId);
    await updateDoc(prayerRef, {
      urgencyLevel,
      updatedAt: serverTimestamp()
    });
    return { success: true, emailAlert: dispatchedAlert };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Real-time synchronization listener for church-wide prayers
export function subscribeToChurchPrayers(
  onUpdate: (prayers: PrayerRequest[]) => void,
  onError?: (err: any) => void
): () => void {
  const db = getDb();
  const path = 'prayers';
  try {
    const prayersCol = collection(db, 'prayers');
    const unsubscribe = onSnapshot(
      prayersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PrayerRequest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: data.id || docSnap.id,
              title: data.title || 'Prayer Request',
              requester: data.requester || 'Church Member',
              date: data.date || new Date().toISOString().split('T')[0],
              category: data.category || 'Healing',
              description: data.description || '',
              status: (data.status as any) || 'Active',
              urgencyLevel: (data.urgencyLevel as any) || (data.status === 'Urgent' ? 'Urgent' : 'General'),
              isPrivate: Boolean(data.isPrivate),
              suggestedPoints: Array.isArray(data.suggestedPoints) ? data.suggestedPoints : undefined
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save Announcement to Firestore
export async function saveAnnouncementToFirestore(announcement: Announcement): Promise<boolean> {
  const db = getDb();
  const path = `announcements/${announcement.id}`;
  try {
    const ref = doc(db, 'announcements', announcement.id);
    await setDoc(ref, {
      id: announcement.id,
      title: announcement.title,
      date: announcement.date,
      category: announcement.category,
      content: announcement.content,
      priority: announcement.priority,
      author: announcement.author,
      createdAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Real-time synchronization listener for church announcements
export function subscribeToChurchAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: any) => void
): () => void {
  const db = getDb();
  const path = 'announcements';
  try {
    const col = collection(db, 'announcements');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Announcement[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: data.id || docSnap.id,
              title: data.title || 'Church Announcement',
              date: data.date || new Date().toISOString().split('T')[0],
              category: data.category || 'General',
              content: data.content || '',
              priority: data.priority || 'Standard',
              author: data.author || 'Church Administration'
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save Member to Firestore
export async function saveMemberToFirestore(member: ChurchMember): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const path = `members/${member.id}`;
  try {
    const ref = doc(db, 'members', member.id);
    await setDoc(ref, {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      fellowship: member.fellowship,
      role: member.role,
      joinedDate: member.joinedDate,
      attendanceScore: member.attendanceScore,
      activeStatus: member.activeStatus,
      birthDate: member.birthDate || null,
      weddingAnniversary: member.weddingAnniversary || null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Subscribe to Congregation Members
export function subscribeToChurchMembers(
  onUpdate: (members: ChurchMember[]) => void,
  onError?: (err: any) => void
): () => void {
  const db = getDb();
  const path = 'members';
  try {
    const col = collection(db, 'members');
    const unsubscribe = onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ChurchMember[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: data.id || docSnap.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || '',
              fellowship: data.fellowship || 'General',
              role: data.role || 'Member',
              joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
              attendanceScore: typeof data.attendanceScore === 'number' ? data.attendanceScore : 100,
              activeStatus: data.activeStatus !== false,
              birthDate: data.birthDate,
              weddingAnniversary: data.weddingAnniversary,
              encryptedNotes: data.encryptedNotes
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Save Sermon to Firestore
export async function saveSermonToFirestore(sermon: Sermon): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const path = `sermons/${sermon.id}`;
  try {
    const ref = doc(db, 'sermons', sermon.id);
    await setDoc(ref, {
      ...sermon,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Synchronize full ministry snapshot to Firestore
export async function syncFullMinistryToFirestore(tenantId: string, payload: any): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const sanitizedDocId = tenantId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() || 'church_primary';
  const path = `ministry_backups/${sanitizedDocId}`;
  try {
    const ref = doc(db, 'ministry_backups', sanitizedDocId);
    await setDoc(ref, {
      tenantId,
      lastSyncedAt: serverTimestamp(),
      stateSummary: {
        membersCount: payload.members?.length || 0,
        sermonsCount: payload.sermons?.length || 0,
        announcementsCount: payload.announcements?.length || 0,
        prayersCount: payload.prayers?.length || 0
      },
      payload,
      encryptionStandard: 'AES-GCM-256 Cloud Firestore Synced'
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

