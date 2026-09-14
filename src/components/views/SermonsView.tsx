import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Printer,
  Copy,
  Save,
  Plus,
  Trash2,
  Share2,
  Check,
  FileText,
  ChevronDown,
  Layers,
  HelpCircle,
  HeartHandshake
} from 'lucide-react';
import { Sermon, BibleStudy, BibleTranslation } from '../../types';
import { sampleScriptures } from '../../data/initialData';

interface SermonsViewProps {
  sermons: Sermon[];
  bibleStudies: BibleStudy[];
  onSaveSermon: (sermon: Sermon) => void;
  onDeleteSermon: (id: string) => void;
  onSaveStudy: (study: BibleStudy) => void;
  onPrintSermon: (sermon: Sermon) => void;
  selectedTranslation: BibleTranslation;
  onSelectTranslation: (version: BibleTranslation) => void;
  initialScriptureFocus?: string;
  initialThemeFocus?: string;
}

export const SermonsView: React.FC<SermonsViewProps> = ({
  sermons,
  bibleStudies,
  onSaveSermon,
  onDeleteSermon,
  onSaveStudy,
  onPrintSermon,
  selectedTranslation,
  onSelectTranslation,
  initialScriptureFocus,
  initialThemeFocus
}) => {
  const [activeTab, setActiveTab] = useState<'sermonBuilder' | 'studyBuilder' | 'scriptureReader'>('sermonBuilder');
  const [activeSermonIndex, setActiveSermonIndex] = useState<number>(0);
  const [currentSermon, setCurrentSermon] = useState<Sermon>(
    sermons[0] || {
      id: 'sermon-new',
      title: initialThemeFocus || 'Walking in Supernatural Authority',
      theme: 'Divine Victory & Holiness',
      mainScripture: initialScriptureFocus || '1 Peter 1:15-16',
      supportingTexts: ['Hebrews 12:14', 'Romans 12:1-2'],
      bibleVersion: selectedTranslation,
      date: new Date().toISOString().split('T')[0],
      speaker: 'Rev. Dr. David Emmanuel',
      introduction: 'True power in the Kingdom of God flows from deep fellowship and holiness.',
      mainPoints: [
        {
          title: 'The Divine Mandate of Consecration',
          subpoints: ['Separated from the spirit of the age', 'Sanctified in heart and mind'],
          scriptureRef: '1 Peter 1:15'
        }
      ],
      illustrations: ['The ancient refiner of silver watching for his own reflection.'],
      applications: ['Spend 30 minutes in private adoration every morning.'],
      conclusion: 'Step out this week knowing heaven stands behind your prayers.',
      prayer: 'Lord, make us holy vessels fit for the Master’s use. Amen.',
      notes: '',
      tags: ['Holiness', 'Authority']
    }
  );

  const [activeStudyIndex, setActiveStudyIndex] = useState<number>(0);
  const [currentStudy, setCurrentStudy] = useState<BibleStudy>(bibleStudies[0]);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);

  // AI Sermon Generation calling server API
  const handleGenerateAiSermon = async (mode: 'full' | 'points' | 'illustrations' | 'youth') => {
    setIsAiGenerating(true);
    try {
      const prompt = `Generate an expository sermon draft.
Topic/Theme: ${currentSermon.theme}.
Main Scripture: ${currentSermon.mainScripture}.
Selected Bible Translation: ${selectedTranslation}.
Variant Mode: ${mode} (if youth, make it relatable to campus/youth; if points, supply 3 deep exegetical points with illustrations).
Follow theological guardrails (Puritans, holiness, Matthew Henry).`;

      const response = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          bibleVersion: selectedTranslation,
          mode: 'sermon_assistant'
        })
      });

      const resData = await response.json();
      if (resData.text) {
        // Integrate into current sermon
        setCurrentSermon({
          ...currentSermon,
          notes: `${currentSermon.notes ? currentSermon.notes + '\n\n' : ''}=== AI EXEGESIS & DRAFT (${new Date().toLocaleTimeString()}) ===\n${resData.text}`,
          bibleVersion: selectedTranslation
        });
      }
    } catch (err) {
      console.error('Error generating AI sermon:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCopyText = () => {
    const fullText = `SERMON: ${currentSermon.title}\nScripture: ${currentSermon.mainScripture} (${currentSermon.bibleVersion})\nSpeaker: ${currentSermon.speaker}\n\nINTRODUCTION:\n${currentSermon.introduction}\n\nPOINTS:\n${currentSermon.mainPoints.map((p, i) => `${i + 1}. ${p.title} (${p.scriptureRef})\n   - ${p.subpoints.join('\n   - ')}`).join('\n\n')}\n\nILLUSTRATIONS:\n${currentSermon.illustrations.join('\n')}\n\nAPPLICATIONS:\n${currentSermon.applications.join('\n')}\n\nCONCLUSION:\n${currentSermon.conclusion}\n\nPRAYER:\n${currentSermon.prayer}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNewSermon = () => {
    const fresh: Sermon = {
      id: `sermon-${Date.now()}`,
      title: 'New Sermon Title',
      theme: 'Faith and Kingdom Grace',
      mainScripture: 'John 14:1',
      supportingTexts: ['Romans 8:28'],
      bibleVersion: selectedTranslation,
      date: new Date().toISOString().split('T')[0],
      speaker: 'Rev. Dr. David Emmanuel',
      introduction: 'Enter introduction here...',
      mainPoints: [
        {
          title: 'Point 1: The Promise of Divine Presence',
          subpoints: ['Subpoint A: Peace in the storm'],
          scriptureRef: 'John 14:1'
        }
      ],
      illustrations: ['Illustration from everyday life...'],
      applications: ['Action step for this week...'],
      conclusion: 'Conclusion summary...',
      prayer: 'Closing altar prayer...',
      notes: '',
      tags: ['Faith']
    };
    setCurrentSermon(fresh);
    onSaveSermon(fresh);
  };

  const activePassage = sampleScriptures[selectedPassageIndex] || sampleScriptures[0];

  return (
    <div id="sermons-view-container" className="space-y-6">
      {/* Top Banner & Sub-navigation */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2D1664] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Pulpit & Study &bull; Expository Hub</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Sermon & Bible Study Builder
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Craft structured sermon manuscripts, prepare fellowship outlines, and compare Scripture translations.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sermonBuilder')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sermonBuilder' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
            }`}
          >
            Sermon Builder
          </button>
          <button
            onClick={() => setActiveTab('studyBuilder')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'studyBuilder' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
            }`}
          >
            Bible Study Builder
          </button>
          <button
            onClick={() => setActiveTab('scriptureReader')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'scriptureReader' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
            }`}
          >
            Scripture Reader
          </button>
        </div>
      </div>

      {/* 1. SERMON BUILDER TAB */}
      {activeTab === 'sermonBuilder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Saved Sermons List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white">
                  Sermon Outlines ({sermons.length})
                </span>
                <button
                  id="new-sermon-btn"
                  onClick={handleCreateNewSermon}
                  className="px-2.5 py-1 rounded-lg bg-[#7D3AC1] hover:bg-[#6023A1] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {sermons.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSermonIndex(idx);
                      setCurrentSermon(s);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      currentSermon.id === s.id
                        ? 'border-[#7D3AC1] dark:border-[#D4AF37] bg-purple-50 dark:bg-purple-950/40 font-medium'
                        : 'border-slate-200 dark:border-indigo-950/60 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{s.date}</span>
                      <span className="font-bold text-[#7D3AC1] dark:text-[#D4AF37]">{s.bibleVersion}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white truncate mt-1">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {s.mainScripture} &bull; {s.speaker}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sermon Editor Form & AI Tools */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-6">
              {/* Header Bar Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-md bg-[#0B1F4D] text-[#D4AF37] text-xs font-bold font-mono">
                    {currentSermon.bibleVersion}
                  </div>
                  <span className="text-xs text-slate-500">Expository Outline</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Assistant dropdown buttons */}
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => handleGenerateAiSermon('full')}
                      disabled={isAiGenerating}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#7D3AC1] to-[#D4AF37] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                      <span>{isAiGenerating ? 'Synthesizing...' : 'FaithGPT AI Draft'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyText}
                    title="Copy full sermon manuscript to clipboard"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#7D3AC1] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onPrintSermon(currentSermon)}
                    title="Print or Export to PDF"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#7D3AC1] transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSaveSermon(currentSermon)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white hover:opacity-90 flex items-center gap-1.5 transition-opacity"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Title & Scripture Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sermon Title
                  </label>
                  <input
                    type="text"
                    value={currentSermon.title}
                    onChange={(e) => setCurrentSermon({ ...currentSermon, title: e.target.value })}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Main Scripture Reference
                  </label>
                  <input
                    type="text"
                    value={currentSermon.mainScripture}
                    onChange={(e) => setCurrentSermon({ ...currentSermon, mainScripture: e.target.value })}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Central Theme / Topic
                  </label>
                  <input
                    type="text"
                    value={currentSermon.theme}
                    onChange={(e) => setCurrentSermon({ ...currentSermon, theme: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Preacher / Minister Name
                  </label>
                  <input
                    type="text"
                    value={currentSermon.speaker}
                    onChange={(e) => setCurrentSermon({ ...currentSermon, speaker: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                  />
                </div>
              </div>

              {/* Introduction */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sermon Introduction & Historical Context
                </label>
                <textarea
                  value={currentSermon.introduction}
                  onChange={(e) => setCurrentSermon({ ...currentSermon, introduction: e.target.value })}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                />
              </div>

              {/* Main Expository Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Expository Outline Points
                  </label>
                  <button
                    onClick={() => {
                      setCurrentSermon({
                        ...currentSermon,
                        mainPoints: [
                          ...currentSermon.mainPoints,
                          {
                            title: `Point ${currentSermon.mainPoints.length + 1}`,
                            subpoints: ['Key observation'],
                            scriptureRef: currentSermon.mainScripture
                          }
                        ]
                      });
                    }}
                    className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentSermon.mainPoints.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#7D3AC1] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {pIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={point.title}
                          onChange={(e) => {
                            const pts = [...currentSermon.mainPoints];
                            pts[pIdx].title = e.target.value;
                            setCurrentSermon({ ...currentSermon, mainPoints: pts });
                          }}
                          placeholder="Point Title"
                          className="flex-1 text-xs font-bold p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        />
                        <input
                          type="text"
                          value={point.scriptureRef}
                          onChange={(e) => {
                            const pts = [...currentSermon.mainPoints];
                            pts[pIdx].scriptureRef = e.target.value;
                            setCurrentSermon({ ...currentSermon, mainPoints: pts });
                          }}
                          placeholder="Scripture Ref"
                          className="w-32 text-xs p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                      <div className="pl-8 space-y-1">
                        <textarea
                          value={point.subpoints.join('\n')}
                          onChange={(e) => {
                            const pts = [...currentSermon.mainPoints];
                            pts[pIdx].subpoints = e.target.value.split('\n');
                            setCurrentSermon({ ...currentSermon, mainPoints: pts });
                          }}
                          rows={2}
                          placeholder="Subpoints (one per line)"
                          className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustrations & Applications Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sermon Illustrations
                  </label>
                  <textarea
                    value={currentSermon.illustrations.join('\n')}
                    onChange={(e) =>
                      setCurrentSermon({ ...currentSermon, illustrations: e.target.value.split('\n') })
                    }
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Practical Applications
                  </label>
                  <textarea
                    value={currentSermon.applications.join('\n')}
                    onChange={(e) =>
                      setCurrentSermon({ ...currentSermon, applications: e.target.value.split('\n') })
                    }
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Conclusion & Altar Prayer */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Conclusion & Altar Call Prayer
                </label>
                <textarea
                  value={currentSermon.prayer}
                  onChange={(e) => setCurrentSermon({ ...currentSermon, prayer: e.target.value })}
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Research Notes & AI Output */}
              {currentSermon.notes && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                  <span className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    FaithGPT Exegesis & Companion Insights
                  </span>
                  <div className="text-xs whitespace-pre-wrap font-mono text-slate-700 dark:text-slate-300 max-h-60 overflow-y-auto">
                    {currentSermon.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BIBLE STUDY BUILDER TAB */}
      {activeTab === 'studyBuilder' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                {currentStudy.title}
              </h3>
              <p className="text-xs text-slate-500">
                Scripture: {currentStudy.scripture} ({currentStudy.bibleVersion}) &bull; For: {currentStudy.targetFellowship}
              </p>
            </div>
            <button
              onClick={() => onSaveStudy(currentStudy)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Study</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Study Title</label>
              <input
                type="text"
                value={currentStudy.title}
                onChange={(e) => setCurrentStudy({ ...currentStudy, title: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Fellowship</label>
              <input
                type="text"
                value={currentStudy.targetFellowship}
                onChange={(e) => setCurrentStudy({ ...currentStudy, targetFellowship: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Study Objective</label>
            <textarea
              value={currentStudy.objective}
              onChange={(e) => setCurrentStudy({ ...currentStudy, objective: e.target.value })}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Discussion Questions (One per line)
              </label>
              <textarea
                value={currentStudy.discussionQuestions.join('\n')}
                onChange={(e) =>
                  setCurrentStudy({ ...currentStudy, discussionQuestions: e.target.value.split('\n') })
                }
                rows={4}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cross References & Cross-Texts
              </label>
              <textarea
                value={currentStudy.crossReferences.join('\n')}
                onChange={(e) =>
                  setCurrentStudy({ ...currentStudy, crossReferences: e.target.value.split('\n') })
                }
                rows={4}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. SCRIPTURE COMPARISON READER TAB */}
      {activeTab === 'scriptureReader' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white">
                Parallel Scripture Reader & Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side comparison across KJV, NASB, NIV, and NLT translations.
              </p>
            </div>

            {/* Passage Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Select Passage:</span>
              <select
                value={selectedPassageIndex}
                onChange={(e) => setSelectedPassageIndex(Number(e.target.value))}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[#0B1F4D] dark:text-[#D4AF37]"
              >
                {sampleScriptures.map((item, idx) => (
                  <option key={item.reference} value={idx}>
                    {item.reference}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Verses Table */}
          <div className="space-y-4">
            {activePassage.verses.map((v) => (
              <div
                key={v.verse}
                className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B1F4D] text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
                    {v.verse}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activePassage.book} {activePassage.chapter}:{v.verse}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-[#7D3AC1] dark:text-[#D4AF37] text-[10px] uppercase">
                      King James Version (KJV)
                    </span>
                    <p className="italic text-slate-800 dark:text-slate-200 font-serif">
                      "{v.translations.KJV}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase">
                      New American Standard Bible (NASB)
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">
                      "{v.translations.NASB}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase">
                      New International Version (NIV)
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">
                      "{v.translations.NIV}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-[10px] uppercase">
                      New Living Translation (NLT)
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">
                      "{v.translations.NLT}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
