import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Compass,
  Volume2,
  VolumeX,
  Trash2,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ThinkBibleMessage, BibleTranslation } from '../types';

interface ThinkBibleAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onStartTour: () => void;
  onNavigateToTool: (toolId: string) => void;
  activeToolId: string;
  selectedTranslation: BibleTranslation;
}

const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header 3 or 2
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="font-serif-cinzel font-bold text-sm text-[#0B1F4D] dark:text-[#D4AF37] pt-2 pb-0.5 border-b border-slate-200/50 dark:border-slate-800"
            >
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="font-serif-cinzel font-bold text-base text-[#0B1F4D] dark:text-[#D4AF37] pt-2"
            >
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#7D3AC1] dark:text-[#D4AF37] mt-1 shrink-0 font-bold">&bull;</span>
              <span className="flex-1">{formatInline(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#7D3AC1] dark:text-[#D4AF37] font-bold text-xs shrink-0">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        // Normal paragraph
        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
};

function formatInline(text: string): React.ReactNode {
  // Replace bold **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Replace `code`
    const subParts = part.split(/(`.*?`)/g);
    return subParts.map((sub, sIdx) => {
      if (sub.startsWith('`') && sub.endsWith('`')) {
        return (
          <code
            key={sIdx}
            className="px-1 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[#7D3AC1] dark:text-[#D4AF37] font-mono text-[11px]"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      return sub;
    });
  });
}

const DEFAULT_WELCOME_MESSAGE: ThinkBibleMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `### Welcome! I am **ThinkBible**

I am your AI Ministry Assistant and Guide for **CHURCH MINISTRY APP**. 

I can explain all features of the application, assist with expository sermon outlines, explain our Computer Vision seating analysis, guide your prayer wall & Firestore sync, and help manage church logistics.

What would you like to explore or accomplish today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedActions: [
    { label: 'Start Interactive App Tour', action: 'start-tour' },
    { label: 'Subscriptions & Plans ($19.99/mo)', toolId: 'billing' },
    { label: 'Explain Computer Vision', toolId: 'computervision' },
    { label: 'Expository Sermon Builder', toolId: 'sermons' },
    { label: 'Real-time Prayer Wall', toolId: 'devotionals' }
  ]
};

const SUGGESTED_PROMPT_CHIPS = [
  'What are the subscription plans and pricing?',
  'How does Computer Vision seating work?',
  'How to build an expository sermon?',
  'Explain the A2A Judge Lab',
  'How do prayer requests sync to Firestore?',
  'Give me an overview of all features'
];

export const ThinkBibleAssistant: React.FC<ThinkBibleAssistantProps> = ({
  isOpen,
  onClose,
  onOpen,
  onStartTour,
  onNavigateToTool,
  activeToolId,
  selectedTranslation
}) => {
  const [messages, setMessages] = useState<ThinkBibleMessage[]>(() => {
    const saved = localStorage.getItem('thinkbible_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore parse error
      }
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('thinkbible_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    const userMessage: ThinkBibleMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/thinkbible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          activeToolId,
          bibleVersion: selectedTranslation,
          history: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.success && data.text) {
        const assistantMessage: ThinkBibleMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.suggestedActions || []
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch {
      // Offline / graceful error recovery
      const assistantMessage: ThinkBibleMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `I am currently operating in offline-resilient mode. Here is a quick guide:\n\n**CHURCH MINISTRY APP** integrates **Computer Vision** (attendance & OCR), **Expository Sermons**, **Firestore Prayer Wall**, **Equipment Bookings**, and **Logos Greek/Hebrew Corpus**.\n\nYou can also launch the interactive tour anytime to step through each module.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Start Interactive App Tour', action: 'start-tour' },
          { label: 'Open Ministry Dashboard', toolId: 'dashboard' }
        ]
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(null);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    localStorage.removeItem('thinkbible_chat_history');
  };

  const handleSpeakText = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleActionClick = (action: { label: string; toolId?: string; action?: string }) => {
    if (action.action === 'start-tour' || action.toolId === 'tour') {
      onStartTour();
      // Optional: keep assistant open or minimize
    } else if (action.toolId) {
      onNavigateToTool(action.toolId);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          id="thinkbible-floating-trigger"
          type="button"
          onClick={onOpen}
          aria-label="Open ThinkBible AI Assistant"
          title="Open ThinkBible AI Assistant (Explains all features & scriptures)"
          className="fixed bottom-5 right-5 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#0B1F4D] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-[#D4AF37]/40"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif-cinzel font-bold text-xs tracking-wider leading-none">
              ThinkBible
            </span>
            <span className="text-[10px] text-amber-200/90 font-medium leading-tight">
              AI App Guide
            </span>
          </div>
        </button>
      )}

      {/* Slide-over Assistant Drawer / Modal */}
      {isOpen && (
        <div
          id="thinkbible-assistant-panel"
          className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-900/80 rounded-2xl overflow-hidden ${
            isMaximized
              ? 'inset-3 sm:inset-6 max-w-4xl mx-auto'
              : 'bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1F4D] via-[#7D3AC1] to-[#D4AF37]" />

          {/* Panel Header */}
          <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#0B1F4D] to-[#7D3AC1] text-white shadow-xs shrink-0">
                <Bot className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-cinzel font-bold text-sm text-slate-900 dark:text-white truncate">
                    ThinkBible
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Guides all features & theology ({selectedTranslation})
                </p>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onStartTour}
                title="Start Guided App Tour"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Compass className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? 'Restore Size' : 'Maximize'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close ThinkBible"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-1.5 bg-[#7D3AC1]/5 dark:bg-[#D4AF37]/5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Active Tool: <strong className="text-slate-700 dark:text-slate-300 capitalize">{activeToolId}</strong>
            </span>
            <button
              type="button"
              onClick={onStartTour}
              className="text-[#7D3AC1] dark:text-[#D4AF37] font-semibold flex items-center gap-1 hover:underline"
            >
              <Compass className="w-3 h-3" />
              <span>Launch App Tour</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B1F4D] to-[#7D3AC1] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-100/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div>
                    {renderFormattedContent(msg.content)}
                  </div>

                  {/* Action Shortcuts Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          {act.action === 'start-tour' ? (
                            <Compass className="w-3 h-3 text-[#7D3AC1] dark:text-[#D4AF37]" />
                          ) : (
                            <ExternalLink className="w-3 h-3 text-[#7D3AC1] dark:text-[#D4AF37]" />
                          )}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer: Timestamp and Read-Aloud */}
                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.id, msg.content)}
                        title={isSpeaking === msg.id ? 'Stop Reading' : 'Listen Aloud'}
                        className="hover:opacity-100 p-0.5 rounded transition-opacity"
                      >
                        {isSpeaking === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center text-slate-500 dark:text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B1F4D] to-[#7D3AC1] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                  <span>ThinkBible is preparing pastoral insights...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/60 overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {SUGGESTED_PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#7D3AC1] dark:hover:border-[#D4AF37] hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-all disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white dark:bg-[#071430] border-t border-slate-200/80 dark:border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask ThinkBible about any app feature or scripture..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7D3AC1]/40 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                aria-label="Send message to ThinkBible"
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#0B1F4D] to-[#7D3AC1] text-white hover:opacity-95 disabled:opacity-40 shadow-xs transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
