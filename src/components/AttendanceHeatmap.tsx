import React, { useState, useMemo } from 'react';
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
  Building2
} from 'lucide-react';

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

interface AttendanceHeatmapProps {
  initialData?: AssemblySlotData[];
  onSelectSlot?: (slot: AssemblySlotData) => void;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({
  initialData = INITIAL_HEATMAP_DATA,
  onSelectSlot
}) => {
  const [data] = useState<AssemblySlotData[]>(initialData);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('sun-m2'); // default to peak
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [campusFilter, setCampusFilter] = useState<string>('All');
  const [displayMode, setDisplayMode] = useState<'headcount' | 'capacity' | 'intensity'>('headcount');
  const [hoveredSlot, setHoveredSlot] = useState<AssemblySlotData | null>(null);

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

    return {
      totalWeeklyTurnout,
      peakItem,
      midweekItem,
      avgCapacity
    };
  }, [data]);

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
    if (item.headcount >= 450 || item.isPeak && item.dayIndex === 0) {
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
              Visualizing congregation density across 7 weekly assembly days and 6 hourly sanctuary windows.
            </p>
          </div>

          {/* Quick Action & Spotlight */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleSpotlightPeak}
              id="spotlight-peak-assembly-btn"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-[#0B1F4D] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              title="Jump directly to peak Lord's Day assembly"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spotlight Peak Assembly</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0B1F4D] dark:text-[#D4AF37]" />
              <span>Total Weekly Turnout</span>
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.totalWeeklyTurnout.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">Attendees</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              &uarr; 4.8% vs last month
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30">
            <span className="text-[11px] font-bold text-amber-700 dark:text-[#D4AF37] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Sanctuary Peak Assembly</span>
            </span>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">
              {stats.peakItem ? `${stats.peakItem.headcount} Disciples` : '520 Disciples'}
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
              Sunday 10:45 AM (95% Sanctuary Cap.)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30">
            <span className="text-[11px] font-bold text-[#7D3AC1] dark:text-purple-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7D3AC1]" />
              <span>Midweek Peak Assembly</span>
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.midweekItem ? `${stats.midweekItem.headcount} Attendees` : '285 Attendees'}
            </div>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">
              Wednesday 7:00 PM Miracle Service
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Avg Sanctuary Utilization</span>
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.avgCapacity}% Capacity
            </div>
            <span className="text-[10px] text-slate-400">
              Optimal seating distribution
            </span>
          </div>
        </div>

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
      </div>

      {/* 5. Selected Assembly Detail Inspector Card */}
      {selectedSlot && (
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-purple-50/40 dark:from-slate-900/90 dark:to-indigo-950/40 border border-purple-200/80 dark:border-indigo-900 shadow-sm space-y-4">
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

            {/* Attendance & Capacity Badge */}
            <div className="flex items-center gap-3 shrink-0">
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
        </div>
      )}
    </div>
  );
};
