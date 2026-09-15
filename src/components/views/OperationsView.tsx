import React, { useState } from 'react';
import {
  Flame,
  Plus,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Sparkles,
  Download,
  Printer,
  FileText
} from 'lucide-react';
import { ChurchOperationEvent, ChurchProfile } from '../../types';
import { downloadChurchOperationsReport } from '../../lib/pdfReportGenerator';

interface OperationsViewProps {
  operations: ChurchOperationEvent[];
  onAddOperation: (op: ChurchOperationEvent) => void;
  onUpdateOperation: (op: ChurchOperationEvent) => void;
  onDeleteOperation: (id: string) => void;
  churchProfile?: ChurchProfile;
  onOpenPrint?: () => void;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  operations = [],
  onAddOperation,
  onUpdateOperation,
  onDeleteOperation,
  churchProfile,
  onOpenPrint
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // New operation form state
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('Crusade');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('6:30 PM');
  const [location, setLocation] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [leadMinistryTeam, setLeadMinistryTeam] = useState('Evangelism Board');
  const [estimatedBudget, setEstimatedBudget] = useState(5000);
  const [expectedAttendance, setExpectedAttendance] = useState(500);
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newOp: ChurchOperationEvent = {
      id: `op-${Date.now()}`,
      name,
      type,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || startDate || new Date().toISOString().split('T')[0],
      time,
      location: location || 'Main Auditorium',
      speaker: speaker || 'Pastoral Ministerial Team',
      leadMinistryTeam,
      estimatedBudget: Number(estimatedBudget),
      expectedAttendance: Number(expectedAttendance),
      notes,
      status: 'Planning'
    };

    onAddOperation(newOp);
    setShowAddModal(false);
    setName('');
    setLocation('');
    setSpeaker('');
    setNotes('');
  };

  const handleDownloadPdfReport = () => {
    setDownloadingPdf(true);
    try {
      downloadChurchOperationsReport({
        churchProfile: churchProfile || {
          churchName: 'Church Ministry Sanctuary',
          tagline: 'Rooted in the Word, Empowered by the Spirit',
          address: '777 Sanctuary Way, Cathedral District',
          city: 'Grace City',
          state: 'TX',
          country: 'USA',
          email: 'pastoral@church.org',
          phone: '(555) 019-2831',
          logoUrl: '',
          website: 'https://churchministry.org',
          headPastor: 'Senior Pastor',
          serviceTimes: {
            sundayMain: '10:00 AM',
            sundayEvening: '6:00 PM',
            midweekPrayer: '7:00 PM',
            bibleStudy: '7:30 PM'
          }
        },
        operations,
        reportingPeriod: 'Fiscal Ministry Quarter',
        generatedBy: 'Operations & Evangelism Board'
      });
      setPdfSuccessMessage(`Operations & Attendance PDF report successfully generated and downloaded (${operations.length} operations included).`);
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredOps = filterType === 'All'
    ? operations
    : operations.filter(o => o.type === filterType || o.status === filterType);

  return (
    <div id="operations-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A1550] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Evangelism & Holy Ghost Operations</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Crusades, Missions & Church Operations
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Coordinate city-wide evangelism campaigns, youth retreats, conferences, and revival services.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Download Report Button (PDF Generation) */}
          <button
            id="download-operations-report-pdf-btn"
            onClick={handleDownloadPdfReport}
            disabled={downloadingPdf}
            title="Download comprehensive PDF summary of church operations and weekly attendance"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>

          {/* PDF / Print Action Button */}
          <button
            id="operations-print-pdf-btn"
            onClick={onOpenPrint ? onOpenPrint : () => window.print()}
            title="Open PDF Preview & Print Document"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>PDF / Print</span>
          </button>

          {/* Launch New Operation Button */}
          <button
            onClick={() => setShowAddModal(true)}
            id="launch-new-operation-btn"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-2 shadow-md transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Operation</span>
          </button>
        </div>
      </div>

      {/* PDF Export Notification Feedback */}
      {pdfSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{pdfSuccessMessage}</span>
          </div>
          <span className="text-[11px] opacity-80 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>A4 Document Downloaded</span>
          </span>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Crusade', 'Camp Meeting', 'Evangelism Campaign', 'Conference', 'Active', 'Planning'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === t
                ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
                : 'bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400 hover:border-[#7D3AC1]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOps.map((op) => (
          <div
            key={op.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4 hover:border-[#D4AF37] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                  {op.type}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    op.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {op.status}
                </span>
              </div>

              <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white leading-tight">
                {op.name}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                  <span>
                    {op.startDate} {op.endDate && op.endDate !== op.startDate ? `to ${op.endDate}` : ''} ({op.time})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{op.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Speaker: {op.speaker}</span>
                </div>
              </div>

              {op.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {op.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <strong>{op.expectedAttendance}</strong> souls
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${op.estimatedBudget.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => onDeleteOperation(op.id)}
                title="Delete Operation"
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Operation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                Launch Church Operation
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Operation Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Greater Miracle Revival Campaign"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Crusade">Crusade</option>
                    <option value="Camp Meeting">Camp Meeting</option>
                    <option value="Evangelism Campaign">Evangelism Campaign</option>
                    <option value="Conference">Conference</option>
                    <option value="Special Program">Special Program</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="6:00 PM"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City Sports Stadium"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Guest Speaker</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Evangelist Johnathan"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expected Attendance</label>
                  <input
                    type="number"
                    value={expectedAttendance}
                    onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Budget ($)</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notes & Objectives</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Goals, transport arrangement, tract distribution..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
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
                  Confirm Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
