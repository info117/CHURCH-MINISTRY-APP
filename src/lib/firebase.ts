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
import { PrayerRequest, Announcement, ChurchMember, Sermon } from '../types';
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

// Synchronize a prayer request to Firestore
export async function savePrayerToFirestore(prayer: PrayerRequest): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const path = `prayers/${prayer.id}`;
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Update status of prayer in Firestore ('Answered' vs 'Active' vs 'Urgent')
export async function updatePrayerStatusInFirestore(
  prayerId: string, 
  status: 'Active' | 'Answered' | 'Urgent'
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const path = `prayers/${prayerId}`;
  try {
    const prayerRef = doc(db, 'prayers', prayerId);
    await updateDoc(prayerRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Update urgency level of prayer in Firestore ('Critical' vs 'Urgent' vs 'General')
export async function updatePrayerUrgencyInFirestore(
  prayerId: string,
  urgencyLevel: 'Critical' | 'Urgent' | 'General'
): Promise<{ success: boolean; error?: string }> {
  const db = getDb();
  const path = `prayers/${prayerId}`;
  try {
    const prayerRef = doc(db, 'prayers', prayerId);
    await updateDoc(prayerRef, {
      urgencyLevel,
      updatedAt: serverTimestamp()
    });
    return { success: true };
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

