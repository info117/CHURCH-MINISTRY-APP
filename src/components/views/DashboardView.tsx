import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Calendar,
  Users,
  BookOpen,
  HeartHandshake,
  ScanEye,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Cake,
  Gift,
  Heart,
  Phone,
  Mail,
  Copy,
  Boxes
} from 'lucide-react';
import {
  ChurchProfile,
  Sermon,
  ChurchOperationEvent,
  WeeklyScheduleItem,
  PrayerRequest,
  BibleTranslation,
  CelebrationAlert,
  ChurchMember
} from '../../types';
import { sampleMembers } from '../../data/initialData';
import { DailyScriptureReflectionWidget } from '../DailyScriptureReflectionWidget';
import { generatePastoralMilestoneGreeting } from '../../lib/celebrationWatcher';

interface DashboardViewProps {
  churchProfile: ChurchProfile;
  sermons: Sermon[];
  operations: ChurchOperationEvent[];
  schedule: WeeklyScheduleItem[];
  prayers: PrayerRequest[];
  selectedTranslation: BibleTranslation;
  celebrationAlerts?: CelebrationAlert[];
  members?: ChurchMember[];
  onNavigateTo: (toolId: string) => void;
  onQuickAiAsk: (prompt: string) => void;
  onSendToSermonBuilder?: (scriptureRef: string, theme: string) => void;
}

interface AttendanceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAttendanceTooltip: React.FC<AttendanceTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/95 dark:bg-[#071430]/95 border border-slate-700 dark:border-indigo-900 shadow-xl backdrop-blur-md text-xs space-y-2 max-w-xs">
        <div className="font-bold text-white flex items-center justify-between gap-3 pb-1.5 border-b border-slate-700/60">
          <span className="font-serif-cinzel text-sm text-[#D4AF37]">{label} 2026</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {data.eventCount} {data.eventCount === 1 ? 'Operation' : 'Operations'}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              Expected:
            </span>
            <span className="font-bold font-mono text-white">
              {data.expected.toLocaleString()} souls
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7D3AC1]" />
              Actual:
            </span>
            <span className="font-bold font-mono text-white">
              {data.actual.toLocaleString()} souls
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
            <span className="text-slate-400">Turnout Variance:</span>
            <span className={`font-bold font-mono ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.variance >= 0 ? `+${data.variance.toLocaleString()}` : data.variance.toLocaleString()} ({data.percentage >= 0 ? `+${data.percentage}%` : `${data.percentage}%`})
            </span>
          </div>
        </div>
        {data.eventsSummary && (
          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60">
            <strong className="text-slate-300 not-italic">Featured:</strong> {data.eventsSummary}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  churchProfile,
  sermons = [],
  operations = [],
  schedule = [],
  prayers = [],
  selectedTranslation,
  celebrationAlerts = [],
  members = [],
  onNavigateTo,
  onQuickAiAsk,
  onSendToSermonBuilder
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [selectedAlertForGreeting, setSelectedAlertForGreeting] = useState<CelebrationAlert | null>(null);
  const [copiedGreeting, setCopiedGreeting] = useState(false);
  const [celebrationFilterCategory, setCelebrationFilterCategory] = useState<'all' | 'birthdays' | 'anniversaries'>('all');

  // Resolve members roster
  const effectiveMembers = members && members.length > 0 ? members : sampleMembers;

  // Calculate upcoming birthdays and anniversaries for the current month
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (8 for September)
    const todayDate = now.getDate();
    const currentMonthName = now.toLocaleDateString('en-US', { month: 'long' });
    const currentMonthShort = now.toLocaleDateString('en-US', { month: 'short' });

    // Days in current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = Math.max(0, lastDayOfMonth - todayDate);

    interface MonthCelebrationItem {
      id: string;
      memberId: string;
      memberName: string;
      type: 'Birthday' | 'Wedding Anniversary';
      dateStr: string;
      dayOfMonth: number;
      daysUntil: number;
      isUpcoming: boolean;
      isToday: boolean;
      yearsElapsed: number;
      formattedDate: string;
      role: string;
      fellowship: string;
      phone?: string;
      email?: string;
      message: string;
    }

    const birthdays: MonthCelebrationItem[] = [];
    const anniversaries: MonthCelebrationItem[] = [];

    effectiveMembers.forEach((m) => {
      const fullName = `${m.firstName} ${m.lastName}`.trim();

      // Check birthDate
      if (m.birthDate) {
        const parts = m.birthDate.split('-');
        if (parts.length >= 2) {
          const birthMonth = parseInt(parts[parts.length - 2], 10) - 1;
          const birthDay = parseInt(parts[parts.length - 1], 10);
          const birthYear = parts.length === 3 ? parseInt(parts[0], 10) : currentYear;

          if (birthMonth === currentMonth) {
            const isToday = birthDay === todayDate;
            const isUpcoming = birthDay >= todayDate;
            const daysUntil = birthDay - todayDate;
            const age = currentYear - birthYear;
            const formattedDate = new Date(currentYear, birthMonth, birthDay).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            birthdays.push({
              id: `bday-${m.id}`,
              memberId: m.id,
              memberName: fullName,
              type: 'Birthday',
              dateStr: m.birthDate,
              dayOfMonth: birthDay,
              daysUntil,
              isUpcoming,
              isToday,
              yearsElapsed: age > 0 ? age : 0,
              formattedDate,
              role: m.role,
              fellowship: m.fellowship,
              phone: m.phone,
              email: m.email,
              message: isToday
                ? `🎉 TODAY is ${fullName}'s ${age > 0 ? `${age}th ` : ''}Birthday! Send pastoral greetings and blessings.`
                : daysUntil === 1
                ? `🎂 Tomorrow (${formattedDate}) is ${fullName}'s ${age > 0 ? `${age}th ` : ''}Birthday.`
                : isUpcoming
                ? `🎂 Upcoming Birthday: ${fullName}${age > 0 ? ` (${age} yrs)` : ''} in ${daysUntil} days on ${formattedDate}.`
                : `Celebrated earlier on ${formattedDate}.`
            });
          }
        }
      }

      // Check weddingAnniversary
      if (m.weddingAnniversary) {
        const parts = m.weddingAnniversary.split('-');
        if (parts.length >= 2) {
          const annivMonth = parseInt(parts[parts.length - 2], 10) - 1;
          const annivDay = parseInt(parts[parts.length - 1], 10);
          const annivYear = parts.length === 3 ? parseInt(parts[0], 10) : currentYear;

          if (annivMonth === currentMonth) {
            const isToday = annivDay === todayDate;
            const isUpcoming = annivDay >= todayDate;
            const daysUntil = annivDay - todayDate;
            const yearsMarried = currentYear - annivYear;
            const formattedDate = new Date(currentYear, annivMonth, annivDay).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });

            anniversaries.push({
              id: `anniv-${m.id}`,
              memberId: m.id,
              memberName: fullName,
              type: 'Wedding Anniversary',
              dateStr: m.weddingAnniversary,
              dayOfMonth: annivDay,
              daysUntil,
              isUpcoming,
              isToday,
              yearsElapsed: yearsMarried > 0 ? yearsMarried : 0,
              formattedDate,
              role: m.role,
              fellowship: m.fellowship,
              phone: m.phone,
              email: m.email,
              message: isToday
                ? `💍 TODAY is ${fullName}'s ${yearsMarried > 0 ? `${yearsMarried}th ` : ''}Wedding Anniversary! Celebrate God's marital covenant.`
                : daysUntil === 1
                ? `💍 Tomorrow (${formattedDate}) is ${fullName}'s ${yearsMarried > 0 ? `${yearsMarried}th ` : ''}Wedding Anniversary.`
                : isUpcoming
                ? `💍 Upcoming Anniversary: ${fullName}${yearsMarried > 0 ? ` (${yearsMarried}th yr)` : ''} in ${daysUntil} days on ${formattedDate}.`
                : `Celebrated earlier on ${formattedDate}.`
            });
          }
        }
      }
    });

    // Upcoming celebrations sorted by daysUntil
    const upcomingBirthdays = birthdays
      .filter((b) => b.isUpcoming)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const upcomingAnniversaries = anniversaries
      .filter((a) => a.isUpcoming)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const allUpcoming = [...upcomingBirthdays, ...upcomingAnniversaries].sort(
      (a, b) => a.daysUntil - b.daysUntil
    );

    return {
      currentMonthName,
      currentMonthShort,
      currentYear,
      todayDate,
      daysRemaining,
      totalBirthdaysInMonth: birthdays.length,
      upcomingBirthdaysCount: upcomingBirthdays.length,
      upcomingBirthdays,
      totalAnniversariesInMonth: anniversaries.length,
      upcomingAnniversariesCount: upcomingAnniversaries.length,
      upcomingAnniversaries,
      totalUpcomingCount: allUpcoming.length,
      allUpcoming
    };
  }, [effectiveMembers]);

  const handleOpenBlessingFromMonthItem = (item: any) => {
    setSelectedAlertForGreeting({
      id: item.id,
      memberId: item.memberId,
      memberName: item.memberName,
      fellowship: item.fellowship,
      role: item.role,
      email: item.email,
      phone: item.phone,
      type: item.type,
      originalDate: item.dateStr,
      daysUntil: Math.max(0, item.daysUntil),
      ageOrYears: item.yearsElapsed,
      celebrationDateFormatted: item.formattedDate,
      message: item.message,
      priority: item.daysUntil <= 1 ? 'today' : 'upcoming'
    });
  };
  const [enabledWidgets, setEnabledWidgets] = useState({
    verseOfDay: true,
    quickStats: true,
    attendanceTrend: true,
    celebrations: true,
    upcomingOps: true,
    todaysMeetings: true,
    recentSermon: true,
    prayerRequests: true,
    visionCard: true
  });

  // Calculate 6-month expected vs actual attendance trend from operations state
  const attendanceTrendData = useMemo(() => {
    // Current date anchor: Sep 2026
    const anchor = new Date('2026-09-13T00:00:00');
    const pastMonths: { key: string; label: string; year: number; month: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      pastMonths.push({
        key,
        label,
        year: d.getFullYear(),
        month: d.getMonth() + 1
      });
    }

    return pastMonths.map((m) => {
      // Find operations in this month
      const opsInMonth = (operations || []).filter((op) => {
        const dateStr = op.startDate || op.date || '';
        return dateStr.startsWith(m.key);
      });

      const expected = opsInMonth.reduce((acc, op) => acc + (op.expectedAttendance || 0), 0);
      const actual = opsInMonth.reduce((acc, op) => {
        const act = typeof op.actualAttendance === 'number' ? op.actualAttendance : op.expectedAttendance;
        return acc + (act || 0);
      }, 0);

      const variance = actual - expected;
      const pct = expected > 0 ? Math.round(((actual - expected) / expected) * 100) : 0;
      const eventsSummary = opsInMonth.map(op => op.name).join(', ') || 'Regular Sanctuary Operations';

      return {
        month: m.label,
        key: m.key,
        'Expected Attendance': expected,
        'Actual Attendance': actual,
        expected,
        actual,
        variance,
        percentage: pct,
        eventCount: opsInMonth.length,
        eventsSummary
      };
    });
  }, [operations]);

  const total6MoExpected = useMemo(() => 
    attendanceTrendData.reduce((sum, d) => sum + d.expected, 0), [attendanceTrendData]);
  const total6MoActual = useMemo(() => 
    attendanceTrendData.reduce((sum, d) => sum + d.actual, 0), [attendanceTrendData]);
  const totalVariance = total6MoActual - total6MoExpected;
  const totalVariancePct = total6MoExpected > 0 ? Math.round((totalVariance / total6MoExpected) * 100) : 0;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysEvents = schedule.filter(item => item.dayOfWeek === currentDayName);

  const activePrayersCount = prayers.filter(p => p.status === 'Active' || p.status === 'Urgent').length;
  const upcomingCrusadesCount = operations.filter(o => o.status === 'Active' || o.status === 'Planning').length;

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onQuickAiAsk(quickPrompt);
  };

  return (
    <div id="dashboard-view-container" className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1F4D] via-[#201C60] to-[#7D3AC1] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{todayStr} &bull; Sanctuary Overview</span>
            </div>
            <h1 className="font-serif-cinzel text-2xl md:text-3xl font-bold tracking-tight text-white">
              Welcome, Beloved of God
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              "{churchProfile.tagline}" &bull; Equipping saints with Scripture, prayer, and Computer Vision ministry tools.
            </p>
          </div>

          {/* Quick AI Trigger */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 w-full md:w-80 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
              <span className="flex items-center gap-1.5 text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                FaithGPT Companion
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">{selectedTranslation}</span>
            </div>
            <form onSubmit={handleAiSubmit} className="flex gap-2">
              <input
                id="quick-dashboard-ai-input"
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask Scripture, outline or sermon theme..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                Ask
              </button>
            </form>
          </div>
        </div>

        {/* Widget Customizer Toggle Button */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autonomous A2A & Judge Agent Active &bull; Offline Sync Ready</span>
          </div>
          <button
            onClick={() => setShowWidgetConfig(!showWidgetConfig)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Widgets</span>
          </button>
        </div>

        {/* Config Panel */}
        {showWidgetConfig && (
          <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/20 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(enabledWidgets).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setEnabledWidgets({ ...enabledWidgets, [key]: e.target.checked })}
                  className="rounded border-white/30 text-[#7D3AC1] focus:ring-0"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Daily Scripture & Reflection Widget */}
      {enabledWidgets.verseOfDay && (
        <DailyScriptureReflectionWidget
          selectedTranslation={selectedTranslation}
          onNavigateToSermons={(scriptureRef, theme) => {
            if (onSendToSermonBuilder) {
              onSendToSermonBuilder(scriptureRef, theme);
            } else {
              onNavigateTo('sermons');
            }
          }}
        />
      )}

      {/* Quick Metrics Grid */}
      {enabledWidgets.quickStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTo('congregation')}
            className="p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs hover:border-[#7D3AC1] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Congregation</span>
              <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">840</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>+18 souls &bull; {currentMonthStats.totalUpcomingCount} milestones in {currentMonthStats.currentMonthShort}</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTo('operations')}
            className="p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs hover:border-[#7D3AC1] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Crusades & Missions</span>
              <Flame className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{upcomingCrusadesCount}</div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Metro Harvest (Oct 16-18)
            </div>
          </div>

          <div
            onClick={() => onNavigateTo('resources')}
            className="p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs hover:border-[#7D3AC1] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Equipment & AV</span>
              <Boxes className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Active</div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Resource Booking Ready
            </div>
          </div>

          <div
            onClick={() => onNavigateTo('sermons')}
            className="p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs hover:border-[#7D3AC1] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Sermon Archives</span>
              <BookOpen className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{sermons.length}</div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              PDF Print & Study Ready
            </div>
          </div>
        </div>
      )}

      {/* Visual Summary Card: Upcoming Birthdays & Anniversaries for the Current Month */}
      {enabledWidgets.celebrations && (
        <div
          id="dashboard-monthly-celebrations-summary-card"
          className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] shadow-xs">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif-cinzel font-bold text-base md:text-lg text-slate-900 dark:text-white">
                    {currentMonthStats.currentMonthName} Celebrations & Covenant Milestones
                  </h3>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    {currentMonthStats.currentMonthName} {currentMonthStats.currentYear}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upcoming member birthdays and wedding anniversaries tracked for pastoral fellowship and blessings.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTo('congregation')}
              className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center"
            >
              <span>View Congregation Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Upcoming Birthdays */}
            <div
              onClick={() => setCelebrationFilterCategory('birthdays')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                celebrationFilterCategory === 'birthdays'
                  ? 'bg-purple-50/80 dark:bg-purple-950/40 border-[#7D3AC1] ring-1 ring-[#7D3AC1]'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-indigo-950 hover:border-purple-300 dark:hover:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Upcoming Birthdays
                </span>
                <span className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-[#7D3AC1] dark:text-purple-300">
                  <Cake className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-purple-700 dark:text-purple-300">
                {currentMonthStats.upcomingBirthdaysCount}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{currentMonthStats.totalBirthdaysInMonth} total in {currentMonthStats.currentMonthShort}</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  {currentMonthStats.upcomingBirthdaysCount > 0 ? 'Upcoming' : 'None Left'}
                </span>
              </div>
            </div>

            {/* Card 2: Upcoming Anniversaries */}
            <div
              onClick={() => setCelebrationFilterCategory('anniversaries')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                celebrationFilterCategory === 'anniversaries'
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-indigo-950 hover:border-rose-300 dark:hover:border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Upcoming Anniversaries
                </span>
                <span className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300">
                  <Heart className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {currentMonthStats.upcomingAnniversariesCount}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{currentMonthStats.totalAnniversariesInMonth} total in {currentMonthStats.currentMonthShort}</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {currentMonthStats.upcomingAnniversariesCount > 0 ? 'Upcoming' : 'None Left'}
                </span>
              </div>
            </div>

            {/* Card 3: Total Month Milestones */}
            <div
              onClick={() => setCelebrationFilterCategory('all')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                celebrationFilterCategory === 'all'
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-indigo-950 hover:border-amber-300 dark:hover:border-amber-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Total Month Milestones
                </span>
                <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <Gift className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {currentMonthStats.totalUpcomingCount}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{currentMonthStats.daysRemaining} days left in {currentMonthStats.currentMonthShort}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Active Filter
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills & Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs self-start">
              <button
                onClick={() => setCelebrationFilterCategory('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  celebrationFilterCategory === 'all'
                    ? 'bg-white dark:bg-[#0B1F4D] text-[#7D3AC1] dark:text-[#D4AF37] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Upcoming ({currentMonthStats.totalUpcomingCount})
              </button>
              <button
                onClick={() => setCelebrationFilterCategory('birthdays')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  celebrationFilterCategory === 'birthdays'
                    ? 'bg-white dark:bg-[#0B1F4D] text-[#7D3AC1] dark:text-[#D4AF37] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Birthdays ({currentMonthStats.upcomingBirthdaysCount})
              </button>
              <button
                onClick={() => setCelebrationFilterCategory('anniversaries')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  celebrationFilterCategory === 'anniversaries'
                    ? 'bg-white dark:bg-[#0B1F4D] text-[#7D3AC1] dark:text-[#D4AF37] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Anniversaries ({currentMonthStats.upcomingAnniversariesCount})
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Tracking for {currentMonthStats.currentMonthShort} {currentMonthStats.todayDate}, {currentMonthStats.currentYear}</span>
            </div>
          </div>

          {/* Cards for displayed upcoming celebrations */}
          {(() => {
            const listToDisplay =
              celebrationFilterCategory === 'birthdays'
                ? currentMonthStats.upcomingBirthdays
                : celebrationFilterCategory === 'anniversaries'
                ? currentMonthStats.upcomingAnniversaries
                : currentMonthStats.allUpcoming;

            if (listToDisplay.length === 0) {
              return (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Upcoming {celebrationFilterCategory === 'birthdays' ? 'Birthdays' : celebrationFilterCategory === 'anniversaries' ? 'Anniversaries' : 'Milestones'} Remaining in {currentMonthStats.currentMonthName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    All registered {celebrationFilterCategory === 'birthdays' ? 'birthdays' : celebrationFilterCategory === 'anniversaries' ? 'wedding anniversaries' : 'milestones'} for this month have occurred or are up to date. You can check the congregation roster for next month&apos;s upcoming celebrations.
                  </p>
                  <button
                    onClick={() => onNavigateTo('congregation')}
                    className="inline-flex items-center gap-1 text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline mt-2"
                  >
                    <span>Open Congregation Roster</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {listToDisplay.map((item) => {
                  const isAnniv = item.type === 'Wedding Anniversary';
                  const initials = item.memberName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.isToday
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-sm'
                          : 'bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                              isAnniv ? 'bg-rose-500' : 'bg-[#7D3AC1]'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {item.memberName}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.role} &bull; {item.fellowship}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            item.isToday
                              ? 'bg-rose-600 text-white animate-pulse'
                              : item.daysUntil === 1
                              ? 'bg-amber-500 text-white'
                              : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {item.isToday ? 'TODAY!' : item.daysUntil === 1 ? 'Tomorrow' : `In ${item.daysUntil} days`}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            isAnniv
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                          }`}
                        >
                          {isAnniv ? 'Wedding Anniversary' : 'Birthday'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          {item.formattedDate}
                          {item.yearsElapsed > 0 && ` (${item.yearsElapsed}${isAnniv ? 'th yr' : ' yrs'})`}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="hover:text-emerald-500 transition-colors p-1"
                              title={`Call ${item.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="hover:text-[#7D3AC1] transition-colors p-1"
                              title={`Email ${item.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenBlessingFromMonthItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B1F4D] dark:bg-[#7D3AC1] hover:opacity-90 text-white text-[11px] font-bold transition-opacity flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          <span>Pastoral Blessing</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Expected vs Actual Attendance Trend - Past 6 Months */}
      {enabledWidgets.attendanceTrend && (
        <div
          id="attendance-trend-widget"
          className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="font-serif-cinzel font-bold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Expected vs Actual Attendance Trend</span>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#7D3AC1] dark:text-purple-300">
                    Past 6 Months
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparative turnout metrics across evangelism campaigns, crusades, and sanctuary operations.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">6-Mo Expected</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{total6MoExpected.toLocaleString()}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">6-Mo Actual</span>
                  <span className="font-bold font-mono text-[#7D3AC1] dark:text-purple-300">{total6MoActual.toLocaleString()}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Net Turnout</span>
                  <span className={`font-bold font-mono ${totalVariance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {totalVariance >= 0 ? `+${totalVariance.toLocaleString()}` : totalVariance.toLocaleString()} ({totalVariancePct >= 0 ? `+${totalVariancePct}%` : `${totalVariancePct}%`})
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateTo('operations')}
                className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Manage Operations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="h-72 md:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 20, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                />
                <Tooltip content={<CustomAttendanceTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="Expected Attendance"
                  name="Expected Attendance"
                  stroke="#D4AF37"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#D4AF37', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#D4AF37' }}
                />
                <Line
                  type="monotone"
                  dataKey="Actual Attendance"
                  name="Actual Attendance"
                  stroke="#7D3AC1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7D3AC1', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#7D3AC1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Content Split: Operations/Schedule & Computer Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule & Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Meetings & Weekly Schedule */}
          {enabledWidgets.todaysMeetings && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <h2 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Schedule & Assemblies ({currentDayName})
                  </h2>
                </div>
                <button
                  onClick={() => onNavigateTo('calendar')}
                  className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Full Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {todaysEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {todaysEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-indigo-950/60 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evt.color }} />
                          {evt.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {evt.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {evt.location}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-[#7D3AC1] dark:text-purple-300">
                        {evt.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
                  No scheduled public services on {currentDayName}. Pastoral counseling and private prayer vigils active.
                </div>
              )}
            </div>
          )}

          {/* Active Church Operations & Crusades */}
          {enabledWidgets.upcomingOps && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h2 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Evangelism & Holy Ghost Crusades
                  </h2>
                </div>
                <button
                  onClick={() => onNavigateTo('operations')}
                  className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Manage Events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {operations.slice(0, 2).map((op) => (
                  <div
                    key={op.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 hover:border-[#D4AF37] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                        {op.type}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {op.startDate}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                      {op.name}
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{op.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Computer Vision & AI Shortcuts */}
        <div className="space-y-6">
          {/* Computer Vision Spotlight Card */}
          {enabledWidgets.visionCard && (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-900/10 via-white to-white dark:from-purple-950/40 dark:via-[#071430] dark:to-[#071430] border border-purple-200 dark:border-purple-900/50 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#7D3AC1] text-white">
                    <ScanEye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                      Computer Vision Lab
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Visual OCR & Crowd Count</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Ready
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Upload church bulletins, crusade flyers, or congregation photos. The Vision Agent extracts dates, Bible verses, crowd attendance, and suggests sermon outlines.
              </p>

              <button
                onClick={() => onNavigateTo('computervision')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:from-[#071430] hover:to-[#6023A1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ScanEye className="w-4 h-4 text-[#D4AF37]" />
                <span>Launch Computer Vision</span>
              </button>
            </div>
          )}

          {/* Prayer Wall Preview */}
          {enabledWidgets.prayerRequests && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[#7D3AC1]" />
                  <h3 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                    Urgent Intercession
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTo('devotionals')}
                  className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {prayers.slice(0, 2).map((pr) => (
                  <div
                    key={pr.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-indigo-950/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {pr.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold shrink-0">
                        {pr.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {pr.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Prepared Sermon */}
          {enabledWidgets.recentSermon && sermons[0] && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Latest Sermon Outline</span>
                <span className="text-[10px] text-slate-400">{sermons[0].date}</span>
              </div>
              <h4 className="font-serif-cinzel font-bold text-sm text-[#0B1F4D] dark:text-white">
                {sermons[0].title}
              </h4>
              <p className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold">
                Text: {sermons[0].mainScripture} ({sermons[0].bibleVersion})
              </p>
              <button
                onClick={() => onNavigateTo('sermons')}
                className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#7D3AC1] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Open Sermon Builder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pastoral Blessing & Milestone Celebration Modal */}
      {selectedAlertForGreeting && (() => {
        const greetingData = generatePastoralMilestoneGreeting(selectedAlertForGreeting);
        const fullMessageText = `${greetingData.prayerText}\n\nScripture Blessing (${greetingData.reference}):\n"${greetingData.scripture}"`;

        const handleCopyText = () => {
          navigator.clipboard.writeText(fullMessageText);
          setCopiedGreeting(true);
          setTimeout(() => setCopiedGreeting(false), 3000);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                      Pastoral Blessing & Prayer
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedAlertForGreeting.type} &bull; {selectedAlertForGreeting.memberName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlertForGreeting(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Scripture Quotation Card */}
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D3AC1] dark:text-[#D4AF37]">
                  Covenant Blessing Scripture &bull; {greetingData.reference} ({selectedTranslation})
                </span>
                <p className="font-serif-cinzel italic text-xs md:text-sm text-slate-800 dark:text-purple-100 leading-relaxed">
                  "{greetingData.scripture}"
                </p>
              </div>

              {/* Pastoral Message */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Pastoral Council Message:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {greetingData.prayerText}
                </p>
              </div>

              {/* Pastoral Contact & Communication Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {selectedAlertForGreeting.phone && (
                    <a
                      href={`tel:${selectedAlertForGreeting.phone}`}
                      className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Member</span>
                    </a>
                  )}
                  {selectedAlertForGreeting.email && (
                    <a
                      href={`mailto:${selectedAlertForGreeting.email}?subject=Pastoral%20Blessings%20on%20your%20${encodeURIComponent(selectedAlertForGreeting.type)}&body=${encodeURIComponent(fullMessageText)}`}
                      className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Greeting</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] hover:opacity-90 text-white font-bold text-xs transition-opacity flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedGreeting ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Copy Blessing</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedAlertForGreeting(null)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
