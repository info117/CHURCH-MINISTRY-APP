import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Flame,
  TrendingUp,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  HeartHandshake,
  Phone,
  Mail,
  AlertCircle,
  X
} from 'lucide-react';
import {
  ChurchMember,
  ChurchAttendanceRecord,
  NewcomerVisitationSchedule,
  VisitationStatus
} from '../types';
import { AttendanceRecordModal } from './attendance/AttendanceRecordModal';
import { NewcomerVisitationModal } from './attendance/NewcomerVisitationModal';
import { AttendanceRecordsList } from './attendance/AttendanceRecordsList';
import { NewcomerVisitationScheduleView } from './attendance/NewcomerVisitationScheduleView';

export interface AssemblySlotData {
  id: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dayName: string;
  timeSlotId: string;
  timeLabel: string;
  assemblyTitle: string;
  category: 'Worship' | 'Prayer' | 'Youth' | 'Discipleship' | 'Outreach' | 'Fellowship';
  headcount: number;
  capacityMax: number;
  capacityPercent: number;
  pastoralLead: string;
  campus: string;
  isPeak?: boolean;
  notes: string;
}

const DAYS_OF_WEEK = [
  { short: 'Sun', full: 'Sunday', index: 0 },
  { short: 'Mon', full: 'Monday', index: 1 },
  { short: 'Tue', full: 'Tuesday', index: 2 },
  { short: 'Wed', full: 'Wednesday', index: 3 },
  { short: 'Thu', full: 'Thursday', index: 4 },
  { short: 'Fri', full: 'Friday', index: 5 },
  { short: 'Sat', full: 'Saturday', index: 6 }
];

const TIME_SLOTS = [
  { id: 'early', label: '06:00 - 08:00 AM', description: 'Early Dawn Intercession' },
  { id: 'morning_1', label: '08:30 - 10:30 AM', description: '1st Service & Sunday School' },
  { id: 'morning_2', label: '10:45 AM - 01:00 PM', description: 'Main Sanctuary Celebration (Peak)' },
  { id: 'afternoon', label: '02:00 - 04:00 PM', description: 'Youth, Campus & Choirs' },
  { id: 'evening', label: '05:00 - 06:30 PM', description: 'Pastoral Counseling & Discipleship' },
  { id: 'night', label: '07:00 - 09:00 PM', description: 'Midweek Revival & Miracle Hour' }
];

// Rich weekly schedule dataset with realistic church attendance figures
export const INITIAL_HEATMAP_DATA: AssemblySlotData[] = [
  // Sunday
  {
    id: 'sun-early',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'early',
    timeLabel: '06:00 - 08:00 AM',
    assemblyTitle: 'Dawn Communion & Prayer Altar',
    category: 'Prayer',
    headcount: 185,
    capacityMax: 550,
    capacityPercent: 34,
    pastoralLead: 'Elder Michael Vance',
    campus: 'Main Sanctuary',
    notes: 'Elder-led intercession and holy communion preparation.'
  },
  {
    id: 'sun-m1',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'morning_1',
    timeLabel: '08:30 - 10:30 AM',
    assemblyTitle: '1st Sanctuary Divine Service & Bible School',
    category: 'Worship',
    headcount: 395,
    capacityMax: 550,
    capacityPercent: 72,
    pastoralLead: 'Associate Pastor David Chen',
    campus: 'Main Sanctuary',
    notes: 'Contemporary liturgy, graded Sunday school classes, traditional choir.'
  },
  {
    id: 'sun-m2',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'morning_2',
    timeLabel: '10:45 AM - 01:00 PM',
    assemblyTitle: 'Main Celebration Service & High Praise',
    category: 'Worship',
    headcount: 520,
    capacityMax: 550,
    capacityPercent: 95,
    pastoralLead: 'Senior Pastor & Bishop',
    campus: 'Main Sanctuary',
    isPeak: true,
    notes: 'Peak weekly assembly. Ordinance of Holy Communion, baptismal candidates, full orchestra.'
  },
  {
    id: 'sun-aft',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'afternoon',
    timeLabel: '02:00 - 04:00 PM',
    assemblyTitle: 'Youth & Young Adults IGNITE Gathering',
    category: 'Youth',
    headcount: 245,
    capacityMax: 300,
    capacityPercent: 82,
    pastoralLead: 'Youth Pastor Marcus Cole',
    campus: 'Family Life Center',
    notes: 'High energy acoustic worship, apologetics workshop, and community cafe.'
  },
  {
    id: 'sun-eve',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'evening',
    timeLabel: '05:00 - 06:30 PM',
    assemblyTitle: 'Pastoral Counseling & New Convert Discipleship',
    category: 'Discipleship',
    headcount: 85,
    capacityMax: 120,
    capacityPercent: 71,
    pastoralLead: 'Pastoral Care Council',
    campus: 'Ministry Annex',
    notes: 'Individual prayer counseling, new member integration and foundation doctrine.'
  },
  {
    id: 'sun-ngt',
    dayIndex: 0,
    dayName: 'Sunday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Sunday Evening Praise & Healing Service',
    category: 'Prayer',
    headcount: 140,
    capacityMax: 300,
    capacityPercent: 47,
    pastoralLead: 'Rev. Elizabeth Walker',
    campus: 'Main Sanctuary',
    notes: 'Quiet prayer, laying on of hands, and testimony thanksgiving.'
  },

  // Monday
  {
    id: 'mon-early',
    dayIndex: 1,
    dayName: 'Monday',
    timeSlotId: 'early',
    timeLabel: '06:00 - 08:00 AM',
    assemblyTitle: 'Weekly Launch Pastoral Intercession',
    category: 'Prayer',
    headcount: 90,
    capacityMax: 200,
    capacityPercent: 45,
    pastoralLead: 'Ministerial Staff',
    campus: 'Prayer Chapel',
    notes: 'Intercession for national leaders, missionary workers, and parish sicknesses.'
  },
  {
    id: 'mon-eve',
    dayIndex: 1,
    dayName: 'Monday',
    timeSlotId: 'evening',
    timeLabel: '05:00 - 06:30 PM',
    assemblyTitle: 'Ministers & Deacons Leadership Academy',
    category: 'Discipleship',
    headcount: 65,
    capacityMax: 100,
    capacityPercent: 65,
    pastoralLead: 'Senior Pastor',
    campus: 'Conference Center',
    notes: 'Homiletics training, biblical leadership, and financial stewardship review.'
  },
  {
    id: 'mon-ngt',
    dayIndex: 1,
    dayName: 'Monday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Men of Valor Fellowship Dinner & Study',
    category: 'Fellowship',
    headcount: 110,
    capacityMax: 160,
    capacityPercent: 69,
    pastoralLead: 'Elder Robert Hayes',
    campus: 'Fellowship Hall',
    notes: 'Brotherhood fellowship, biblical fatherhood, and marketplace ethics.'
  },

  // Tuesday
  {
    id: 'tue-m1',
    dayIndex: 2,
    dayName: 'Tuesday',
    timeSlotId: 'morning_1',
    timeLabel: '08:30 - 10:30 AM',
    assemblyTitle: 'Golden Age Senior Saints Bible Hour',
    category: 'Fellowship',
    headcount: 125,
    capacityMax: 180,
    capacityPercent: 69,
    pastoralLead: 'Pastor Grace Miller',
    campus: 'Fellowship Hall',
    notes: 'Hymn sing, expository study of Psalms, and homebound visits dispatch.'
  },
  {
    id: 'tue-ngt',
    dayIndex: 2,
    dayName: 'Tuesday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Women of Grace Prayer & Missionary Circle',
    category: 'Fellowship',
    headcount: 145,
    capacityMax: 200,
    capacityPercent: 73,
    pastoralLead: 'Deaconess Sarah Jenkins',
    campus: 'Fellowship Hall',
    notes: 'Global missions support, community benevolence packing, and family intercession.'
  },

  // Wednesday (Midweek Peak)
  {
    id: 'wed-early',
    dayIndex: 3,
    dayName: 'Wednesday',
    timeSlotId: 'early',
    timeLabel: '06:00 - 08:00 AM',
    assemblyTitle: 'Midweek Fasting & Prayer Break',
    category: 'Prayer',
    headcount: 115,
    capacityMax: 250,
    capacityPercent: 46,
    pastoralLead: 'Prayer Ministry Council',
    campus: 'Prayer Chapel',
    notes: 'Congregational fast breaking and warfare intercession.'
  },
  {
    id: 'wed-aft',
    dayIndex: 3,
    dayName: 'Wednesday',
    timeSlotId: 'afternoon',
    timeLabel: '02:00 - 04:00 PM',
    assemblyTitle: 'Community Food Pantry & Benevolence Hub',
    category: 'Outreach',
    headcount: 160,
    capacityMax: 200,
    capacityPercent: 80,
    pastoralLead: 'Deacon Community Board',
    campus: 'Benevolence Center',
    notes: 'Food box distribution, chaplaincy support, and neighborhood gospel tracts.'
  },
  {
    id: 'wed-ngt',
    dayIndex: 3,
    dayName: 'Wednesday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Midweek Expository Bible Study & Miracle Service',
    category: 'Worship',
    headcount: 285,
    capacityMax: 400,
    capacityPercent: 71,
    pastoralLead: 'Senior Pastor',
    campus: 'Main Sanctuary',
    isPeak: true,
    notes: 'Midweek peak attendance! Deep line-by-line verse analysis and prayer ministry.'
  },

  // Thursday
  {
    id: 'thu-aft',
    dayIndex: 4,
    dayName: 'Thursday',
    timeSlotId: 'afternoon',
    timeLabel: '02:00 - 04:00 PM',
    assemblyTitle: 'Worship Arts Choir & Orchestra Rehearsal',
    category: 'Worship',
    headcount: 75,
    capacityMax: 100,
    capacityPercent: 75,
    pastoralLead: 'Minister of Music',
    campus: 'Main Sanctuary Choir Loft',
    notes: 'Arrangements for upcoming Lord\'s Day anthems and orchestral instrumentation.'
  },
  {
    id: 'thu-ngt',
    dayIndex: 4,
    dayName: 'Thursday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Home Life Groups & Neighborhood Cell Hubs',
    category: 'Discipleship',
    headcount: 230,
    capacityMax: 300,
    capacityPercent: 77,
    pastoralLead: 'Cell Group Directors',
    campus: 'Multiple Regional Homes',
    notes: 'Simultaneous decentralized home groups meeting across city districts.'
  },

  // Friday
  {
    id: 'fri-aft',
    dayIndex: 5,
    dayName: 'Friday',
    timeSlotId: 'afternoon',
    timeLabel: '02:00 - 04:00 PM',
    assemblyTitle: 'Prison Ministry & Hospital Visitation Team',
    category: 'Outreach',
    headcount: 45,
    capacityMax: 60,
    capacityPercent: 75,
    pastoralLead: 'Chaplain Samuel Adams',
    campus: 'Regional Outreach',
    notes: 'Pastoral chaplain visits to county hospitals and correctional institutions.'
  },
  {
    id: 'fri-ngt',
    dayIndex: 5,
    dayName: 'Friday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Friday Night All-Night Prayer Vigil & Revival Fire',
    category: 'Prayer',
    headcount: 310,
    capacityMax: 450,
    capacityPercent: 69,
    pastoralLead: 'Evangelism & Revival Ministry',
    campus: 'Main Sanctuary',
    notes: 'Extended praise, prophetic intercession, deliverance ministry, and midnight watch.'
  },

  // Saturday
  {
    id: 'sat-early',
    dayIndex: 6,
    dayName: 'Saturday',
    timeSlotId: 'early',
    timeLabel: '06:00 - 08:00 AM',
    assemblyTitle: 'Sanctuary Ushers & Hospitality Preparation',
    category: 'Fellowship',
    headcount: 55,
    capacityMax: 80,
    capacityPercent: 69,
    pastoralLead: 'Head Usher & Protocol Lead',
    campus: 'Sanctuary Vestibule',
    notes: 'Facilities preparation, communion tray setting, and soundcheck verification.'
  },
  {
    id: 'sat-m1',
    dayIndex: 6,
    dayName: 'Saturday',
    timeSlotId: 'morning_1',
    timeLabel: '08:30 - 10:30 AM',
    assemblyTitle: 'Saturday City Street Evangelism & Food Drive',
    category: 'Outreach',
    headcount: 140,
    capacityMax: 180,
    capacityPercent: 78,
    pastoralLead: 'Evangelism Director',
    campus: 'Community Pavilion',
    notes: 'Open-air gospel preach, distribution of hot meals, and tract evangelism.'
  },
  {
    id: 'sat-ngt',
    dayIndex: 6,
    dayName: 'Saturday',
    timeSlotId: 'night',
    timeLabel: '07:00 - 09:00 PM',
    assemblyTitle: 'Saturday Youth Sports & Kingdom League',
    category: 'Youth',
    headcount: 195,
    capacityMax: 250,
    capacityPercent: 78,
    pastoralLead: 'Youth Pastor Marcus Cole',
    campus: 'Family Life Gym',
    notes: 'Christian athletic league, youth halftime devotion, and peer fellowship.'
  }
];

const INITIAL_ATTENDANCE_RECORDS: ChurchAttendanceRecord[] = [
  {
    id: 'att-1',
    attendeeType: 'Church Member',
    memberId: 'mem-1',
    name: 'Elder Michael Vance',
    phone: '(555) 019-2834',
    email: 'm.vance@livingfaith.org',
    fellowship: 'Adults Men',
    assemblySlotId: 'sun-early',
    assemblyTitle: 'Dawn Communion & Prayer Altar',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '06:00 - 08:00 AM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Pastoral Staff',
    notes: 'Led early morning communion prayer altar.',
    createdAt: '2026-09-13T06:15:00.000Z'
  },
  {
    id: 'att-2',
    attendeeType: 'Church Member',
    memberId: 'mem-2',
    name: 'Deaconess Sarah Jenkins',
    phone: '(555) 012-9843',
    email: 'sarah.j@livingfaith.org',
    fellowship: 'Adults Women',
    assemblySlotId: 'sun-m2',
    assemblyTitle: 'Main Celebration Service & High Praise',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '10:45 AM - 01:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Sanctuary Ushers',
    notes: 'Sanctuary hospitality lead.',
    createdAt: '2026-09-13T10:30:00.000Z'
  },
  {
    id: 'att-3',
    attendeeType: 'Church Member',
    memberId: 'mem-3',
    name: 'Dr. Emmanuel Adeyemi',
    phone: '(555) 014-5567',
    email: 'emmanuel.a@hospital.org',
    fellowship: 'Adults Men',
    assemblySlotId: 'sun-m2',
    assemblyTitle: 'Main Celebration Service & High Praise',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '10:45 AM - 01:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Sanctuary Ushers',
    notes: 'Attended with family.',
    createdAt: '2026-09-13T10:40:00.000Z'
  },
  {
    id: 'att-4',
    attendeeType: 'Church Member',
    memberId: 'mem-4',
    name: 'Hannah Brooks',
    phone: '(555) 017-3392',
    email: 'hannah.b@youthfaith.org',
    fellowship: 'Youth & Campus',
    assemblySlotId: 'sun-m2',
    assemblyTitle: 'Main Celebration Service & High Praise',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '10:45 AM - 01:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Youth Ministry',
    notes: 'Choir soloist.',
    createdAt: '2026-09-13T10:42:00.000Z'
  },
  {
    id: 'att-5',
    attendeeType: 'Newcomer',
    name: 'Sister Grace Adebayo',
    phone: '(555) 432-8765',
    email: 'grace.adebayo@gmail.com',
    fellowship: 'Adults Women',
    assemblySlotId: 'sun-m2',
    assemblyTitle: 'Main Celebration Service & High Praise',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '10:45 AM - 01:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Welcome Team',
    notes: 'First time visiting. Relocated from Dallas. Desires prayer for new family home.',
    createdAt: '2026-09-13T10:55:00.000Z',
    hasVisitationSchedule: true
  },
  {
    id: 'att-6',
    attendeeType: 'Newcomer',
    name: 'Brother Samuel Okafor',
    phone: '(555) 234-5678',
    email: 'samuel.okafor@techpulse.io',
    fellowship: 'Adults Men',
    assemblySlotId: 'wed-night',
    assemblyTitle: 'Midweek Miracle & Deliverance Hour',
    dayName: 'Wednesday',
    date: '2026-09-16',
    timeLabel: '07:00 - 09:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Ushering Dept',
    notes: 'Invited by neighbor. Expressed interest in water baptism and discipleship.',
    createdAt: '2026-09-16T19:10:00.000Z',
    hasVisitationSchedule: true
  },
  {
    id: 'att-7',
    attendeeType: 'Newcomer',
    name: 'Sister Jessica Taylor',
    phone: '(555) 987-6543',
    email: 'jessica.taylor@outlook.com',
    fellowship: 'Adults Women',
    assemblySlotId: 'sun-m1',
    assemblyTitle: '1st Sanctuary Divine Service & Bible School',
    dayName: 'Sunday',
    date: '2026-09-13',
    timeLabel: '08:30 - 10:30 AM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Welcome Team',
    notes: 'Received community invitation flyer. Very joyful and touched by worship.',
    createdAt: '2026-09-13T08:45:00.000Z',
    hasVisitationSchedule: true
  },
  {
    id: 'att-8',
    attendeeType: 'Church Member',
    memberId: 'mem-5',
    name: 'Jonathan Miller',
    phone: '(555) 018-4421',
    email: 'jonathan.m@soundfaith.com',
    fellowship: 'Adults Men',
    assemblySlotId: 'wed-night',
    assemblyTitle: 'Midweek Miracle & Deliverance Hour',
    dayName: 'Wednesday',
    date: '2026-09-16',
    timeLabel: '07:00 - 09:00 PM',
    attendanceMode: 'In-Person Sanctuary',
    recordedBy: 'Media Team',
    notes: 'Sound booth technician.',
    createdAt: '2026-09-16T19:00:00.000Z'
  }
];

const INITIAL_VISITATION_SCHEDULES: NewcomerVisitationSchedule[] = [
  {
    id: 'vis-1',
    newcomerName: 'Sister Grace Adebayo',
    newcomerPhone: '(555) 432-8765',
    newcomerEmail: 'grace.adebayo@gmail.com',
    address: '742 Evergreen Terrace, Apt 3B, Springfield',
    fellowship: 'Adults Women',
    firstVisitDate: '2026-09-13',
    assemblyTitle: 'Main Celebration Service & High Praise',
    assemblySlotId: 'sun-m2',
    visitationDate: '2026-09-18',
    visitationTime: '18:00',
    visitationType: 'Home Visitation',
    assignedMinister: 'Associate Pastor David Chen',
    status: 'Scheduled',
    prayerRequests: 'Relocated from Dallas; desires pastoral prayer for family settlement and schooling for children.',
    notes: 'Prefers Friday evening after 6:00 PM. Will prepare tea. Deaconess Sarah Jenkins will accompany pastor.',
    createdAt: '2026-09-13T11:00:00.000Z'
  },
  {
    id: 'vis-2',
    newcomerName: 'Brother Samuel Okafor',
    newcomerPhone: '(555) 234-5678',
    newcomerEmail: 'samuel.okafor@techpulse.io',
    address: '1420 Heritage Blvd, Suite 104',
    fellowship: 'Adults Men',
    firstVisitDate: '2026-09-16',
    assemblyTitle: 'Midweek Miracle & Deliverance Hour',
    assemblySlotId: 'wed-night',
    visitationDate: '2026-09-19',
    visitationTime: '14:30',
    visitationType: 'Pastoral Office Meeting',
    assignedMinister: 'Senior Pastor & Bishop',
    status: 'Scheduled',
    prayerRequests: 'Guidance in professional career, desiring baptism and foundation Bible school class.',
    notes: 'Booked 45-minute pastoral counseling session in Church Office Suite A.',
    createdAt: '2026-09-16T19:30:00.000Z'
  },
  {
    id: 'vis-3',
    newcomerName: 'Sister Jessica Taylor',
    newcomerPhone: '(555) 987-6543',
    newcomerEmail: 'jessica.taylor@outlook.com',
    address: '308 Maple Ridge Way',
    fellowship: 'Adults Women',
    firstVisitDate: '2026-09-13',
    assemblyTitle: '1st Sanctuary Divine Service & Bible School',
    assemblySlotId: 'sun-m1',
    visitationDate: '2026-09-15',
    visitationTime: '17:00',
    visitationType: 'Phone Call & Pastoral Check',
    assignedMinister: 'Elder Michael Vance',
    status: 'Completed',
    prayerRequests: 'Health and healing for elderly mother.',
    notes: 'Elder Vance completed warm 20-minute welcome call. Sister Jessica expressed deep gratitude and will attend Sunday School next Lord\'s Day.',
    createdAt: '2026-09-13T09:00:00.000Z',
    completedAt: '2026-09-15T17:25:00.000Z'
  },
  {
    id: 'vis-4',
    newcomerName: 'Brother Kevin Patel',
    newcomerPhone: '(555) 314-8890',
    newcomerEmail: 'k.patel@student.edu',
    address: '120 Campus View Dr, Dorm 4',
    fellowship: 'Youth & Campus',
    firstVisitDate: '2026-09-11',
    assemblyTitle: 'Youth Awakening & Friday Vibe',
    assemblySlotId: 'fri-night',
    visitationDate: '2026-09-20',
    visitationTime: '16:00',
    visitationType: 'Welcome Tea & Fellowship',
    assignedMinister: 'Youth Pastor Marcus Cole',
    status: 'Scheduled',
    prayerRequests: 'Academic success in engineering finals and building godly college friendships.',
    notes: 'Meeting at Campus Student Center cafe. Youth choir leaders attending.',
    createdAt: '2026-09-11T20:30:00.000Z'
  }
];

interface AttendanceHeatmapProps {
  initialData?: AssemblySlotData[];
  onSelectSlot?: (slot: AssemblySlotData) => void;
  members?: ChurchMember[];
  onAddMemberToRoster?: (member: ChurchMember) => void;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({
  initialData = INITIAL_HEATMAP_DATA,
  onSelectSlot,
  members = [],
  onAddMemberToRoster
}) => {
  const [data, setData] = useState<AssemblySlotData[]>(initialData);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('sun-m2'); // default to peak
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [campusFilter, setCampusFilter] = useState<string>('All');
  const [displayMode, setDisplayMode] = useState<'headcount' | 'capacity' | 'intensity'>('headcount');
  const [hoveredSlot, setHoveredSlot] = useState<AssemblySlotData | null>(null);

  // Tab state: Heatmap, Attendance Records, Newcomer Visitation Schedule
  const [activeTab, setActiveTab] = useState<'heatmap' | 'records' | 'visitation'>('heatmap');

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [isVisitationModalOpen, setIsVisitationModalOpen] = useState<boolean>(false);
  const [visitationToEdit, setVisitationToEdit] = useState<NewcomerVisitationSchedule | null>(null);
  const [preselectedSlotForAdd, setPreselectedSlotForAdd] = useState<string | undefined>(undefined);

  // Attendance Records State (persisted in localStorage)
  const [attendanceRecords, setAttendanceRecords] = useState<ChurchAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('church_assembly_attendance_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading church attendance records:', e);
    }
    return INITIAL_ATTENDANCE_RECORDS;
  });

  // Newcomer Visitation Schedules State (persisted in localStorage)
  const [visitationSchedules, setVisitationSchedules] = useState<NewcomerVisitationSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('church_newcomer_visitation_schedules');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading newcomer visitation schedules:', e);
    }
    return INITIAL_VISITATION_SCHEDULES;
  });

  // Notification Toast
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'church_assembly_attendance_records',
        JSON.stringify(attendanceRecords)
      );
    } catch (e) {
      console.error(e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'church_newcomer_visitation_schedules',
        JSON.stringify(visitationSchedules)
      );
    } catch (e) {
      console.error(e);
    }
  }, [visitationSchedules]);

  // Quick lookup dictionary: `${dayIndex}-${timeSlotId}` -> AssemblySlotData
  const matrixLookup = useMemo(() => {
    const map = new Map<string, AssemblySlotData>();
    data.forEach((item) => {
      const key = `${item.dayIndex}-${item.timeSlotId}`;
      map.set(key, item);
    });
    return map;
  }, [data]);

  // Selected item details
  const selectedSlot = useMemo(() => {
    return data.find((d) => d.id === selectedSlotId) || data[2]; // fallback to Sunday 10:45 AM
  }, [data, selectedSlotId]);

  // Attendees checked into the selected slot
  const slotAttendees = useMemo(() => {
    return attendanceRecords.filter((r) => r.assemblySlotId === selectedSlot?.id);
  }, [attendanceRecords, selectedSlot]);

  const slotMembers = useMemo(() => {
    return slotAttendees.filter((r) => r.attendeeType === 'Church Member');
  }, [slotAttendees]);

  const slotNewcomers = useMemo(() => {
    return slotAttendees.filter((r) => r.attendeeType === 'Newcomer');
  }, [slotAttendees]);

  // Overall calculations & peak metrics
  const stats = useMemo(() => {
    const totalWeeklyTurnout = data.reduce((sum, item) => sum + item.headcount, 0);
    const peakItem = [...data].sort((a, b) => b.headcount - a.headcount)[0];
    const midweekItem = [...data]
      .filter((d) => d.dayIndex === 3)
      .sort((a, b) => b.headcount - a.headcount)[0];
    const avgCapacity = Math.round(
      data.reduce((sum, item) => sum + item.capacityPercent, 0) / (data.length || 1)
    );

    const totalMembersRecorded = attendanceRecords.filter((r) => r.attendeeType === 'Church Member').length;
    const totalNewcomersRecorded = attendanceRecords.filter((r) => r.attendeeType === 'Newcomer').length;
    const pendingVisitations = visitationSchedules.filter((v) => v.status === 'Scheduled').length;

    return {
      totalWeeklyTurnout,
      peakItem,
      midweekItem,
      avgCapacity,
      totalMembersRecorded,
      totalNewcomersRecorded,
      pendingVisitations
    };
  }, [data, attendanceRecords, visitationSchedules]);

  // Handle Add Attendance Record
  const handleSaveAttendance = (
    record: ChurchAttendanceRecord,
    visitation?: NewcomerVisitationSchedule,
    addToRoster?: boolean
  ) => {
    // 1. Add record
    setAttendanceRecords((prev) => [record, ...prev]);

    // 2. Add visitation if provided
    if (visitation) {
      setVisitationSchedules((prev) => [visitation, ...prev]);
    }

    // 3. Register to Congregation Member Roster if requested
    if (addToRoster && onAddMemberToRoster && record.attendeeType === 'Newcomer') {
      const nameParts = record.name.trim().split(' ');
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || 'Visitor';

      const newMember: ChurchMember = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        firstName,
        lastName,
        email: record.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@congregation.org`,
        phone: record.phone || '(555) 000-0000',
        fellowship: (record.fellowship as any) || 'Adults Men',
        role: 'Visitor',
        joinedDate: record.date,
        attendanceScore: 100,
        activeStatus: true,
        encryptedNotes: visitation
          ? `Newcomer visit scheduled on ${visitation.visitationDate}. Address: ${visitation.address || 'N/A'}`
          : 'Newcomer attendance recorded via weekly assembly heatmap.'
      };

      try {
        onAddMemberToRoster(newMember);
      } catch (err) {
        console.error('Could not auto-add to roster:', err);
      }
    }

    // 4. Increment headcount of that assembly slot in data
    setData((prev) =>
      prev.map((slot) => {
        if (slot.id === record.assemblySlotId) {
          const newHeadcount = slot.headcount + 1;
          const newPercent = Math.min(100, Math.round((newHeadcount / slot.capacityMax) * 100));
          return {
            ...slot,
            headcount: newHeadcount,
            capacityPercent: newPercent
          };
        }
        return slot;
      })
    );

    showToast(
      `Recorded church attendance for ${record.name} (${record.attendeeType})${
        visitation ? ` and scheduled pastoral visit for ${visitation.visitationDate}.` : '.'
      }`,
      'success'
    );
  };

  // Handle Delete Attendance Record
  const handleDeleteAttendanceRecord = (id: string, name: string) => {
    const recordToDelete = attendanceRecords.find((r) => r.id === id);

    if (recordToDelete) {
      // Decrement headcount of that slot
      setData((prev) =>
        prev.map((slot) => {
          if (slot.id === recordToDelete.assemblySlotId) {
            const newHeadcount = Math.max(0, slot.headcount - 1);
            const newPercent = Math.min(100, Math.round((newHeadcount / slot.capacityMax) * 100));
            return {
              ...slot,
              headcount: newHeadcount,
              capacityPercent: newPercent
            };
          }
          return slot;
        })
      );
    }

    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    showToast(`Deleted attendance record for ${name}.`, 'info');
  };

  // Handle Save Visitation Schedule
  const handleSaveVisitation = (visitation: NewcomerVisitationSchedule) => {
    setVisitationSchedules((prev) => {
      const exists = prev.some((v) => v.id === visitation.id);
      if (exists) {
        return prev.map((v) => (v.id === visitation.id ? visitation : v));
      }
      return [visitation, ...prev];
    });

    showToast(
      `Saved Follow-Up & Visitation for ${visitation.newcomerName} on ${visitation.visitationDate}.`,
      'success'
    );
  };

  // Handle Delete Visitation Schedule
  const handleDeleteVisitationSchedule = (id: string, name: string) => {
    setVisitationSchedules((prev) => prev.filter((v) => v.id !== id));
    showToast(`Deleted visitation schedule for ${name}.`, 'info');
  };

  // Handle Update Visitation Status
  const handleUpdateVisitationStatus = (id: string, newStatus: VisitationStatus) => {
    setVisitationSchedules((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: newStatus,
            completedAt: newStatus === 'Completed' ? new Date().toISOString() : undefined
          };
        }
        return v;
      })
    );
    showToast(`Updated visitation status to ${newStatus}.`, 'info');
  };

  // Open add modal pre-selecting a specific slot
  const handleOpenAddForSlot = (slotId?: string) => {
    setPreselectedSlotForAdd(slotId || selectedSlotId);
    setIsAttendanceModalOpen(true);
  };

  // Open schedule modal
  const handleOpenScheduleModal = (visitation?: NewcomerVisitationSchedule) => {
    setVisitationToEdit(visitation || null);
    setIsVisitationModalOpen(true);
  };

  // Quick jump to newcomer in visitation tab
  const handleNavigateToVisitation = (newcomerName?: string) => {
    setActiveTab('visitation');
  };

  // Color intensity calculation helper
  const getCellIntensityStyle = (item?: AssemblySlotData) => {
    if (!item) {
      return 'bg-slate-50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700';
    }

    const isMatchFilter =
      (categoryFilter === 'All' || item.category === categoryFilter) &&
      (campusFilter === 'All' || item.campus.includes(campusFilter));

    if (!isMatchFilter) {
      return 'opacity-25 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400';
    }

    const isSelected = item.id === selectedSlotId;

    // Peak tier (>= 450 or explicit peak flag)
    if (item.headcount >= 450 || (item.isPeak && item.dayIndex === 0)) {
      return `${
        isSelected
          ? 'ring-2 ring-[#D4AF37] ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] shadow-md z-10'
          : 'hover:scale-[1.02]'
      } bg-gradient-to-br from-amber-500/20 via-purple-600/30 to-[#0B1F4D] border-[#D4AF37] text-amber-600 dark:text-[#D4AF37] font-bold`;
    }

    // High tier (250 - 449)
    if (item.headcount >= 250) {
      return `${
        isSelected
          ? 'ring-2 ring-[#7D3AC1] ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] shadow-md z-10'
          : 'hover:scale-[1.02]'
      } bg-purple-600/15 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 text-[#7D3AC1] dark:text-purple-300 font-semibold`;
    }

    // Moderate tier (130 - 249)
    if (item.headcount >= 130) {
      return `${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] shadow-md z-10'
          : 'hover:scale-[1.02]'
      } bg-indigo-500/10 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300`;
    }

    // Low tier (< 130)
    return `${
      isSelected
        ? 'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-950 scale-[1.02] shadow-xs z-10'
        : 'hover:scale-[1.02]'
    } bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`;
  };

  const handleCellClick = (item?: AssemblySlotData) => {
    if (!item) return;
    setSelectedSlotId(item.id);
    if (onSelectSlot) {
      onSelectSlot(item);
    }
  };

  const handleSpotlightPeak = () => {
    if (stats.peakItem) {
      setSelectedSlotId(stats.peakItem.id);
      if (onSelectSlot) {
        onSelectSlot(stats.peakItem);
      }
    }
  };

  return (
    <div id="attendance-heatmap-container" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-3 text-sm font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* 1. Header & KPI Ribbon */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Weekly Congregation Analytics &bull; Sanctuary Census</span>
            </div>
            <h2 className="font-serif-cinzel text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Weekly Assembly Attendance Heatmap
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Visualizing congregation density, logging member & newcomer attendance, and managing newcomer follow-up schedules.
            </p>
          </div>

          {/* Quick Actions & Record Triggers */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => handleOpenAddForSlot()}
              id="record-church-attendance-btn"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:from-indigo-900 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Record Member or Newcomer church attendance"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Record Attendance</span>
            </button>

            <button
              onClick={() => handleOpenScheduleModal()}
              id="schedule-visitation-btn"
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#7D3AC1] dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Schedule Follow-Up & Visitation for Newcomers"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Visitation</span>
            </button>

            <button
              onClick={handleSpotlightPeak}
              id="spotlight-peak-assembly-btn"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-[#0B1F4D] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              title="Jump directly to peak Lord's Day assembly"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spotlight Peak</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('heatmap')}
            id="tab-heatmap-matrix"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-[#0B1F4D] dark:bg-indigo-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heatmap Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            id="tab-attendance-records"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'records'
                ? 'bg-[#0B1F4D] dark:bg-indigo-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Attendance Records</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {attendanceRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('visitation')}
            id="tab-newcomer-visitation"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'visitation'
                ? 'bg-[#0B1F4D] dark:bg-indigo-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Follow-Up & Visitation</span>
            {stats.pendingVisitations > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-[#0B1F4D] font-black">
                {stats.pendingVisitations}
              </span>
            )}
          </button>
        </div>

        {/* KPI Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0B1F4D] dark:text-[#D4AF37]" />
              <span>Weekly Census</span>
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {stats.totalWeeklyTurnout.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              &uarr; 4.8% turnout
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
            <span className="text-[11px] font-bold text-amber-700 dark:text-[#D4AF37] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Sanctuary Peak</span>
            </span>
            <div className="text-lg font-bold text-amber-900 dark:text-amber-200 mt-1">
              {stats.peakItem ? `${stats.peakItem.headcount}` : '520'}
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold truncate block">
              Sun 10:45 AM (95%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30">
            <span className="text-[11px] font-bold text-[#7D3AC1] dark:text-purple-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7D3AC1]" />
              <span>Midweek Peak</span>
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {stats.midweekItem ? `${stats.midweekItem.headcount}` : '285'}
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium truncate block">
              Wed 7:00 PM Miracle
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Members Logged</span>
            </span>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-200 mt-1">
              {stats.totalMembersRecorded}
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">
              Verified disciples
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Newcomers Logged</span>
            </span>
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mt-1">
              {stats.totalNewcomersRecorded}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              First-time guests
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Pending Visits</span>
            </span>
            <div className="text-lg font-bold text-rose-900 dark:text-rose-200 mt-1">
              {stats.pendingVisitations}
            </div>
            <span className="text-[10px] text-rose-600 dark:text-rose-400">
              Awaiting pastoral call
            </span>
          </div>
        </div>

        {activeTab === 'heatmap' && (
          <>
            {/* 2. Interactive Filter & Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="heatmap-category-filter" className="font-semibold text-slate-600 dark:text-slate-300">
                Service Type:
              </label>
              <select
                id="heatmap-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
              >
                <option value="All">All Categories ({data.length})</option>
                <option value="Worship">Worship Services</option>
                <option value="Prayer">Prayer Altars & Vigils</option>
                <option value="Youth">Youth & Young Adults</option>
                <option value="Discipleship">Discipleship & Academy</option>
                <option value="Fellowship">Fellowships & Circles</option>
                <option value="Outreach">Outreach & Evangelism</option>
              </select>
            </div>

            {/* Campus Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="heatmap-campus-filter" className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Venue:</span>
              </label>
              <select
                id="heatmap-campus-filter"
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
              >
                <option value="All">All Sanctuary Venues</option>
                <option value="Main Sanctuary">Main Sanctuary (550 cap)</option>
                <option value="Family Life">Family Life Center</option>
                <option value="Fellowship Hall">Fellowship Hall</option>
                <option value="Prayer Chapel">Prayer Chapel</option>
              </select>
            </div>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDisplayMode('headcount')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                displayMode === 'headcount'
                  ? 'bg-[#0B1F4D] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Headcount
            </button>
            <button
              onClick={() => setDisplayMode('capacity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                displayMode === 'capacity'
                  ? 'bg-[#0B1F4D] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              % Capacity
            </button>
            <button
              onClick={() => setDisplayMode('intensity')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                displayMode === 'intensity'
                  ? 'bg-[#0B1F4D] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Heat Intensity
            </button>
          </div>
        </div>

        {/* 3. The 7x6 Interactive Matrix */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[720px]">
            {/* Days of Week Column Headers */}
            <div className="grid grid-cols-8 gap-2 mb-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="text-left font-serif-cinzel text-slate-400 dark:text-slate-500 py-1 pl-2">
                Time Window
              </div>
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.short}
                  className={`py-1.5 px-2 rounded-lg ${
                    day.index === 0
                      ? 'bg-amber-500/10 text-amber-700 dark:text-[#D4AF37] border border-amber-500/30'
                      : day.index === 3
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-100 dark:bg-slate-800/60'
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                    {day.short}
                  </span>
                  <span>{day.full}</span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <div key={slot.id} className="grid grid-cols-8 gap-2 items-stretch">
                  {/* Row Time Label */}
                  <div className="flex flex-col justify-center text-left py-2 px-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {slot.label}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate" title={slot.description}>
                      {slot.description}
                    </span>
                  </div>

                  {/* 7 Day Columns for this Time Slot */}
                  {DAYS_OF_WEEK.map((day) => {
                    const cellItem = matrixLookup.get(`${day.index}-${slot.id}`);
                    const cellStyle = getCellIntensityStyle(cellItem);

                    return (
                      <div
                        key={`${day.index}-${slot.id}`}
                        onClick={() => handleCellClick(cellItem)}
                        onMouseEnter={() => cellItem && setHoveredSlot(cellItem)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`relative rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer min-h-[72px] select-none ${cellStyle}`}
                      >
                        {cellItem ? (
                          <>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold truncate" title={cellItem.assemblyTitle}>
                                {cellItem.category}
                              </span>
                              {cellItem.isPeak && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              )}
                            </div>

                            <div className="text-center my-auto py-1">
                              {displayMode === 'headcount' && (
                                <div className="text-sm font-bold tracking-tight">
                                  {cellItem.headcount}
                                  <span className="text-[9px] font-normal opacity-75 block">disciples</span>
                                </div>
                              )}
                              {displayMode === 'capacity' && (
                                <div className="text-sm font-bold tracking-tight">
                                  {cellItem.capacityPercent}%
                                  <span className="text-[9px] font-normal opacity-75 block">capacity</span>
                                </div>
                              )}
                              {displayMode === 'intensity' && (
                                <div className="flex items-center justify-center gap-0.5">
                                  <Flame className={`w-3.5 h-3.5 ${cellItem.headcount > 300 ? 'text-amber-500' : 'text-purple-400'}`} />
                                  <span className="text-xs font-bold">{cellItem.headcount}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-[9px] text-slate-400 truncate opacity-90" title={cellItem.assemblyTitle}>
                              {cellItem.assemblyTitle.substring(0, 16)}..
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-slate-400 italic">
                            &mdash;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Attendance Density:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                <span className="text-[11px]">&lt; 130</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-400" />
                <span className="text-[11px]">130 - 249</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-purple-600/30 border border-purple-500" />
                <span className="text-[11px]">250 - 449</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500/40 border border-[#D4AF37]" />
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">450+ (Sanctuary Peak)</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Click any assembly card to inspect pastoral ministry details below</span>
          </div>
        </div>
          </>
        )}
      </div>

      {/* When activeTab === 'records' */}
      {activeTab === 'records' && (
        <AttendanceRecordsList
          records={attendanceRecords}
          assemblySlots={data}
          onDeleteRecord={handleDeleteAttendanceRecord}
          onOpenAddModal={() => handleOpenAddForSlot()}
          onScheduleVisitation={handleOpenScheduleModal}
        />
      )}

      {/* When activeTab === 'visitation' */}
      {activeTab === 'visitation' && (
        <NewcomerVisitationScheduleView
          schedules={visitationSchedules}
          onOpenAddSchedule={() => handleOpenScheduleModal()}
          onEditSchedule={handleOpenScheduleModal}
          onDeleteSchedule={handleDeleteVisitationSchedule}
          onUpdateStatus={handleUpdateVisitationStatus}
        />
      )}

      {/* 5. Selected Assembly Detail Inspector Card (shown in Heatmap tab) */}
      {activeTab === 'heatmap' && selectedSlot && (
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-purple-50/40 dark:from-slate-900/90 dark:to-indigo-950/40 border border-purple-200/80 dark:border-indigo-900 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-indigo-950/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1F4D] to-[#7D3AC1] flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#7D3AC1]/10 text-[#7D3AC1] dark:text-[#D4AF37]">
                    {selectedSlot.dayName} &bull; {selectedSlot.timeLabel}
                  </span>
                  {selectedSlot.isPeak && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-[#0B1F4D]">
                      WEEKLY PEAK
                    </span>
                  )}
                </div>
                <h3 className="font-serif-cinzel text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedSlot.assemblyTitle}
                </h3>
              </div>
            </div>

            {/* Attendance & Capacity Badge + Record Button */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Headcount Census</span>
                <span className="text-xl font-bold text-[#0B1F4D] dark:text-[#D4AF37]">
                  {selectedSlot.headcount} attendees
                </span>
              </div>
              <div className="h-8 w-px bg-purple-200 dark:bg-indigo-900" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Sanctuary Fill</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedSlot.capacityPercent}%
                </span>
              </div>

              <button
                onClick={() => handleOpenAddForSlot(selectedSlot.id)}
                id="record-slot-attendance-btn"
                className="ml-2 px-3 py-1.5 rounded-xl bg-[#0B1F4D] dark:bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title={`Record Member or Newcomer for ${selectedSlot.assemblyTitle}`}
              >
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Record for Slot</span>
              </button>
            </div>
          </div>

          {/* Detail Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Pastoral Leadership</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>{selectedSlot.pastoralLead}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Sanctuary Venue / Room</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedSlot.campus} (Max: {selectedSlot.capacityMax})</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Classification</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{selectedSlot.category} Ministry Assembly</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Parish Documentation</span>
              <p className="text-slate-600 dark:text-slate-300 italic text-[11px] leading-relaxed">
                "{selectedSlot.notes}"
              </p>
            </div>
          </div>

          {/* Assembly Checked-In Roster (Members & Newcomers for this Slot) */}
          <div className="pt-3 border-t border-purple-100 dark:border-indigo-950/80">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Checked-In Assembly Roster ({slotAttendees.length})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  &bull; {slotMembers.length} Members, {slotNewcomers.length} Newcomers
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddForSlot(selectedSlot.id)}
                  className="text-xs font-semibold text-[#7D3AC1] dark:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attendee</span>
                </button>
              </div>
            </div>

            {slotAttendees.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>No individual members or newcomers logged for this assembly slot yet. Click </span>
                <button
                  onClick={() => handleOpenAddForSlot(selectedSlot.id)}
                  className="text-[#7D3AC1] dark:text-[#D4AF37] font-semibold underline inline cursor-pointer"
                >
                  Record for Slot
                </button>
                <span> to register attendees.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {slotAttendees.map((attendee) => {
                  const isNewcomer = attendee.attendeeType === 'Newcomer';
                  const hasVisitation = visitationSchedules.some((v) => v.attendanceRecordId === attendee.id || v.newcomerName.toLowerCase() === attendee.name.toLowerCase());

                  return (
                    <div
                      key={attendee.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs transition-all ${
                        isNewcomer
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {attendee.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                              isNewcomer
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            {attendee.attendeeType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{attendee.fellowship}</span>
                          <span>&bull;</span>
                          <span>{attendee.checkInTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isNewcomer && (
                          <button
                            onClick={() => {
                              const existing = visitationSchedules.find(
                                (v) => v.newcomerName.toLowerCase() === attendee.name.toLowerCase()
                              );
                              if (existing) {
                                handleOpenScheduleModal(existing);
                              } else {
                                handleOpenScheduleModal({
                                  id: `vis-${Date.now()}`,
                                  newcomerName: attendee.name,
                                  newcomerPhone: attendee.phone || '(555) 000-0000',
                                  newcomerEmail: attendee.email || '',
                                  address: '',
                                  fellowship: attendee.fellowship,
                                  firstVisitDate: attendee.date || new Date().toISOString().split('T')[0],
                                  assemblyTitle: selectedSlot.assemblyTitle,
                                  assemblySlotId: selectedSlot.id,
                                  visitationDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                                  visitationTime: '18:00',
                                  visitationType: 'Home Visitation',
                                  assignedMinister: 'Associate Pastor David Chen',
                                  status: 'Scheduled',
                                  notes: `Follow-up after ${selectedSlot.assemblyTitle}`,
                                  createdAt: new Date().toISOString()
                                });
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                              hasVisitation
                                ? 'bg-purple-100 dark:bg-purple-900/60 text-[#7D3AC1] dark:text-purple-300'
                                : 'bg-amber-500 hover:bg-amber-600 text-[#0B1F4D]'
                            }`}
                            title={hasVisitation ? 'View Follow-Up Schedule' : 'Schedule Newcomer Follow-Up & Visitation'}
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{hasVisitation ? 'Visit Set' : 'Schedule Visit'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteAttendanceRecord(attendee.id, attendee.name)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title={`Delete ${attendee.name} attendance`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Record Modal */}
      <AttendanceRecordModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onSave={handleSaveAttendance}
        slots={data}
        selectedSlotId={preselectedSlotForAdd}
        members={members}
      />

      {/* Newcomer Visitation Modal */}
      <NewcomerVisitationModal
        isOpen={isVisitationModalOpen}
        onClose={() => {
          setIsVisitationModalOpen(false);
          setVisitationToEdit(null);
        }}
        onSave={handleSaveVisitation}
        visitationToEdit={visitationToEdit}
      />
    </div>
  );
};
