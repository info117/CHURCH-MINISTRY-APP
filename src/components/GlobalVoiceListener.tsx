import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Compass, 
  Radio,
  Sparkles
} from 'lucide-react';

interface GlobalVoiceListenerProps {
  activeToolId: string;
  onNavigateTo: (toolId: string) => void;
  isCompactButton?: boolean;
}

interface CommandMatch {
  toolId: string;
  name: string;
  patterns: RegExp[];
}

const VOICE_COMMANDS: CommandMatch[] = [
  {
    toolId: 'dashboard',
    name: 'Dashboard & Sanctuary Overview',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*dashboard/i,
      /(?:go|take me)?\s*home/i,
      /(?:open|show)?\s*overview/i
    ]
  },
  {
    toolId: 'sermons',
    name: 'Sermons & Bible Study',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*sermons?/i,
      /(?:open|navigate to|go to)?\s*sermon builder/i,
      /(?:open|navigate to|go to)?\s*bible stud(?:y|ies)/i,
      /(?:open|navigate to|go to)?\s*scripture research/i
    ]
  },
  {
    toolId: 'calendar',
    name: 'Schedules & Calendar',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*calendar/i,
      /(?:open|navigate to|go to|show)?\s*schedules?/i,
      /(?:open|navigate to|go to)?\s*weekly schedule/i,
      /(?:open|navigate to|go to)?\s*service timings?/i
    ]
  },
  {
    toolId: 'congregation',
    name: 'Congregation Profiles & Census',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*congregation/i,
      /(?:open|navigate to|go to|show)?\s*members?/i,
      /(?:open|navigate to|go to)?\s*pastoral directory/i,
      /(?:open|navigate to|go to)?\s*member directory/i,
      /(?:open|navigate to|go to)?\s*growth trend/i
    ]
  },
  {
    toolId: 'devotionals',
    name: 'Devotionals & Prayers',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*devotionals?/i,
      /(?:open|navigate to|go to|show)?\s*prayers?/i,
      /(?:open|navigate to|go to)?\s*prayer wall/i,
      /(?:open|navigate to|go to)?\s*daily bread/i
    ]
  },
  {
    toolId: 'computervision',
    name: 'Computer Vision Lab',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*computer vision/i,
      /(?:open|navigate to|go to)?\s*vision lab/i,
      /(?:scan|read|analyze)?\s*flyer/i,
      /(?:scan|read|analyze)?\s*bulletin/i,
      /(?:open|navigate to)?\s*ocr/i
    ]
  },
  {
    toolId: 'faithgpt',
    name: 'FaithGPT / Bible Companion',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*faith\s*gpt/i,
      /(?:open|navigate to|go to|show)?\s*bible\s*gpt/i,
      /(?:talk to|ask|open)?\s*(?:the\s*)?bible ai/i,
      /(?:open|navigate to)?\s*ai companion/i
    ]
  },
  {
    toolId: 'operations',
    name: 'Church Operations & Crusades',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*operations?/i,
      /(?:open|navigate to|go to|show)?\s*crusades?/i,
      /(?:open|navigate to|go to|show)?\s*missions?/i,
      /(?:open|navigate to|go to)?\s*evangelism/i
    ]
  },
  {
    toolId: 'maps',
    name: 'Google Maps & Outreach',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*(?:google\s*)?maps?/i,
      /(?:open|navigate to|go to|show)?\s*outreach/i,
      /(?:open|navigate to|go to)?\s*territorial missions?/i,
      /(?:open|navigate to|go to)?\s*locations?/i
    ]
  },
  {
    toolId: 'fellowships',
    name: 'Fellowship Departments',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*fellowships?/i,
      /(?:open|navigate to|go to|show)?\s*ministry groups?/i,
      /(?:open|navigate to|go to)?\s*departments?/i
    ]
  },
  {
    toolId: 'announcements',
    name: 'Announcements & Bulletins',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*announcements?/i,
      /(?:open|navigate to|go to|show)?\s*bulletins?/i
    ]
  },
  {
    toolId: 'multimedia',
    name: 'Multimedia & Audio Player',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*multimedia/i,
      /(?:open|navigate to|go to|show)?\s*media/i,
      /(?:open|navigate to|go to)?\s*sermon audio/i,
      /(?:open|navigate to|go to)?\s*podcasts?/i
    ]
  },
  {
    toolId: 'logos',
    name: 'Logos Theological Corpus',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*logos/i,
      /(?:open|navigate to|go to|show)?\s*theolog(?:y|ical)/i,
      /(?:open|navigate to|go to)?\s*corpus/i,
      /(?:open|navigate to|go to)?\s*library/i
    ]
  },
  {
    toolId: 'a2ajudge',
    name: 'A2A Collaboration & Judge Lab',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*a2a/i,
      /(?:open|navigate to|go to|show)?\s*judge lab/i,
      /(?:open|navigate to|go to)?\s*multi agent/i
    ]
  },
  {
    toolId: 'settings',
    name: 'Settings & Cloud Backup',
    patterns: [
      /(?:open|navigate to|go to|show)?\s*settings?/i,
      /(?:open|navigate to|go to)?\s*preferences/i,
      /(?:open|navigate to|go to)?\s*backup data/i,
      /(?:open|navigate to|go to)?\s*backup/i
    ]
  }
];

export const GlobalVoiceListener: React.FC<GlobalVoiceListenerProps> = ({
  activeToolId,
  onNavigateTo,
  isCompactButton = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusToast, setStatusToast] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    destination?: string;
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Check support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const speakConfirmation = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }, []);

  const handleCommand = useCallback((rawText: string) => {
    const clean = rawText.trim().toLowerCase();
    if (!clean) return;

    setTranscript(clean);

    let matched: CommandMatch | null = null;
    for (const cmd of VOICE_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(clean)) {
          matched = cmd;
          break;
        }
      }
      if (matched) break;
    }

    if (matched) {
      onNavigateTo(matched.toolId);
      setStatusToast({
        type: 'success',
        message: `Heard: "${rawText}"`,
        destination: `Switched to ${matched.name}`
      });
      speakConfirmation(`Opening ${matched.name}`);
    } else {
      setStatusToast({
        type: 'info',
        message: `Heard: "${rawText}"`,
        destination: `Try saying "Open Sermons" or "Navigate to Calendar"`
      });
    }

    // Clear toast after 4 seconds
    setTimeout(() => {
      if (isMountedRef.current) {
        setStatusToast(null);
      }
    }, 4000);
  }, [onNavigateTo, speakConfirmation]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      alert('Web Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusToast({
          type: 'info',
          message: 'Voice Navigation Active',
          destination: 'Say "Open Sermons", "Navigate to Calendar", "Open Maps"...'
        });
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;
        setTranscript(text);

        if (lastResult.isFinal) {
          handleCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        setIsListening(false);
      };

      recognition.onend = () => {
        // Only restart if intended to stay listening
        if (isMountedRef.current && isListening) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsListening(false);
    }
  }, [isSupported, handleCommand, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setStatusToast(null);
    } else {
      startListening();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <>
      {/* Voice Control Trigger Button (For TopBar or Navbar) */}
      <div className="relative flex items-center">
        <button
          id="global-voice-listener-btn"
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Voice Navigation is Active (Click to Stop)' : 'Start Voice Navigation (Web Speech API)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isListening
              ? 'bg-rose-500 text-white shadow-md animate-pulse ring-2 ring-rose-300 dark:ring-rose-900'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-3.5 h-3.5 animate-bounce text-white" />
              <span className="hidden sm:inline">Voice Active</span>
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-[#7D3AC1] dark:text-[#D4AF37]" />
              <span className="hidden md:inline">Voice Nav</span>
            </>
          )}
        </button>

        {/* Quick Voice Command Help Icon */}
        <button
          onClick={() => setShowHelpModal(true)}
          title="View Voice Commands Cheat Sheet"
          className="ml-1 p-1 text-slate-400 hover:text-[#7D3AC1] dark:hover:text-[#D4AF37] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating HUD Toast Notification when speaking / switching */}
      {statusToast && (
        <div 
          id="voice-command-hud-toast"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] md:w-auto p-4 rounded-2xl bg-slate-900/95 text-white border border-[#D4AF37]/50 shadow-2xl backdrop-blur-xl animate-bounce-short flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              statusToast.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-[#D4AF37]/20 text-[#D4AF37]'
            }`}>
              {statusToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Radio className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-slate-300">
                {statusToast.message}
              </div>
              {statusToast.destination && (
                <div className="text-xs md:text-sm font-bold text-[#D4AF37]">
                  {statusToast.destination}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setStatusToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Commands Cheat Sheet Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#7D3AC1] dark:text-[#D4AF37]">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-cinzel text-base font-bold text-slate-900 dark:text-white">
                    Global Voice Navigation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control the entire church platform hands-free with Web Speech API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Click the microphone button in the top navigation bar or say any of the spoken commands below to instantly navigate between tools:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {VOICE_COMMANDS.map((cmd) => (
                  <div
                    key={cmd.toolId}
                    onClick={() => {
                      onNavigateTo(cmd.toolId);
                      setShowHelpModal(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activeToolId === cmd.toolId
                        ? 'bg-purple-50 dark:bg-purple-950/30 border-[#7D3AC1] text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="font-bold text-[#7D3AC1] dark:text-[#D4AF37] flex items-center justify-between">
                      <span>{cmd.name}</span>
                      {activeToolId === cmd.toolId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7D3AC1] text-white">Active</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                      e.g., "Open {cmd.name.split(' ')[0]}" or "Navigate to {cmd.name.split(' ')[0]}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Uses browser Web Speech Recognition & Speech Synthesis
              </span>
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  if (!isListening) startListening();
                }}
                className="px-4 py-2 rounded-xl bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Voice Already Active' : 'Enable Voice Listener'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
