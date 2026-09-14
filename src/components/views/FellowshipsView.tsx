import React, { useState } from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { FellowshipGroup, BibleTranslation } from '../../types';

interface FellowshipsViewProps {
  selectedTranslation: BibleTranslation;
  onNavigateToStudy: () => void;
}

export const FellowshipsView: React.FC<FellowshipsViewProps> = ({
  selectedTranslation,
  onNavigateToStudy
}) => {
  const [selectedFellowship, setSelectedFellowship] = useState<FellowshipGroup>('Adults Men');

  const fellowshipData: Record<
    FellowshipGroup,
    {
      leader: string;
      leaderRole: string;
      email: string;
      phone: string;
      meetingTime: string;
      location: string;
      motto: string;
      currentCurriculum: string;
      scriptureTheme: string;
      memberCount: number;
      attendanceRate: string;
    }
  > = {
    'Adults Men': {
      leader: 'Elder Thomas Vance',
      leaderRole: 'Men of Valor Director',
      email: 'men.fellowship@church.org',
      phone: '+1 (555) 234-8890',
      meetingTime: '1st & 3rd Saturdays @ 7:30 AM',
      location: 'Fellowship Hall & Prayer Garden',
      motto: 'Watch ye, stand fast in the faith, quit you like men, be strong.',
      currentCurriculum: 'Spiritual Priesthood in the Home & Marketplace Evangelism',
      scriptureTheme: '1 Corinthians 16:13',
      memberCount: 142,
      attendanceRate: '88%'
    },
    'Adults Women': {
      leader: 'Deaconess Mary Vance',
      leaderRole: 'Daughters of Grace Coordinator',
      email: 'women.fellowship@church.org',
      phone: '+1 (555) 234-8891',
      meetingTime: '2nd & 4th Saturdays @ 10:00 AM',
      location: 'Grace Chapel & Virtual Stream',
      motto: 'Strength and honour are her clothing; and she shall rejoice in time to come.',
      currentCurriculum: 'The Consecrated Matron: Intercession and Generational Holiness',
      scriptureTheme: 'Proverbs 31:25-30',
      memberCount: 188,
      attendanceRate: '92%'
    },
    'Youth & Campus': {
      leader: 'Youth Pastor Daniel Cole',
      leaderRole: 'Campus & Fire Generation Lead',
      email: 'ignite.youth@church.org',
      phone: '+1 (555) 234-8892',
      meetingTime: 'Every Friday @ 6:30 PM & Sunday 5:00 PM',
      location: 'Youth Auditorium & Campus Hub',
      motto: 'Let no man despise thy youth; but be thou an example of the believers.',
      currentCurriculum: 'Standing in the Gap: Apologetics, Purity & Power in Modern Universities',
      scriptureTheme: '1 Timothy 4:12',
      memberCount: 215,
      attendanceRate: '95%'
    },
    'Children': {
      leader: 'Sister Sarah Adams',
      leaderRole: 'Children Ministry Superintendent',
      email: 'children.church@church.org',
      phone: '+1 (555) 234-8893',
      meetingTime: 'Every Sunday @ 9:00 AM (Concurrent)',
      location: 'Children’s Kingdom Wing & Play Sanctuary',
      motto: 'Suffer the little children to come unto me, and forbid them not.',
      currentCurriculum: 'The Heroes of Faith: David, Daniel, and Samuel Hearing God’s Voice',
      scriptureTheme: 'Mark 10:14',
      memberCount: 165,
      attendanceRate: '97%'
    }
  };

  const current = fellowshipData[selectedFellowship];

  return (
    <div id="fellowships-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2D1664] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Ministry Arms & Fellowship Groups</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Fellowship Departments
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Pastoral oversight, curricula, meetings, and discipleship tracks tailored for each age and demographic.
          </p>
        </div>
      </div>

      {/* Fellowship Department Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(fellowshipData) as FellowshipGroup[]).map((groupName) => (
          <button
            key={groupName}
            onClick={() => setSelectedFellowship(groupName)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedFellowship === groupName
                ? 'bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white border-[#D4AF37] shadow-lg'
                : 'bg-white dark:bg-[#071430] border-slate-200 dark:border-indigo-950 text-slate-800 dark:text-slate-200 hover:border-[#7D3AC1]'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              Department
            </div>
            <div className="font-serif-cinzel font-bold text-base mt-1">
              {groupName}
            </div>
            <div className="text-[11px] opacity-70 mt-1">
              {fellowshipData[groupName].memberCount} Souls Registered
            </div>
          </button>
        ))}
      </div>

      {/* Selected Fellowship Spotlight */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
              Active Fellowship Profile
            </span>
            <h2 className="font-serif-cinzel font-bold text-2xl text-slate-900 dark:text-white">
              {selectedFellowship} Fellowship
            </h2>
            <p className="text-xs text-slate-500 italic mt-0.5">
              Scripture Pillar: {current.scriptureTheme} ({selectedTranslation})
            </p>
          </div>

          <button
            onClick={onNavigateToStudy}
            className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Open Study Guide</span>
          </button>
        </div>

        {/* Motto Box */}
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7D3AC1] dark:text-[#D4AF37] block mb-1">
            Department Motto & Scriptural Anchor
          </span>
          <p className="font-serif-cinzel italic text-sm md:text-base text-slate-800 dark:text-slate-200">
            "{current.motto}"
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Schedule & Curriculum */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#7D3AC1]" />
                Current Teaching Curriculum
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {current.currentCurriculum}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Weekly study materials distributed to group cell leaders every Wednesday.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                Assembly Time & Gathering Venue
              </span>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {current.meetingTime}
              </div>
              <div className="text-xs text-slate-500">
                Location: {current.location}
              </div>
            </div>
          </div>

          {/* Right: Leadership & Metrics */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Department Leadership
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {current.leader}
                </h4>
                <div className="text-xs text-[#7D3AC1] dark:text-[#D4AF37] font-semibold">
                  {current.leaderRole}
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{current.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{current.phone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {current.memberCount}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">Active Members</div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {current.attendanceRate}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">Quarterly Attendance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
