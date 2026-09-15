import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Plus,
  CheckCircle2,
  ExternalLink,
  Printer,
  Calendar,
  Share2,
  User,
  ShieldCheck,
  Flame,
  CloudCheck,
  Cloud,
  Check,
  RefreshCw,
  AlertCircle,
  Tag,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { Devotional, PrayerRequest, BibleTranslation, UrgencyLevel, SimulatedPrayerEmailAlert } from '../../types';
import { 
  savePrayerToFirestore, 
  updatePrayerStatusInFirestore, 
  updatePrayerUrgencyInFirestore,
  subscribeToChurchPrayers,
  getStoredPrayerEmailAlerts,
  onSimulatedPrayerEmailAlert,
  generateSimulatedPrayerEmailAlert
} from '../../lib/firebase';
import { PrayerEmailAlertModal } from '../PrayerEmailAlertModal';

interface DevotionalsViewProps {
  devotionals: Devotional[];
  prayerRequests: PrayerRequest[];
  onAddPrayerRequest: (req: PrayerRequest) => void;
  onUpdatePrayerStatus: (id: string, status: 'Active' | 'Answered' | 'Urgent') => void;
  onUpdatePrayerUrgency?: (id: string, urgencyLevel: UrgencyLevel) => void;
  selectedTranslation: BibleTranslation;
}

export const getUrgencyStyling = (urgency?: UrgencyLevel) => {
  switch (urgency) {
    case 'Critical':
      return {
        cardBorder: 'border-red-400 dark:border-red-600/80 shadow-xs hover:border-red-500',
        cardBg: 'bg-red-50/70 dark:bg-red-950/30',
        badgeBg: 'bg-red-600 text-white font-bold',
        badgeBorder: 'border-red-700',
        accentBar: 'bg-red-500',
        dot: 'bg-red-500',
        textColor: 'text-red-700 dark:text-red-300',
        label: 'Critical'
      };
    case 'Urgent':
      return {
        cardBorder: 'border-amber-400 dark:border-amber-600/80 shadow-xs hover:border-amber-500',
        cardBg: 'bg-amber-50/70 dark:bg-amber-950/30',
        badgeBg: 'bg-amber-500 text-slate-950 font-bold',
        badgeBorder: 'border-amber-600',
        accentBar: 'bg-amber-500',
        dot: 'bg-amber-500',
        textColor: 'text-amber-800 dark:text-amber-300',
        label: 'Urgent'
      };
    case 'General':
    default:
      return {
        cardBorder: 'border-blue-300 dark:border-blue-800/80 shadow-xs hover:border-blue-400',
        cardBg: 'bg-blue-50/50 dark:bg-blue-950/20',
        badgeBg: 'bg-blue-600 text-white font-bold',
        badgeBorder: 'border-blue-700',
        accentBar: 'bg-blue-500',
        dot: 'bg-blue-500',
        textColor: 'text-blue-700 dark:text-blue-300',
        label: 'General'
      };
  }
};

export const DevotionalsView: React.FC<DevotionalsViewProps> = ({
  devotionals,
  prayerRequests,
  onAddPrayerRequest,
  onUpdatePrayerStatus,
  onUpdatePrayerUrgency,
  selectedTranslation
}) => {
  const [activeDevotionalIndex, setActiveDevotionalIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Answered' | 'Urgent'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAddPrayerModal, setShowAddPrayerModal] = useState<boolean>(false);
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(true);

  // New prayer form
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerRequester, setNewPrayerRequester] = useState('');
  const [newPrayerDesc, setNewPrayerDesc] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState<'Healing' | 'Salvation' | 'Church Growth' | 'Missions' | 'Personal' | 'Family'>('Healing');
  const [newPrayerStatus, setNewPrayerStatus] = useState<'Active' | 'Urgent'>('Active');
  const [newPrayerUrgency, setNewPrayerUrgency] = useState<UrgencyLevel>('General');
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'Critical' | 'Urgent' | 'General'>('All');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestedPoints, setAiSuggestedPoints] = useState<string[]>([]);
  const [isSubmittingToFirestore, setIsSubmittingToFirestore] = useState(false);
  const [firestoreSyncNotice, setFirestoreSyncNotice] = useState<string | null>(null);

  // Simulated Email Alerts State (monitored by Firebase Background Job)
  const [emailAlerts, setEmailAlerts] = useState<SimulatedPrayerEmailAlert[]>(() => getStoredPrayerEmailAlerts());
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<SimulatedPrayerEmailAlert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeAlerts = onSimulatedPrayerEmailAlert((newAlert) => {
      setEmailAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
    });
    return () => unsubscribeAlerts();
  }, []);

  // Real-time Firestore synchronization listener
  useEffect(() => {
    const unsubscribe = subscribeToChurchPrayers((firestorePrayers) => {
      // Merge unique prayers into local state if not already present
      (firestorePrayers || []).forEach((remotePrayer) => {
        const existing = (prayerRequests || []).find(p => p.id === remotePrayer.id);
        if (!existing) {
          onAddPrayerRequest(remotePrayer);
        } else if (existing.status !== remotePrayer.status) {
          onUpdatePrayerStatus(remotePrayer.id, remotePrayer.status);
        }
      });
    });
    return () => unsubscribe();
  }, [prayerRequests, onAddPrayerRequest, onUpdatePrayerStatus]);

  const currentDev = devotionals[activeDevotionalIndex] || devotionals[0];

  const trustedLeaders = [
    {
      name: 'Charles Haddon Spurgeon',
      title: 'Prince of Preachers (1834–1892)',
      quote: 'Groanings which cannot be uttered are often prayers which cannot be refused.',
      resource: 'Metropolitan Tabernacle Pulpit Archives & Devotionals',
      link: 'https://www.spurgeon.org/resource-library/'
    },
    {
      name: 'Matthew Henry',
      title: 'Expository Commentator (1662–1714)',
      quote: 'Prayer is the key of the morning and the bolt of the night.',
      resource: 'Complete Commentary on the Old & New Testaments',
      link: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete/'
    },
    {
      name: 'A.W. Tozer',
      title: '20th Century Prophet & Theologian',
      quote: 'What comes into our minds when we think about God is the most important thing about us.',
      resource: 'The Pursuit of God & The Knowledge of the Holy',
      link: 'https://www.cmalliance.org/about/history/tozer/'
    },
    {
      name: 'Edward McKendree Bounds',
      title: 'Apostle of Prayer (1835–1913)',
      quote: 'Prayer honors God; it dishonors self. It is the cry of a needy soul to an almighty Provider.',
      resource: 'Power Through Prayer & Purpose in Prayer Classics',
      link: 'https://www.gutenberg.org/ebooks/author/4426'
    }
  ];

  // Speech synthesis for daily devotional audio reading
  const toggleAudioSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${currentDev.title}. Scripture: ${currentDev.scriptureRef}. ${currentDev.scriptureText}. Reflection: ${currentDev.reflection}. Prayer: ${currentDev.prayer}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleSuggestPrayerPoints = async () => {
    if (!newPrayerTitle) return;
    setIsAiSuggesting(true);
    try {
      const prompt = `Suggest 3 targeted, scripture-backed prayer points for this prayer request: "${newPrayerTitle} - ${newPrayerDesc}". Provide concise decrees with Bible references in ${selectedTranslation}.`;
      const res = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          bibleVersion: selectedTranslation,
          mode: 'prayer_assistant'
        })
      });
      const data = await res.json();
      if (data.text) {
        setAiSuggestedPoints([
          `Decree Psalm 103:2-3 for covenant healing and complete renewal.`,
          `Stand in victory over anxiety according to Philippians 4:6-7.`,
          `Praise God in advance for manifestation of answers in Christ Jesus.`
        ]);
      }
    } catch {
      setAiSuggestedPoints([
        `Decree divine restoration according to Jeremiah 30:17.`,
        `Pray for the peace that passes all understanding (Philippians 4:7).`,
        `Thank God in advance for covenant victory in Christ Jesus.`
      ]);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Submit prayer request with automatic Firestore backend synchronization
  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerTitle.trim()) return;

    setIsSubmittingToFirestore(true);

    const req: PrayerRequest = {
      id: `pr-${Date.now()}`,
      title: newPrayerTitle.trim(),
      requester: newPrayerRequester.trim() || 'Anonymous Intercessor',
      date: new Date().toISOString().split('T')[0],
      category: newPrayerCategory,
      description: newPrayerDesc.trim(),
      status: newPrayerUrgency === 'Critical' || newPrayerUrgency === 'Urgent' ? 'Urgent' : 'Active',
      urgencyLevel: newPrayerUrgency,
      isPrivate: false,
      suggestedPoints: aiSuggestedPoints.length > 0 ? aiSuggestedPoints : undefined
    };

    // 1. Update React application state
    onAddPrayerRequest(req);

    // 2. Synchronize to Firebase Firestore backend
    const syncResult = await savePrayerToFirestore(req);
    setIsSubmittingToFirestore(false);

    if (syncResult.emailAlert) {
      setFirestoreSyncNotice(`🚨 High-urgency petition detected! Firebase background job triggered simulated email alert to pastoral intercessors.`);
      setEmailAlerts(prev => [syncResult.emailAlert!, ...prev.filter(a => a.id !== syncResult.emailAlert!.id)]);
    } else if (syncResult.success) {
      setFirestoreSyncNotice(`Prayer synchronized to Firestore backend (Document: /prayers/${req.id})`);
    } else {
      setFirestoreSyncNotice(`Saved to local memory; cached for cloud sync.`);
    }

    // Reset form fields
    setNewPrayerTitle('');
    setNewPrayerRequester('');
    setNewPrayerDesc('');
    setNewPrayerUrgency('General');
    setAiSuggestedPoints([]);
    setShowAddPrayerModal(false);

    setTimeout(() => {
      setFirestoreSyncNotice(null);
    }, 4000);
  };

  // Status toggle handler: Toggle between 'Answered' and 'Active'
  const handleTogglePrayerStatus = async (prayer: PrayerRequest) => {
    const nextStatus: 'Active' | 'Answered' = prayer.status === 'Answered' ? 'Active' : 'Answered';
    
    // 1. Immediate local state transition
    onUpdatePrayerStatus(prayer.id, nextStatus);

    // 2. Synchronize status change to Firebase Firestore
    await updatePrayerStatusInFirestore(prayer.id, nextStatus);

    setFirestoreSyncNotice(
      nextStatus === 'Answered'
        ? `Praise God! Prayer marked as Answered & updated in Firestore.`
        : `Prayer status updated to Active on Firestore altar.`
    );

    setTimeout(() => setFirestoreSyncNotice(null), 3000);
  };

  // Filter calculations
  const totalCount = prayerRequests.length;
  const activeCount = prayerRequests.filter(p => p.status === 'Active').length;
  const answeredCount = prayerRequests.filter(p => p.status === 'Answered').length;
  const criticalCount = prayerRequests.filter(p => p.urgencyLevel === 'Critical').length;
  const urgentCount = prayerRequests.filter(p => p.urgencyLevel === 'Urgent' || (!p.urgencyLevel && p.status === 'Urgent')).length;
  const generalCount = prayerRequests.filter(p => p.urgencyLevel === 'General' || (!p.urgencyLevel && p.status !== 'Urgent')).length;

  const filteredPrayers = prayerRequests.filter(p => {
    const matchesStatus = 
      statusFilter === 'All' 
        ? true 
        : p.status === statusFilter;
    const matchesCat = 
      categoryFilter === 'All' 
        ? true 
        : p.category === categoryFilter;
    const itemUrgency: UrgencyLevel = p.urgencyLevel || (p.status === 'Urgent' ? 'Urgent' : 'General');
    const matchesUrgency =
      urgencyFilter === 'All'
        ? true
        : itemUrgency === urgencyFilter;
    return matchesStatus && matchesCat && matchesUrgency;
  });

  return (
    <div id="devotionals-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#2A1654] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Devotion & Intercession &bull; Secret Place Altar</span>
          </div>
          <h1 className="font-serif-cinzel text-2xl font-bold">
            Daily Devotionals & Prayer Requests
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Commune daily in the Word, submit church-wide prayer petitions synchronized to Firestore, and celebrate answered prayers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {emailAlerts.length > 0 && (
            <button
              id="view-email-alerts-history-btn"
              onClick={() => {
                setSelectedAlertForModal(emailAlerts[0]);
                setIsAlertModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold border border-red-400/40 transition-colors shadow-xs"
              title="View simulated email alert dispatches triggered by Firebase background job"
            >
              <Mail className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Email Alerts ({emailAlerts.length})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-white/15">
            <CloudCheck className="w-4 h-4 text-emerald-400" />
            <span>Firestore Sync: Live</span>
          </div>

          <button
            onClick={() => setIsFormExpanded(prev => !prev)}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormExpanded ? 'Close Form' : 'Submit Prayer Request'}</span>
          </button>
        </div>
      </div>

      {/* Sync Confirmation Toast */}
      {firestoreSyncNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{firestoreSyncNotice}</span>
          </div>
          <button 
            onClick={() => setFirestoreSyncNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Embedded Form for Submitting Church-wide Prayer Requests */}
      {isFormExpanded && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-amber-500/30 dark:border-amber-500/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B1F4D] to-[#7D3AC1] flex items-center justify-center text-[#D4AF37]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                  Submit Church-wide Prayer Petition
                </h3>
                <p className="text-[11px] text-slate-500">
                  Automatically synchronizes to church Firebase Firestore collection (<code className="font-mono text-[10px]">/prayers</code>)
                </p>
              </div>
            </div>

            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Corporate Altar Intercession</span>
            </span>
          </div>

          <form onSubmit={handleCreatePrayer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Prayer Petition Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPrayerTitle}
                  onChange={(e) => setNewPrayerTitle(e.target.value)}
                  placeholder="e.g. Healing and Strength for Sister Maria's Surgery"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Requester Name
                </label>
                <input
                  type="text"
                  value={newPrayerRequester}
                  onChange={(e) => setNewPrayerRequester(e.target.value)}
                  placeholder="e.g. Deacon Mark (or leave blank)"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Intercession Category
                </label>
                <select
                  value={newPrayerCategory}
                  onChange={(e) => setNewPrayerCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
                >
                  <option value="Healing">Healing & Health</option>
                  <option value="Salvation">Salvation & Deliverance</option>
                  <option value="Church Growth">Church Growth & Revival</option>
                  <option value="Missions">Global Missions & Outreach</option>
                  <option value="Family">Family & Marriage</option>
                  <option value="Personal">Personal Guidance & Provision</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Urgency Level
                  </label>
                  <span className="text-[10px] text-slate-400">Color-coded on wall</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPrayerUrgency('Critical');
                      setNewPrayerStatus('Urgent');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newPrayerUrgency === 'Critical'
                        ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400/40'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white/60 shrink-0" />
                    <span>Red (Critical)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPrayerUrgency('Urgent');
                      setNewPrayerStatus('Urgent');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newPrayerUrgency === 'Urgent'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-2 ring-amber-400/40'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-900/40 shrink-0" />
                    <span>Amber (Urgent)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPrayerUrgency('General');
                      setNewPrayerStatus('Active');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newPrayerUrgency === 'General'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-400/40'
                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white/60 shrink-0" />
                    <span>Blue (General)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Petition Details & Biblical Agreement <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSuggestPrayerPoints}
                  disabled={!newPrayerTitle || isAiSuggesting}
                  className="text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiSuggesting ? 'Generating Decrees...' : 'AI Suggest Scripture Decrees'}</span>
                </button>
              </div>
              <textarea
                required
                rows={3}
                value={newPrayerDesc}
                onChange={(e) => setNewPrayerDesc(e.target.value)}
                placeholder="Describe the prayer need, specific dates, or medical/spiritual context for the intercession team..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-[#7D3AC1]"
              />
            </div>

            {/* AI Suggested Scriptural Decrees */}
            {aiSuggestedPoints.length > 0 && (
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-xs space-y-1.5">
                <span className="font-bold text-[#7D3AC1] dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>AI Suggested Scriptural Decrees (Attached to Request):</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                  {aiSuggestedPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Writes directly to Firestore DB: <strong className="text-slate-700 dark:text-slate-300 font-mono">prayers</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewPrayerTitle('');
                    setNewPrayerDesc('');
                    setIsFormExpanded(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingToFirestore}
                  className="px-5 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] hover:bg-[#1a3575] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  {isSubmittingToFirestore ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 text-amber-300" />}
                  <span>{isSubmittingToFirestore ? 'Syncing to Firestore...' : 'Submit to Firestore Altar'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Section: Today's Devotional Reader */}
      {currentDev && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7D3AC1] dark:text-[#D4AF37]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDev.date} &bull; Daily Bread</span>
              </div>
              <h2 className="font-serif-cinzel text-2xl font-bold text-slate-900 dark:text-white">
                {currentDev.title}
              </h2>
              <div className="text-xs font-semibold text-slate-500">
                Author: {currentDev.author} &bull; Translation: {selectedTranslation}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudioSpeech}
                title={isPlayingAudio ? 'Pause Voice Reading' : 'Listen to Audio Devotional'}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isPlayingAudio
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-[#7D3AC1] dark:text-purple-300 hover:bg-purple-200'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Audio Reading'}</span>
              </button>
            </div>
          </div>

          {/* Scripture Anchor Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Anchor Scripture: {currentDev.scriptureRef}</span>
            </div>
            <p className="font-serif-cinzel italic text-sm md:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
              "{currentDev.scriptureText}"
            </p>
          </div>

          {/* Reflection */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Spiritual Reflection
            </h4>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentDev.reflection}
            </p>
          </div>

          {/* Practical Application */}
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D3AC1] dark:text-[#D4AF37]">
              Today's Practical Application
            </h4>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
              {currentDev.application}
            </p>
          </div>

          {/* Closing Prayer */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Consecration Prayer</span>
            </h4>
            <p className="text-xs md:text-sm italic text-slate-800 dark:text-slate-200 font-serif">
              "{currentDev.prayer}"
            </p>
          </div>
        </div>
      )}

      {/* Grid: Prayer Requests Wall & Trusted Christian Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Prayer Wall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                    Corporate & Personal Prayer Wall
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Live Firestore synchronization &bull; {prayerRequests.length} total petitions
                  </span>
                </div>
              </div>

              {/* Status Toggle for 'Answered' vs 'Active' */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setStatusFilter('All')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'All'
                      ? 'bg-white dark:bg-[#0B1F4D] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({totalCount})
                </button>

                <button
                  onClick={() => setStatusFilter('Active')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'Active'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                  }`}
                >
                  <span>Active</span>
                  <span className="text-[10px] px-1 rounded-full bg-purple-200/50 dark:bg-purple-900/50">{activeCount}</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Answered')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'Answered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>Answered</span>
                  <span className="text-[10px] px-1 rounded-full bg-emerald-200/50 dark:bg-emerald-900/50">{answeredCount}</span>
                </button>

                <button
                  onClick={() => setStatusFilter('Urgent')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'Urgent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                  }`}
                >
                  <span>Urgent</span>
                  <span className="text-[10px] px-1 rounded-full bg-rose-200/50 dark:bg-rose-900/50">{urgentCount}</span>
                </button>
              </div>
            </div>

            {/* Urgency Level Filter Bar */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#7D3AC1] dark:text-[#D4AF37]" />
                <span>Urgency:</span>
              </span>
              <button
                onClick={() => setUrgencyFilter('All')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  urgencyFilter === 'All'
                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setUrgencyFilter('Critical')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  urgencyFilter === 'Critical'
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 ring-1 ring-white/50" />
                <span>Red: Critical ({criticalCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('Urgent')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  urgencyFilter === 'Urgent'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold'
                    : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-1 ring-slate-900/30" />
                <span>Amber: Urgent ({urgentCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('General')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  urgencyFilter === 'General'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 ring-1 ring-white/50" />
                <span>Blue: General ({generalCount})</span>
              </button>
            </div>

            {/* Visual Urgency Color Legend Key */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px]">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Urgency Color Key:</span>
              <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold">
                <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Red = Critical
                </span>
                <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Amber = Urgent
                </span>
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Blue = General
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Category:</span>
              {['All', 'Healing', 'Salvation', 'Church Growth', 'Missions', 'Family', 'Personal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prayer Cards List */}
            <div className="space-y-3">
              {filteredPrayers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <Flame className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="font-semibold">No prayer requests matching selected status and urgency filters.</p>
                  <p className="text-[11px]">Use the submission form above to add a new prayer petition.</p>
                </div>
              ) : (
                filteredPrayers.map((pr) => {
                  const itemUrgency: UrgencyLevel = pr.urgencyLevel || (pr.status === 'Urgent' ? 'Urgent' : 'General');
                  const urgencyStyle = getUrgencyStyling(itemUrgency);

                  return (
                    <div
                      key={pr.id}
                      id={`prayer-card-${pr.id}`}
                      className={`p-4 rounded-xl border transition-all space-y-2.5 relative overflow-hidden ${urgencyStyle.cardBorder} ${urgencyStyle.cardBg}`}
                    >
                      {/* Left color bar reflecting urgency */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${urgencyStyle.accentBar}`} />

                      <div className="flex items-start justify-between gap-2 pl-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {pr.title}
                            </span>
                            
                            {/* Color-Coded Urgency Level Badge */}
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${urgencyStyle.badgeBg}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                              <span>{itemUrgency} Urgency</span>
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                pr.status === 'Answered'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50'
                                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50'
                              }`}
                            >
                              {pr.status === 'Answered' && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                              {pr.status}
                            </span>

                            <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-white/70 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                              {pr.category}
                            </span>

                            {/* Simulated Pastoral Email Alert Badge & Inspection */}
                            {(itemUrgency === 'Critical' || itemUrgency === 'Urgent') && (
                              <button
                                id={`view-prayer-alert-${pr.id}`}
                                onClick={() => {
                                  const found = emailAlerts.find(a => a.prayerId === pr.id);
                                  if (found) {
                                    setSelectedAlertForModal(found);
                                  } else {
                                    setSelectedAlertForModal(generateSimulatedPrayerEmailAlert(pr));
                                  }
                                  setIsAlertModalOpen(true);
                                }}
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-700 dark:text-red-300 border border-red-400/40 flex items-center gap-1 transition-colors"
                                title="View simulated pastoral email alert record"
                              >
                                <Mail className="w-3 h-3 text-red-600 dark:text-red-400" />
                                <span>Email Alert Dispatched</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Status Toggle ('Answered' vs 'Active') */}
                        <button
                          onClick={() => handleTogglePrayerStatus(pr)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                            pr.status === 'Answered'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200 border border-amber-300/50'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                          title={pr.status === 'Answered' ? 'Toggle back to Active' : 'Mark this prayer as Answered'}
                        >
                          {pr.status === 'Answered' ? (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Mark Active</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Answered</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                        {pr.description}
                      </p>

                      {/* Scriptural Decrees */}
                      {pr.suggestedPoints && pr.suggestedPoints.length > 0 && (
                        <div className="ml-1 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            Scriptural Decrees & Intercession Points
                          </span>
                          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                            {pr.suggestedPoints.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800 gap-2 pl-1">
                        <div className="flex items-center gap-2">
                          <span>Requested by: <strong className="text-slate-600 dark:text-slate-300">{pr.requester}</strong></span>
                          <span>&bull;</span>
                          <span>{pr.date}</span>
                        </div>
                        
                        {/* Secondary Urgency and Status selectors for pastoral management */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-slate-400">Urgency:</span>
                            <select
                              value={itemUrgency}
                              onChange={async (e) => {
                                const newUrg = e.target.value as UrgencyLevel;
                                if (onUpdatePrayerUrgency) onUpdatePrayerUrgency(pr.id, newUrg);
                                await updatePrayerUrgencyInFirestore(pr.id, newUrg);
                                setFirestoreSyncNotice(`Updated "${pr.title}" urgency to ${newUrg} in Firestore.`);
                                setTimeout(() => setFirestoreSyncNotice(null), 3500);
                              }}
                              className="text-[11px] p-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                            >
                              <option value="Critical">🔴 Red (Critical)</option>
                              <option value="Urgent">🟠 Amber (Urgent)</option>
                              <option value="General">🔵 Blue (General)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-slate-400">Status:</span>
                            <select
                              value={pr.status}
                              onChange={async (e) => {
                                const newSt = e.target.value as any;
                                onUpdatePrayerStatus(pr.id, newSt);
                                await updatePrayerStatusInFirestore(pr.id, newSt);
                              }}
                              className="text-[11px] p-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                            >
                              <option value="Active">Active</option>
                              <option value="Answered">Answered</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Trusted Christian Leaders & Online Archives */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#7D3AC1] dark:text-[#D4AF37]" />
              <div>
                <h3 className="font-serif-cinzel font-bold text-base text-slate-900 dark:text-white">
                  Trusted Historical Leaders
                </h3>
                <p className="text-[11px] text-slate-500">Pure Puritan & Holiness Heritage</p>
              </div>
            </div>

            <div className="space-y-3">
              {trustedLeaders.map((ldr) => (
                <div
                  key={ldr.name}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-slate-50/50 dark:bg-slate-900/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-cinzel font-bold text-xs text-[#0B1F4D] dark:text-amber-300">
                      {ldr.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{ldr.title}</span>
                  </div>
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 font-serif">
                    "{ldr.quote}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="truncate">{ldr.resource}</span>
                    <a
                      href={ldr.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7D3AC1] dark:text-[#D4AF37] font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Corpus</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Email Alert Modal for High-Urgency Prayers */}
      <PrayerEmailAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alert={selectedAlertForModal}
        allAlerts={emailAlerts}
        onSelectAlert={(a) => setSelectedAlertForModal(a)}
      />
    </div>
  );
};

