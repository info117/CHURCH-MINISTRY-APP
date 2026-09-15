import React, { useState } from 'react';
import { 
  Mail, 
  AlertTriangle, 
  Check, 
  Copy, 
  X, 
  Send, 
  ShieldAlert, 
  Clock, 
  User, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { SimulatedPrayerEmailAlert } from '../types';

interface PrayerEmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: SimulatedPrayerEmailAlert | null;
  allAlerts?: SimulatedPrayerEmailAlert[];
  onSelectAlert?: (alert: SimulatedPrayerEmailAlert) => void;
}

export const PrayerEmailAlertModal: React.FC<PrayerEmailAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  allAlerts = [],
  onSelectAlert
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'history'>('preview');

  if (!isOpen || !alert) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(alert.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isCritical = alert.urgencyLevel === 'Critical';

  return (
    <div 
      id="prayer-email-alert-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="prayer-email-alert-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isCritical ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pastoral Email Alert Dispatch
                </h3>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                  {alert.urgencyLevel}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Dispatched (Simulated SMTP)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triggered by Firebase background job upon detection of high-urgency petition
              </p>
            </div>
          </div>

          <button
            id="close-email-alert-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-2">
            <button
              id="email-tab-preview-btn"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Email Client Preview
            </button>
            <button
              id="email-tab-raw-btn"
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                activeTab === 'raw'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Plain Text & Headers
            </button>
            {allAlerts.length > 1 && (
              <button
                id="email-tab-history-btn"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Alert History ({allAlerts.length})
              </button>
            )}
          </div>

          <button
            id="copy-alert-email-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Email Text</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Envelope Meta Header */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">From:</span>
                  <span className="font-medium text-slate-900 dark:text-white font-mono">
                    {alert.sender}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">To:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.recipients.map((email, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-md font-mono text-[11px] border border-blue-200 dark:border-blue-900/60"
                      >
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {alert.subject}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Sent:</span>
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(alert.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Formatted HTML View */}
              <div 
                className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200"
                dangerouslySetInnerHTML={{ __html: alert.htmlBody }}
              />
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  SMTP Transmission Log & Multipart Body
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {alert.id}
                </span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-blue-600 border border-slate-800">
                {alert.body}
              </pre>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All simulated email alerts triggered during this session and saved to audit log:
              </p>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {allAlerts.map((histAlert) => (
                  <button
                    key={histAlert.id}
                    onClick={() => {
                      if (onSelectAlert) onSelectAlert(histAlert);
                      setActiveTab('preview');
                    }}
                    className={`w-full text-left p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      histAlert.id === alert.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          histAlert.urgencyLevel === 'Critical' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-amber-500 text-slate-950'
                        }`}>
                          {histAlert.urgencyLevel}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {histAlert.prayerTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        Requester: {histAlert.requester} • Category: {histAlert.category}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(histAlert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulated Pastoral Prayer Chain Service</span>
          </div>

          <button
            id="close-email-alert-dialog-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
