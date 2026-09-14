/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Tag,
  Mic,
  Tv,
  Radio,
  Music,
  Flame,
  Layers,
  RotateCcw,
  X,
  UserCheck,
  FileText
} from 'lucide-react';
import {
  PhysicalEquipment,
  EquipmentBooking,
  ResourceCategory,
  ChurchOperationEvent
} from '../../types';

interface ResourceManagementViewProps {
  equipmentList?: PhysicalEquipment[];
  equipment?: PhysicalEquipment[];
  bookings?: EquipmentBooking[];
  operations?: ChurchOperationEvent[];
  currentUserRole?: string;
  currentUserName?: string;
  onAddEquipment?: (equipment: PhysicalEquipment) => void;
  onUpdateEquipment?: (equipment: PhysicalEquipment) => void;
  onDeleteEquipment?: (id: string) => void;
  onAddBooking?: (booking: Omit<EquipmentBooking, 'id' | 'createdAt'>) => void;
  onUpdateBookingStatus?: (bookingId: string, status: EquipmentBooking['status']) => void;
  onDeleteBooking?: (id: string) => void;
  onNavigateToOperation?: (opId: string) => void;
}

/**
 * Checks for time-slot overlap between two intervals on the same date:
 * Returns true if slots overlap
 */
function isTimeSlotOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  // Convert HH:MM to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = (timeStr || '').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const aStart = toMinutes(startA);
  let aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  let bEnd = toMinutes(endB);

  // If end time is next day morning (e.g. 05:00 next day for all-night vigils)
  if (aEnd <= aStart) aEnd += 24 * 60;
  if (bEnd <= bStart) bEnd += 24 * 60;

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Validates whether a potential booking conflicts with existing reservations
 */
export function checkEquipmentBookingConflict(
  targetEquipmentId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  requestedQuantity: number,
  existingBookings: EquipmentBooking[] = [],
  allEquipment: PhysicalEquipment[] = [],
  excludeBookingId?: string
): {
  hasConflict: boolean;
  conflictingBookings: EquipmentBooking[];
  availableUnits: number;
  totalCapacity: number;
  reason?: string;
} {
  const safeEquipment = allEquipment || [];
  const safeBookings = existingBookings || [];
  const equipment = safeEquipment.find(e => e.id === targetEquipmentId);
  const totalCapacity = equipment ? equipment.totalQuantity : 1;

  if (!bookingDate || !startTime || !endTime) {
    return { hasConflict: false, conflictingBookings: [], availableUnits: totalCapacity, totalCapacity };
  }

  // Find active overlapping bookings for this same equipment and same date
  const overlapping = safeBookings.filter(b => {
    if (b.id === excludeBookingId) return false;
    if (b.equipmentId !== targetEquipmentId) return false;
    if (b.bookingDate !== bookingDate) return false;
    if (b.status === 'Returned' || b.status === 'Cancelled') return false;

    return isTimeSlotOverlapping(startTime, endTime, b.startTime, b.endTime);
  });

  const bookedQuantityInSlot = overlapping.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const availableUnits = Math.max(0, totalCapacity - bookedQuantityInSlot);
  const hasConflict = requestedQuantity > availableUnits;

  let reason = undefined;
  if (hasConflict) {
    const conflictNames = overlapping.map(b => `"${b.operationEventName}" (${b.startTime} - ${b.endTime})`).join(', ');
    reason = `Capacity exceeded! Requested ${requestedQuantity} unit(s), but only ${availableUnits} of ${totalCapacity} available during this window due to concurrent booking for ${conflictNames}.`;
  }

  return {
    hasConflict,
    conflictingBookings: overlapping,
    availableUnits,
    totalCapacity,
    reason
  };
}

export const ResourceManagementView: React.FC<ResourceManagementViewProps> = ({
  equipmentList: propsEquipmentList,
  equipment: propsEquipment,
  bookings = [],
  operations = [],
  onAddBooking,
  onUpdateBookingStatus
}) => {
  const equipmentList = useMemo(() => {
    return propsEquipmentList || propsEquipment || [];
  }, [propsEquipmentList, propsEquipment]);

  const [activeTab, setActiveTab] = useState<'inventory' | 'bookings' | 'conflicts'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEquipmentForModal, setSelectedEquipmentForModal] = useState<PhysicalEquipment | null>(null);

  // Booking Form State
  const [formEquipmentId, setFormEquipmentId] = useState('');
  const [formOperationId, setFormOperationId] = useState('');
  const [formOperationName, setFormOperationName] = useState('');
  const [formBookingDate, setFormBookingDate] = useState('2026-09-12');
  const [formStartTime, setFormStartTime] = useState('16:00');
  const [formEndTime, setFormEndTime] = useState('21:30');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formBookedBy, setFormBookedBy] = useState('Pastor / Operations Administrator');
  const [formPurposeNotes, setFormPurposeNotes] = useState('');
  const [formSubmittedAlert, setFormSubmittedAlert] = useState<string | null>(null);

  // Live conflict evaluation on the booking form
  const liveConflictStatus = useMemo(() => {
    if (!formEquipmentId || !formBookingDate || !formStartTime || !formEndTime) {
      return { hasConflict: false, conflictingBookings: [], availableUnits: 0, totalCapacity: 0 };
    }
    return checkEquipmentBookingConflict(
      formEquipmentId,
      formBookingDate,
      formStartTime,
      formEndTime,
      formQuantity,
      bookings,
      equipmentList
    );
  }, [formEquipmentId, formBookingDate, formStartTime, formEndTime, formQuantity, bookings, equipmentList]);

  // Detected global conflicts across all bookings
  const allDetectedConflicts = useMemo(() => {
    const list: { booking: EquipmentBooking; conflict: ReturnType<typeof checkEquipmentBookingConflict> }[] = [];
    bookings.forEach(b => {
      if (b.status === 'Returned' || b.status === 'Cancelled') return;
      const check = checkEquipmentBookingConflict(
        b.equipmentId,
        b.bookingDate,
        b.startTime,
        b.endTime,
        b.quantity,
        bookings,
        equipmentList,
        b.id
      );
      if (check.hasConflict || check.conflictingBookings.length > 0) {
        list.push({ booking: b, conflict: check });
      }
    });
    return list;
  }, [bookings, equipmentList]);

  const categories: ResourceCategory[] = [
    'Audio & Microphones',
    'Visual & Projection',
    'Broadcasting & Streaming',
    'Musical Instruments',
    'Liturgical & Sanctuary',
    'Facilities & Seating'
  ];

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || eq.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [equipmentList, searchQuery, selectedCategory]);

  const handleOpenBookingFor = (eq: PhysicalEquipment) => {
    setSelectedEquipmentForModal(eq);
    setFormEquipmentId(eq.id);
    setIsBookingModalOpen(true);
  };

  const handleOperationSelect = (opId: string) => {
    setFormOperationId(opId);
    const op = (operations || []).find(o => o.id === opId);
    if (op) {
      setFormOperationName(op.title);
      if (op.date) setFormBookingDate(op.date);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipmentId) return;

    const eq = (equipmentList || []).find(item => item.id === formEquipmentId);
    const finalEquipmentName = eq ? eq.name : 'Unknown Equipment';
    const finalOpName = formOperationName.trim() || 'General Ministry Program';

    if (onAddBooking) {
      onAddBooking({
        equipmentId: formEquipmentId,
        equipmentName: finalEquipmentName,
        operationEventId: formOperationId || 'custom-op',
        operationEventName: finalOpName,
        bookingDate: formBookingDate,
        startTime: formStartTime,
        endTime: formEndTime,
        quantity: formQuantity,
        bookedBy: formBookedBy,
        status: 'Confirmed',
        purposeNotes: formPurposeNotes,
        conflictDetected: liveConflictStatus.hasConflict,
        conflictDetails: liveConflictStatus.reason
      });
    }

    setFormSubmittedAlert(`Equipment booked for "${finalOpName}"!`);
    setIsBookingModalOpen(false);
    setTimeout(() => setFormSubmittedAlert(null), 3500);

    // Reset form defaults
    setFormPurposeNotes('');
  };

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'Audio & Microphones':
        return <Mic className="w-4 h-4 text-sky-500" />;
      case 'Visual & Projection':
        return <Tv className="w-4 h-4 text-purple-500" />;
      case 'Broadcasting & Streaming':
        return <Radio className="w-4 h-4 text-emerald-500" />;
      case 'Musical Instruments':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'Liturgical & Sanctuary':
        return <Flame className="w-4 h-4 text-rose-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div id="resource-management-view-container" className="space-y-6 animate-fadeIn">
      {/* View Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1F4D] via-[#1E1B4B] to-[#7D3AC1] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-[#D4AF37]/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              <Package className="w-4 h-4" />
              <span>Church Logistics & Operations Inventory</span>
            </div>
            <h1 className="font-serif-cinzel text-2xl md:text-3xl font-bold tracking-tight text-white">
              Physical Resource & Equipment Management
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed">
              Book wireless microphones, laser projectors, mobile broadcast gear, and sanctuary assets for upcoming crusades, services, and operations with real-time conflict detection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="open-book-equipment-btn"
              onClick={() => {
                if (equipmentList.length > 0 && !formEquipmentId) {
                  setFormEquipmentId(equipmentList[0].id);
                }
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4D06F] text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Book Equipment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {formSubmittedAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">{formSubmittedAlert}</span>
          </div>
          <button onClick={() => setFormSubmittedAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Conflict Warning Banner if any conflicts exist */}
      {allDetectedConflicts.length > 0 && (
        <div
          id="global-conflict-alert-banner"
          className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Resource Collision Alert ({allDetectedConflicts.length} item{allDetectedConflicts.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/90">
                Multiple church operations have requested overlapping time slots for the same physical equipment. Review and reassign resources.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('conflicts')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Inspect Conflicts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs and Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-indigo-950/70 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-[#7D3AC1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Equipment Catalog ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#7D3AC1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Active Reservations ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conflicts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'conflicts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Conflict Detection</span>
            {allDetectedConflicts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {allDetectedConflicts.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Total Units: {equipmentList.reduce((acc, cur) => acc + cur.totalQuantity, 0)}</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Operations Linked: {operations.length}</span>
          </span>
        </div>
      </div>

      {/* TAB 1: Equipment Inventory Catalog */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment by name, model, serial #, or sanctuary location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7D3AC1]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#7D3AC1] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#7D3AC1] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map((eq) => (
              <div
                key={eq.id}
                id={`equipment-card-${eq.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs flex flex-col justify-between hover:border-[#7D3AC1]/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getCategoryIcon(eq.category)}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {eq.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        eq.condition === 'Optimal'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : eq.condition === 'Good'
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {eq.condition}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {eq.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Model: {eq.model} &bull; S/N: {eq.serialNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{eq.location}</span>
                  </div>

                  {eq.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg italic">
                      "{eq.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {eq.availableQuantity} of {eq.totalQuantity}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">available</span>
                  </div>

                  <button
                    onClick={() => handleOpenBookingFor(eq)}
                    className="px-3 py-1.5 rounded-lg bg-[#7D3AC1] hover:bg-[#682ea3] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Reserve Gear</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Equipment Found</h4>
              <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Reservations & Schedule */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Operation Event</th>
                  <th className="py-3.5 px-4">Reservation Window</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Booked By</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {bookings.map((booking) => {
                  const hasConflict = checkEquipmentBookingConflict(
                    booking.equipmentId,
                    booking.bookingDate,
                    booking.startTime,
                    booking.endTime,
                    booking.quantity,
                    bookings,
                    equipmentList,
                    booking.id
                  ).hasConflict;

                  return (
                    <tr
                      key={booking.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors ${
                        hasConflict ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-[#7D3AC1]" />
                          <span>{booking.equipmentName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {booking.operationEventName}
                        </div>
                        {booking.purposeNotes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {booking.purposeNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{booking.bookingDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold">{booking.quantity}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{booking.bookedBy}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : booking.status === 'Returned'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {booking.status}
                          </span>

                          {hasConflict && booking.status !== 'Returned' && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Conflict Alert</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {booking.status === 'Confirmed' && (
                          <button
                            onClick={() => onUpdateBookingStatus(booking.id, 'Returned')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Check-In / Return</span>
                          </button>
                        )}
                        {booking.status === 'Returned' && (
                          <span className="text-[11px] text-slate-400 italic">Gear Returned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Conflict Detection Center */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {allDetectedConflicts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                All Operations Cleared - No Resource Conflicts
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Physical microphones, projectors, and broadcast gear have distinct booking windows and do not exceed available quantities.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Conflict Detection Engine Active</span>
                </div>
                <p>
                  The system detected overlapping schedules where two or more operations have booked the same gear during the same hours. Below are the collision reports and recommended adjustments.
                </p>
              </div>

              {allDetectedConflicts.map(({ booking, conflict }) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-amber-300 dark:border-amber-900/60 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase">
                          Schedule Collision
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {booking.equipmentName}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Event: {booking.operationEventName} ({booking.bookingDate})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Requested slot: {booking.startTime} - {booking.endTime} &bull; Qty: {booking.quantity} &bull; Booked by: {booking.bookedBy}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Capacity: {conflict.availableUnits} of {conflict.totalCapacity} Available
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      Conflicting Concurrent Reservation:
                    </div>
                    {conflict.conflictingBookings.map(cb => (
                      <div key={cb.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400 pl-2 border-l-2 border-amber-500">
                        <span>
                          <strong>{cb.operationEventName}</strong> ({cb.startTime} - {cb.endTime}) &bull; Qty: {cb.quantity} by {cb.bookedBy}
                        </span>
                        <button
                          onClick={() => onUpdateBookingStatus(cb.id, 'Returned')}
                          className="text-[11px] font-bold text-[#7D3AC1] hover:underline"
                        >
                          Release Booking
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 italic">
                      Recommended: Shift booking window or assign alternative mobile unit.
                    </span>
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'Returned')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-colors"
                    >
                      Resolve by Releasing This Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal with Interactive Real-Time Conflict Detection */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            id="book-equipment-modal"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-indigo-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <Package className="w-5 h-5 text-[#7D3AC1]" />
                <span>Book Equipment for Operation Event</span>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* REAL-TIME CONFLICT ALERT INSIDE MODAL */}
            {liveConflictStatus.hasConflict && (
              <div
                id="modal-conflict-alert"
                className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>⚠️ BOOKING CONFLICT DETECTED!</span>
                </div>
                <p className="leading-relaxed">{liveConflictStatus.reason}</p>
                <div className="text-[11px] text-rose-800 dark:text-rose-300/80 font-medium">
                  Please select another equipment model or change the reservation time to avoid double-booking church gear.
                </div>
              </div>
            )}

            {!liveConflictStatus.hasConflict && formEquipmentId && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Slot is available! ({liveConflictStatus.availableUnits} unit(s) unreserved).</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Equipment Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Physical Equipment Resource
                </label>
                <select
                  value={formEquipmentId}
                  onChange={(e) => setFormEquipmentId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select Equipment...</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.category} - {eq.totalQuantity} total)
                    </option>
                  ))}
                </select>
              </div>

              {/* Operation Event Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Operation / Ministry Event
                </label>
                <select
                  value={formOperationId}
                  onChange={(e) => handleOperationSelect(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Choose an existing Operation Event or enter below...</option>
                  {operations.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.title} ({op.date || 'Upcoming'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Name Override / Custom */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Event Name / Program Title
                </label>
                <input
                  type="text"
                  value={formOperationName}
                  onChange={(e) => setFormOperationName(e.target.value)}
                  placeholder="e.g. Sunday Divine Consecration Service"
                  required
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Date & Time Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={formBookingDate}
                    onChange={(e) => setFormBookingDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Quantity & Booked By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Booked By (Staff / Ministry Lead)
                  </label>
                  <input
                    type="text"
                    value={formBookedBy}
                    onChange={(e) => setFormBookedBy(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Purpose Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Purpose / Equipment Notes
                </label>
                <textarea
                  rows={2}
                  value={formPurposeNotes}
                  onChange={(e) => setFormPurposeNotes(e.target.value)}
                  placeholder="e.g. Lead vocalist and guest preacher audio setup on main stage"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="confirm-equipment-booking-btn"
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 ${
                    liveConflictStatus.hasConflict
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#7D3AC1] hover:bg-[#682ea3]'
                  }`}
                >
                  {liveConflictStatus.hasConflict ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Book Despite Warning</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Reservation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
