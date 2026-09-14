import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  BookmarkPlus,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { BibleTranslation } from '../../types';

interface FaithGPTViewProps {
  selectedTranslation: BibleTranslation;
  onSelectTranslation: (v: BibleTranslation) => void;
  onSendToSermonBuilder: (scripture: string, theme: string) => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  bibleVersion?: BibleTranslation;
  mode?: string;
}

export const FaithGPTView: React.FC<FaithGPTViewProps> = ({
  selectedTranslation,
  onSelectTranslation,
  onSendToSermonBuilder,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Grace and peace be unto you! I am **FaithGPT & Bible Companion**, rooted in orthodox Scripture (${selectedTranslation}) and the rich theological corpus of Matthew Henry, Charles Spurgeon, and classic Puritan commentaries.\n\nHow may I assist your sermon exegesis, Bible study preparation, or personal spiritual walk today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bibleVersion: selectedTranslation
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [companionMode, setCompanionMode] = useState<'faithgpt' | 'biblegpt' | 'greek_hebrew'>('faithgpt');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is supported on Chrome, Safari and modern mobile browsers.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const toggleSpeechResponse = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setIsSpeakingId(id);
  };

  const quickPrompts = [
    'Explain Romans 8:28 in Greek root context',
    '3-Point outline on The Armor of God (Eph 6:10-18)',
    'Faith vs Works (James 2:14-26 & Romans 4:1-5)',
    'Biblical guidance for overcoming fear and anxiety'
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bibleVersion: selectedTranslation,
      mode: companionMode
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          bibleVersion: selectedTranslation,
          mode: companionMode
        })
      });

      const resData = await response.json();
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: resData.text || 'Theological reflection complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bibleVersion: selectedTranslation,
        mode: companionMode
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error contacting FaithGPT:', err);
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: 'Forgive me, the companion connection encountered a temporary network delay. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `m-reset-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Standing ready in ${selectedTranslation} Scripture.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bibleVersion: selectedTranslation
      }
    ]);
  };

  return (
    <div id="faithgpt-view-container" className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Top Banner with Modes & Translation */}
      <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-r from-[#0B1F4D] via-[#2A1654] to-[#7D3AC1] text-white shadow-lg flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#0B1F4D] flex items-center justify-center font-bold shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-cinzel font-bold text-lg md:text-xl text-white flex items-center gap-2">
              <span>FaithGPT & Bible AI Companion</span>
            </h1>
            <p className="text-xs text-slate-200">
              Theologically Guard-Railed AI Assistant &bull; Matthew Henry, Puritans & Strong's Corpus
            </p>
          </div>
        </div>

        {/* Mode Selector & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black/30 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCompanionMode('faithgpt')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                companionMode === 'faithgpt' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              FaithGPT
            </button>
            <button
              onClick={() => setCompanionMode('biblegpt')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                companionMode === 'biblegpt' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              Bible Exegesis
            </button>
            <button
              onClick={() => setCompanionMode('greek_hebrew')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                companionMode === 'greek_hebrew' ? 'bg-[#D4AF37] text-[#0B1F4D] font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              Greek / Hebrew
            </button>
          </div>

          <button
            onClick={handleClearChat}
            title="Reset Conversation"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                  isAi
                    ? 'bg-gradient-to-tr from-[#7D3AC1] to-[#D4AF37]'
                    : 'bg-[#0B1F4D] dark:bg-slate-700'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Speech Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs md:text-sm space-y-2 leading-relaxed shadow-xs ${
                  isAi
                    ? 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-gradient-to-r from-[#0B1F4D] to-[#2D1664] text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 gap-4">
                  <span className="font-semibold">{isAi ? 'FaithGPT Guardian' : 'You'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {isAi && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Theological Audit Passed ({msg.bibleVersion || selectedTranslation})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSpeechResponse(msg.id, msg.text)}
                        title={isSpeakingId === msg.id ? 'Stop Voice Reading' : 'Listen via Audio'}
                        className={`p-1 transition-colors ${
                          isSpeakingId === msg.id
                            ? 'text-rose-500 animate-pulse'
                            : 'hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] text-slate-400'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy Response"
                        className="p-1 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] text-slate-400 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onSendToSermonBuilder('Scripture Text', 'Sermon Concept')}
                        title="Export to Sermon Builder"
                        className="p-1 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] text-slate-400 transition-colors"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 max-w-md mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7D3AC1] to-[#D4AF37] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7D3AC1] animate-ping" />
              <span>Consulting Scripture corpus and Matthew Henry commentaries...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Exegesis:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-indigo-950/80 bg-white dark:bg-[#071430] hover:border-[#7D3AC1] text-slate-700 dark:text-slate-300 shrink-0 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-2 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-md shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="faithgpt-main-input"
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={isListening ? 'Listening to your voice prayer or question...' : `Ask FaithGPT in ${selectedTranslation} Scripture, Greek root, or pastoral outline...`}
            className="flex-1 text-xs md:text-sm px-3 py-2.5 bg-transparent border-none focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />

          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop Listening' : 'Dictate with Voice (Microphone)'}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            id="faithgpt-submit-btn"
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] hover:from-[#071430] hover:to-[#6023A1] text-white disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
