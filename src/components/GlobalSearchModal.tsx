import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  Users,
  X,
  ArrowRight,
  Flame,
  FileText
} from 'lucide-react';
import { Sermon, ChurchOperationEvent, ChurchMember, BibleTranslation } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sermons: Sermon[];
  operations: ChurchOperationEvent[];
  members: ChurchMember[];
  onNavigateTo: (toolId: string) => void;
  selectedTranslation: BibleTranslation;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  sermons,
  operations,
  members,
  onNavigateTo,
  selectedTranslation
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingSermons = q
    ? sermons.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.mainScripture.toLowerCase().includes(q) ||
          s.theme.toLowerCase().includes(q)
      )
    : [];

  const matchingOps = q
    ? operations.filter(
        o =>
          o.name.toLowerCase().includes(q) ||
          o.location.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q)
      )
    : [];

  const matchingMembers = q
    ? members.filter(
        m =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.fellowship.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#071430] rounded-2xl border border-slate-200 dark:border-indigo-950 w-full max-w-2xl overflow-hidden shadow-2xl space-y-3">
        {/* Search Bar */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across sermons, scriptures, members, crusades..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {!q ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Type keywords to search sermons ({selectedTranslation}), church events, or member records.
            </div>
          ) : matchingSermons.length === 0 && matchingOps.length === 0 && matchingMembers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Sermons */}
              {matchingSermons.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#7D3AC1]" />
                    Sermons & Scripture Outlines
                  </span>
                  <div className="space-y-1">
                    {matchingSermons.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigateTo('sermons');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.mainScripture} &bull; {s.speaker} ({s.date})
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Church Operations */}
              {matchingOps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Crusades & Operations
                  </span>
                  <div className="space-y-1">
                    {matchingOps.map((op) => (
                      <div
                        key={op.id}
                        onClick={() => {
                          onNavigateTo('operations');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {op.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {op.type} &bull; {op.startDate} &bull; {op.location}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Congregation Members */}
              {matchingMembers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Members & Workers
                  </span>
                  <div className="space-y-1">
                    {matchingMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigateTo('congregation');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {m.fellowship} &bull; {m.role} &bull; {m.phone}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
