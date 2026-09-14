import { SubscriptionPlan, ChurchSubscriptionState } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro',
    name: 'Sanctuary Pro',
    badge: 'Official Ministry Plan',
    tagline: 'Complete ecclesiastical platform equipped with generative AI, vision analytics, and real-time cloud data.',
    priceMonthly: 19.99,
    priceYearly: 199.99,
    monthlyDisplay: '$19.99/Monthly',
    yearlyDisplay: '$199.99/yearly',
    isPopular: true,
    features: [
      'Unlimited Congregation Profiles & Milestone Tracking',
      'AI Expository Sermon Studio & Greek/Hebrew Exegesis',
      'FaithGPT Orthodox AI Companion & RAG Citations',
      'Computer Vision Sanctuary Seating & Pew Density OCR',
      'Real-Time Google Cloud Firestore Multi-Device Sync',
      'Multi-Agent A2A Theological Judge & Audit Lab',
      'Interactive Bulletin Publisher & PDF Export',
      'AV Equipment & Hall Conflict-Free Booking System',
      'Automated Browser Push Notifications & Prayer Alerts',
      'Multi-Role Permissions (Super Admin, Pastors, Leaders, Teachers)',
      'Encrypted Cloud Data Snapshots & 1-Click JSON Backup',
      'Priority Pastoral Tech Support (Email & Chat)'
    ],
    limits: {
      members: 'Unlimited',
      aiGenerations: 'Unlimited High-Speed AI',
      cloudStorage: '25 GB Cloud Storage',
      campuses: 'All Sanctuary Campuses'
    }
  }
];

export const initialChurchSubscription: ChurchSubscriptionState = {
  id: 'sub_grace_cathedral_2026',
  tierId: 'pro',
  planName: 'Sanctuary Pro',
  billingCycle: 'monthly',
  priceTag: '$19.99/Monthly',
  currentPeriodStart: '2026-09-01T00:00:00.000Z',
  currentPeriodEnd: '2026-10-01T00:00:00.000Z',
  status: 'active',
  cancelAtPeriodEnd: false,
  billingEmail: 'info@thinktecai.com',
  churchTaxExemptId: 'EXEMPT-501C3-984321',
  isTaxExempt: true,
  paymentMethod: {
    id: 'pm_card_7714',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2028',
    cardholderName: 'Rev. Dr. David Emmanuel',
    isDefault: true
  },
  invoices: [
    {
      id: 'inv_2026_09',
      invoiceNumber: 'INV-2026-0901',
      date: 'Sep 1, 2026',
      dueDate: 'Sep 1, 2026',
      planName: 'Sanctuary Pro - Monthly Subscription',
      billingCycle: 'monthly',
      amount: 19.99,
      formattedAmount: '$19.99',
      status: 'paid',
      paymentMethodSummary: 'Visa ending in 4242',
      items: [
        {
          description: 'Sanctuary Pro Plan (Monthly Recurring Subscription: Sep 1 - Oct 1, 2026)',
          amount: 19.99
        }
      ]
    },
    {
      id: 'inv_2026_08',
      invoiceNumber: 'INV-2026-0801',
      date: 'Aug 1, 2026',
      dueDate: 'Aug 1, 2026',
      planName: 'Sanctuary Pro - Monthly Subscription',
      billingCycle: 'monthly',
      amount: 19.99,
      formattedAmount: '$19.99',
      status: 'paid',
      paymentMethodSummary: 'Visa ending in 4242',
      items: [
        {
          description: 'Sanctuary Pro Plan (Monthly Recurring Subscription: Aug 1 - Sep 1, 2026)',
          amount: 19.99
        }
      ]
    },
    {
      id: 'inv_2026_07',
      invoiceNumber: 'INV-2026-0701',
      date: 'Jul 1, 2026',
      dueDate: 'Jul 1, 2026',
      planName: 'Sanctuary Pro - Monthly Subscription',
      billingCycle: 'monthly',
      amount: 19.99,
      formattedAmount: '$19.99',
      status: 'paid',
      paymentMethodSummary: 'Visa ending in 4242',
      items: [
        {
          description: 'Sanctuary Pro Plan (Monthly Recurring Subscription: Jul 1 - Aug 1, 2026)',
          amount: 19.99
        }
      ]
    }
  ]
};
