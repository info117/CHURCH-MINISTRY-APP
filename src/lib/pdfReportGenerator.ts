import { jsPDF } from 'jspdf';
import { ChurchOperationEvent, ChurchProfile } from '../types';

export interface AttendanceSummaryData {
  weeklyHeadcount: number;
  peakAssemblyTime: string;
  peakAssemblyHeadcount: number;
  peakCapacityPercent: number;
  midweekPeakAssembly: string;
  midweekHeadcount: number;
  averageUtilization: number;
  activeCongregationScore: number;
}

export const defaultAttendanceSummary: AttendanceSummaryData = {
  weeklyHeadcount: 2145,
  peakAssemblyTime: 'Sunday 10:45 AM – 01:00 PM',
  peakAssemblyHeadcount: 520,
  peakCapacityPercent: 95,
  midweekPeakAssembly: 'Wednesday 07:00 PM – 09:00 PM',
  midweekHeadcount: 285,
  averageUtilization: 78,
  activeCongregationScore: 92
};

export interface GenerateReportOptions {
  churchProfile: ChurchProfile;
  operations: ChurchOperationEvent[];
  attendance?: AttendanceSummaryData;
  reportingPeriod?: string;
  generatedBy?: string;
}

/**
 * Generates an executive PDF report of church operations and weekly attendance data.
 */
export function generateChurchOperationsReport({
  churchProfile,
  operations,
  attendance = defaultAttendanceSummary,
  reportingPeriod = 'Current Ministry Quarter',
  generatedBy = 'Pastoral Administration Office'
}: GenerateReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Primary palette colors
  const primaryNavy = [11, 31, 77];     // #0B1F4D
  const accentPurple = [125, 58, 193];  // #7D3AC1
  const goldAccent = [212, 175, 55];    // #D4AF37
  const slateText = [51, 65, 85];       // #334155
  const lightBg = [248, 250, 252];      // #F8FAFC
  const borderGray = [226, 232, 240];   // #E2E8F0

  // 1. TOP BANNER & HEADER
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Gold accent bar
  doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
  doc.rect(0, 32, pageWidth, 2, 'F');

  // Church Name & Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text((churchProfile.churchName || 'CHURCH MINISTRY').toUpperCase(), margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55);
  doc.text('OPERATIONS, EVANGELISM & ATTENDANCE EXECUTIVE SUMMARY', margin, 20);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const dateStamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.text(`Generated: ${dateStamp} | ${reportingPeriod} | Auth: ${generatedBy}`, margin, 27);

  cursorY = 42;

  // 2. CHURCH METADATA STRIP
  doc.setFontSize(8);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  const addressInfo = `${churchProfile.address || 'Sanctuary Campus'} • ${churchProfile.phone || '(555) 019-2831'} • ${churchProfile.email || 'office@church.org'}`;
  doc.text(addressInfo, margin, cursorY);
  cursorY += 6;

  // Subtle separator line
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // 3. EXECUTIVE KPI CARDS (Attendance & Operations)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('1. EXECUTIVE ATTENDANCE & CONGREGATION METRICS', margin, cursorY);
  cursorY += 5;

  const cardWidth = (contentWidth - 6) / 3;
  const cardHeight = 20;

  // Card 1: Total Weekly Headcount
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('WEEKLY CONGREGATION', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text(`${attendance.weeklyHeadcount.toLocaleString()} Attendees`, margin + 4, cursorY + 14);

  // Card 2: Peak Assembly
  const card2X = margin + cardWidth + 3;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(card2X, cursorY, cardWidth, cardHeight, 2, 2, 'F');
  doc.roundedRect(card2X, cursorY, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PEAK ASSEMBLY CENSUS', card2X + 4, cursorY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.text(`${attendance.peakAssemblyHeadcount} (${attendance.peakCapacityPercent}% Cap.)`, card2X + 4, cursorY + 14);

  // Card 3: Operations & Crusades Count
  const card3X = card2X + cardWidth + 3;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(card3X, cursorY, cardWidth, cardHeight, 2, 2, 'F');
  doc.roundedRect(card3X, cursorY, cardWidth, cardHeight, 2, 2, 'S');

  const totalBudget = operations.reduce((sum, o) => sum + (o.estimatedBudget || 0), 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('OPERATIONS & BUDGET', card3X + 4, cursorY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 149, 106); // Emerald
  doc.text(`${operations.length} Events ($${totalBudget.toLocaleString()})`, card3X + 4, cursorY + 14);

  cursorY += cardHeight + 8;

  // 4. WEEKLY ASSEMBLY BREAKDOWN TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('2. WEEKLY ASSEMBLY ATTENDANCE & PEAK TIMES', margin, cursorY);
  cursorY += 4;

  // Table Header
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Assembly / Service Gathering', margin + 3, cursorY + 4.8);
  doc.text('Day & Time Window', margin + 65, cursorY + 4.8);
  doc.text('Avg Headcount', margin + 115, cursorY + 4.8);
  doc.text('Sanctuary Fill', margin + 145, cursorY + 4.8);
  cursorY += 7;

  const assemblyRows = [
    { name: 'Sunday Main Celebration & Communion', dayTime: 'Sunday 10:45 AM - 01:00 PM', count: '520 attendees', fill: '95% (Peak)' },
    { name: 'Sunday 1st Morning Worship & Sunday School', dayTime: 'Sunday 08:30 AM - 10:30 AM', count: '380 attendees', fill: '82%' },
    { name: 'Sunday Early Dawn Intercession', dayTime: 'Sunday 06:00 AM - 08:00 AM', count: '180 attendees', fill: '60%' },
    { name: 'Sunday Youth & Campus Gathering', dayTime: 'Sunday 02:00 PM - 04:00 PM', count: '240 attendees', fill: '78%' },
    { name: 'Wednesday Midweek Revival & Miracle Hour', dayTime: 'Wednesday 07:00 PM - 09:00 PM', count: '285 attendees', fill: '72% (Midweek Peak)' },
    { name: 'Friday Night All-Night Prayer Vigil', dayTime: 'Friday 10:00 PM - 01:00 AM', count: '310 attendees', fill: '79%' },
    { name: 'Saturday Morning Community Bread Outreach', dayTime: 'Saturday 09:00 AM - 12:00 PM', count: '230 attendees', fill: 'Community' }
  ];

  assemblyRows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, cursorY + 6, margin + contentWidth, cursorY + 6);

    doc.setFont('helvetica', row.name.includes('Peak') || idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(row.name.includes('Peak') || idx === 0 ? primaryNavy[0] : slateText[0], row.name.includes('Peak') || idx === 0 ? primaryNavy[1] : slateText[1], row.name.includes('Peak') || idx === 0 ? primaryNavy[2] : slateText[2]);

    doc.text(row.name, margin + 3, cursorY + 4.2);
    doc.text(row.dayTime, margin + 65, cursorY + 4.2);
    doc.text(row.count, margin + 115, cursorY + 4.2);
    doc.text(row.fill, margin + 145, cursorY + 4.2);

    cursorY += 6;
  });

  cursorY += 6;

  // 5. SCHEDULED OPERATIONS, CRUSADES & MISSIONS TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('3. SCHEDULED CHURCH OPERATIONS & EVANGELISTIC CAMPAIGNS', margin, cursorY);
  cursorY += 4;

  // Table Header
  doc.setFillColor(accentPurple[0], accentPurple[1], accentPurple[2]);
  doc.rect(margin, cursorY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Operation Name', margin + 3, cursorY + 4.8);
  doc.text('Type', margin + 55, cursorY + 4.8);
  doc.text('Schedule & Location', margin + 80, cursorY + 4.8);
  doc.text('Lead Team', margin + 130, cursorY + 4.8);
  doc.text('Budget / Status', margin + 160, cursorY + 4.8);
  cursorY += 7;

  // Display operations
  const opsList = operations.slice(0, 10); // fit neatly on primary sheet
  opsList.forEach((op, idx) => {
    // Check if new page is needed
    if (cursorY > pageHeight - 25) {
      doc.addPage();
      cursorY = margin;

      // Repeat subheader on page 2
      doc.setFillColor(accentPurple[0], accentPurple[1], accentPurple[2]);
      doc.rect(margin, cursorY, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('Operation Name', margin + 3, cursorY + 4.8);
      doc.text('Type', margin + 55, cursorY + 4.8);
      doc.text('Schedule & Location', margin + 80, cursorY + 4.8);
      doc.text('Lead Team', margin + 130, cursorY + 4.8);
      doc.text('Budget / Status', margin + 160, cursorY + 4.8);
      cursorY += 7;
    }

    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, cursorY, contentWidth, 7, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, cursorY + 7, margin + contentWidth, cursorY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    const cleanName = op.name.length > 25 ? `${op.name.substring(0, 23)}..` : op.name;
    doc.text(cleanName, margin + 3, cursorY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    doc.text(op.type || 'Mission', margin + 55, cursorY + 4.8);

    const schedLoc = `${op.startDate} (${op.location || 'Auditorium'})`;
    const cleanSchedLoc = schedLoc.length > 26 ? `${schedLoc.substring(0, 24)}..` : schedLoc;
    doc.text(cleanSchedLoc, margin + 80, cursorY + 4.8);

    const cleanTeam = (op.leadMinistryTeam || 'Pastoral Team').substring(0, 16);
    doc.text(cleanTeam, margin + 130, cursorY + 4.8);

    const budgetStatus = `$${(op.estimatedBudget || 0).toLocaleString()} • ${op.status || 'Active'}`;
    doc.setFont('helvetica', 'bold');
    doc.text(budgetStatus, margin + 160, cursorY + 4.8);

    cursorY += 7;
  });

  cursorY += 6;

  // 6. PASTORAL STEWARDSHIP DECLARATION
  if (cursorY <= pageHeight - 35) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, cursorY, contentWidth, 18, 2, 2, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, cursorY, contentWidth, 18, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text('501(c)(3) ECCLESIASTICAL STEWARDSHIP & GOVERNANCE COMPLIANCE', margin + 4, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(slateText[0], slateText[1], slateText[2]);
    const complianceText = 'This report contains confidential pastoral data, attendance audits, and operational allocations. Prepared for ministry board oversight, elder review, and ecclesiastical administration. Certified accurate per parish governance standards.';
    doc.text(complianceText, margin + 4, cursorY + 10, { maxWidth: contentWidth - 8 });
  }

  // 7. FOOTER (On all pages)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text('SanctuaryOS Ecclesiastical Platform • Secure Ministry Operations & Attendance Report', margin, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 6);
  }

  return doc;
}

/**
 * Downloads the Church Operations & Attendance report directly to the client device.
 */
export function downloadChurchOperationsReport(options: GenerateReportOptions): void {
  const doc = generateChurchOperationsReport(options);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeChurch = (options.churchProfile.churchName || 'Church')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 20);
  const fileName = `${safeChurch}_operations_attendance_report_${dateStr}.pdf`;
  doc.save(fileName);
}
