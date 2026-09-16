import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  Sparkles,
  HeartHandshake,
  AlertCircle,
  Plus
} from 'lucide-react';
import { ChurchAttendanceRecord } from '../../types';

interface AttendanceRecordsListProps {
  records: ChurchAttendanceRecord[];
  onDeleteRecord: (id: string, name: string) => void;
  onOpenAddModal: () => void;
  onNavigateToVisitation?: (newcomerName?: string) => void;
  selectedSlotId?: string;
  selectedSlotTitle?: string;
}

export const AttendanceRecordsList: React.FC<AttendanceRecordsListProps> = ({
  records,
  onDeleteRecord,
  onOpenAddModal,
  onNavigateToVisitation,
  selectedSlotId,
  selectedSlotTitle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Church Member' | 'Newcomer'>('All');
  const [modeFilter, setModeFilter] = useState<'All' | 'In-Person Sanctuary' | 'Online Live Stream'>('All');
  const [filterBySelectedSlot, setFilterBySelectedSlot] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredRecords = records.filter((rec) => {
    if (filterBySelectedSlot && selectedSlotId && rec.assemblySlotId !== selectedSlotId) {
      return false;
    }
    if (typeFilter !== 'All' && rec.attendeeType !== typeFilter) {
      return false;
    }
    if (modeFilter !== 'All' && rec.attendanceMode !== modeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.name.toLowerCase().includes(q);
      const matchAssembly = rec.assemblyTitle.toLowerCase().includes(q);
      const matchPhone = (rec.phone || '').toLowerCase().includes(q);
      const matchEmail = (rec.email || '').toLowerCase().includes(q);
      const matchNotes = (rec.notes || '').toLowerCase().includes(q);
      return matchName || matchAssembly || matchPhone || matchEmail || matchNotes;
    }
    return true;
  });

  const memberCount = records.filter((r) => r.attendeeType === 'Church Member').length;
  const newcomerCount = records.filter((r) => r.attendeeType === 'Newcomer').length;

  const handleDeleteClick = (id: string, name: string) => {
    if (deleteConfirmId === id) {
      onDeleteRecord(id, name);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => {
        setDeleteConfirmId((curr) => (curr === id ? null : curr));
      }, 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attendee by name, contact, notes..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('All')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                typeFilter === 'All'
                  ? 'bg-[#0B1F4D] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('Church Member')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'Church Member'
                  ? 'bg-[#7D3AC1] text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Members ({memberCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('Newcomer')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'Newcomer'
                  ? 'bg-amber-500 text-[#0B1F4D]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Newcomers ({newcomerCount})</span>
            </button>
          </div>

          {/* Filter by Currently Inspected Slot (if available) */}
          {selectedSlotTitle && (
            <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={filterBySelectedSlot}
                onChange={(e) => setFilterBySelectedSlot(e.target.checked)}
                className="rounded text-[#7D3AC1] focus:ring-[#7D3AC1]"
              />
              <span className="truncate max-w-[200px]" title={selectedSlotTitle}>
                Only this assembly: {selectedSlotTitle}
              </span>
            </label>
          )}
        </div>

        {/* Record Attendance Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          id="add-attendance-record-btn"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>+ Record Church Attendance</span>
        </button>
      </div>

      {/* Attendance Records List / Table */}
      {filteredRecords.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#071430] border border-dashed border-slate-200 dark:border-indigo-950 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7D3AC1] dark:text-[#D4AF37] flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              No Attendance Records Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              No attendees match your current filters. Use the "Record Church Attendance" button above to log congregation members or first-time newcomers.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold hover:opacity-95 transition-all cursor-pointer"
          >
            + Record First Attendee
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Attendee Name & Classification</th>
                  <th className="py-3 px-4">Assembly Service & Time</th>
                  <th className="py-3 px-4">Attendance Date</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Contact / Follow-Up</th>
                  <th className="py-3 px-4 text-right">Delete Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredRecords.map((rec) => {
                  const isConfirming = deleteConfirmId === rec.id;
                  const initials = rec.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Name & Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              rec.attendeeType === 'Church Member'
                                ? 'bg-purple-100 dark:bg-purple-950 text-[#7D3AC1] dark:text-purple-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{rec.name}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                  rec.attendeeType === 'Church Member'
                                    ? 'bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300'
                                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                }`}
                              >
                                {rec.attendeeType === 'Church Member' ? 'Church Member' : 'Newcomer Guest'}
                              </span>
                            </div>
                            {rec.fellowship && (
                              <span className="text-[11px] text-slate-400 block">
                                {rec.fellowship}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Assembly & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {rec.assemblyTitle}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {rec.dayName} &bull; {rec.timeLabel}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.date}</span>
                        </span>
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            rec.attendanceMode === 'In-Person Sanctuary'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {rec.attendanceMode}
                        </span>
                      </td>

                      {/* Contact / Follow-Up */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {rec.phone && (
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{rec.phone}</span>
                            </span>
                          )}
                          {rec.email && (
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{rec.email}</span>
                            </span>
                          )}
                          {rec.attendeeType === 'Newcomer' && rec.hasVisitationSchedule && (
                            <button
                              type="button"
                              onClick={() => onNavigateToVisitation && onNavigateToVisitation(rec.name)}
                              className="text-[10px] font-bold text-[#7D3AC1] dark:text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <HeartHandshake className="w-3 h-3" />
                              <span>View Visitation Schedule &rarr;</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Explicit Delete Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(rec.id, rec.name)}
                          id={`delete-attendance-record-${rec.id}`}
                          title={`Delete attendance record for ${rec.name}`}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                            isConfirming
                              ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-400'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/80'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isConfirming ? 'Confirm Delete?' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
