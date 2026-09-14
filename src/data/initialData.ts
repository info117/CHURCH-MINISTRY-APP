import {
  ChurchProfile,
  SidebarTool,
  Sermon,
  BibleStudy,
  Devotional,
  PrayerRequest,
  ChurchOperationEvent,
  WeeklyScheduleItem,
  CongregationMember,
  ChurchBulletin,
  ComputerVisionAnalysis,
  MediaTrack,
  TrustedTheologicalSource,
  A2ATaskLog,
  PhysicalEquipment,
  EquipmentBooking
} from '../types';

export const initialChurchProfile: ChurchProfile = {
  name: 'CHURCH MINISTRY APP',
  appName: 'SanctuaryOS Church Management',
  churchName: 'Grace Cathedral & Global Outreach Ministries',
  ministryName: 'Grace Cathedral & Global Outreach Ministries',
  tagline: 'Equipping the Saints, Preaching the Gospel, Reaching the Nations',
  customPrimaryColor: '#7D3AC1',
  logoUrl: '',
  address: '777 Faith Avenue, Victory Plaza',
  city: 'Dallas',
  state: 'Texas',
  country: 'United States',
  email: 'pastor@gracecathedralministry.org',
  phone: '+1 (800) 555-PRAY',
  secondaryPhone: '+1 (800) 555-HOPE',
  website: 'https://gracecathedralministry.org',
  headPastor: 'Rev. Dr. David Emmanuel',
  serviceTimes: {
    sundayMain: '9:00 AM & 11:30 AM',
    sundayEvening: '6:00 PM Praise & Miracle Service',
    midweekPrayer: 'Wednesday 7:00 PM Prayer Watch',
    bibleStudy: 'Thursday 6:30 PM In-Depth Discipleship'
  },
  preferredTranslation: 'KJV'
};

export const defaultSidebarTools: SidebarTool[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    shortName: 'Dash',
    iconName: 'LayoutDashboard',
    description: 'Overview of ministry metrics, daily verses, and quick actions',
    category: 'core',
    order: 1,
    isFavorite: true
  },
  {
    id: 'sermons',
    name: 'Sermons & Bible Study',
    shortName: 'Sermons',
    iconName: 'BookOpen',
    description: 'Sermon Builder, Bible Study outlines, and Scripture research',
    category: 'ministry',
    order: 2,
    isFavorite: true
  },
  {
    id: 'devotionals',
    name: 'Devotionals & Prayers',
    shortName: 'Prayer',
    iconName: 'HeartHandshake',
    description: 'Daily devotional feed, prayer walls, and trusted leader archives',
    category: 'ministry',
    order: 3,
    isFavorite: true
  },
  {
    id: 'computervision',
    name: 'Computer Vision Lab',
    shortName: 'Vision',
    iconName: 'ScanEye',
    description: 'OCR flyers, crowd attendance counting, entity extraction, sermon triggers',
    category: 'ai',
    order: 4,
    isFavorite: false
  },
  {
    id: 'faithgpt',
    name: 'FaithGPT / BibleGPT',
    shortName: 'Bible AI',
    iconName: 'Sparkles',
    description: 'Theologically guarded AI companion with citations and RAG context',
    category: 'ai',
    order: 5,
    isFavorite: false
  },
  {
    id: 'operations',
    name: 'Church Operations',
    shortName: 'Ops',
    iconName: 'Briefcase',
    description: 'Evangelism, Camp Meetings, Crusades, and Special Missions',
    category: 'operations',
    order: 6,
    isFavorite: false
  },
  {
    id: 'calendar',
    name: 'Schedules & Calendar',
    shortName: 'Calendar',
    iconName: 'CalendarDays',
    description: 'Weekly schedule planner, service timings, and recurring calendar',
    category: 'operations',
    order: 7,
    isFavorite: false
  },
  {
    id: 'maps',
    name: 'Google Maps & Outreach',
    shortName: 'Maps',
    iconName: 'MapPin',
    description: 'Real-time Google Maps geospatial intelligence, directions, and outreach planning',
    category: 'operations',
    order: 8,
    isFavorite: false
  },
  {
    id: 'congregation',
    name: 'Congregation Profiles',
    shortName: 'Members',
    iconName: 'Users',
    description: 'Member records, role-based directory, and secure dispatch',
    category: 'core',
    order: 9,
    isFavorite: false
  },
  {
    id: 'fellowships',
    name: 'Fellowships',
    shortName: 'Groups',
    iconName: 'HeartHandshake',
    description: 'Adults (Men & Women), Youth & Campus, and Children departments',
    category: 'ministry',
    order: 9,
    isFavorite: false
  },
  {
    id: 'announcements',
    name: 'Announcements & Bulletins',
    shortName: 'Bulletins',
    iconName: 'Megaphone',
    description: 'Church bulletin publisher, PDF generator, and push notifications',
    category: 'core',
    order: 10,
    isFavorite: false
  },
  {
    id: 'multimedia',
    name: 'Multimedia Pathways',
    shortName: 'Media',
    iconName: 'Video',
    description: 'Sermon audio player, worship recordings, slides, and media archive',
    category: 'ministry',
    order: 11,
    isFavorite: false
  },
  {
    id: 'logos',
    name: 'Logos Guard-Rail Corpus',
    shortName: 'Corpus',
    iconName: 'Library',
    description: 'Curated Puritan and Holiness commentary library and verification rules',
    category: 'ai',
    order: 12,
    isFavorite: false
  },
  {
    id: 'a2a',
    name: 'A2A & Judge Agent Lab',
    shortName: 'A2A Lab',
    iconName: 'Scale',
    description: 'Multi-agent orchestration, theological audits, and self-maintenance',
    category: 'ai',
    order: 13,
    isFavorite: false
  },
  {
    id: 'resources',
    name: 'Resource & Equipment Booking',
    shortName: 'Resources',
    iconName: 'Package',
    description: 'Book physical microphones, projectors, and equipment with conflict detection',
    category: 'operations',
    order: 14,
    isFavorite: true
  },
  {
    id: 'billing',
    name: 'Subscriptions & Billing',
    shortName: 'Billing',
    iconName: 'CreditCard',
    description: 'Manage church subscription plans ($19.99/Monthly & $199.99/yearly), invoices & 501(c)(3) tax exemption',
    category: 'admin',
    order: 15,
    isFavorite: true
  },
  {
    id: 'settings',
    name: 'Settings & Customization',
    shortName: 'Settings',
    iconName: 'Settings',
    description: 'White-labeling, cloud backup, offline storage, and tenant profile',
    category: 'admin',
    order: 16,
    isFavorite: false
  }
];

export const sampleSermons: Sermon[] = [
  {
    id: 'sermon-1',
    title: 'Walking in Supernatural Holiness and Power',
    theme: 'Consecration and Kingdom Authority',
    mainScripture: '1 Peter 1:15-16',
    supportingTexts: ['Hebrews 12:14', 'Leviticus 20:7', 'Romans 12:1-2'],
    bibleVersion: 'KJV',
    date: '2026-09-06',
    speaker: 'Rev. Dr. David Emmanuel',
    introduction: 'In a world of moral ambiguity, the call of God remains immutable and crystalline: "Be ye holy, for I am holy." Holiness is not legalistic constraint; it is intimate likeness to the character of our Sovereign King.',
    mainPoints: [
      {
        title: 'The Divine Command of Consecration',
        subpoints: [
          'Separation from worldly patterns to God',
          'A renewed mind in Christ Jesus',
          'God supplies the grace for what He commands'
        ],
        scriptureRef: '1 Peter 1:15-16'
      },
      {
        title: 'The Vessel Prepared for the Master’s Use',
        subpoints: [
          'Cleansing from dishonorable things (2 Tim 2:21)',
          'The refining fire of the Holy Spirit',
          'Holiness produces authentic spiritual boldness'
        ],
        scriptureRef: '2 Timothy 2:20-22'
      },
      {
        title: 'Power Follows Purity',
        subpoints: [
          'Why compromised altars lose fire',
          'Elijah repairing the broken altar of God',
          'Signs, wonders, and righteous fruits in this generation'
        ],
        scriptureRef: 'Acts 1:8'
      }
    ],
    illustrations: [
      'The ancient silversmith who held silver over the fire until he could see his own reflection.',
      'The electrical insulator: clean copper conductors transmit high voltage without short-circuiting.'
    ],
    applications: [
      'Audit your thought life and media diet this week.',
      'Establish a 30-minute uninterrupted morning secret-place prayer altar.',
      'Forgive any harboring bitterness and present yourself fresh to God.'
    ],
    conclusion: 'When the Church walks in holiness, heaven backs her decrees with unwavering power. Step out today as a sanctified ambassador of Jesus Christ.',
    prayer: 'Heavenly Father, purify our hearts with hyssop and wash us white as snow. Set us ablaze with holy passion for Your glory.',
    notes: 'Preached to 840 congregants. 24 responded to the altar call for rededication.',
    tags: ['Holiness', 'Consecration', 'Spiritual Power', 'Discipleship']
  },
  {
    id: 'sermon-2',
    title: 'The Mountain-Moving Power of Unwavering Faith',
    theme: 'Trusting God Beyond Sight',
    mainScripture: 'Mark 11:22-24',
    supportingTexts: ['Hebrews 11:1', 'Romans 10:17', 'James 1:6-8'],
    bibleVersion: 'NASB',
    date: '2026-08-30',
    speaker: 'Pastor Grace Emmanuel',
    introduction: 'Faith is not a wishful thought cast into an empty sky; faith is a firm title deed granted by the living Word of Almighty God.',
    mainPoints: [
      {
        title: 'Having the Faith of God',
        subpoints: [
          'Looking at the Promise, not the obstacle',
          'Speaking to obstacles with spiritual authority'
        ],
        scriptureRef: 'Mark 11:22'
      },
      {
        title: 'Removing Doubt From the Heart',
        subpoints: [
          'The difference between intellectual assent and deep heart conviction',
          'Feeding on the Word of God daily'
        ],
        scriptureRef: 'Romans 10:17'
      }
    ],
    illustrations: [
      'George Müller feeding hundreds of orphans solely on prayer without asking men for money.'
    ],
    applications: [
      'Take that specific impossibility in your family or health and pray Mark 11:24 over it daily.'
    ],
    conclusion: 'Mountains will dissolve when aligned with the sovereignty of Christ.',
    prayer: 'Lord, strengthen our faith. We believe, help our unbelief!',
    notes: 'Excellent feedback from youth fellowship.',
    tags: ['Faith', 'Miracles', 'Prayer']
  }
];

export const sampleBibleStudies: BibleStudy[] = [
  {
    id: 'study-1',
    title: 'The Fruit of the Spirit in Practical Christian Character',
    scripture: 'Galatians 5:22-26',
    bibleVersion: 'KJV',
    objective: 'To understand the singular manifestation of Christlike love expressed through nine divine virtues in everyday living.',
    background: 'Paul writes to the Galatian believers to counteract the trap of legalism on one hand and carnal license on the other.',
    keyObservations: [
      'Fruit is singular in Greek (karpos), demonstrating unity of character.',
      'Fruit grows naturally on a healthy branch connected to the true Vine (John 15).',
      'The contrast between fleshly works (plural, chaotic) and spiritual fruit (singular, harmonious).'
    ],
    interpretation: 'The Fruit of the Spirit is the supernatural reproduction of Jesus Christ’s personality within the believer by the Holy Spirit.',
    discussionQuestions: [
      'Which of the nine aspects of the fruit is currently challenged most in your workplace or family?',
      'How does abiding in Christ differ from merely striving to be patient in human willpower?',
      'In what ways does longsuffering reveal the holiness of God to non-believers?'
    ],
    crossReferences: ['John 15:1-8', 'Colossians 3:12-14', '2 Peter 1:5-8'],
    prayerPoints: [
      'Grace to prune out fruitless branches of malice or impatience.',
      'A fresh outpouring of the Holy Spirit to produce divine peace in trials.'
    ],
    targetFellowship: 'Adults & Youths Fellowship'
  },
  {
    id: 'study-2',
    title: 'The Whole Armor of God: Standing Unshakable',
    scripture: 'Ephesians 6:10-18',
    bibleVersion: 'NIV',
    objective: 'Equipping believers to recognize spiritual warfare and wield the offensive and defensive armor of God.',
    background: 'Paul wrote this epistle while chained to a Roman legionnaire in prison.',
    keyObservations: [
      'We wrestle not against flesh and blood.',
      'The belt of truth anchors all other armor pieces.',
      'The sword of the Spirit is the spoken Rhema word of God.'
    ],
    interpretation: 'Victory is already won at Calvary; the believer’s calling is to "stand" in that finished work.',
    discussionQuestions: [
      'How can we detect when an attack is spiritual rather than just human interpersonal friction?',
      'How do we effectively take up the shield of faith when fiery darts of anxiety strike?'
    ],
    crossReferences: ['2 Corinthians 10:3-5', 'James 4:7', '1 Peter 5:8-9'],
    prayerPoints: [
      'Praying for church leaders against deceptive schemes of darkness.',
      'Cloaking our youth in the breastplate of righteousness.'
    ],
    targetFellowship: 'Campus & Youth Fellowship'
  }
];

export const sampleDevotionals: Devotional[] = [
  {
    id: 'dev-1',
    title: 'Quiet Waters in the Middle of the Storm',
    date: '2026-09-09',
    scriptureRef: 'Psalm 23:1-3',
    scriptureText: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul...',
    bibleVersion: 'KJV',
    reflection: 'Notice where the Shepherd leads. He does not take us to rushing, tumultuous rapids that frighten the sheep; He leads us beside still, peaceful waters. Even when your calendar is demanding and anxieties roar, the Good Shepherd invites your spirit into celestial calm today.',
    application: 'Before starting your next meeting, pause for 3 minutes. Close your eyes, breathe deeply, and surrender every heavy burden to the Great Shepherd.',
    prayer: 'Lord Jesus, You are my Shepherd. I release all striving, worry, and fear into Your gentle, almighty hands. Restore my soul today. Amen.',
    author: 'Rev. Dr. David Emmanuel'
  },
  {
    id: 'dev-2',
    title: 'Streams in the Desert',
    date: '2026-09-08',
    scriptureRef: 'Isaiah 43:19',
    scriptureText: 'Behold, I will do a new thing; now it shall spring forth; shall ye not know it? I will even make a way in the wilderness, and rivers in the desert.',
    bibleVersion: 'KJV',
    reflection: 'God specializes in barren landscapes. When human reasoning sees dead ends, divine sovereignty creates highways of deliverance.',
    application: 'Write down the one circumstance that appears most barren in your life right now, and declare Isaiah 43:19 over it with thanksgiving.',
    prayer: 'Father, let living waters burst forth in my desert. I trust Your timing and Your power.',
    author: 'Pastor Grace Emmanuel'
  }
];

export const samplePrayerRequests: PrayerRequest[] = [
  {
    id: 'pr-1',
    title: 'Complete Healing for Sister Sarah (Oncology Recovery)',
    requester: 'Elder Thomas Vance',
    date: '2026-09-07',
    category: 'Healing',
    description: 'Sister Sarah is undergoing post-operative tests this Thursday. Praying for total remission and divine strength for her family.',
    status: 'Urgent',
    urgencyLevel: 'Critical',
    isPrivate: false,
    suggestedPoints: [
      'Decree Jeremiah 30:17 (I will restore health unto thee).',
      'Peace that surpasses all understanding for her children.',
      'Supernatural stamina for the medical care team.'
    ]
  },
  {
    id: 'pr-2',
    title: 'Harvest of Souls at the City-Wide Fall Crusade',
    requester: 'Evangelism Director Mark O.',
    date: '2026-09-05',
    category: 'Church Growth',
    description: 'Upcoming 3-day outdoor crusade at Central Community Park. Praying for 500+ unchurched souls to be convicted by the Holy Spirit.',
    status: 'Active',
    urgencyLevel: 'Urgent',
    isPrivate: false,
    suggestedPoints: [
      'Unfettered weather and favorable logistics.',
      'Spiritual blindness broken over our metro neighborhood.',
      'Boldness and love in every street outreach worker.'
    ]
  },
  {
    id: 'pr-3',
    title: 'Youth Campus Revival at State University',
    requester: 'Brother Joshua (Campus Leader)',
    date: '2026-09-03',
    category: 'Salvation',
    description: 'Weekly dorm Bible study has grown from 8 students to 42. Praying for discipleship mentors and true holiness on campus.',
    status: 'Answered',
    urgencyLevel: 'General',
    isPrivate: false,
    suggestedPoints: [
      'Preservation from youthful temptations.',
      'Fire for evangelism in student dining halls.'
    ]
  },
  {
    id: 'pr-4',
    title: 'Emergency ICU Surgery & Divine Protection for Deacon Michael',
    requester: 'Pastor Grace Emmanuel',
    date: '2026-09-11',
    category: 'Healing',
    description: 'Deacon Michael was admitted for emergency cardiac procedure. The church family stands in faith for zero complications.',
    status: 'Active',
    urgencyLevel: 'Critical',
    isPrivate: false,
    suggestedPoints: [
      'Psalm 91:1-3 covering the operating theater.',
      'Precision and guidance for the surgical specialists.'
    ]
  },
  {
    id: 'pr-5',
    title: 'Provision for Sanctuary Youth Bus & Missions Outreach',
    requester: 'Minister Caleb (Youth Directorate)',
    date: '2026-08-28',
    category: 'Missions',
    description: 'Believing God for financial breakthrough to replace the campus outreach transport vehicle before winter.',
    status: 'Active',
    urgencyLevel: 'General',
    isPrivate: false,
    suggestedPoints: [
      'Philippians 4:19 Jehovah Jireh provision.',
      'Kingdom partners and willing givers.'
    ]
  }
];

export const sampleOperations: ChurchOperationEvent[] = [
  {
    id: 'op-apr',
    name: 'Easter Resurrection Harvest Crusade',
    type: 'Crusade',
    startDate: '2026-04-12',
    endDate: '2026-04-14',
    time: '6:00 PM Nightly',
    location: 'Memorial Civic Stadium & Grounds',
    speaker: 'Rev. Dr. David Emmanuel',
    leadMinistryTeam: 'Global Evangelism & Crusade Unit',
    estimatedBudget: 14000,
    expectedAttendance: 1200,
    actualAttendance: 1380,
    notes: 'Massive soul harvest and overflow seating required.',
    status: 'Completed'
  },
  {
    id: 'op-may',
    name: 'Pentecost Power Outpouring & Prayer Rally',
    type: 'Special Program',
    startDate: '2026-05-24',
    endDate: '2026-05-25',
    time: '7:00 PM',
    location: 'Main Sanctuary & Overflow Pavilions',
    speaker: 'Guest Bishop Samuel Adams',
    leadMinistryTeam: 'Intercessory Prayer Band',
    estimatedBudget: 6500,
    expectedAttendance: 850,
    actualAttendance: 920,
    notes: 'All-night prayer vigil with 24 baptisms recorded.',
    status: 'Completed'
  },
  {
    id: 'op-jun',
    name: 'Mid-Year Community Health & Food Outreach',
    type: 'Evangelism',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    time: '9:00 AM - 4:00 PM',
    location: 'East District Community Plaza',
    speaker: 'Deacon Philip & Medical Guild',
    leadMinistryTeam: 'Compassion & Mercy Ministry',
    estimatedBudget: 4200,
    expectedAttendance: 500,
    actualAttendance: 480,
    notes: 'Served 600 meals and provided 120 blood pressure checks.',
    status: 'Completed'
  },
  {
    id: 'op-jul',
    name: 'Youth & Campus Summer Awakening Conference',
    type: 'Conference',
    startDate: '2026-07-17',
    endDate: '2026-07-19',
    time: 'All Day Sessions',
    location: 'Mount Zion Pine Grove Retreat Center',
    speaker: 'Youth Pastor Timothy & Team',
    leadMinistryTeam: 'Campus Fellowship Directorate',
    estimatedBudget: 11000,
    expectedAttendance: 700,
    actualAttendance: 840,
    notes: 'Record student attendance from 6 regional universities.',
    status: 'Completed'
  },
  {
    id: 'op-aug',
    name: 'Kingdom Authority & Divine Healing Assembly',
    type: 'Crusade',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    time: '6:30 PM Nightly',
    location: 'Northside Arena Convention Hall',
    speaker: 'Rev. Dr. David Emmanuel',
    leadMinistryTeam: 'Sanctuary Ushers & Media Department',
    estimatedBudget: 18500,
    expectedAttendance: 1400,
    actualAttendance: 1520,
    notes: 'Miracle testimonies and live stream viewer surge.',
    status: 'Completed'
  },
  {
    id: 'op-3',
    name: 'Inner-City Bread of Life Feeding & Street Outreach',
    type: 'Evangelism',
    startDate: '2026-09-19',
    endDate: '2026-09-19',
    time: '10:00 AM - 3:00 PM',
    location: 'Downtown Community Shelter Grounds',
    speaker: 'Deacon Philip & Evangelism Team A',
    leadMinistryTeam: 'Compassion & Mercy Ministry',
    estimatedBudget: 3200,
    expectedAttendance: 400,
    actualAttendance: 450,
    notes: 'Preparing 500 hot meal packages and gospel tract packs in 3 languages.',
    status: 'Active'
  },
  {
    id: 'op-1',
    name: 'Metropolitan Great Harvest Crusade & Health Fair',
    type: 'Crusade',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    time: '6:30 PM Nightly',
    location: 'Central Metro Amphitheater, North Gate',
    speaker: 'Rev. Dr. David Emmanuel & Guest Evangelist J. Wesley',
    leadMinistryTeam: 'Global Evangelism & Medical Outreach Guild',
    estimatedBudget: 12500,
    expectedAttendance: 1500,
    actualAttendance: 1650,
    notes: 'Mobile sound stage reserved. Free eye exam clinics during afternoon hours.',
    status: 'Active',
    flyerImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230B1F4D"/><circle cx="300" cy="180" r="140" fill="%237D3AC1" opacity="0.4"/><path d="M300 40 L300 320 M200 120 L400 120" stroke="%23D4AF37" stroke-width="12" stroke-linecap="round"/><text x="300" y="345" font-family="Cinzel, serif" font-size="28" fill="%23FFFFFF" text-anchor="middle" font-weight="bold">METROPOLITAN CRUSADE 2026</text><text x="300" y="380" font-family="sans-serif" font-size="16" fill="%23D4AF37" text-anchor="middle">OCTOBER 16-18 | POWER & SALVATION</text></svg>'
  },
  {
    id: 'op-2',
    name: 'Annual Holy Ghost Camp Meeting: Higher Heights',
    type: 'Camp Meeting',
    startDate: '2026-11-20',
    endDate: '2026-11-24',
    time: 'All Day Sessions',
    location: 'Mount Zion Pine Grove Retreat Center',
    speaker: 'Elders Council & Bishop Samuel Adams',
    leadMinistryTeam: 'Events & Hospitality Directorate',
    estimatedBudget: 28000,
    expectedAttendance: 850,
    actualAttendance: 900,
    notes: 'Cabin lodging for 600 registered; overflow RV sites secured. Youth camp concurrent track.',
    status: 'Planning'
  }
];

export const sampleWeeklySchedule: WeeklyScheduleItem[] = [
  {
    id: 'ws-1',
    dayOfWeek: 'Sunday',
    time: '09:00 AM - 10:45 AM',
    title: 'First Glory Service & Sunday School',
    category: 'Sunday Service',
    location: 'Main Sanctuary',
    speakerOrLeader: 'Rev. Dr. David Emmanuel',
    color: '#0B1F4D'
  },
  {
    id: 'ws-2',
    dayOfWeek: 'Sunday',
    time: '11:30 AM - 01:15 PM',
    title: 'Celebration of Miracles & Second Service',
    category: 'Sunday Service',
    location: 'Main Sanctuary & Livestream',
    speakerOrLeader: 'Rev. Dr. David Emmanuel',
    color: '#7D3AC1'
  },
  {
    id: 'ws-3',
    dayOfWeek: 'Tuesday',
    time: '06:00 PM - 07:30 PM',
    title: 'Choir & Worship Band Rehearsal',
    category: 'Choir Rehearsal',
    location: 'Choir Loft & Audio Studio',
    speakerOrLeader: 'Minister Caleb (Worship Director)',
    color: '#0284C7'
  },
  {
    id: 'ws-4',
    dayOfWeek: 'Wednesday',
    time: '07:00 PM - 08:30 PM',
    title: 'Midweek Believers Prayer Vigil',
    category: 'Prayer Meeting',
    location: 'Sanctuary & Zoom Prayer Room',
    speakerOrLeader: 'Elder Jonathan Edwards',
    color: '#D4AF37'
  },
  {
    id: 'ws-5',
    dayOfWeek: 'Thursday',
    time: '06:30 PM - 08:00 PM',
    title: 'Systematic Expository Bible Study',
    category: 'Bible Study',
    location: 'Fellowship Hall & Online Stream',
    speakerOrLeader: 'Pastor Grace Emmanuel',
    color: '#9333EA'
  },
  {
    id: 'ws-6',
    dayOfWeek: 'Friday',
    time: '07:00 PM - 09:30 PM',
    title: 'Ignite Youth & Campus Fire Night',
    category: 'Youth Fellowship',
    location: 'Youth Auditorium B',
    speakerOrLeader: 'Youth Pastor Daniel Cole',
    color: '#EA580C'
  },
  {
    id: 'ws-7',
    dayOfWeek: 'Saturday',
    time: '10:00 AM - 12:30 PM',
    title: 'Neighborhood Door-to-Door Evangelism',
    category: 'Evangelism',
    location: 'East District Mission Hub',
    speakerOrLeader: 'Evangelist Mark O.',
    color: '#16A34A'
  }
];

export const sampleCongregation: CongregationMember[] = [
  {
    id: 'mem-1',
    fullName: 'Elder Thomas Vance',
    email: 'thomas.vance@churchmail.org',
    phone: '+1 (214) 555-0192',
    address: '421 Pine Hill Rd, Dallas, TX',
    fellowship: 'Adults Men',
    membershipStatus: 'Leader',
    dateJoined: '2018-04-12',
    attendanceScore: 98,
    notes: 'Head of Board of Elders. Counselor for men fellowship.'
  },
  {
    id: 'mem-2',
    fullName: 'Sister Ruth Campbell',
    email: 'ruth.campbell@faithpost.net',
    phone: '+1 (214) 555-4819',
    address: '108 Cedar Valley Way, Dallas, TX',
    fellowship: 'Adults Women',
    membershipStatus: 'Active Member',
    dateJoined: '2020-01-19',
    attendanceScore: 94,
    notes: 'Welfare department coordinator. Organizes hospital visits.'
  },
  {
    id: 'mem-3',
    fullName: 'Brother Joshua Adeleke',
    email: 'joshua.adeleke@university.edu',
    phone: '+1 (214) 555-7362',
    address: 'Campus West Hall #402, Dallas, TX',
    fellowship: 'Youth & Campus',
    membershipStatus: 'Leader',
    dateJoined: '2022-09-01',
    attendanceScore: 96,
    notes: 'President of University Christian Campus Fellowship.'
  },
  {
    id: 'mem-4',
    fullName: 'Sister Lydia Martin',
    email: 'lydia.martin@gmail.com',
    phone: '+1 (214) 555-3211',
    address: '89 Willow Creek Lane, Dallas, TX',
    fellowship: 'Children',
    membershipStatus: 'Active Member',
    dateJoined: '2021-06-15',
    attendanceScore: 91,
    notes: 'Sunday School Teacher for ages 7-10. Certified in child safety.'
  },
  {
    id: 'mem-5',
    fullName: 'Brother Samuel Hernandez',
    email: 'samuel.h@innovative.io',
    phone: '+1 (214) 555-9081',
    address: '3304 Meadowbrook Dr, Dallas, TX',
    fellowship: 'Adults Men',
    membershipStatus: 'New Convert',
    dateJoined: '2026-07-14',
    attendanceScore: 88,
    notes: 'Accepted Christ at the July Evangelism Outreach. Currently in Discipleship 101.'
  }
];

export const sampleBulletins: ChurchBulletin[] = [
  {
    id: 'bul-1',
    title: 'Sunday Victory Bulletin - Week 37',
    bulletinDate: '2026-09-13',
    theme: 'Walking in Supernatural Authority',
    memoryVerse: '1 John 4:4 - "Ye are of God, little children, and have overcome them: because greater is he that is in you, than he that is in the world."',
    orderOfService: [
      { time: '09:00 AM', item: 'Opening Prayer & Hymn of Worship', leader: 'Elder Thomas Vance' },
      { time: '09:15 AM', item: 'Praise & High Adoration', leader: 'Grace Sanctuary Choir' },
      { time: '09:40 AM', item: 'Announcements & Welcome of First-Time Guests', leader: 'Deaconess Mary' },
      { time: '09:55 AM', item: 'Tithes, Kingdom Sacrifices & Special Ministry Offering', leader: 'Pastor Grace' },
      { time: '10:10 AM', item: 'The Ministry of the Spoken Word', leader: 'Rev. Dr. David Emmanuel' },
      { time: '10:45 AM', item: 'Altar Call, Ministry to the Sick & Benediction', leader: 'Pastoral Council' }
    ],
    announcements: [
      'Water Baptismal Service will hold next Saturday at 8:00 AM. Candidates should meet Elder Thomas after service.',
      'Annual Men’s Leadership Breakfast holds this Saturday at 8:30 AM in the Fellowship Hall.',
      'FaithGPT & Computer Vision workshops for youth media volunteers begins this Tuesday evening.'
    ],
    weeklyHighlights: [
      'Over 40 students attended our Campus Revival night this past Friday.',
      'Thank you for your donations: 350 emergency care packages were delivered to local homeless families.'
    ],
    pastoralGreeting: 'Dear Beloved Flock, as you embark on this glorious new week, remember that no weapon formed against you shall prosper. Walk in peace, speak with grace, and remain anchored in the Holy Scriptures.'
  }
];

export const sampleVisionAnalyses: ComputerVisionAnalysis[] = [
  {
    id: 'cv-sample-1',
    timestamp: '2026-09-08T16:20:00Z',
    imagePreview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230B1F4D"/><rect x="20" y="20" width="360" height="260" rx="12" fill="%237D3AC1" fill-opacity="0.3" stroke="%23D4AF37" stroke-width="2"/><text x="200" y="70" font-family="Cinzel, serif" font-size="20" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">ANNUAL REVIVAL SUMMIT</text><text x="200" y="105" font-family="sans-serif" font-size="14" fill="%23D4AF37" text-anchor="middle">THEME: REPAIRING THE ALTAR</text><text x="200" y="145" font-family="sans-serif" font-size="13" fill="%23E2E8F0" text-anchor="middle">DATE: OCTOBER 22 - 25, 2026</text><text x="200" y="175" font-family="sans-serif" font-size="13" fill="%23E2E8F0" text-anchor="middle">KEY SCRIPTURE: 1 KINGS 18:30</text><text x="200" y="210" font-family="sans-serif" font-size="13" fill="%23FFFFFF" text-anchor="middle">GUEST SPEAKER: DR. ENOCH ADE</text><text x="200" y="245" font-family="sans-serif" font-size="11" fill="%2394A3B8" text-anchor="middle">FREE REGISTRATION @ GRACECHURCH.ORG</text></svg>',
    category: 'Event Flyer',
    extractedText: 'ANNUAL REVIVAL SUMMIT\nTHEME: REPAIRING THE ALTAR\nDATE: OCTOBER 22 - 25, 2026\nKEY SCRIPTURE: 1 KINGS 18:30\nGUEST SPEAKER: DR. ENOCH ADE\nFREE REGISTRATION @ GRACECHURCH.ORG',
    detectedObjects: [
      { label: 'Church Altar Visual', confidence: 0.98 },
      { label: 'Sacred Cross Symbol', confidence: 0.95 },
      { label: 'Typography / Text Layout', confidence: 0.99 },
      { label: 'QR Code / Website URL', confidence: 0.92 }
    ],
    detectedBibleReferences: ['1 Kings 18:30', 'Leviticus 6:13', 'Romans 12:1'],
    suggestedEvents: [
      {
        title: 'Annual Revival Summit: Repairing the Altar',
        date: '2026-10-22 to 2026-10-25',
        location: 'Grace Cathedral Main Sanctuary',
        speaker: 'Dr. Enoch Ade'
      }
    ],
    suggestedSermonThemes: [
      'The Uncompromising Fire of Elijah',
      'Restoring Broken Family Altars',
      'Holiness Before Manifestation'
    ],
    humanReviewConfirmed: true,
    notes: 'Extracted automatically via Multimodal Vision Agent. Confirmed by church office.'
  },
  {
    id: 'cv-sample-2',
    timestamp: '2026-09-06T11:45:00Z',
    imagePreview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23071430"/><circle cx="100" cy="120" r="16" fill="%23D4AF37"/><circle cx="150" cy="115" r="16" fill="%23D4AF37"/><circle cx="200" cy="122" r="16" fill="%23D4AF37"/><circle cx="250" cy="118" r="16" fill="%23D4AF37"/><circle cx="300" cy="125" r="16" fill="%23D4AF37"/><circle cx="80" cy="180" r="18" fill="%239333EA"/><circle cx="140" cy="175" r="18" fill="%239333EA"/><circle cx="200" cy="182" r="18" fill="%239333EA"/><circle cx="260" cy="178" r="18" fill="%239333EA"/><circle cx="320" cy="185" r="18" fill="%239333EA"/><circle cx="110" cy="240" r="20" fill="%2338BDF8"/><circle cx="180" cy="235" r="20" fill="%2338BDF8"/><circle cx="250" cy="242" r="20" fill="%2338BDF8"/><circle cx="310" cy="238" r="20" fill="%2338BDF8"/><text x="200" y="45" font-family="Cinzel, serif" font-size="18" fill="%23FFFFFF" text-anchor="middle">SANCTUARY CONGREGATION ANALYSIS</text><text x="200" y="285" font-family="sans-serif" font-size="12" fill="%23D4AF37" text-anchor="middle">AUTOMATED PEW COUNT: ~780 PERSONS (93% CAPACITY)</text></svg>',
    category: 'Attendance / Congregation',
    extractedText: 'SANCTUARY CONGREGATION CAMERA FEED\nROW DENSITY: 93% CAPACITY\nTOTAL DETECTED HEADS: 780 SEATED',
    detectedObjects: [
      { label: 'Person / Seated Congregants', confidence: 0.94, count: 780 },
      { label: 'Sanctuary Pews', confidence: 0.97, count: 48 },
      { label: 'Pulpit / Stage Area', confidence: 0.99 }
    ],
    estimatedAttendance: 780,
    detectedBibleReferences: ['Psalm 122:1', 'Hebrews 10:25'],
    suggestedEvents: [],
    suggestedSermonThemes: [
      'The Joy of Assembly: Psalm 122:1',
      'The United Body in One Accord: Acts 2:1'
    ],
    humanReviewConfirmed: true,
    notes: 'Attendance estimate logged for Sunday 11:30 AM Service.'
  }
];

export const sampleMediaTracks: MediaTrack[] = [
  {
    id: 'media-1',
    title: 'The Unshakable Kingdom of God (Sunday Sermon)',
    speakerOrArtist: 'Rev. Dr. David Emmanuel',
    type: 'sermon-audio',
    duration: '48:15',
    date: '2026-09-06',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&auto=format&fit=crop&q=60',
    mediaUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    category: 'Sunday Ministry'
  },
  {
    id: 'media-2',
    title: 'Holy, Holy, Holy (Lord God Almighty) - Live Worship',
    speakerOrArtist: 'Grace Sanctuary Choir & Orchestra',
    type: 'worship-music',
    duration: '07:42',
    date: '2026-09-06',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    mediaUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_32c86b2b73.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    category: 'Worship Anthem'
  },
  {
    id: 'media-3',
    title: 'Systematic Theology: The Doctrine of Justification',
    speakerOrArtist: 'Pastor Grace Emmanuel',
    type: 'sermon-video',
    duration: '54:30',
    date: '2026-09-03',
    coverImage: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&auto=format&fit=crop&q=60',
    mediaUrl: '#',
    category: 'Bible Study Video'
  }
];

export const sampleTheologicalSources: TrustedTheologicalSource[] = [
  {
    id: 'src-1',
    title: 'Matthew Henry’s Complete Commentary on the Whole Bible',
    author: 'Matthew Henry (1662–1714)',
    category: 'Commentary',
    yearOrEra: '1706 (Historical Classic)',
    description: 'Expository, devotional, and doctrinally sound exposition of Scripture. Esteemed for heart application and reverent Christ-centered insights.',
    isTrusted: true,
    priority: 'High'
  },
  {
    id: 'src-2',
    title: 'The Treasury of David (Psalms Exposition)',
    author: 'Charles H. Spurgeon',
    category: 'Puritan Classic',
    yearOrEra: '1885',
    description: 'Spurgeon’s magnum opus on the book of Psalms featuring his own reflections alongside extensive quotations from classic Puritan divines.',
    isTrusted: true,
    priority: 'High'
  },
  {
    id: 'src-3',
    title: 'Plain Account of Christian Perfection & Holiness Sermons',
    author: 'John Wesley',
    category: 'Holiness Preaching',
    yearOrEra: '1766',
    description: 'Biblical foundation for sanctification, wholehearted love of God, and victory over deliberate sin through the indwelling Holy Spirit.',
    isTrusted: true,
    priority: 'High'
  },
  {
    id: 'src-4',
    title: 'Strong’s Exhaustive Concordance of the Bible',
    author: 'Dr. James Strong',
    category: 'Dictionary',
    yearOrEra: '1890',
    description: 'Hebrew and Greek Lexicon linking every word in the King James Version to the original biblical manuscripts.',
    isTrusted: true,
    priority: 'High'
  },
  {
    id: 'src-5',
    title: 'The Knowledge of the Holy',
    author: 'A.W. Tozer',
    category: 'Holiness Preaching',
    yearOrEra: '1961',
    description: 'Profound study of the attributes of God and their transforming reality for personal devotion and church ministry.',
    isTrusted: true,
    priority: 'High'
  },
  {
    id: 'src-6',
    title: 'Easton’s Bible Dictionary',
    author: 'M.G. Easton, M.A., D.D.',
    category: 'Dictionary',
    yearOrEra: '1897',
    description: 'Comprehensive historical, archaeological, and doctrinal dictionary of Biblical terms, customs, and geography.',
    isTrusted: true,
    priority: 'Standard'
  }
];

export const sampleA2ALogs: A2ATaskLog[] = [
  {
    id: 'task-log-1',
    timestamp: '2026-09-08T14:10:00Z',
    taskType: 'Sermon Generation',
    inputContext: 'Topic: The Uncompromising Altar of Elijah (1 Kings 18). Selected translation: KJV. Focus: Restoring true worship, turning hearts back to God.',
    ministryBuilderDraft: 'Title: Repairing the Broken Altar\nText: 1 Kings 18:30-39\nPoints: 1. The Desolation of False Gods 2. The Twelve Stones of Covenant Unity 3. The Consuming Fire of Jehovah',
    judgeEvaluation: {
      verdict: 'APPROVED',
      theologicalSoundnessScore: 99,
      biblicalAccuracyReview: 'All citations verified against 1 Kings 18 (KJV). Exegesis harmonizes with Matthew Henry commentary and historical orthodox theology. No speculative doctrine detected.',
      guardrailCompliance: true,
      judgeNotes: [
        'Scripture quotes match KJV 100% precision.',
        'Distinction between historic narrative and pastoral application is clear.',
        'Puritan holiness themes honored.'
      ]
    },
    finalOutputText: 'Sermon Outline verified and published to Sermon Builder with full safety certificate.'
  },
  {
    id: 'task-log-2',
    timestamp: '2026-09-07T18:25:00Z',
    taskType: 'Vision-to-Campaign',
    inputContext: 'Youth camp banner uploaded via Computer Vision. OCR text extracted: "Youth Fire Summit 2026, 2 Chron 7:14".',
    visionInput: 'Extracted title: Youth Fire Summit. Date: Nov 12-14. Speaker: Youth Pastor Daniel.',
    ministryBuilderDraft: 'Auto-generating 3-day youth revival campaign schedule and daily prayer bulletin.',
    judgeEvaluation: {
      verdict: 'APPROVED',
      theologicalSoundnessScore: 97,
      biblicalAccuracyReview: '2 Chronicles 7:14 properly contextualized within Solomon\'s temple dedication, applied with humility and repentance for modern youth.',
      guardrailCompliance: true,
      judgeNotes: [
        'Confirmed human review checkbox before saving to Church Operations.',
        'Appropriate for youth fellowship category.'
      ]
    },
    finalOutputText: 'Campaign generated, event registered, and study outline linked.'
  }
];

// Offline Scripture Reader Data for Key Chapters across KJV, NASB, NIV, NLT
export interface ScripturePassage {
  reference: string;
  book: string;
  chapter: number;
  verses: {
    verse: number;
    translations: {
      KJV: string;
      NASB: string;
      NIV: string;
      NLT: string;
    };
  }[];
}

export const sampleScriptures: ScripturePassage[] = [
  {
    reference: 'Psalm 23:1-6',
    book: 'Psalms',
    chapter: 23,
    verses: [
      {
        verse: 1,
        translations: {
          KJV: 'The LORD is my shepherd; I shall not want.',
          NASB: 'The LORD is my shepherd, I will not be in need.',
          NIV: 'The LORD is my shepherd, I lack nothing.',
          NLT: 'The LORD is my shepherd; I have all that I need.'
        }
      },
      {
        verse: 2,
        translations: {
          KJV: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
          NASB: 'He lets me lie down in green pastures; He leads me beside quiet waters.',
          NIV: 'He makes me lie down in green pastures, he leads me beside quiet waters,',
          NLT: 'He lets me rest in green meadows; he leads me beside peaceful streams.'
        }
      },
      {
        verse: 3,
        translations: {
          KJV: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
          NASB: 'He restores my soul; He guides me in the paths of righteousness for the sake of His name.',
          NIV: 'he refreshes my soul. He guides me along the right paths for his name’s sake.',
          NLT: 'He renews my strength. He guides me along right paths, bringing honor to his name.'
        }
      },
      {
        verse: 4,
        translations: {
          KJV: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
          NASB: 'Even though I walk through the valley of the shadow of death, I fear no evil, for You are with me; Your rod and Your staff, they comfort me.',
          NIV: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
          NLT: 'Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.'
        }
      },
      {
        verse: 5,
        translations: {
          KJV: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
          NASB: 'You prepare a table before me in the presence of my enemies; You have anointed my head with oil; My cup overflows.',
          NIV: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.',
          NLT: 'You prepare a feast for me in the presence of my enemies. You honor me by anointing my head with oil. My cup overflows with blessings.'
        }
      },
      {
        verse: 6,
        translations: {
          KJV: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.',
          NASB: 'Certainly goodness and faithfulness will follow me all the days of my life, And my dwelling will be in the house of the LORD forever.',
          NIV: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.',
          NLT: 'Surely your goodness and unfailing love will pursue me all the days of my life, and I will live in the house of the LORD forever.'
        }
      }
    ]
  },
  {
    reference: 'John 14:1-6',
    book: 'John',
    chapter: 14,
    verses: [
      {
        verse: 1,
        translations: {
          KJV: 'Let not your heart be troubled: ye believe in God, believe also in me.',
          NASB: 'Do not let your heart be troubled; believe in God, believe also in Me.',
          NIV: 'Do not let your hearts be troubled. You believe in God; believe also in me.',
          NLT: 'Don’t let your hearts be troubled. Trust in God, and trust also in me.'
        }
      },
      {
        verse: 6,
        translations: {
          KJV: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.',
          NASB: 'Jesus said to him, "I am the way, and the truth, and the life; no one comes to the Father except through Me."',
          NIV: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
          NLT: 'Jesus told him, "I am the way, the truth, and the life. No one can come to the Father except through me."'
        }
      }
    ]
  },
  {
    reference: 'Romans 8:28-31',
    book: 'Romans',
    chapter: 8,
    verses: [
      {
        verse: 28,
        translations: {
          KJV: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
          NASB: 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.',
          NIV: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
          NLT: 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.'
        }
      },
      {
        verse: 31,
        translations: {
          KJV: 'What shall we then say to these things? If God be for us, who can be against us?',
          NASB: 'What then shall we say to these things? If God is for us, who is against us?',
          NIV: 'What, then, shall we say in response to these things? If God is for us, who can be against us?',
          NLT: 'What shall we say about such wonderful things as these? If God is for us, who can ever be against us?'
        }
      }
    ]
  },
  {
    reference: '1 Peter 1:15-16',
    book: '1 Peter',
    chapter: 1,
    verses: [
      {
        verse: 15,
        translations: {
          KJV: 'But as he which hath called you is holy, so be ye holy in all manner of conversation;',
          NASB: 'but like the Holy One who called you, be holy yourselves also in all your behavior;',
          NIV: 'But just as he who called you is holy, so be holy in all you do;',
          NLT: 'But now you must be holy in everything you do, just as God who chose you is holy.'
        }
      },
      {
        verse: 16,
        translations: {
          KJV: 'Because it is written, Be ye holy; for I am holy.',
          NASB: 'because it is written: "YOU SHALL BE HOLY, FOR I AM HOLY."',
          NIV: 'for it is written: "Be holy, because I am holy."',
          NLT: 'For the Scriptures say, "You must be holy because I am holy."'
        }
      }
    ]
  }
];

export const defaultChurchProfile = initialChurchProfile;
export const initialSidebarTools = defaultSidebarTools;

export const sampleMembers = [
  {
    id: 'mem-1',
    firstName: 'Thomas',
    lastName: 'Vance',
    email: 'thomas.vance@churchmail.org',
    phone: '+1 (214) 555-0192',
    fellowship: 'Adults Men' as const,
    role: 'Elder & Men’s Director',
    joinedDate: '2018-04-12',
    attendanceScore: 98,
    activeStatus: true,
    birthDate: '1982-09-11', // In 2 days!
    weddingAnniversary: '2008-09-14', // In 5 days!
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-2',
    firstName: 'Mary',
    lastName: 'Vance',
    email: 'mary.vance@faithpost.net',
    phone: '+1 (214) 555-4819',
    fellowship: 'Adults Women' as const,
    role: 'Deaconess & Women Coordinator',
    joinedDate: '2020-01-19',
    attendanceScore: 94,
    activeStatus: true,
    birthDate: '1985-09-18', // In 9 days!
    weddingAnniversary: '2008-09-14', // In 5 days!
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-3',
    firstName: 'Daniel',
    lastName: 'Cole',
    email: 'daniel.cole@university.edu',
    phone: '+1 (214) 555-7362',
    fellowship: 'Youth & Campus' as const,
    role: 'Youth Pastor & Campus Lead',
    joinedDate: '2022-09-01',
    attendanceScore: 96,
    activeStatus: true,
    birthDate: '1998-09-09', // TODAY! (28th Birthday)
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-4',
    firstName: 'Sarah',
    lastName: 'Adams',
    email: 'sarah.adams@gmail.com',
    phone: '+1 (214) 555-3211',
    fellowship: 'Children' as const,
    role: 'Children Superintendent',
    joinedDate: '2021-06-15',
    attendanceScore: 92,
    activeStatus: true,
    birthDate: '1990-09-12', // In 3 days!
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-5',
    firstName: 'Grace',
    lastName: 'Adeyemi',
    email: 'grace.a@church.org',
    phone: '+1 (555) 392-1082',
    fellowship: 'Adults Women' as const,
    role: 'Sanctuary Choir Lead',
    joinedDate: '2023-03-10',
    attendanceScore: 95,
    activeStatus: true,
    birthDate: '1994-09-15', // In 6 days!
    weddingAnniversary: '2019-09-10', // TOMORROW! (7th Wedding Anniversary)
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-6',
    firstName: 'Jonathan',
    lastName: 'David',
    email: 'jonathan.david@campusfaith.edu',
    phone: '+1 (555) 882-9912',
    fellowship: 'Youth & Campus' as const,
    role: 'Campus Outreach Secretary',
    joinedDate: '2023-08-20',
    attendanceScore: 97,
    activeStatus: true,
    birthDate: '2001-09-09', // TODAY! (25th Birthday)
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  },
  {
    id: 'mem-7',
    firstName: 'Pastor Samuel',
    lastName: 'Kalu',
    email: 'samuel.kalu@missionsglobal.org',
    phone: '+1 (555) 721-4402',
    fellowship: 'Adults Men' as const,
    role: 'Associate Missions Pastor',
    joinedDate: '2019-02-14',
    attendanceScore: 99,
    activeStatus: true,
    birthDate: '1979-11-20',
    weddingAnniversary: '2012-09-09', // TODAY! (14th Wedding Anniversary)
    encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
  }
];

export const sampleEquipment: PhysicalEquipment[] = [
  {
    id: 'eq-1',
    name: 'Shure QLX-D Wireless Handheld Microphone System',
    category: 'Audio & Microphones',
    model: 'QLXD24/B87A Digital',
    serialNumber: 'SH-QLX-88219',
    location: 'Sanctuary Main Sound Booth',
    totalQuantity: 4,
    availableQuantity: 3,
    condition: 'Optimal',
    notes: 'Includes rechargeable lithium SB900B battery packs and Beta 87A capsule.'
  },
  {
    id: 'eq-2',
    name: 'Shure Wireless Lavalier Bodypack Microphone',
    category: 'Audio & Microphones',
    model: 'QLXD1 Bodypack with WL185',
    serialNumber: 'SH-BP-44910',
    location: 'Pulpit Vestry Sound Cabinet',
    totalQuantity: 2,
    availableQuantity: 2,
    condition: 'Optimal',
    notes: 'Primary clip-on lapel mic for visiting evangelists and preaching pastors.'
  },
  {
    id: 'eq-3',
    name: 'Epson Pro L 15,000-Lumen 4K Laser Projector',
    category: 'Visual & Projection',
    model: 'Pro L1755UNL WUXGA',
    serialNumber: 'EP-PROL-09231',
    location: 'Sanctuary Overhead Truss Center',
    totalQuantity: 1,
    availableQuantity: 0,
    condition: 'Optimal',
    notes: 'Ultra high-definition sanctuary main display with motorized zoom lens.'
  },
  {
    id: 'eq-4',
    name: 'Optoma High-Lumen Mobile Outreach Projector',
    category: 'Visual & Projection',
    model: 'EH412 1080p HDR',
    serialNumber: 'OP-OUT-55120',
    location: 'Missions & Outreach Mobile Van',
    totalQuantity: 2,
    availableQuantity: 1,
    condition: 'Good',
    notes: 'Portable 4,500 lumens projector with rugged road travel flight case.'
  },
  {
    id: 'eq-5',
    name: 'Blackmagic ATEM Mini Extreme ISO Switcher',
    category: 'Broadcasting & Streaming',
    model: 'ATEM Mini Extreme 8-HDMI',
    serialNumber: 'BM-ATEM-77291',
    location: 'Broadcast Media Control Suite',
    totalQuantity: 1,
    availableQuantity: 1,
    condition: 'Optimal',
    notes: 'Direct 8-camera multi-view ISO live recording for church broadcast.'
  },
  {
    id: 'eq-6',
    name: 'Sony FX3 Cinema Live Stream Camera Package',
    category: 'Broadcasting & Streaming',
    model: 'FX3 Full-Frame Cinema Line',
    serialNumber: 'SN-FX3-66280',
    location: 'Sanctuary Balcony Camera Stand 1',
    totalQuantity: 2,
    availableQuantity: 2,
    condition: 'Optimal',
    notes: 'Includes 24-70mm GM lens, carbon fiber tripod, and HDMI fiber transmitters.'
  },
  {
    id: 'eq-7',
    name: 'Nord Stage 3 88-Key Stage Synthesizer Keyboard',
    category: 'Musical Instruments',
    model: 'Nord Stage 3 HP76 / 88',
    serialNumber: 'NRD-STG-11842',
    location: 'Sanctuary Choir Stage Left',
    totalQuantity: 1,
    availableQuantity: 1,
    condition: 'Optimal',
    notes: 'Flagship worship keyboard loaded with pipe organ and grand piano samples.'
  },
  {
    id: 'eq-8',
    name: 'Portable Immersion Baptismal Pool & Water Heater',
    category: 'Liturgical & Sanctuary',
    model: 'Sanctuary Hydro-Baptist Pro',
    serialNumber: 'BAP-POOL-22109',
    location: 'Baptismal Annex East Wing',
    totalQuantity: 1,
    availableQuantity: 1,
    condition: 'Optimal',
    notes: 'Quick-fill thermal heated water pool for consecration services.'
  }
];

export const sampleEquipmentBookings: EquipmentBooking[] = [
  {
    id: 'book-1',
    equipmentId: 'eq-1',
    equipmentName: 'Shure QLX-D Wireless Handheld Microphone System',
    operationEventId: 'op-1',
    operationEventName: 'Metropolitan Citywide Gospel Crusade',
    bookingDate: '2026-09-12',
    startTime: '16:00',
    endTime: '21:30',
    quantity: 1,
    bookedBy: 'Elder Thomas Vance',
    status: 'Confirmed',
    purposeNotes: 'Pulpit and guest vocal soloist audio for citywide outdoor outreach.',
    conflictDetected: false,
    createdAt: '2026-09-07T10:00:00Z'
  },
  {
    id: 'book-2',
    equipmentId: 'eq-4',
    equipmentName: 'Optoma High-Lumen Mobile Outreach Projector',
    operationEventId: 'op-1',
    operationEventName: 'Metropolitan Citywide Gospel Crusade',
    bookingDate: '2026-09-12',
    startTime: '17:00',
    endTime: '22:00',
    quantity: 1,
    bookedBy: 'Media Lead Mark',
    status: 'Confirmed',
    purposeNotes: 'Outdoor scripture hymn slides and testimonies display screen.',
    conflictDetected: false,
    createdAt: '2026-09-08T14:30:00Z'
  },
  {
    id: 'book-3',
    equipmentId: 'eq-3',
    equipmentName: 'Epson Pro L 15,000-Lumen 4K Laser Projector',
    operationEventId: 'op-2',
    operationEventName: 'Sanctuary All-Night Prayer Vigil: Altar of Power',
    bookingDate: '2026-09-18',
    startTime: '21:00',
    endTime: '05:00',
    quantity: 1,
    bookedBy: 'Pastor Daniel Cole',
    status: 'Confirmed',
    purposeNotes: 'Continuous intercessory prayer scripture slides and prayer points.',
    conflictDetected: false,
    createdAt: '2026-09-08T16:00:00Z'
  }
];

export const sampleAnnouncements = [
  {
    id: 'ann-1',
    title: 'Water Baptismal Immersion & Believers Consecration',
    date: '2026-09-13',
    category: 'Event' as const,
    content: 'All candidates who completed Discipleship 101 should report at 8:00 AM on Saturday for baptism in the Sanctuary font.',
    priority: 'High' as const,
    author: 'Secretariat'
  },
  {
    id: 'ann-2',
    title: 'Computer Vision & Media Team Technical Workshop',
    date: '2026-09-15',
    category: 'General' as const,
    content: 'Hands-on training session in the Media Suite covering live stream camera feeds, OCR flyer extraction, and FaithGPT study notes.',
    priority: 'Standard' as const,
    author: 'Media Board'
  },
  {
    id: 'ann-3',
    title: 'Sanctuary All-Night Prayer Vigil: Altar of Power',
    date: '2026-09-18',
    category: 'Urgent' as const,
    content: 'Night of apostolic intercession for our city, missions, and spiritual revival. 10:00 PM till dawn.',
    priority: 'High' as const,
    author: 'Pastoral Council'
  }
];

export const sampleOrderOfService = [
  { sequence: 1, activity: 'Opening Prayer & Processional Hymn', assignedLeader: 'Elder Thomas Vance', durationMinutes: 10, notes: 'Hymn #42: Great Is Thy Faithfulness' },
  { sequence: 2, activity: 'Praise & High Adoration', assignedLeader: 'Sanctuary Choir & Orchestra', durationMinutes: 20, notes: 'Atmosphere of reverence' },
  { sequence: 3, activity: 'Congregational Expository Reading', assignedLeader: 'Deaconess Mary Vance', durationMinutes: 5, notes: '1 Peter 1:13-25' },
  { sequence: 4, activity: 'Pastoral Greetings & Fellowship Welcome', assignedLeader: 'Secretariat', durationMinutes: 10, notes: 'First-time guests recognition' },
  { sequence: 5, activity: 'Sacred Tithes, Offerings & Building Seed', assignedLeader: 'Pastor Grace Emmanuel', durationMinutes: 10, notes: 'Malachi 3:10 & 2 Corinthians 9:7' },
  { sequence: 6, activity: 'The Ministry of the Spoken Word', assignedLeader: 'Rev. Dr. David Emmanuel', durationMinutes: 45, notes: 'Pulpit Delivery & Scripture Exposition' },
  { sequence: 7, activity: 'Altar Call, Healing Ministry & Benediction', assignedLeader: 'Pastoral Council', durationMinutes: 20, notes: 'Personal prayer ministering' }
];

export const sampleMedia = [
  {
    id: 'med-1',
    title: 'The Uncompromising Altar of Holiness & Kingdom Power',
    speaker: 'Rev. Dr. David Emmanuel',
    type: 'Sermon Audio',
    duration: '48:15',
    date: '2026-09-06'
  },
  {
    id: 'med-2',
    title: 'Holy, Holy, Holy (Lord God Almighty) - Live Sanctuary Worship',
    speaker: 'Grace Sanctuary Choir',
    type: 'Worship Music',
    duration: '07:42',
    date: '2026-09-06'
  },
  {
    id: 'med-3',
    title: 'Systematic Theology: The Doctrine of Justification by Faith',
    speaker: 'Pastor Grace Emmanuel',
    type: 'Video Study',
    duration: '54:30',
    date: '2026-09-03'
  },
  {
    id: 'med-4',
    title: 'Pulpit Expository Slide Deck: 1 Peter Chapter 1',
    speaker: 'Media Ministry',
    type: 'Slide Deck',
    duration: '24 Slides',
    date: '2026-09-06'
  }
];

