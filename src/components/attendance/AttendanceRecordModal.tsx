import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ChurchMember,
  ChurchAttendanceRecord,
  NewcomerVisitationSchedule,
  AttendeeClassification,
  VisitationType,
  FellowshipGroup
} from '../../types';
import { AssemblySlotData } from '../AttendanceHeatmap';

interface AttendanceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: AssemblySlotData[];
  selectedSlotId?: string;
  members?: ChurchMember[];
  onSave: (
    record: ChurchAttendanceRecord,
    visitation?: NewcomerVisitationSchedule,
    addToRoster?: boolean
  ) => void;
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

export const AttendanceRecordModal: React.FC<AttendanceRecordModalProps> = ({
  isOpen,
  onClose,
  slots,
  selectedSlotId,
  members = [],
  onSave
}) => {
  const [attendeeType, setAttendeeType] = useState<AttendeeClassification>('Church Member');

  // Common fields
  const [slotId, setSlotId] = useState<string>(selectedSlotId || 'sun-m2');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMode, setAttendanceMode] = useState<'In-Person Sanctuary' | 'Online Live Stream'>(
    'In-Person Sanctuary'
  );
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Church Member Fields
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [customMemberName, setCustomMemberName] = useState<string>('');

  // Newcomer Fields
  const [newcomerName, setNewcomerName] = useState<string>('');
  const [newcomerPhone, setNewcomerPhone] = useState<string>('');
  const [newcomerEmail, setNewcomerEmail] = useState<string>('');
  const [newcomerAddress, setNewcomerAddress] = useState<string>('');
  const [newcomerFellowship, setNewcomerFellowship] = useState<FellowshipGroup>('Adults Men');
  const [addToCongregationRoster, setAddToCongregationRoster] = useState<boolean>(true);

  // Newcomer Follow-Up & Visitation Schedule Fields
  const [scheduleVisitation, setScheduleVisitation] = useState<boolean>(true);
  const [visitationDate, setVisitationDate] = useState<string>('2026-09-18');
  const [visitationTime, setVisitationTime] = useState<string>('18:00');
  const [visitationType, setVisitationType] = useState<VisitationType>('Home Visitation');
  const [assignedMinister, setAssignedMinister] = useState<string>('Associate Pastor David Chen');
  const [prayerRequests, setPrayerRequests] = useState<string>('');
  const [visitationNotes, setVisitationNotes] = useState<string>('');

  // Reset or initialize on open or slotId change
  useEffect(() => {
    if (selectedSlotId) {
      setSlotId(selectedSlotId);
    }
  }, [selectedSlotId]);

  // Set default visitation date to 3 days after today
  useEffect(() => {
    try {
      const today = new Date();
      today.setDate(today.getDate() + 3);
      setVisitationDate(today.toISOString().split('T')[0]);
    } catch {
      setVisitationDate('2026-09-18');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlot = slots.find((s) => s.id === slotId) || slots[0];

  const filteredMembers = members.filter((m) => {
    const query = memberSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.fellowship.toLowerCase().includes(query)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let attendeeName = '';
    let memberId: string | undefined = undefined;
    let memberPhone: string | undefined = undefined;
    let memberEmail: string | undefined = undefined;
    let memberFellowship: string | undefined = undefined;

    if (attendeeType === 'Church Member') {
      if (selectedMemberId) {
        const found = members.find((m) => m.id === selectedMemberId);
        if (found) {
          attendeeName = `${found.firstName} ${found.lastName}`;
          memberId = found.id;
          memberPhone = found.phone;
          memberEmail = found.email;
          memberFellowship = found.fellowship;
        } else {
          attendeeName = customMemberName.trim() || 'Church Disciple';
        }
      } else {
        attendeeName = customMemberName.trim();
        if (!attendeeName) {
          alert('Please select or enter the member name.');
          return;
        }
      }
    } else {
      // Newcomer
      attendeeName = newcomerName.trim();
      if (!attendeeName) {
        alert('Please enter the newcomer full name.');
        return;
      }
      if (!newcomerPhone.trim()) {
        alert('Please provide a contact phone number for pastoral follow-up.');
        return;
      }
    }

    const recordId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newRecord: ChurchAttendanceRecord = {
      id: recordId,
      attendeeType,
      memberId,
      name: attendeeName,
      phone: attendeeType === 'Church Member' ? memberPhone : newcomerPhone,
      email: attendeeType === 'Church Member' ? memberEmail : newcomerEmail,
      fellowship: attendeeType === 'Church Member' ? memberFellowship : newcomerFellowship,
      assemblySlotId: slotId,
      assemblyTitle: currentSlot ? currentSlot.assemblyTitle : 'Church Assembly',
      dayName: currentSlot ? currentSlot.dayName : 'Sunday',
      date: attendanceDate,
      timeLabel: currentSlot ? currentSlot.timeLabel : 'Morning',
      attendanceMode,
      recordedBy: 'Pastoral Secretariat',
      notes: generalNotes.trim(),
      createdAt: new Date().toISOString(),
      hasVisitationSchedule: attendeeType === 'Newcomer' && scheduleVisitation
    };

    let newVisitation: NewcomerVisitationSchedule | undefined = undefined;
    if (attendeeType === 'Newcomer' && scheduleVisitation) {
      newVisitation = {
        id: `vis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        newcomerName: attendeeName,
        newcomerPhone: newcomerPhone.trim(),
        newcomerEmail: newcomerEmail.trim() || undefined,
        address: newcomerAddress.trim() || undefined,
        fellowship: newcomerFellowship,
        firstVisitDate: attendanceDate,
        assemblyTitle: currentSlot ? currentSlot.assemblyTitle : 'Church Assembly',
        assemblySlotId: slotId,
        visitationDate: visitationDate || attendanceDate,
        visitationTime: visitationTime || '18:00',
        visitationType,
        assignedMinister,
        status: 'Scheduled',
        prayerRequests: prayerRequests.trim() || undefined,
        notes: visitationNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      };
    }

    onSave(newRecord, newVisitation, attendeeType === 'Newcomer' && addToCongregationRoster);
    onClose();
  };

  return (
    <div
      id="attendance-record-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="attendance-record-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 dark:text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-[#D4AF37] shadow-inner">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-cinzel font-bold text-lg">
                Record Assembly Attendance
              </h3>
              <p className="text-xs text-purple-200">
                Log active congregation turnout & configure newcomer pastoral visitation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attendee Type Switcher Tabs */}
        <div className="px-5 pt-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex gap-3">
          <button
            type="button"
            onClick={() => setAttendeeType('Church Member')}
            id="attendee-tab-church-member"
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              attendeeType === 'Church Member'
                ? 'border-[#7D3AC1] text-[#7D3AC1] dark:text-[#D4AF37]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Church Member</span>
          </button>

          <button
            type="button"
            onClick={() => setAttendeeType('Newcomer')}
            id="attendee-tab-newcomer"
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              attendeeType === 'Newcomer'
                ? 'border-[#7D3AC1] text-[#7D3AC1] dark:text-[#D4AF37]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Newcomer / First-Time Guest</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
              + Visitation
            </span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Assembly Slot & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assembly Service & Window:
              </label>
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                id="attendance-slot-select"
                className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.dayName} &bull; {s.timeLabel} - {s.assemblyTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Attendance Date:
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  id="attendance-date-input"
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Attendance Mode */}
            <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Participation Mode:
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="attendance-mode"
                    checked={attendanceMode === 'In-Person Sanctuary'}
                    onChange={() => setAttendanceMode('In-Person Sanctuary')}
                  />
                  <span>In-Person Sanctuary</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="attendance-mode"
                    checked={attendanceMode === 'Online Live Stream'}
                    onChange={() => setAttendanceMode('Online Live Stream')}
                  />
                  <span>Online Live Stream</span>
                </label>
              </div>
            </div>
          </div>

          {/* TAB 1: CHURCH MEMBER FORM */}
          {attendeeType === 'Church Member' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Church Member from Congregation Roster:
                </label>

                {members.length > 0 ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Quick filter member by name, fellowship, email..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />

                    <select
                      value={selectedMemberId}
                      onChange={(e) => {
                        setSelectedMemberId(e.target.value);
                        setCustomMemberName('');
                      }}
                      id="select-church-member-dropdown"
                      className="w-full text-xs py-2 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Choose Member from Roster ({filteredMembers.length}) --</option>
                      {filteredMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} &bull; {m.fellowship} &bull; {m.role} ({m.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                    No members currently loaded in roster. You can type the member name below:
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Enter Member Name Directly:
                </label>
                <input
                  type="text"
                  value={customMemberName}
                  onChange={(e) => {
                    setCustomMemberName(e.target.value);
                    if (e.target.value) setSelectedMemberId('');
                  }}
                  placeholder="e.g. Sister Deborah Vance"
                  id="custom-member-name-input"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Notes & Parish Observations:
                </label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="e.g. Served in sanctuary ushering team; brought two family relatives."
                  className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: NEWCOMER / FIRST-TIME GUEST FORM */}
          {attendeeType === 'Newcomer' && (
            <div className="space-y-4">
              {/* Newcomer Core Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Newcomer Full Name: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newcomerName}
                    onChange={(e) => setNewcomerName(e.target.value)}
                    placeholder="e.g. Sister Grace Adebayo"
                    id="newcomer-full-name-input"
                    className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number: <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={newcomerPhone}
                      onChange={(e) => setNewcomerPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      id="newcomer-phone-input"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newcomerEmail}
                      onChange={(e) => setNewcomerEmail(e.target.value)}
                      placeholder="guest@example.com"
                      id="newcomer-email-input"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address / Neighborhood (for home visitation):
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newcomerAddress}
                      onChange={(e) => setNewcomerAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 3B, Springfield"
                      id="newcomer-address-input"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Demographic / Fellowship Group:
                  </label>
                  <select
                    value={newcomerFellowship}
                    onChange={(e) => setNewcomerFellowship(e.target.value as FellowshipGroup)}
                    id="newcomer-fellowship-select"
                    className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Adults Men">Adults Men</option>
                    <option value="Adults Women">Adults Women</option>
                    <option value="Youth & Campus">Youth & Campus</option>
                    <option value="Children">Children Ministry</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToCongregationRoster}
                      onChange={(e) => setAddToCongregationRoster(e.target.checked)}
                      className="rounded text-[#7D3AC1] focus:ring-[#7D3AC1]"
                    />
                    <span>Add to Congregation Roster (as Visitor)</span>
                  </label>
                </div>
              </div>

              {/* FOLLOW UP & VISITATION SCHEDULE CARD */}
              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-[#7D3AC1] dark:text-[#D4AF37]" />
                    <span className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                      Follow Up & Visitation Schedule
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleVisitation}
                      onChange={(e) => setScheduleVisitation(e.target.checked)}
                      id="schedule-visitation-toggle"
                      className="rounded text-[#7D3AC1] focus:ring-[#7D3AC1]"
                    />
                    <span>Schedule Pastoral Visit</span>
                  </label>
                </div>

                {scheduleVisitation && (
                  <div className="space-y-3 pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Follow-Up & Visitation Date: <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={visitationDate}
                            onChange={(e) => setVisitationDate(e.target.value)}
                            id="visitation-date-input"
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                            required={scheduleVisitation}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Visitation Time:
                        </label>
                        <div className="relative">
                          <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={visitationTime}
                            onChange={(e) => setVisitationTime(e.target.value)}
                            id="visitation-time-input"
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Visitation Method / Type:
                        </label>
                        <select
                          value={visitationType}
                          onChange={(e) => setVisitationType(e.target.value as VisitationType)}
                          id="visitation-type-select"
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
                          Assigned Minister / Team:
                        </label>
                        <select
                          value={assignedMinister}
                          onChange={(e) => setAssignedMinister(e.target.value)}
                          id="visitation-minister-select"
                          className="w-full text-xs py-2 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white font-medium"
                        >
                          {MINISTERS_LIST.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prayer Requests & Special Visitation Directives:
                      </label>
                      <textarea
                        rows={2}
                        value={prayerRequests}
                        onChange={(e) => setPrayerRequests(e.target.value)}
                        placeholder="e.g. Desires prayer for family settlement, career breakthrough, or water baptism interest."
                        id="visitation-prayer-requests-input"
                        className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
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
              id="submit-attendance-record-btn"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {attendeeType === 'Church Member'
                  ? 'Save Member Attendance'
                  : 'Record Newcomer & Visitation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
