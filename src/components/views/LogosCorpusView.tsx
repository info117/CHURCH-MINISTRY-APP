import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  Search,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { TheologicalSource, BibleTranslation } from '../../types';
import { sampleTheologicalSources } from '../../data/initialData';

interface LogosCorpusViewProps {
  selectedTranslation: BibleTranslation;
}

export const LogosCorpusView: React.FC<LogosCorpusViewProps> = ({
  selectedTranslation
}) => {
  const [sources, setSources] = useState<TheologicalSource[]>(sampleTheologicalSources);
  const [activeSourceId, setActiveSourceId] = useState<string>(sources?.[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedExcerpt, setCopiedExcerpt] = useState(false);

  const activeSource = (sources || []).find(s => s.id === activeSourceId) || sources?.[0];

  const handleToggleSource = (id: string) => {
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExcerpt(true);
    setTimeout(() => setCopiedExcerpt(false), 2000);
  };

  return (
    <div id="logos-corpus-view-container" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2D1664] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Library className="w-4 h-4" />
            <span>Sacred Archive &bull; Expository Guard-Rails</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Theological Corpus & Commentary Library
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            FaithGPT and Bible AI assistants are constrained to this verified orthodox Christian corpus to ensure doctrinal purity.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D4AF37] shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Orthodox Guard-Rails Enforced</span>
        </div>
      </div>

      {/* Main Split: Sources Roster & Excerpt Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Corpus Sources Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                Theological Corpus Sources
              </h3>
              <span className="text-[10px] text-slate-400">
                {sources.filter(s => s.enabled).length}/{sources.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {sources.map((src) => {
                const isSelected = src.id === activeSource.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setActiveSourceId(src.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-[#7D3AC1] dark:border-[#D4AF37] bg-purple-50 dark:bg-purple-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-indigo-950/80 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {src.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {src.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {src.author} ({src.century})
                      </div>
                    </div>

                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={src.enabled}
                        onChange={() => handleToggleSource(src.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#7D3AC1]"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Excerpt & Detail Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider">
                  {activeSource.category} &bull; Weight: {activeSource.theologicalWeight}%
                </span>
                <h3 className="font-serif-cinzel font-bold text-xl text-slate-900 dark:text-white mt-1">
                  {activeSource.name}
                </h3>
                <div className="text-xs text-slate-500">
                  By {activeSource.author} &bull; {activeSource.century}
                </div>
              </div>

              <button
                onClick={() => handleCopy(activeSource.sampleExcerpt)}
                title="Copy Commentary Excerpt"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1]"
              >
                {copiedExcerpt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Source Description & Doctrine
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeSource.description}
              </p>
            </div>

            {/* Excerpt Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Exegesis Excerpt Sample
              </span>
              <p className="font-serif-cinzel italic text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                "{activeSource.sampleExcerpt}"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-bold text-[#7D3AC1] dark:text-[#D4AF37] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                A2A Judge Integration
              </span>
              <p className="text-[11px]">
                When sermon outlines or Bible studies are generated, the Judge Agent audits claims against this corpus before human review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
