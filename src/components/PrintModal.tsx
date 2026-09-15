import React, { useState } from 'react';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
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
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header Banner
      doc.setFillColor(11, 31, 77); // #0B1F4D
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFillColor(212, 175, 55); // #D4AF37
      doc.rect(0, 28, pageWidth, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text((churchProfile.churchName || 'CHURCH MINISTRY').toUpperCase(), margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(212, 175, 55);
      doc.text(churchProfile.tagline || 'Rooted in Scripture • Sanctuary Worship', margin, 19);

      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`${churchProfile.address || ''} • ${churchProfile.phone || ''} • ${churchProfile.email || 'info@thinktecai.com'}`, margin, 25);

      y = 38;

      if (sermon) {
        // Sermon Title & Theme
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(11, 31, 77);
        doc.text(sermon.title.toUpperCase(), margin, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(125, 58, 193); // #7D3AC1
        doc.text(`THEME: ${sermon.theme.toUpperCase()}`, margin, y);
        y += 7;

        // Metadata box
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(`Scripture: ${sermon.mainScripture} (${sermon.bibleVersion})`, margin + 3, y + 5);
        doc.text(`Preacher: ${sermon.speaker}`, margin + 3, y + 9.5);
        doc.text(`Date: ${sermon.date}`, margin + 110, y + 5);
        doc.text(`Series: ${sermon.series || 'Sanctuary Pulpit'}`, margin + 110, y + 9.5);
        y += 18;

        // Introduction
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(11, 31, 77);
        doc.text('I. EXPOSITORY INTRODUCTION', margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const introLines = doc.splitTextToSize(sermon.introduction, contentWidth);
        doc.text(introLines, margin, y);
        y += introLines.length * 4.5 + 4;

        // Expository Points
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(11, 31, 77);
        doc.text('II. MAIN EXPOSITORY DIVISIONS', margin, y);
        y += 5;

        sermon.points.forEach((pt, idx) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(125, 58, 193);
          doc.text(`${idx + 1}. ${pt.pointTitle} (${pt.scripture})`, margin, y);
          y += 4.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          const expLines = doc.splitTextToSize(pt.explanation, contentWidth - 4);
          doc.text(expLines, margin + 2, y);
          y += expLines.length * 4 + 3;
        });

        // Conclusion & Prayer
        if (sermon.conclusion) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(11, 31, 77);
          doc.text('III. CONCLUSION & ALTAR CALL', margin, y);
          y += 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const conclLines = doc.splitTextToSize(sermon.conclusion, contentWidth);
          doc.text(conclLines, margin, y);
        }
      } else {
        // General Church Bulletin & Order of Service
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(11, 31, 77);
        doc.text('LORD\'S DAY WORSHIP BULLETIN & LITURGY', margin, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text('Welcome to the divine service of worship. May the grace of our Lord Jesus Christ be with you.', margin, y);
      }

      const safeTitle = (sermon ? sermon.title : 'church_bulletin')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 25);
      doc.save(`${safeTitle}_document.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Action Bar (no-print) */}
        <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif-cinzel font-bold text-sm text-[#0B1F4D]">
              Print & PDF Expository Document
            </span>
            {downloadSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Direct Download PDF Button */}
            <button
              id="printmodal-download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={downloading}
              title="Download direct A4 PDF document to your device"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {/* Print / Save to PDF Button */}
            <button
              id="printmodal-print-btn"
              onClick={handlePrint}
              title="Open browser print dialog / Save as PDF"
              className="px-4 py-1.5 rounded-lg bg-[#0B1F4D] hover:bg-[#7D3AC1] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print to PDF</span>
            </button>

            <button
              id="printmodal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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
              {churchProfile.address} &bull; {churchProfile.phone} &bull; {churchProfile.email || 'info@thinktecai.com'}
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
