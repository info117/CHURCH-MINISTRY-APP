import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote
} from 'lucide-react';
import { BibleTranslation } from '../types';

interface DailyScriptureReflectionWidgetProps {
  selectedTranslation: BibleTranslation;
  onNavigateToSermons?: (scriptureRef: string, theme: string) => void;
}

interface ScriptureItem {
  reference: string;
  theme: string;
  texts: Record<BibleTranslation, string>;
  defaultReflections: Record<BibleTranslation, string>;
  prayer: string;
}

const DAILY_SCRIPTURES: ScriptureItem[] = [
  {
    reference: '1 Peter 1:15-16',
    theme: 'Holiness & Divine Calling',
    texts: {
      KJV: 'But as he which hath called you is holy, so be ye holy in all manner of conversation; Because it is written, Be ye holy; for I am holy.',
      NASB: 'but like the Holy One who called you, be holy yourselves also in all your behavior; because it is written: "YOU SHALL BE HOLY, FOR I AM HOLY."',
      NIV: 'But just as he who called you is holy, so be holy in all you do; for it is written: "Be holy, because I am holy."',
      NLT: 'But now you must be holy in everything you do, just as God who chose you is holy. For the Scriptures say, "You must be holy because I am holy."'
    },
    defaultReflections: {
      KJV: 'True biblical holiness is not outward asceticism, but an inward consecration that permeates all conversation, work, and worship. As the Lord sanctifies our inner heart, our daily walk becomes an epistle of Christ.',
      NASB: 'God does not merely suggest righteousness—He summons us into distinctiveness. Our entire pattern of conduct must mirror the moral beauty and purity of our Heavenly Father.',
      NIV: 'Holiness is not about rigid moralism; it is about active transformation in every arena of life. Living holy means walking in constant alignment with God’s gracious character.',
      NLT: 'God has called each of us out of darkness to reflect His marvelous light. Every decision, word, and relationship today is an altar where we can honor His holy name.'
    },
    prayer: 'Lord, purify my thoughts, speech, and deeds today. May my life be a living sacrifice consecrated wholly unto Your glory. Amen.'
  },
  {
    reference: 'Romans 8:28',
    theme: 'Sovereignty & Divine Providence',
    texts: {
      KJV: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      NASB: 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.',
      NIV: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      NLT: 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.'
    },
    defaultReflections: {
      KJV: 'No trial or valley is wasted in the master weaver’s hands. God orchestrates even our delays and tribulations to birth eternal character and manifest His redemptive mercy.',
      NASB: 'Divine providence guarantees that earthly disruptions never annul divine destiny. What seems fragmented to our eyes is sovereignly synthesized for our spiritual maturity.',
      NIV: 'God is actively redeeming every circumstance in our lives. Even in unexpected delays, His gracious purpose is shaping you into the likeness of Christ.',
      NLT: 'Rest assured today that God has not lost control. He weaves both triumphs and challenges into a masterpiece of spiritual fruit and peace.'
    },
    prayer: 'Heavenly Father, I surrender my anxieties into Your sovereign hands, trusting that every detail of today works for my eternal good. Amen.'
  },
  {
    reference: 'Philippians 4:6-7',
    theme: 'Supernatural Peace in Prayer',
    texts: {
      KJV: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
      NASB: 'Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus.',
      NIV: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      NLT: 'Don’t worry about anything; instead, pray about everything. Tell God what you need, and thank him for all he has done. Then you will experience God’s peace, which exceeds anything we can understand. His peace will guard your hearts and minds as you live in Christ Jesus.'
    },
    defaultReflections: {
      KJV: 'The antidote to anxious fretfulness is earnest petition cloaked in grateful thanksgiving. God’s peace stands as an impregnable garrison shielding your spirit today.',
      NASB: 'Thanksgiving changes the atmosphere of our petitions. When we recount God’s prior faithfulness, divine tranquility takes custody of our emotions and thoughts.',
      NIV: 'Worry paralyzes, but prayer mobilizes heaven. Trade your burdens for God’s transcendent peace, knowing He hears your faintest cry.',
      NLT: 'Instead of carrying tomorrow’s worries, give them to God in prayer right now. His perfect calm will stand guard over your mind all day.'
    },
    prayer: 'Jesus, Prince of Peace, I release all anxiety and thank You for Your endless mercies. Fill my mind with stillness that defies human comprehension. Amen.'
  },
  {
    reference: 'Isaiah 40:31',
    theme: 'Spiritual Renewal & Strength',
    texts: {
      KJV: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
      NASB: 'Yet those who wait for the Lord will gain new strength; they will mount up with wings like eagles, they will run and not get tired, they will walk and not become weary.',
      NIV: 'but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      NLT: 'But those who trust in the Lord will find new strength. They will soar high on wings like eagles. They will run and not grow weary. They will walk and not faint.'
    },
    defaultReflections: {
      KJV: 'Waiting on the Lord is not idle passivity, but expectant posture in prayer. God exchanges our finite human frailty for His inexhaustible, heavenly vigor.',
      NASB: 'When human reserves run dry, divine replenishment begins. Look upward today; the eagle ascends not by flapping in panic, but by catching the currents of God’s Spirit.',
      NIV: 'Renewal comes when we pause in God’s presence. He empowers the weary and grants steady endurance for both the sprints and the marathon of ministry.',
      NLT: 'Do not rely on your own strength today. Lean into God’s limitless power; He will lift you above fatigue and grant supernatural resilience.'
    },
    prayer: 'Almighty God, renew my soul today. Let Your Holy Spirit lift me above worldly weariness so I may walk faithfully without fainting. Amen.'
  },
  {
    reference: 'Psalm 23:1-3',
    theme: 'The Shepherd’s Care & Restoration',
    texts: {
      KJV: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
      NASB: 'The Lord is my shepherd, I shall not want. He makes me lie down in green pastures; He leads me beside quiet waters. He restores my soul; He guides me in the paths of righteousness for His name\'s sake.',
      NIV: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name’s sake.',
      NLT: 'The Lord is my shepherd; I have all that I need. He lets me rest in green meadows; he leads me beside peaceful streams. He renews my strength. He guides me along right paths, bringing honor to his name.'
    },
    defaultReflections: {
      KJV: 'Because Jehovah is our Shepherd, spiritual deficit is impossible. He tenderly guides our steps past turbulent torrents to resting places of divine abundance.',
      NASB: 'Soul restoration happens under the Shepherd’s watch. Allow Him to direct your itinerary today, confident that every pasture He chooses is fertile with grace.',
      NIV: 'In a noisy and hurried world, the Good Shepherd invites you into quiet waters. Rest in His provision, knowing He lovingly watches over your soul.',
      NLT: 'You lack nothing essential because Jesus is caring for you. Let Him guide your steps today into peace, righteousness, and restored joy.'
    },
    prayer: 'Good Shepherd, lead me today beside Your peaceful waters. Restore my soul and keep my feet upon paths of righteousness. Amen.'
  }
];

export const DailyScriptureReflectionWidget: React.FC<DailyScriptureReflectionWidgetProps> = ({
  selectedTranslation,
  onNavigateToSermons
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiReflection, setAiReflection] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scripture = DAILY_SCRIPTURES[currentIndex];
  const verseText = scripture.texts[selectedTranslation] || scripture.texts['KJV'];
  const defaultReflection = scripture.defaultReflections[selectedTranslation] || scripture.defaultReflections['KJV'];

  // Keep reflection updated when scripture changes
  useEffect(() => {
    setAiReflection(defaultReflection);
  }, [currentIndex, selectedTranslation, defaultReflection]);

  const handleNextScripture = () => {
    setCurrentIndex((prev) => (prev + 1) % DAILY_SCRIPTURES.length);
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePrevScripture = () => {
    setCurrentIndex((prev) => (prev - 1 + DAILY_SCRIPTURES.length) % DAILY_SCRIPTURES.length);
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const handleGenerateAiReflection = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/companion/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are the Pastoral Theological Companion for a church congregation.
Scripture: ${scripture.reference}
Translation: ${selectedTranslation}
Verse Text: "${verseText}"
Theme: ${scripture.theme}

Provide:
1. A short, spiritually rich devotional reflection (2-3 concise sentences maximum). Focus on how this applies to modern daily discipleship and holiness.
2. A single concise sentence prayer or action takeaway.
Keep the tone pastoral, dignified, encouraging, and theologically orthodox.`,
          bibleVersion: selectedTranslation
        })
      });

      const data = await response.json();
      if (data.text) {
        setAiReflection(data.text);
      }
    } catch {
      // Graceful fallback to default curated reflection
      setAiReflection(defaultReflection);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = `*${scripture.reference} (${selectedTranslation})*\n"${verseText}"\n\n*Devotional Reflection:*\n${aiReflection}\n\n*Daily Prayer:*\n${scripture.prayer}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const readOut = `${scripture.reference}, in the ${selectedTranslation} translation. ${verseText}. Reflection: ${aiReflection}. Prayer: ${scripture.prayer}`;
    const cleanText = readOut.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div 
      id="daily-scripture-reflection-widget"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-white dark:to-[#071430] border border-amber-500/30 dark:border-amber-500/20 shadow-sm transition-all"
    >
      {/* Top Header Bar */}
      <div className="p-4 md:p-5 border-b border-amber-500/20 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-amber-500/5 dark:bg-amber-950/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] text-[#D4AF37] flex items-center justify-center font-bold shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7D3AC1] dark:text-[#D4AF37]">
                Daily Scripture & Reflection
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#0B1F4D] dark:text-amber-300 border border-[#D4AF37]/30">
                {selectedTranslation}
              </span>
            </div>
            <h3 className="font-serif-cinzel text-base md:text-lg font-bold text-slate-900 dark:text-white">
              {scripture.reference} &bull; <span className="font-sans font-normal text-xs text-slate-500 dark:text-slate-400">{scripture.theme}</span>
            </h3>
          </div>
        </div>

        {/* Carousel & Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevScripture}
            title="Previous Scripture"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
            {currentIndex + 1}/{DAILY_SCRIPTURES.length}
          </span>
          <button
            onClick={handleNextScripture}
            title="Next Scripture"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Read Out Loud */}
          <button
            onClick={handleToggleSpeech}
            title={isSpeaking ? 'Stop Audio' : 'Listen to Scripture & Devotional'}
            className={`p-1.5 rounded-lg border transition-all ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1]'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            title="Copy Devotional"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Refresh AI Reflection */}
          <button
            onClick={handleGenerateAiReflection}
            disabled={isGenerating}
            title="Generate AI Theological Reflection"
            className="px-2.5 py-1.5 rounded-lg bg-[#0B1F4D] hover:bg-slate-900 text-[#D4AF37] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGenerating ? 'Reflecting...' : 'AI Reflect'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Scripture Quote */}
        <div className="relative pl-6 pr-4 py-1 border-l-3 border-[#D4AF37] dark:border-[#D4AF37]">
          <Quote className="w-6 h-6 text-[#D4AF37]/30 absolute -left-2 -top-2 rotate-180 pointer-events-none" />
          <p className="font-serif-cinzel text-base md:text-xl font-bold leading-relaxed text-slate-900 dark:text-slate-50 italic">
            "{verseText}"
          </p>
          <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{scripture.reference} &bull; {selectedTranslation} Translation</span>
          </div>
        </div>

        {/* AI-Generated Devotional Reflection Box */}
        <div className="rounded-xl p-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 text-[#7D3AC1] dark:text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              Devotional Reflection
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Adapted for {selectedTranslation} Text
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {aiReflection}
          </p>
        </div>

        {/* Daily Prayer & Sermon Bridge Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-start sm:items-center gap-2">
            <span className="font-bold text-[#0B1F4D] dark:text-amber-400 shrink-0">Daily Prayer:</span>
            <span className="italic text-slate-700 dark:text-slate-300">{scripture.prayer}</span>
          </div>

          {onNavigateToSermons && (
            <button
              onClick={() => onNavigateToSermons(scripture.reference, scripture.theme)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
            >
              <span>Build Sermon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
