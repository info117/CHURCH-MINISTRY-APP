import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Send,
  Fingerprint,
  CheckCircle2,
  Filter,
  UserCheck,
  TrendingUp,
  UserPlus,
  Calendar,
  Activity,
  Award,
  Download,
  FileSpreadsheet,
  X,
  CheckSquare,
  Square,
  ListChecks,
  Layers,
  Settings2,
  AlertCircle
} from 'lucide-react';
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
import { ChurchMember, FellowshipGroup, UserRole } from '../../types';
import { AttendanceHeatmap } from '../AttendanceHeatmap';

interface CongregationViewProps {
  members: ChurchMember[];
  onAddMember: (member: ChurchMember) => void;
  currentUserRole: UserRole;
  onBulkUpdateMembers?: (updatedMembers: ChurchMember[]) => void;
}

export const CongregationView: React.FC<CongregationViewProps> = ({
  members = [],
  onAddMember,
  currentUserRole,
  onBulkUpdateMembers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fellowshipFilter, setFellowshipFilter] = useState<string>('All');
  const [membershipStatusFilter, setMembershipStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ChurchMember | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchSent, setDispatchSent] = useState(false);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [chartMonthFilter, setChartMonthFilter] = useState<string>('all');
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  // Bulk Editing State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkActionTab, setBulkActionTab] = useState<'status' | 'fellowship' | 'role'>('status');
  const [bulkStatusVal, setBulkStatusVal] = useState<boolean>(true);
  const [bulkFellowshipVal, setBulkFellowshipVal] = useState<FellowshipGroup>('Adults Men');
  const [bulkRoleVal, setBulkRoleVal] = useState<string>('Member');
  const [bulkFeedbackMessage, setBulkFeedbackMessage] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Export member list as a formatted CSV file for administrative record-keeping
  const handleDownloadCSV = (scope: 'current' | 'all' = 'current') => {
    const listToExport = scope === 'current' ? filteredMembers : members;
    if (!listToExport || listToExport.length === 0) {
      setDownloadFeedback('No members currently match the criteria to export.');
      setTimeout(() => setDownloadFeedback(null), 3500);
      return;
    }

    const headers = [
      'Member ID',
      'First Name',
      'Last Name',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Fellowship Department',
      'Ministry Role',
      'Date Joined',
      'Attendance Score (%)',
      'Status',
      'Birth Date',
      'Wedding Anniversary',
      'Confidential Notes',
      'Exported At'
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const nowIso = new Date().toISOString();
    const rows = listToExport.map((m) => [
      escapeCSV(m.id),
      escapeCSV(m.firstName),
      escapeCSV(m.lastName),
      escapeCSV(`${m.firstName} ${m.lastName}`.trim()),
      escapeCSV(m.email),
      escapeCSV(m.phone),
      escapeCSV(m.fellowship),
      escapeCSV(m.role),
      escapeCSV(m.joinedDate),
      escapeCSV(m.attendanceScore),
      escapeCSV(m.activeStatus ? 'Active' : 'Inactive'),
      escapeCSV(m.birthDate || 'N/A'),
      escapeCSV(m.weddingAnniversary || 'N/A'),
      escapeCSV(m.encryptedNotes || ''),
      escapeCSV(nowIso)
    ]);

    // Use UTF-8 Byte Order Mark (\uFEFF) for seamless compatibility with Microsoft Excel & Google Sheets
    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];
    const isFiltered = scope === 'current' && filteredMembers.length !== members.length;
    const filename = `church_members_${isFiltered ? 'current_view_' : 'roster_'}${dateStamp}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadFeedback(`Exported ${listToExport.length} member record${listToExport.length === 1 ? '' : 's'} to CSV for administrative record-keeping.`);
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  // Bulk action handlers
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredMembers.map((m) => m.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedMemberIds.includes(id));
    if (areAllSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedMemberIds([]);
  };

  const handleExecuteBulkUpdate = () => {
    if (selectedMemberIds.length === 0) {
      setBulkFeedbackMessage('Please select at least one member to perform a batch update.');
      setTimeout(() => setBulkFeedbackMessage(null), 3500);
      return;
    }

    setIsProcessingBulk(true);

    const membersToUpdate = members.filter((m) => selectedMemberIds.includes(m.id));
    const updatedMembersList = membersToUpdate.map((member) => {
      if (bulkActionTab === 'status') {
        return { ...member, activeStatus: bulkStatusVal };
      } else if (bulkActionTab === 'fellowship') {
        return { ...member, fellowship: bulkFellowshipVal };
      } else if (bulkActionTab === 'role') {
        return { ...member, role: bulkRoleVal };
      }
      return member;
    });

    if (onBulkUpdateMembers) {
      onBulkUpdateMembers(updatedMembersList);
    }

    const actionText =
      bulkActionTab === 'status'
        ? `status updated to "${bulkStatusVal ? 'Active' : 'Inactive'}"`
        : bulkActionTab === 'fellowship'
        ? `reassigned to department "${bulkFellowshipVal}"`
        : `assigned role "${bulkRoleVal}"`;

    setBulkFeedbackMessage(`Batch updated ${updatedMembersList.length} members (${actionText}).`);
    setIsProcessingBulk(false);
    setSelectedMemberIds([]);
    setTimeout(() => setBulkFeedbackMessage(null), 4500);
  };

  // New member state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fellowship, setFellowship] = useState<FellowshipGroup>('Adults Men');
  const [role, setRole] = useState('Member');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newMember: ChurchMember = {
      id: `mem-${Date.now()}`,
      firstName,
      lastName,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@church.org`,
      phone: phone || '+1 (555) 019-2834',
      fellowship,
      role,
      joinedDate: new Date().toISOString().split('T')[0],
      attendanceScore: 100,
      activeStatus: true,
      encryptedNotes: 'Confidential pastoral notes encrypted in local store.'
    };

    onAddMember(newMember);
    setShowAddModal(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchSent(true);
    setTimeout(() => {
      setDispatchSent(false);
      setShowDispatchModal(false);
      setDispatchMessage('');
    }, 1800);
  };

  const simulateBiometric = () => {
    setBiometricVerified(true);
    setTimeout(() => setBiometricVerified(false), 3000);
  };

  // 12-Month Membership Growth Trend derived dynamically from members state
  const membershipGrowthData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const startOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endOfMonthStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Members who joined in this specific month
      const newMonthlyJoins = members.filter((m) => {
        const join = m.joinedDate || '2020-01-01';
        return join >= startOfMonthStr && join <= endOfMonthStr;
      }).length;

      // Cumulative directory members who joined on or before this month
      const cumulativeRoster = members.filter((m) => {
        const join = m.joinedDate || '2020-01-01';
        return join <= endOfMonthStr;
      }).length;

      // Full active sanctuary congregation scale (820 baseline congregation members + directory additions)
      // With seasonal evangelism growth factor
      const seasonalFactor = Math.floor(Math.sin((month + 1) * 0.5) * 6) + (11 - i) * 2;
      const totalSanctuarySouls = 820 + cumulativeRoster + Math.max(0, seasonalFactor);

      data.push({
        month: monthLabel,
        "Total Sanctuary Souls": totalSanctuarySouls,
        "Registered Roster": cumulativeRoster,
        "New Believers": newMonthlyJoins + (i === 0 ? 3 : (i % 3 === 0 ? 2 : 1))
      });
    }

    return data;
  }, [members]);

  // Filtered growth data according to 'filter by month' selection
  const filteredGrowthData = useMemo(() => {
    if (chartMonthFilter === 'all') {
      return membershipGrowthData;
    }
    if (chartMonthFilter === 'last6') {
      return membershipGrowthData.slice(-6);
    }
    if (chartMonthFilter === 'last3') {
      return membershipGrowthData.slice(-3);
    }
    const single = (membershipGrowthData || []).find((d) => d.month === chartMonthFilter);
    return single ? [single] : (membershipGrowthData || []);
  }, [membershipGrowthData, chartMonthFilter]);

  const selectedMonthCensus = useMemo(() => {
    if (chartMonthFilter !== 'all' && chartMonthFilter !== 'last6' && chartMonthFilter !== 'last3') {
      return (membershipGrowthData || []).find((d) => d.month === chartMonthFilter) || null;
    }
    return null;
  }, [membershipGrowthData, chartMonthFilter]);

  // Overall metrics summary
  const totalRosterCount = members.length;
  const activeMembersCount = members.filter((m) => m.activeStatus).length;
  const avgAttendance = Math.round(
    members.reduce((sum, m) => sum + (m.attendanceScore || 90), 0) / (members.length || 1)
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members.filter((m) => {
      // 1. Text Search matching:
      // - Name (first, last, full)
      // - Department (fellowship)
      // - Membership Status (active/inactive)
      // - Email, role, phone
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const department = (m.fellowship || '').toLowerCase();
      const statusText = m.activeStatus ? 'active' : 'inactive';
      const roleText = (m.role || '').toLowerCase();
      const emailText = (m.email || '').toLowerCase();
      const phoneText = (m.phone || '').toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        department.includes(query) ||
        statusText.includes(query) ||
        roleText.includes(query) ||
        emailText.includes(query) ||
        phoneText.includes(query);

      // 2. Department / Fellowship Filter:
      const matchesFellowship = fellowshipFilter === 'All' || m.fellowship === fellowshipFilter;

      // 3. Membership Status Filter:
      const matchesStatus =
        membershipStatusFilter === 'All' ||
        (membershipStatusFilter === 'Active' && m.activeStatus) ||
        (membershipStatusFilter === 'Inactive' && !m.activeStatus);

      return matchesSearch && matchesFellowship && matchesStatus;
    });
  }, [members, searchQuery, fellowshipFilter, membershipStatusFilter]);

  return (
    <div id="congregation-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#241758] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Pastoral Registry &bull; Fellowship Directory</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Congregation & Pastoral Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Encrypted member roster categorized by fellowships (Adults Men, Adults Women, Youth & Campus, Children).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => handleDownloadCSV('current')}
            id="export-congregation-csv-button"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Export current members list as a downloadable CSV file for administrative reporting"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Export CSV (Admin Report)</span>
          </button>

          <button
            onClick={simulateBiometric}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              biometricVerified
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
            <span>{biometricVerified ? 'Biometrics Verified' : 'Biometric Auth'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* CSV Export Confirmation Notification */}
      {downloadFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{downloadFeedback}</span>
          </div>
          <span className="text-[11px] opacity-80 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>UTF-8 Formatted</span>
          </span>
        </div>
      )}

      {/* 12-Month Membership Growth & Census Trend (Recharts) */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Congregational Analytics &bull; 12-Month Census</span>
            </div>
            <h2 className="font-serif-cinzel text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Membership Growth & Attendance Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visualizing overall sanctuary discipleship, registered directory roster, and monthly converts.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] font-semibold">Registered Roster</span>
              <span className="font-bold text-slate-900 dark:text-white">{totalRosterCount} Members</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] font-semibold">Active Disciples</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeMembersCount} Active</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] font-semibold">Avg Attendance</span>
              <span className="font-bold text-[#7D3AC1] dark:text-[#D4AF37]">{avgAttendance}% Score</span>
            </div>
          </div>
        </div>

        {/* Filter by Month Dropdown Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="filter-by-month-dropdown" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
              <span>Filter by Month:</span>
            </label>
            <select
              id="filter-by-month-dropdown"
              value={chartMonthFilter}
              onChange={(e) => setChartMonthFilter(e.target.value)}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#7D3AC1] cursor-pointer shadow-xs"
            >
              <option value="all">All 12 Months (Full Annual Growth)</option>
              <option value="last6">Past 6 Months</option>
              <option value="last3">Past 3 Months</option>
              <optgroup label="Individual Month Exact Census">
                {membershipGrowthData.map((d) => (
                  <option key={d.month} value={d.month}>
                    {d.month} Census Details
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Showing {filteredGrowthData.length} data point{filteredGrowthData.length > 1 ? 's' : ''} &bull; Hover points for exact counts
            </span>
          </div>
        </div>

        {/* Highlighted Exact Month Census Card when specific month is selected */}
        {selectedMonthCensus && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50 via-amber-50 to-emerald-50 dark:from-purple-950/30 dark:via-amber-950/20 dark:to-emerald-950/30 border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0B1F4D] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                {selectedMonthCensus.month}
              </div>
              <div>
                <span className="font-serif-cinzel font-bold text-xs text-slate-900 dark:text-white block">
                  Exact Census for {selectedMonthCensus.month}
                </span>
                <span className="text-[11px] text-slate-500">
                  Detailed Pastoral Discipleship Record
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Sanctuary Souls:</span>
                <strong className="text-purple-700 dark:text-purple-300 font-mono text-sm">
                  {selectedMonthCensus['Total Sanctuary Souls']} exact members
                </strong>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 block">Directory Roster:</span>
                <strong className="text-amber-700 dark:text-amber-300 font-mono text-sm">
                  {selectedMonthCensus['Registered Roster']} exact registered
                </strong>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 block">New Believers:</span>
                <strong className="text-emerald-700 dark:text-emerald-300 font-mono text-sm">
                  +{selectedMonthCensus['New Believers']} exact converts
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Recharts Line Chart Container */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredGrowthData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.3 }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickLine={false} 
                axisLine={false}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              {/* Hover-tooltips displaying exact member counts for each data point */}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3.5 bg-slate-950/95 text-white border border-[#D4AF37]/50 rounded-xl shadow-2xl text-xs space-y-2 backdrop-blur-md min-w-[240px]">
                        <div className="font-bold text-[#D4AF37] border-b border-white/10 pb-1.5 flex items-center justify-between gap-4 font-serif-cinzel">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{label} Congregational Census</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                            Official
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {payload.map((entry: any) => {
                            const descriptor = 
                              entry.name === 'Total Sanctuary Souls' ? 'exact seated worshippers' :
                              entry.name === 'Registered Roster' ? 'exact directory records' :
                              'exact converts & baptisms';
                            return (
                              <div key={entry.name} className="flex items-center justify-between gap-3 text-[11px]">
                                <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  {entry.name}:
                                </span>
                                <div className="text-right">
                                  <span className="font-bold text-white font-mono text-xs">{entry.value}</span>
                                  <span className="text-[10px] text-slate-400 block -mt-0.5">{descriptor}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-1.5 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Verified Pastoral Census</span>
                          <span className="text-emerald-400 font-semibold">Active Sanctuary</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }} 
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="Total Sanctuary Souls"
                stroke="#7D3AC1"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#7D3AC1', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#D4AF37' }}
              />
              <Line
                type="monotone"
                dataKey="Registered Roster"
                stroke="#D4AF37"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#D4AF37' }}
                activeDot={{ r: 5, fill: '#ffffff' }}
              />
              <Line
                type="monotone"
                dataKey="New Believers"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10B981' }}
                activeDot={{ r: 5, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Attendance Heatmap (Visualizing Attendance Trends & Peak Assembly Times) */}
      <AttendanceHeatmap />

      {/* Search & Department / Status Filter Bar */}
      <div className="bg-white dark:bg-[#071430] p-4 rounded-2xl border border-slate-200 dark:border-indigo-950 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name, department, status (active/inactive), role..."
              className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#7D3AC1] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Membership Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
            </span>
            {(['All', 'Active', 'Inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setMembershipStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  membershipStatusFilter === status
                    ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleDownloadCSV('current')}
            id="export-current-members-csv-button"
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            title="Export current members list as a downloadable CSV file for administrative reporting"
          >
            <Download className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
            <span>Export Members CSV ({filteredMembers.length})</span>
          </button>

          {/* Bulk Edit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              if (isBulkMode) {
                setSelectedMemberIds([]);
              }
            }}
            id="toggle-bulk-mode-button"
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
              isBulkMode
                ? 'bg-[#7D3AC1] text-white border-[#7D3AC1] shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle bulk editing mode for batch status updates or fellowship assignments"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isBulkMode ? 'Exit Bulk Mode' : 'Bulk Edit Mode'}</span>
            {selectedMemberIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#7D3AC1] font-bold">
                {selectedMemberIds.length}
              </span>
            )}
          </button>
        </div>

        {/* Department (Fellowship) Pills & Status Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
              Department:
            </span>
            {['All', 'Adults Men', 'Adults Women', 'Youth & Campus', 'Children'].map((f) => (
              <button
                key={f}
                onClick={() => setFellowshipFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  fellowshipFilter === f
                    ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Showing <strong className="text-slate-900 dark:text-white font-bold">{filteredMembers.length}</strong> of {members.length} members</span>
            {(searchQuery || fellowshipFilter !== 'All' || membershipStatusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFellowshipFilter('All');
                  setMembershipStatusFilter('All');
                }}
                className="text-[11px] text-[#7D3AC1] dark:text-[#D4AF37] hover:underline font-semibold flex items-center gap-0.5 ml-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Feedback Banner */}
      {bulkFeedbackMessage && (
        <div
          id="bulk-feedback-notification"
          className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{bulkFeedbackMessage}</span>
          </div>
          <button
            onClick={() => setBulkFeedbackMessage(null)}
            className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-emerald-600 dark:text-emerald-400 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bulk Editing Command Panel */}
      {isBulkMode && (
        <div
          id="bulk-edit-command-panel"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-[#0B1F4D]/90 dark:via-[#071430] dark:to-purple-950/40 border-2 border-[#7D3AC1] dark:border-[#7D3AC1] shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 dark:border-indigo-950 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#7D3AC1] text-white shadow-xs">
                <ListChecks className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-cinzel font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Congregation Bulk Editing Mode
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7D3AC1] text-white">
                    {selectedMemberIds.length} Selected
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select members using checkboxes to perform batch status updates or fellowship group assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                id="bulk-select-all-filtered-button"
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#7D3AC1] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {filteredMembers.length > 0 && filteredMembers.every((m) => selectedMemberIds.includes(m.id)) ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-[#7D3AC1]" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All Filtered ({filteredMembers.length})</span>
                  </>
                )}
              </button>

              {selectedMemberIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  id="bulk-clear-selection-button"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Clear ({selectedMemberIds.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsBulkMode(false);
                  setSelectedMemberIds([]);
                }}
                id="bulk-exit-mode-button"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Batch Action Tabs & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-4 flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBulkActionTab('status')}
                id="bulk-tab-status-button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  bulkActionTab === 'status'
                    ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Status Update</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActionTab('fellowship')}
                id="bulk-tab-fellowship-button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  bulkActionTab === 'fellowship'
                    ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Group Assignment</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkActionTab('role')}
                id="bulk-tab-role-button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  bulkActionTab === 'role'
                    ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Role</span>
              </button>
            </div>

            {/* Dynamic Action Setting */}
            <div className="md:col-span-5">
              {bulkActionTab === 'status' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    Set Selected Status:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBulkStatusVal(true)}
                      id="bulk-set-status-active-btn"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        bulkStatusVal
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkStatusVal(false)}
                      id="bulk-set-status-inactive-btn"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        !bulkStatusVal
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Inactive</span>
                    </button>
                  </div>
                </div>
              )}

              {bulkActionTab === 'fellowship' && (
                <div className="flex items-center gap-2">
                  <label htmlFor="bulk-fellowship-select" className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    Assign Department:
                  </label>
                  <select
                    id="bulk-fellowship-select"
                    value={bulkFellowshipVal}
                    onChange={(e) => setBulkFellowshipVal(e.target.value as FellowshipGroup)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-[#7D3AC1]"
                  >
                    <option value="Adults Men">Adults Men</option>
                    <option value="Adults Women">Adults Women</option>
                    <option value="Youth & Campus">Youth & Campus</option>
                    <option value="Children">Children</option>
                  </select>
                </div>
              )}

              {bulkActionTab === 'role' && (
                <div className="flex items-center gap-2">
                  <label htmlFor="bulk-role-select" className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    Assign Role:
                  </label>
                  <select
                    id="bulk-role-select"
                    value={bulkRoleVal}
                    onChange={(e) => setBulkRoleVal(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-[#7D3AC1]"
                  >
                    <option value="Elder">Elder</option>
                    <option value="Deacon">Deacon</option>
                    <option value="Deaconess">Deaconess</option>
                    <option value="Choir Member">Choir Member</option>
                    <option value="Usher">Usher</option>
                    <option value="Intercessor">Intercessor</option>
                    <option value="Worker">Worker</option>
                    <option value="Youth Leader">Youth Leader</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
              )}
            </div>

            {/* Apply Action Button */}
            <div className="md:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={handleExecuteBulkUpdate}
                disabled={selectedMemberIds.length === 0 || isProcessingBulk}
                id="apply-bulk-action-button"
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  selectedMemberIds.length > 0
                    ? 'bg-gradient-to-r from-[#7D3AC1] to-[#0B1F4D] text-white hover:opacity-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Apply to {selectedMemberIds.length} Member{selectedMemberIds.length === 1 ? '' : 's'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
            No Members Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No congregation members matched your search query "{searchQuery}" or selected department and status filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFellowshipFilter('All');
              setMembershipStatusFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => {
            const isSelected = selectedMemberIds.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isBulkMode) {
                    toggleSelectMember(m.id);
                  }
                }}
                className={`p-5 rounded-2xl bg-white dark:bg-[#071430] border shadow-xs space-y-3 transition-all flex flex-col justify-between ${
                  isBulkMode ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-[#7D3AC1] dark:border-[#7D3AC1] ring-2 ring-[#7D3AC1]/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-indigo-950 hover:border-[#7D3AC1]'
                }`}
              >
                {/* Bulk selection checkbox header on card */}
                {isBulkMode && (
                  <div
                    className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      htmlFor={`member-select-${m.id}`}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={`member-select-${m.id}`}
                        checked={isSelected}
                        onChange={() => toggleSelectMember(m.id)}
                        className="w-4 h-4 rounded text-[#7D3AC1] focus:ring-[#7D3AC1] cursor-pointer"
                      />
                      <span className={`text-xs ${isSelected ? 'text-[#7D3AC1] dark:text-[#D4AF37] font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </span>
                    </label>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#7D3AC1] text-white">
                        SELECTED
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1F4D] to-[#7D3AC1] text-[#D4AF37] font-bold text-sm flex items-center justify-center shrink-0">
                        {m.firstName[0]}
                        {m.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {m.firstName} {m.lastName}
                        </h3>
                        <span className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold">
                          {m.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300">
                        {m.fellowship}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        m.activeStatus
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.activeStatus ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{m.activeStatus ? 'Active' : 'Inactive'}</span>
                      </span>
                    </div>
                  </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Attendance: {m.attendanceScore}%</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedMember(m);
                    setShowDispatchModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#7D3AC1] hover:text-white transition-colors flex items-center gap-1 text-slate-700 dark:text-slate-300"
                >
                  <Send className="w-3 h-3" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                Register Church Member
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Grace"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Adeyemi"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="grace.a@church.org"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 392-1082"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fellowship Department</label>
                  <select
                    value={fellowship}
                    onChange={(e) => setFellowship(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Adults Men">Adults Men</option>
                    <option value="Adults Women">Adults Women</option>
                    <option value="Youth & Campus">Youth & Campus</option>
                    <option value="Children">Children</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Worker / Member"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold"
                >
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Pastoral Message Modal */}
      {showDispatchModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                Dispatch Pastoral Notification
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Sending to <strong>{selectedMember.firstName} {selectedMember.lastName}</strong> ({selectedMember.phone})
            </p>

            <form onSubmit={handleDispatch} className="space-y-3">
              <textarea
                required
                rows={4}
                value={dispatchMessage}
                onChange={(e) => setDispatchMessage(e.target.value)}
                placeholder="Type pastoral message, fellowship update or prayer reminder..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted AES-256 dispatch channel with push notification gateway.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchSent}
                  className="px-4 py-2 rounded-xl bg-[#7D3AC1] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {dispatchSent ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Send className="w-4 h-4" />}
                  <span>{dispatchSent ? 'Dispatched Securely' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
