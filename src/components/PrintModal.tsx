import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { ChurchProfile, Sermon } from '../types';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchProfile: ChurchProfile;
  sermon?: Sermon;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  churchProfile,
  sermon
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Action Bar (no-print) */}
        <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print shrink-0">
          <span className="font-serif-cinzel font-bold text-sm text-[#0B1F4D]">
            Print & PDF Expository Document
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#0B1F4D] hover:bg-[#7D3AC1] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="p-8 md:p-12 overflow-y-auto space-y-6 print-container text-slate-900 font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h1 className="font-serif-cinzel text-2xl font-bold tracking-tight text-[#0B1F4D] uppercase">
              {churchProfile.churchName}
            </h1>
            <p className="text-xs italic text-slate-600">
              "{churchProfile.tagline}"
            </p>
            <p className="text-[11px] text-slate-500">
              {churchProfile.address} &bull; {churchProfile.phone} &bull; {churchProfile.contactEmail}
            </p>
          </div>

          {sermon ? (
            <div className="space-y-6">
              {/* Sermon Metadata */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                <div>
                  <span className="font-bold">Text:</span> {sermon.mainScripture} ({sermon.bibleVersion})
                </div>
                <div>
                  <span className="font-bold">Preacher:</span> {sermon.speaker}
                </div>
                <div>
                  <span className="font-bold">Date:</span> {sermon.date}
                </div>
              </div>

              {/* Sermon Title */}
              <div className="text-center space-y-1">
                <h2 className="font-serif-cinzel text-xl font-bold uppercase text-slate-900">
                  {sermon.title}
                </h2>
                <span className="text-xs font-semibold text-[#7D3AC1] tracking-wider uppercase">
                  Theme: {sermon.theme}
                </span>
              </div>

              {/* Introduction */}
              <div className="space-y-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  I. Introduction
                </h3>
                <p className="text-xs leading-relaxed text-slate-800">
                  {sermon.introduction}
                </p>
              </div>

              {/* Main Expository Points */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  II. Expository Outline
                </h3>
                {sermon.mainPoints.map((pt, i) => (
                  <div key={i} className="pl-4 space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {i + 1}. {pt.title} ({pt.scriptureRef})
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pl-2">
                      {pt.subpoints.map((sub, sIdx) => (
                        <li key={sIdx}>{sub}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Illustrations & Application */}
              {sermon.illustrations.length > 0 && (
                <div className="space-y-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    III. Illustrations
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-800 pl-4">
                    {sermon.illustrations.join(' ')}
                  </p>
                </div>
              )}

              {sermon.applications.length > 0 && (
                <div className="space-y-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    IV. Practical Applications
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-800 space-y-0.5 pl-4">
                    {sermon.applications.map((app, aIdx) => (
                      <li key={aIdx}>{app}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Conclusion & Prayer */}
              <div className="space-y-1 border-t border-slate-200 pt-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  V. Altar Call & Benediction
                </h3>
                <p className="text-xs italic leading-relaxed text-slate-800 pl-4 font-serif">
                  "{sermon.prayer}"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-center">Weekly Bulletin & Announcements</h3>
              <p>Prepared for congregation study and distribution.</p>
            </div>
          )}

          {/* Document Footer */}
          <div className="text-center pt-8 border-t border-slate-200 text-[10px] text-slate-400">
            CHURCH MINISTRY APP &bull; Theological Guard-Railed &bull; Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  );
};
