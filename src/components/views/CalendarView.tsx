import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { WeeklyScheduleItem } from '../../types';

interface CalendarViewProps {
  schedule: WeeklyScheduleItem[];
  onAddScheduleItem: (item: WeeklyScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  onAddScheduleItem,
  onDeleteScheduleItem
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Sunday');
  const [time, setTime] = useState('9:00 AM - 11:30 AM');
  const [location, setLocation] = useState('Main Sanctuary');
  const [speakerOrLeader, setSpeakerOrLeader] = useState('Pastoral Team');
  const [category, setCategory] = useState<any>('Sunday Service');
  const [color, setColor] = useState('#0B1F4D');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: WeeklyScheduleItem = {
      id: `sched-${Date.now()}`,
      dayOfWeek: dayOfWeek as any,
      time,
      title,
      location,
      speakerOrLeader,
      category,
      color: color || '#7D3AC1'
    };

    onAddScheduleItem(newItem);
    setShowAddModal(false);
    setTitle('');
  };

  const filteredSchedule = selectedDay === 'All'
    ? schedule
    : schedule.filter(s => s.dayOfWeek === selectedDay);

  return (
    <div id="calendar-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A1550] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Liturgical Order & Assemblies</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Church Weekly Assembly Calendar
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Weekly assembly schedule: Sunday Divine Services, Tuesday Expository Studies, Friday Miracle Vigils, and departmental fellowships.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-2 shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weekly Service</span>
        </button>
      </div>

      {/* Day of Week Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDay('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            selectedDay === 'All'
              ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
              : 'bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Days ({schedule.length})
        </button>
        {DAYS_OF_WEEK.map((d) => {
          const count = schedule.filter(s => s.dayOfWeek === d).length;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                selectedDay === d
                  ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white'
                  : 'bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 text-slate-600 dark:text-slate-400 hover:border-[#7D3AC1]'
              }`}
            >
              <span>{d}</span>
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Items List */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => {
          if (selectedDay !== 'All' && selectedDay !== day) return null;
          const dayItems = schedule.filter(s => s.dayOfWeek === day);
          if (selectedDay === 'All' && dayItems.length === 0) return null;

          return (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>{day}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs flex items-center justify-between hover:border-[#D4AF37] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <h4 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300">
                        {item.category}
                      </span>
                      <button
                        onClick={() => onDeleteScheduleItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Remove Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                Add Weekly Assembly
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Service / Assembly Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wednesday Miracle & Deliverance Service"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Range</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="6:00 PM - 8:00 PM"
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
                    placeholder="Main Sanctuary"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="Worship Service">Worship Service</option>
                    <option value="Bible Study">Bible Study</option>
                    <option value="Prayer Meeting">Prayer Meeting</option>
                    <option value="Youth Gathering">Youth Gathering</option>
                    <option value="Evangelism Outreach">Evangelism Outreach</option>
                    <option value="Choir Rehearsal">Choir Rehearsal</option>
                  </select>
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
