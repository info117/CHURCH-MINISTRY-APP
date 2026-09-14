export type ThemeMode = 'light' | 'dark' | 'system';
export type BibleTranslation = 'KJV' | 'NASB' | 'NIV' | 'NLT';

export type UserRole = 
  | 'Super Administrator'
  | 'Church Administrator'
  | 'Pastor/Minister'
  | 'Ministry Leader'
  | 'Fellowship Leader'
  | 'Teacher'
  | 'Member'
  | 'Viewer';

export interface SidebarTool {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
  category: 'core' | 'ai' | 'ministry' | 'operations' | 'admin';
  order: number;
  isFavorite: boolean;
  isHidden?: boolean;
}

export interface ChurchProfile {
  name?: string;
  appName?: string;
  churchName: string;
  ministryName?: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  website: string;
  headPastor: string;
  serviceTimes: {
    sundayMain: string;
    sundayEvening: string;
    midweekPrayer: string;
    bibleStudy: string;
  };
  preferredTranslation: BibleTranslation;
  customPrimaryColor?: string;
}

export interface Sermon {
  id: string;
  title: string;
  theme: string;
  mainScripture: string;
  supportingTexts: string[];
  bibleVersion: BibleTranslation;
  date: string;
  speaker: string;
  introduction: string;
  mainPoints: {
    title: string;
    subpoints: string[];
    scriptureRef: string;
  }[];
  illustrations: string[];
  applications: string[];
  conclusion: string;
  prayer: string;
  notes: string;
  tags: string[];
}

export interface BibleStudy {
  id: string;
  title: string;
  scripture: string;
  bibleVersion: BibleTranslation;
  objective: string;
  background: string;
  keyObservations: string[];
  interpretation: string;
  discussionQuestions: string[];
  crossReferences: string[];
  prayerPoints: string[];
  targetFellowship: string;
}

export interface Devotional {
  id: string;
  title: string;
  date: string;
  scriptureRef: string;
  scriptureText: string;
  bibleVersion: BibleTranslation;
  reflection: string;
  application: string;
  prayer: string;
  author: string;
}

export type UrgencyLevel = 'Critical' | 'Urgent' | 'General';

export interface PrayerRequest {
  id: string;
  title: string;
  requester: string;
  date: string;
  category: 'Healing' | 'Salvation' | 'Church Growth' | 'Missions' | 'Personal' | 'Family';
  description: string;
  status: 'Active' | 'Answered' | 'Urgent';
  isPrivate: boolean;
  suggestedPoints?: string[];
  urgencyLevel?: UrgencyLevel;
}

export interface ChurchOperationEvent {
  id: string;
  name: string;
  title?: string;
  type: 'Evangelism' | 'Camp Meeting' | 'Crusade' | 'Special Program' | 'Missions' | 'Conference';
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  speaker: string;
  leadMinistryTeam: string;
  estimatedBudget: number;
  expectedAttendance: number;
  actualAttendance?: number;
  notes: string;
  status: 'Planning' | 'Active' | 'Completed';
  flyerImage?: string;
  date?: string;
}

export interface WeeklyScheduleItem {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string;
  title: string;
  category: 'Sunday Service' | 'Prayer Meeting' | 'Bible Study' | 'Youth Fellowship' | 'Choir Rehearsal' | 'Evangelism';
  location: string;
  speakerOrLeader: string;
  color: string;
}

export interface CongregationMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  address: string;
  fellowship: 'Adults Men' | 'Adults Women' | 'Youth & Campus' | 'Children';
  membershipStatus: 'Active Member' | 'New Convert' | 'Visitor' | 'Leader';
  dateJoined: string;
  attendanceScore: number;
  notes: string;
}

export interface ChurchBulletin {
  id: string;
  title: string;
  bulletinDate: string;
  theme: string;
  memoryVerse: string;
  orderOfService: { time: string; item: string; leader: string }[];
  announcements: string[];
  weeklyHighlights: string[];
  pastoralGreeting: string;
}

export interface ComputerVisionAnalysis {
  id: string;
  timestamp: string;
  imagePreview: string;
  category: 'Church Bulletin' | 'Event Flyer' | 'Attendance / Congregation' | 'Stage Layout' | 'Street Outreach';
  extractedText: string;
  detectedObjects: { label: string; confidence: number; count?: number }[];
  estimatedAttendance?: number;
  detectedBibleReferences: string[];
  suggestedEvents: {
    title: string;
    date: string;
    location: string;
    speaker?: string;
  }[];
  suggestedSermonThemes: string[];
  humanReviewConfirmed: boolean;
  notes?: string;
}

export interface MediaTrack {
  id: string;
  title: string;
  speakerOrArtist: string;
  type: 'sermon-audio' | 'sermon-video' | 'worship-music' | 'slide-deck';
  duration: string;
  date: string;
  coverImage: string;
  mediaUrl: string;
  category: string;
}

export interface TrustedTheologicalSource {
  id: string;
  title: string;
  author: string;
  category: 'Commentary' | 'Puritan Classic' | 'Holiness Preaching' | 'Dictionary' | 'Historical Creed';
  yearOrEra: string;
  description: string;
  isTrusted: boolean;
  priority: 'High' | 'Standard' | 'Restricted';
}

export interface A2ATaskLog {
  id: string;
  timestamp: string;
  taskType: 'Sermon Generation' | 'Vision-to-Campaign' | 'Bible Study Review' | 'Bulletin Creation';
  inputContext: string;
  ministryBuilderDraft: string;
  visionInput?: string;
  judgeEvaluation: {
    verdict: 'APPROVED' | 'REVISE';
    theologicalSoundnessScore: number; // 0 - 100
    biblicalAccuracyReview: string;
    guardrailCompliance: boolean;
    judgeNotes: string[];
  };
  finalOutputText: string;
}

export interface SyncState {
  isOnline: boolean;
  lastSyncedAt: string;
  pendingChangesCount: number;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  backupVersion?: number;
}

export type FellowshipGroup = 'Adults Men' | 'Adults Women' | 'Youth & Campus' | 'Children';

export interface ChurchMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fellowship: FellowshipGroup;
  role: string;
  joinedDate: string;
  attendanceScore: number;
  activeStatus: boolean;
  encryptedNotes?: string;
  birthDate?: string; // YYYY-MM-DD
  weddingAnniversary?: string; // YYYY-MM-DD
}

export interface CelebrationAlert {
  id: string;
  memberId: string;
  memberName: string;
  fellowship: FellowshipGroup;
  role: string;
  email: string;
  phone: string;
  type: 'Birthday' | 'Wedding Anniversary';
  originalDate: string; // YYYY-MM-DD
  daysUntil: number; // 0 for today, 1 for tomorrow, etc.
  ageOrYears?: number;
  celebrationDateFormatted: string;
  message: string;
  priority: 'today' | 'upcoming';
  acknowledged?: boolean;
}

export type ResourceCategory = 
  | 'Audio & Microphones'
  | 'Visual & Projection'
  | 'Broadcasting & Streaming'
  | 'Musical Instruments'
  | 'Liturgical & Sanctuary'
  | 'Facilities & Seating';

export interface PhysicalEquipment {
  id: string;
  name: string;
  category: ResourceCategory;
  model: string;
  serialNumber: string;
  location: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: 'Optimal' | 'Good' | 'Maintenance Required';
  notes?: string;
  iconName?: string;
}

export interface EquipmentBooking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  operationEventId: string;
  operationEventName: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  quantity: number;
  bookedBy: string;
  status: 'Confirmed' | 'Pending' | 'Returned' | 'Cancelled';
  purposeNotes: string;
  conflictDetected?: boolean;
  conflictDetails?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Urgent' | 'Event' | 'Fellowship';
  content: string;
  priority: 'Standard' | 'High' | 'Emergency';
  author: string;
}

export interface OrderOfServiceItem {
  sequence: number;
  activity: string;
  assignedLeader: string;
  durationMinutes: number;
  notes?: string;
}

export interface MediaResource {
  id: string;
  title: string;
  speaker: string;
  type: string;
  duration: string;
  date: string;
  mediaUrl?: string;
}

export interface TheologicalSource {
  id: string;
  name: string;
  author: string;
  century: string;
  category: string;
  description: string;
  sampleExcerpt: string;
  theologicalWeight: number;
  enabled: boolean;
}

export interface A2AOrchestrationResult {
  jobId: string;
  timestamp: string;
  taskPrompt: string;
  builderDraft: string;
  judgeAudit: {
    theologicalSoundnessScore: number;
    orthodoxyVerdict: 'APPROVED' | 'REVISE';
    scriptureCitationCheck: boolean;
    identifiedHeresies: string[];
    reasoning: string;
    suggestedRefinements?: string[];
  };
  finalPayload: string;
  steps: { stepName: string; status: 'pending' | 'running' | 'success' | 'failed'; details: string }[];
}

export interface BackupSnapshot {
  snapshotId: string;
  tenantId: string;
  timestamp: string;
  checksum: string;
  sizeBytes: number;
  status: string;
}

export interface UserAccount {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isBiometricEnrolled?: boolean;
  lastLoginMethod?: 'google' | 'biometric' | 'anonymous';
  createdAt?: string;
}

export interface ChurchLocationQuery {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'Sanctuary' | 'Outreach' | 'Crusade Grounds' | 'Fellowship Center' | 'Prayer Mountain';
  description?: string;
  phone?: string;
  routeEstimatedTime?: string;
  drivingDistance?: string;
}

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  targetToolId: string;
  badge: string;
  description: string;
  highlights: string[];
  tips?: string;
  iconName?: string;
}

export interface ThinkBibleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    toolId?: string;
    action?: string;
  }[];
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionTierId = 'pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

export interface SubscriptionPlan {
  id: SubscriptionTierId;
  name: string;
  tagline: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  monthlyDisplay: string;
  yearlyDisplay: string;
  isPopular?: boolean;
  features: string[];
  omittedFeatures?: string[];
  limits: {
    members: string;
    aiGenerations: string;
    cloudStorage: string;
    campuses: string;
  };
}

export interface BillingPaymentMethod {
  id: string;
  type: 'card' | 'ach' | 'church_check';
  brand?: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isDefault: boolean;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  formattedAmount: string;
  status: 'paid' | 'pending' | 'failed';
  paymentMethodSummary: string;
  items: {
    description: string;
    amount: number;
  }[];
}

export interface ChurchSubscriptionState {
  id: string;
  tierId: SubscriptionTierId;
  planName: string;
  billingCycle: BillingCycle;
  priceTag: string; // e.g. "$19.99/Monthly" or "$199.99/yearly"
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  billingEmail: string;
  churchTaxExemptId?: string;
  isTaxExempt: boolean;
  paymentMethod: BillingPaymentMethod;
  invoices: BillingInvoice[];
}


