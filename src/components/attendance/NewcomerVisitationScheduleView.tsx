import React, { useState } from 'react';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Sparkles,
  Check,
  RotateCcw,
  Building2
} from 'lucide-react';
import {
  NewcomerVisitationSchedule,
  VisitationStatus,
  VisitationType
} from '../../types';

interface NewcomerVisitationScheduleViewProps {
  schedules: NewcomerVisitationSchedule[];
  onOpenScheduleModal: (visitationToEdit?: NewcomerVisitationSchedule) => void;
  onDeleteSchedule: (id: string, name: string) => void;
  onUpdateStatus: (id: string, newStatus: VisitationStatus) => void;
}

export const NewcomerVisitationScheduleView: React.FC<NewcomerVisitationScheduleViewProps> = ({
  schedules,
  onOpenScheduleModal,
  onDeleteSchedule,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | VisitationStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | VisitationType>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSchedules = schedules.filter((s) => {
    if (statusFilter !== 'All' && s.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'All' && s.visitationType !== typeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.newcomerName.toLowerCase().includes(q);
      const matchPhone = s.newcomerPhone.toLowerCase().includes(q);
      const matchMinister = s.assignedMinister.toLowerCase().includes(q);
      const matchAddress = (s.address || '').toLowerCase().includes(q);
      const matchNotes = (s.notes || '').toLowerCase().includes(q);
      const matchPrayer = (s.prayerRequests || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchMinister || matchAddress || matchNotes || matchPrayer;
    }
    return true;
  });

  // Calculate days until visitation relative to current date (2026-09-15)
  const getDaysUntilText = (dateStr: string) => {
    try {
      const today = new Date('2026-09-15');
      const target = new Date(dateStr);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return { text: 'Today', isUrgent: true, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' };
      if (diffDays === 1) return { text: 'Tomorrow', isUrgent: true, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60' };
      if (diffDays > 1) return { text: `In ${diffDays} days`, isUrgent: false, color: 'text-indigo-700 bg-indigo-100 dark:bg-indigo-950/60' };
      if (diffDays < 0) return { text: `${Math.abs(diffDays)} days ago`, isUrgent: false, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };
    } catch {
      return { text: dateStr, isUrgent: false, color: 'text-slate-500 bg-slate-100' };
    }
    return { text: dateStr, isUrgent: false, color: 'text-slate-500 bg-slate-100' };
  };

  const totalCount = schedules.length;
  const scheduledCount = schedules.filter((s) => s.status === 'Scheduled').length;
  const completedCount = schedules.filter((s) => s.status === 'Completed').length;
  const followUpNeededCount = schedules.filter((s) => s.status === 'Follow-up Needed').length;

  const handleDeleteClick = (id: string, name: string) => {
    if (deleteConfirmId === id) {
      onDeleteSchedule(id, name);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId((curr) => (curr === id ? null : curr));
      }, 4000);
    }
  };

  return (
    <div id="newcomer-visitation-schedule-section" className="space-y-5">
      {/* 1. Header & KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
          <span className="text-[11px] font-semibold text-[#7D3AC1] dark:text-purple-300 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#7D3AC1]" />
            <span>Total Newcomers in Follow-Up</span>
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalCount} <span className="text-xs font-normal text-slate-400">Visitors</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Carefully tracked for integration
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-900/60">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Scheduled Visitations</span>
          </span>
          <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">
            {scheduledCount} <span className="text-xs font-normal text-amber-600/70">Upcoming</span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400">
            Home visits & pastoral calls
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-900/60">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed Care Visits</span>
          </span>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
            {completedCount} <span className="text-xs font-normal text-emerald-600/70">Visited</span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
            Successfully ministered
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-300/40 dark:border-rose-900/60">
          <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Follow-Up Needed</span>
          </span>
          <div className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1">
            {followUpNeededCount} <span className="text-xs font-normal text-rose-600/70">Pending</span>
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400">
            Requires pastoral re-contact
          </span>
        </div>
      </div>

      {/* 2. Filter & Action Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search newcomer, phone, minister, address..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            {(['All', 'Scheduled', 'Completed', 'Follow-up Needed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0B1F4D] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Visitation Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Visitation Types</option>
            <option value="Home Visitation">Home Visitation</option>
            <option value="Phone Call & Pastoral Check">Phone Call</option>
            <option value="Pastoral Office Meeting">Pastoral Office Meeting</option>
            <option value="Welcome Tea & Fellowship">Welcome Tea & Fellowship</option>
            <option value="Care & Prayer Visit">Care & Prayer Visit</option>
          </select>
        </div>

        {/* Schedule New Visitation Button */}
        <button
          type="button"
          onClick={() => onOpenScheduleModal()}
          id="add-newcomer-visitation-schedule-btn"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>+ Schedule Follow-Up & Visitation</span>
        </button>
      </div>

      {/* 3. Visitation Schedules Grid / Cards */}
      {filteredSchedules.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#071430] border border-dashed border-slate-200 dark:border-indigo-950 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7D3AC1] dark:text-[#D4AF37] flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              No Visitation Schedules Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              No newcomer visitation appointments match the selected filters. Use "+ Schedule Follow-Up & Visitation" to create a new appointment with date and assigned minister.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenScheduleModal()}
            className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold hover:opacity-95 transition-all cursor-pointer"
          >
            + Schedule First Visitation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((item) => {
            const isConfirming = deleteConfirmId === item.id;
            const daysInfo = getDaysUntilText(item.visitationDate);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs hover:border-[#7D3AC1] dark:hover:border-[#7D3AC1] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Header: Scheduled Date Badge & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Visitation Date & Time Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-[#7D3AC1] dark:text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 shadow-2xs font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                        <span>{item.visitationDate}</span>
                        {item.visitationTime && (
                          <>
                            <span className="opacity-40">&bull;</span>
                            <Clock className="w-3 h-3 opacity-70" />
                            <span>{item.visitationTime}</span>
                          </>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${daysInfo.color}`}>
                        {daysInfo.text}
                      </span>
                    </div>

                    {/* Status Toggle / Badge */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : item.status === 'Scheduled'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {item.status === 'Completed' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Newcomer Name & Contact */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white group-hover:text-[#7D3AC1] dark:group-hover:text-[#D4AF37] transition-colors">
                        {item.newcomerName}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Newcomer Guest
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.newcomerPhone}</span>
                      </span>

                      {item.newcomerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.newcomerEmail}</span>
                        </span>
                      )}
                    </div>

                    {item.address && (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Visitation Scope & Assigned Minister */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Visitation Method:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-[#7D3AC1]" />
                        <span>{item.visitationType}</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Assigned Minister / Team:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{item.assignedMinister}</span>
                      </span>
                    </div>
                  </div>

                  {/* Prayer Requests / Notes */}
                  {item.prayerRequests && (
                    <div className="p-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs">
                      <span className="text-[10px] font-bold text-[#7D3AC1] dark:text-[#D4AF37] block mb-0.5">
                        Prayer Requests & Directives:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                        "{item.prayerRequests}"
                      </p>
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Parish note: {item.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                  {/* Quick Status Actions */}
                  <div className="flex items-center gap-1.5">
                    {item.status !== 'Completed' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'Completed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Visited</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, 'Scheduled')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Mark Scheduled</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenScheduleModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>
                  </div>

                  {/* Explicit Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(item.id, item.newcomerName)}
                    id={`delete-visitation-schedule-${item.id}`}
                    title={`Delete visitation schedule for ${item.newcomerName}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isConfirming
                        ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/80'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isConfirming ? 'Confirm Delete?' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
