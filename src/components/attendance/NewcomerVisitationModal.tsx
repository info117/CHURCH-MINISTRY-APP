import React, { useState, useEffect } from 'react';
import {
  X,
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck
} from 'lucide-react';
import {
  NewcomerVisitationSchedule,
  VisitationType,
  VisitationStatus
} from '../../types';

interface NewcomerVisitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitationToEdit?: NewcomerVisitationSchedule | null;
  onSave: (visitation: NewcomerVisitationSchedule) => void;
}

const MINISTERS_LIST = [
  'Senior Pastor & Bishop',
  'Associate Pastor David Chen',
  'Elder Michael Vance',
  'Deaconess Sarah Jenkins',
  'Youth Pastor Marcus Cole',
  'Evangelism & Visitation Team'
];

const VISITATION_TYPES: VisitationType[] = [
  'Home Visitation',
  'Phone Call & Pastoral Check',
  'Pastoral Office Meeting',
  'Welcome Tea & Fellowship',
  'Care & Prayer Visit',
  'Welcome Packet Delivery'
];

export const NewcomerVisitationModal: React.FC<NewcomerVisitationModalProps> = ({
  isOpen,
  onClose,
  visitationToEdit,
  onSave
}) => {
  const [newcomerName, setNewcomerName] = useState<string>('');
  const [newcomerPhone, setNewcomerPhone] = useState<string>('');
  const [newcomerEmail, setNewcomerEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [assemblyTitle, setAssemblyTitle] = useState<string>('Main Celebration Service');
  const [visitationDate, setVisitationDate] = useState<string>('2026-09-18');
  const [visitationTime, setVisitationTime] = useState<string>('18:00');
  const [visitationType, setVisitationType] = useState<VisitationType>('Home Visitation');
  const [assignedMinister, setAssignedMinister] = useState<string>('Associate Pastor David Chen');
  const [status, setStatus] = useState<VisitationStatus>('Scheduled');
  const [prayerRequests, setPrayerRequests] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (visitationToEdit) {
      setNewcomerName(visitationToEdit.newcomerName);
      setNewcomerPhone(visitationToEdit.newcomerPhone);
      setNewcomerEmail(visitationToEdit.newcomerEmail || '');
      setAddress(visitationToEdit.address || '');
      setAssemblyTitle(visitationToEdit.assemblyTitle);
      setVisitationDate(visitationToEdit.visitationDate);
      setVisitationTime(visitationToEdit.visitationTime || '18:00');
      setVisitationType(visitationToEdit.visitationType);
      setAssignedMinister(visitationToEdit.assignedMinister);
      setStatus(visitationToEdit.status);
      setPrayerRequests(visitationToEdit.prayerRequests || '');
      setNotes(visitationToEdit.notes || '');
    } else {
      setNewcomerName('');
      setNewcomerPhone('');
      setNewcomerEmail('');
      setAddress('');
      setAssemblyTitle('Main Celebration Service');
      setVisitationDate('2026-09-18');
      setVisitationTime('18:00');
      setVisitationType('Home Visitation');
      setAssignedMinister('Associate Pastor David Chen');
      setStatus('Scheduled');
      setPrayerRequests('');
      setNotes('');
    }
  }, [visitationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newcomerName.trim()) {
      alert('Please provide the newcomer name.');
      return;
    }
    if (!newcomerPhone.trim()) {
      alert('Please provide a contact phone number.');
      return;
    }

    const record: NewcomerVisitationSchedule = {
      id: visitationToEdit ? visitationToEdit.id : `vis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      newcomerName: newcomerName.trim(),
      newcomerPhone: newcomerPhone.trim(),
      newcomerEmail: newcomerEmail.trim() || undefined,
      address: address.trim() || undefined,
      fellowship: visitationToEdit?.fellowship || 'General',
      firstVisitDate: visitationToEdit?.firstVisitDate || new Date().toISOString().split('T')[0],
      assemblyTitle: assemblyTitle.trim(),
      assemblySlotId: visitationToEdit?.assemblySlotId || 'sun-m2',
      visitationDate: visitationDate,
      visitationTime: visitationTime || '18:00',
      visitationType,
      assignedMinister,
      status,
      prayerRequests: prayerRequests.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: visitationToEdit ? visitationToEdit.createdAt : new Date().toISOString(),
      completedAt: status === 'Completed' ? (visitationToEdit?.completedAt || new Date().toISOString()) : undefined
    };

    onSave(record);
    onClose();
  };

  return (
    <div
      id="newcomer-visitation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="newcomer-visitation-modal-card"
        className="relative w-full max-w-lg bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-[#D4AF37] shadow-inner">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-cinzel font-bold text-lg">
                {visitationToEdit ? 'Edit Visitation Schedule' : 'Schedule Newcomer Visitation'}
              </h3>
              <p className="text-xs text-purple-200">
                Pastoral follow-up, home visits, and fellowship appointment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Newcomer Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Newcomer Name: <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newcomerName}
                  onChange={(e) => setNewcomerName(e.target.value)}
                  placeholder="e.g. Brother Samuel Okafor"
                  id="visitation-modal-name-input"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={newcomerPhone}
                    onChange={(e) => setNewcomerPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    id="visitation-modal-phone-input"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email:
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newcomerEmail}
                    onChange={(e) => setNewcomerEmail(e.target.value)}
                    placeholder="guest@example.com"
                    id="visitation-modal-email-input"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Home Address / Location:
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1420 Heritage Blvd, Suite 104"
                  id="visitation-modal-address-input"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Schedule Date, Time & Minister */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-Up Date: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={visitationDate}
                    onChange={(e) => setVisitationDate(e.target.value)}
                    id="visitation-modal-date-input"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time:
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={visitationTime}
                    onChange={(e) => setVisitationTime(e.target.value)}
                    id="visitation-modal-time-input"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Visitation Method:
                </label>
                <select
                  value={visitationType}
                  onChange={(e) => setVisitationType(e.target.value as VisitationType)}
                  id="visitation-modal-type-select"
                  className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                >
                  {VISITATION_TYPES.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Minister:
                </label>
                <select
                  value={assignedMinister}
                  onChange={(e) => setAssignedMinister(e.target.value)}
                  id="visitation-modal-minister-select"
                  className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                >
                  {MINISTERS_LIST.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VisitationStatus)}
                  id="visitation-modal-status-select"
                  className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Follow-up Needed">Follow-up Needed</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assembly Attended:
                </label>
                <input
                  type="text"
                  value={assemblyTitle}
                  onChange={(e) => setAssemblyTitle(e.target.value)}
                  placeholder="e.g. Main Celebration Service"
                  className="w-full text-xs px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Prayer Requests & Ministry Directives:
              </label>
              <textarea
                rows={2}
                value={prayerRequests}
                onChange={(e) => setPrayerRequests(e.target.value)}
                placeholder="Specific prayers, family details, or questions raised by newcomer..."
                id="visitation-modal-prayer-input"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pastoral Visitation Notes (Follow-up report):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log notes from visit, outcome, or follow-up steps taken..."
                id="visitation-modal-notes-input"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="submit-save-visitation-btn"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>{visitationToEdit ? 'Update Schedule' : 'Save Visitation Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
