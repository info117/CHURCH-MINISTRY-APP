import { TourStep } from '../types';

export const churchAppTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CHURCH MINISTRY APP',
    subtitle: 'The Unified Ecclesiastical OS for Modern Ministry',
    targetToolId: 'dashboard',
    badge: 'Platform Overview',
    description: 'CHURCH MINISTRY APP brings together cutting-edge AI, real-time cloud data, and orthodox pastoral workflows into a unified, encrypted platform engineered for ministry excellence.',
    highlights: [
      '15+ Specialized Ministry & Pastoral Modules',
      'Computer Vision Sanctuary Seating Analytics & OCR',
      'Real-time Google Cloud Firestore Synchronization',
      'ThinkBible AI Assistant & Theological Guide'
    ],
    tips: 'Use ⌘K (or Ctrl+K) anytime to open the global omni-search, or tap the microphone in the top bar for voice commands.',
    iconName: 'Sparkles'
  },
  {
    id: 'dashboard',
    title: 'Executive Ministry Dashboard',
    subtitle: 'Live Attendance KPIs, Operations & Quick Actions',
    targetToolId: 'dashboard',
    badge: 'Executive Overview',
    description: 'Monitor Sunday attendance growth, weekly service timelines, urgent prayer petitions, financial stewardship, and quick launchpads in one real-time command center.',
    highlights: [
      'Live attendance tracking vs previous Lord\'s Day',
      'Weekly ministerial schedule and liturgy timeline',
      'Direct shortcuts to AI Sermon Builder and Vision OCR',
      'Real-time pastoral prayer wall summary'
    ],
    tips: 'Click on any KPI metric card or quick action to jump straight into that workflow.',
    iconName: 'LayoutDashboard'
  },
  {
    id: 'computervision',
    title: 'Computer Vision Seating Analyzer',
    subtitle: 'Multimodal Crowd Estimation & Media OCR',
    targetToolId: 'computervision',
    badge: 'AI Vision Analysis',
    description: 'Transform sanctuary photos and event flyers into actionable ministry intelligence. Our vision pipeline calculates crowd counts, detects seating density, and extracts event dates via OCR.',
    highlights: [
      'Congregation headcount & seating density % calculation',
      'Sanctuary altar, pulpit, and pew layout identification',
      'OCR flyer extraction to auto-populate events & sermon outlines',
      'Privacy-first anonymous crowd estimation'
    ],
    tips: 'Try the sample sanctuary images or upload your church\'s service photograph to run instant seating analytics.',
    iconName: 'Camera'
  },
  {
    id: 'sermons',
    title: 'Expository Sermon Builder',
    subtitle: 'Homiletic Outlines, Exegesis & Pulpit Manuscripts',
    targetToolId: 'sermons',
    badge: 'Homiletics & Preaching',
    description: 'Craft biblically faithful, expositional sermons. Generate 3-point homiletic outlines, cross-reference historical commentaries, and generate print-ready manuscripts with ease.',
    highlights: [
      '3-point expository outline generator with theological rigor',
      'Historical commentary integration (Spurgeon, Matthew Henry)',
      'Contextual homiletic illustrations and modern applications',
      'One-click export to PDF and pulpit print mode'
    ],
    tips: 'Send scripture references directly from FaithGPT or Computer Vision into the Sermon Builder with a single click.',
    iconName: 'BookOpen'
  },
  {
    id: 'devotionals',
    title: 'Devotionals & Firestore Prayer Requests',
    subtitle: 'Real-time Intercession Wall & Urgency Badges',
    targetToolId: 'devotionals',
    badge: 'Pastoral Care & Prayer',
    description: 'Nurture congregational intercession with daily scripture reflections and a real-time prayer wall. Connected directly to Google Cloud Firestore for instant synchronization across pastoral staff.',
    highlights: [
      'Live prayer petitions with Urgent vs General urgency badges',
      'Active, Answered, and In Prayer status tracking',
      'Real-time Google Cloud Firestore synchronization',
      'Daily devotional reflections and pastoral prayers'
    ],
    tips: 'Mark prayer requests as "Answered" to build a living testimony archive for your congregation.',
    iconName: 'Heart'
  },
  {
    id: 'faithgpt',
    title: 'FaithGPT Theological Research',
    subtitle: 'Orthodox Theological AI Companion',
    targetToolId: 'faithgpt',
    badge: 'Theology & Hermeneutics',
    description: 'Deep-dive into biblical passages, theological queries, and doctrinal questions. FaithGPT synthesizes historical orthodox scholarship, original Hebrew/Greek concepts, and practical ministry applications.',
    highlights: [
      'Strict adherence to historic orthodox Christian theology',
      'Multi-translation comparative scripture analysis (KJV, NASB, NIV, NLT)',
      'Puritan, Reformation, and Holiness commentary references',
      'Direct transfer to Sermon Builder'
    ],
    tips: 'Ask FaithGPT about difficult theological passages or homiletic applications for this Sunday\'s sermon.',
    iconName: 'GraduationCap'
  },
  {
    id: 'operations',
    title: 'Operations & Physical Equipment',
    subtitle: 'Facility Bookings, Inventory & Maintenance',
    targetToolId: 'operations',
    badge: 'Administration & Logistics',
    description: 'Manage physical church assets, soundboards, projectors, and communion trays alongside service operations. Track equipment condition, reservations, and maintenance logs.',
    highlights: [
      'Physical equipment barcode/serial inventory tracking',
      'Team booking and checkout reservation calendar',
      'Facility maintenance workflows and logistics',
      'Budget estimation and financial stewardship tracking'
    ],
    tips: 'Reserve audiovisual equipment before upcoming conferences to prevent scheduling conflicts.',
    iconName: 'Calendar'
  },
  {
    id: 'congregation',
    title: 'Congregation Directory & Celebration Watcher',
    subtitle: 'Flock Directory & Automated Milestone Alerts',
    targetToolId: 'congregation',
    badge: 'Flock Directory',
    description: 'Maintain a secure, searchable directory of your church family. A built-in background watcher cross-references member records to alert pastoral staff of upcoming birthdays and wedding anniversaries.',
    highlights: [
      'Comprehensive member records with fellowship affiliations',
      'Automated recurring celebration watcher with celebratory email/SMS drafts',
      'Attendance score tracking and pastoral follow-up flags',
      'Role-based access control for member privacy'
    ],
    tips: 'Look out for celebration alerts at the top of the dashboard for today\'s milestone celebrations.',
    iconName: 'Users'
  },
  {
    id: 'announcements',
    title: 'Bulletins, Order of Service & Push Alerts',
    subtitle: 'Multi-Channel Communications & Print Layouts',
    targetToolId: 'announcements',
    badge: 'Communications & Bulletins',
    description: 'Create elegant Sunday bulletins, configure structured orders of service, preview print layouts, and dispatch real-time browser push notifications to the congregation.',
    highlights: [
      'Dual-column print-ready Sunday bulletin builder',
      'Liturgy and Order of Service sequence management',
      'Real-time browser push notifications dispatched via FCM service',
      'Priority tagging (Urgent, High, Standard)'
    ],
    tips: 'Click "Print / Export" in the top bar to preview a physical printout of the Sunday bulletin.',
    iconName: 'Megaphone'
  },
  {
    id: 'logos',
    title: 'Logos Corpus & Original Languages',
    subtitle: 'Hebrew & Greek Interlinear Word Studies',
    targetToolId: 'logos',
    badge: 'Original Languages',
    description: 'Equip Bible teachers and pastors with lexical tools. Explore Greek (NT) and Hebrew (OT) vocabulary, Strong\'s concordance numbering, and theological dictionary definitions.',
    highlights: [
      'Interlinear Hebrew and Greek text inspection',
      'Strong\'s concordance reference numbers and morphology',
      'Theological dictionary cross-references',
      'Original language sermon insights'
    ],
    tips: 'Hover over original language words to view grammatical parsing and Strong\'s dictionary definitions.',
    iconName: 'Scroll'
  },
  {
    id: 'a2ajudge',
    title: 'A2A Multi-Agent & Judge Lab',
    subtitle: 'Collaborative AI with Theological Guardrails',
    targetToolId: 'a2ajudge',
    badge: 'Agentic AI Pipeline',
    description: 'Experience collaborative agentic AI. Specialized MinistryBuilder agents draft sermons and study guides, while an uncompromising Judge Agent scores theological orthodoxy and verifies scripture citations.',
    highlights: [
      'Multi-Agent collaboration pipeline (Builder + Judge)',
      'Theological Soundness Score (0-100%)',
      'Automated scripture quote verification against chosen translation',
      'Transparent agent reasoning logs'
    ],
    tips: 'Run the A2A pipeline to watch the Judge Agent audit and refine theological drafts in real-time.',
    iconName: 'Scale'
  },
  {
    id: 'billing',
    title: 'Subscriptions & Billing Center',
    subtitle: 'Transparent Ministry Plans ($19.99/Monthly & $199.99/yearly)',
    targetToolId: 'billing',
    badge: 'Billing & Plans',
    description: 'Manage church subscription plans, recurring billing frequency, 501(c)(3) tax exemptions, and downloadable official ecclesiastical receipts.',
    highlights: [
      'Sanctuary Pro plan: $19.99/Monthly or $199.99/yearly (Save ~17% / 2 Months Free)',
      '501(c)(3) verified tax-exempt ministry invoicing',
      'Manage church credit cards and bank payment methods',
      'Official downloadable and printable billing receipts'
    ],
    tips: 'Easily toggle between Monthly ($19.99) and Yearly ($199.99) to view savings, or update church cardholder details anytime.',
    iconName: 'CreditCard'
  },
  {
    id: 'settings',
    title: 'Settings & Firebase Cloud Sync',
    subtitle: 'Custom Church Branding & Encrypted Firestore Backups',
    targetToolId: 'settings',
    badge: 'Cloud Sync & Settings',
    description: 'Customize your church profile, generate custom ecclesiastical primary color themes, check your live Google Cloud Firestore connection, and export encrypted archives.',
    highlights: [
      'Live Google Cloud Firestore connection monitor',
      'Custom ecclesiastical primary color theme generator',
      'One-click cloud snapshot synchronization',
      'Offline JSON archival download for local backup'
    ],
    tips: 'Try selecting different liturgical color presets or upload your church logo to extract brand colors automatically.',
    iconName: 'Settings'
  },
  {
    id: 'thinkbible',
    title: 'ThinkBible AI Assistant',
    subtitle: 'Your 24/7 Intelligent Ministry Guide',
    targetToolId: 'dashboard',
    badge: 'ThinkBible Assistant',
    description: 'Meet ThinkBible, your dedicated AI Assistant. Available across every screen in the bottom right, ThinkBible explains any feature, guides your ministry preparation, answers biblical queries, and navigates the app for you.',
    highlights: [
      'Instant explanation of all 15 app modules and shortcuts',
      'Direct action buttons that launch tools and views for you',
      'Pastoral advice and sermon preparation assistance',
      'Always accessible via the floating badge or top bar'
    ],
    tips: 'Click the floating ThinkBible button in the bottom right or in the top bar anytime to ask a question or explore a feature!',
    iconName: 'Bot'
  }
];
