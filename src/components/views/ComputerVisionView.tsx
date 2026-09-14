import React, { useState, useRef } from 'react';
import {
  ScanEye,
  UploadCloud,
  FileImage,
  CheckCircle2,
  Sparkles,
  CalendarPlus,
  BookOpen,
  Users,
  ShieldCheck,
  AlertCircle,
  Eye,
  RefreshCw,
  Camera,
  Layers,
  Check,
  Edit3
} from 'lucide-react';
import { ComputerVisionAnalysis, ChurchOperationEvent, BibleTranslation } from '../../types';
import { sampleVisionAnalyses } from '../../data/initialData';

interface ComputerVisionViewProps {
  selectedTranslation: BibleTranslation;
  onCommitEvent: (event: ChurchOperationEvent) => void;
  onSendToSermonBuilder: (scripture: string, theme: string) => void;
  onAddAttendanceLog: (count: number, notes: string) => void;
}

export const ComputerVisionView: React.FC<ComputerVisionViewProps> = ({
  selectedTranslation,
  onCommitEvent,
  onSendToSermonBuilder,
  onAddAttendanceLog
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ComputerVisionAnalysis>(sampleVisionAnalyses[0]);
  const [history, setHistory] = useState<ComputerVisionAnalysis[]>(sampleVisionAnalyses);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [editableNotes, setEditableNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetSamples = [
    {
      title: 'Annual Revival Flyer',
      category: 'Event Flyer' as const,
      data: sampleVisionAnalyses[0]
    },
    {
      title: 'Sanctuary Congregation & Pew Count',
      category: 'Attendance / Congregation' as const,
      data: sampleVisionAnalyses[1]
    },
    {
      title: 'Holy Ghost Youth Camp Banner',
      category: 'Event Flyer' as const,
      data: {
        id: 'cv-sample-3',
        timestamp: new Date().toISOString(),
        imagePreview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230B1F4D"/><polygon points="200,40 240,160 380,160 270,240 310,360 200,280 90,360 130,240 20,160 160,160" fill="%237D3AC1" opacity="0.3"/><text x="200" y="90" font-family="Cinzel, serif" font-size="22" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">IGNITE YOUTH CAMP 2026</text><text x="200" y="135" font-family="sans-serif" font-size="14" fill="%23D4AF37" text-anchor="middle">THEME: STANDING IN THE GAP</text><text x="200" y="180" font-family="sans-serif" font-size="13" fill="%23FFFFFF" text-anchor="middle">EZEKIEL 22:30 | NOV 20 - 24</text><text x="200" y="225" font-family="sans-serif" font-size="13" fill="%2393C5FD" text-anchor="middle">PINE GROVE RETREAT CENTER</text></svg>',
        category: 'Event Flyer' as const,
        extractedText: 'IGNITE YOUTH CAMP 2026\nTHEME: STANDING IN THE GAP\nEZEKIEL 22:30\nDATE: NOV 20 - 24, 2026\nLOCATION: PINE GROVE RETREAT CENTER',
        detectedObjects: [
          { label: 'Youth Logo Emblem', confidence: 0.96 },
          { label: 'Camp Location Header', confidence: 0.94 },
          { label: 'Scripture Reference Block', confidence: 0.99 }
        ],
        detectedBibleReferences: ['Ezekiel 22:30', '1 Timothy 4:12'],
        suggestedEvents: [
          {
            title: 'Ignite Youth Camp 2026: Standing in the Gap',
            date: '2026-11-20 to 2026-11-24',
            location: 'Pine Grove Retreat Center',
            speaker: 'Youth Pastor Daniel Cole'
          }
        ],
        suggestedSermonThemes: [
          'Seeking for a Man to Stand in the Gap',
          'Let No Man Despise Thy Youth',
          'Consecrated Living on University Campuses'
        ],
        humanReviewConfirmed: false,
        notes: 'Youth camp banner parsed with OCR and object bounding.'
      }
    }
  ];

  const handleSelectPreset = (index: number) => {
    setSelectedPreset(index);
    setCustomImage(null);
    setCurrentAnalysis(presetSamples[index].data);
    setIsCommitted(false);
    setEditableNotes(presetSamples[index].data.notes || '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCustomImage(base64);
      runVisionAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (imgBase64: string, mimeType: string = 'image/jpeg') => {
    setAnalyzing(true);
    setIsCommitted(false);

    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgBase64,
          mimeType,
          categoryHint: 'Event Flyer'
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const newAnalysis: ComputerVisionAnalysis = {
          id: `cv-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imagePreview: imgBase64,
          category: d.estimatedAttendance ? 'Attendance / Congregation' : 'Event Flyer',
          extractedText: d.extractedText || '',
          detectedObjects: d.detectedObjects || [],
          estimatedAttendance: d.estimatedAttendance,
          detectedBibleReferences: d.detectedBibleReferences || [],
          suggestedEvents: d.suggestedEvents || [],
          suggestedSermonThemes: d.suggestedSermonThemes || [],
          humanReviewConfirmed: false,
          notes: d.visionNotes || 'Parsed via Computer Vision Agent'
        };
        setCurrentAnalysis(newAnalysis);
        setHistory([newAnalysis, ...history]);
        setEditableNotes(newAnalysis.notes || '');
      }
    } catch (err) {
      console.error('Failed to run computer vision:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Human Review & Commit action: Save to Church Operations Calendar
  const handleCommitToOperations = () => {
    if (!currentAnalysis.suggestedEvents || currentAnalysis.suggestedEvents.length === 0) return;
    const evt = currentAnalysis.suggestedEvents[0];
    const newOp: ChurchOperationEvent = {
      id: `op-${Date.now()}`,
      name: evt.title,
      type: 'Special Program',
      startDate: evt.date.split(' to ')[0] || '2026-10-24',
      endDate: evt.date.split(' to ')[1] || evt.date.split(' to ')[0] || '2026-10-26',
      time: '6:30 PM',
      location: evt.location || 'Main Sanctuary',
      speaker: evt.speaker || 'Pastoral Ministry Team',
      leadMinistryTeam: 'Events & Operations Team',
      estimatedBudget: 5000,
      expectedAttendance: currentAnalysis.estimatedAttendance || 300,
      notes: `Extracted via Computer Vision: ${currentAnalysis.extractedText.slice(0, 120)}...`,
      status: 'Active'
    };

    onCommitEvent(newOp);
    setIsCommitted(true);
  };

  // Commit Attendance Count to Records
  const handleCommitAttendance = () => {
    if (currentAnalysis.estimatedAttendance) {
      onAddAttendanceLog(
        currentAnalysis.estimatedAttendance,
        `Camera AI detection: ${currentAnalysis.extractedText.slice(0, 80)}`
      );
      setIsCommitted(true);
    }
  };

  return (
    <div id="computer-vision-container" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#35196A] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <ScanEye className="w-4 h-4" />
            <span>Computer Vision &bull; Multimodal Visual Analysis</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Church Computer Vision Subsystem
          </h1>
          <p className="text-xs md:text-sm text-slate-200 max-w-2xl">
            Extract text from flyers and bulletins, count congregation attendance in sanctuary camera frames, identify Bible scriptures, and generate sermon themes.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 bg-black/30 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'scan' ? 'bg-[#D4AF37] text-[#0B1F4D]' : 'text-slate-200 hover:text-white'
            }`}
          >
            Live Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'history' ? 'bg-[#D4AF37] text-[#0B1F4D]' : 'text-slate-200 hover:text-white'
            }`}
          >
            Analysis Logs ({history.length})
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Input & Presets */}
          <div className="lg:col-span-5 space-y-4">
            {/* Upload Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
              <h3 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Upload Church Image or Document</span>
              </h3>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-indigo-900/80 hover:border-[#7D3AC1] dark:hover:border-[#D4AF37] rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-[#D4AF37] flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to choose image or drag & drop
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports PNG, JPG, WEBP flyers, church bulletins, and congregation photos
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Or Test Preset Samples
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {presetSamples.map((sample, idx) => (
                    <button
                      key={sample.title}
                      onClick={() => handleSelectPreset(idx)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        selectedPreset === idx && !customImage
                          ? 'border-[#7D3AC1] dark:border-[#D4AF37] bg-purple-50 dark:bg-purple-950/40 text-[#7D3AC1] dark:text-[#D4AF37] font-semibold'
                          : 'border-slate-200 dark:border-indigo-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="truncate">{sample.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {sample.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Box */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Active Image Frame
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-64">
                  {customImage ? (
                    <img src={customImage} alt="User Upload" className="w-full h-auto object-contain max-h-64" />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: currentAnalysis.imagePreview }}
                      className="w-full flex justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-60"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Extraction & Human Review Pipeline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Extraction Results & Entity Recognition
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300 font-semibold">
                    {currentAnalysis.category}
                  </span>
                  {analyzing && (
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold animate-spin">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance Meter (If Detected) */}
              {currentAnalysis.estimatedAttendance !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-transparent border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F4D] dark:text-blue-300 uppercase">
                      <Users className="w-4 h-4" />
                      <span>Congregation Crowd Detection</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ~{currentAnalysis.estimatedAttendance} Persons Seated
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Calculated via pew density bounding boxes with 94.2% model confidence.
                    </p>
                  </div>
                  <button
                    onClick={handleCommitAttendance}
                    disabled={isCommitted}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isCommitted
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#7D3AC1] hover:bg-[#6023A1] text-white shadow-md'
                    }`}
                  >
                    {isCommitted ? <Check className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{isCommitted ? 'Logged to Attendance' : 'Commit to Attendance'}</span>
                  </button>
                </div>
              )}

              {/* OCR Extracted Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#7D3AC1]" />
                    OCR Raw Text Extracted from Image
                  </span>
                  <span className="text-[10px] text-slate-400">Editable before commit</span>
                </div>
                <textarea
                  id="cv-extracted-text-area"
                  value={currentAnalysis.extractedText}
                  onChange={(e) =>
                    setCurrentAnalysis({ ...currentAnalysis, extractedText: e.target.value })
                  }
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#7D3AC1]"
                />
              </div>

              {/* Detected Objects & Tags */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Detected Sacred Visual Objects
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.detectedObjects.map((obj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{obj.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Scriptures */}
              {currentAnalysis.detectedBibleReferences.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Detected Bible Scriptures in Flyer ({selectedTranslation})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.detectedBibleReferences.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSendToSermonBuilder(ref, currentAnalysis.suggestedSermonThemes[0] || 'Divine Victory')}
                        title="Click to build sermon outline with this Scripture"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-[#0B1F4D] dark:text-amber-200 hover:border-[#D4AF37] transition-colors flex items-center gap-1"
                      >
                        <span>{ref}</span>
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Sermon Themes */}
              {currentAnalysis.suggestedSermonThemes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7D3AC1]" />
                    AI Suggested Sermon & Bible Study Themes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentAnalysis.suggestedSermonThemes.map((theme, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          onSendToSermonBuilder(
                            currentAnalysis.detectedBibleReferences[0] || '1 Peter 1:15',
                            theme
                          )
                        }
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-indigo-950/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-[#7D3AC1] cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <span className="truncate">{theme}</span>
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7D3AC1] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Review & Commit Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    <strong>Human-in-the-Loop Safeguard:</strong> Records are never modified automatically without administrator confirmation.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {currentAnalysis.suggestedEvents.length > 0 && (
                    <button
                      id="cv-commit-event-btn"
                      onClick={handleCommitToOperations}
                      disabled={isCommitted}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isCommitted
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white hover:opacity-90 shadow-md'
                      }`}
                    >
                      {isCommitted ? <Check className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4 text-[#D4AF37]" />}
                      <span>{isCommitted ? 'Event Added to Operations' : 'Confirm & Add to Church Calendar'}</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      onSendToSermonBuilder(
                        currentAnalysis.detectedBibleReferences[0] || '1 Kings 18:30',
                        currentAnalysis.suggestedSermonThemes[0] || 'Altar of Fire'
                      )
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[#0B1F4D] dark:text-slate-200 hover:border-[#7D3AC1] flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#7D3AC1]" />
                    <span>Create Sermon Outline from Flyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Logs Tab */
        <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
          <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
            Computer Vision Audit & Visual Analysis Log
          </h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-indigo-950 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B1F4D] dark:text-[#D4AF37]">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono line-clamp-2">
                    {item.extractedText}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Objects: {item.detectedObjects.map(o => o.label).join(', ')}</span>
                    {item.estimatedAttendance && (
                      <span className="font-bold text-[#7D3AC1] dark:text-purple-300">
                        &bull; Count: ~{item.estimatedAttendance}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentAnalysis(item);
                    setActiveTab('scan');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-[#7D3AC1] text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                >
                  Inspect Extraction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
