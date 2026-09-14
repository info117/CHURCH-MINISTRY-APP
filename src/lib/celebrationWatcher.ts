/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChurchMember, CelebrationAlert } from '../types';

/**
 * Calculates the number of days until the next occurrence of an annual MM-DD date
 */
function calculateDaysUntilAnnualDate(
  dateStr: string,
  referenceDate: Date = new Date()
): { daysUntil: number; celebrationDate: Date; yearsElapsed: number } | null {
  if (!dateStr) return null;

  const parts = dateStr.split('-');
  if (parts.length < 2) return null;

  const originYear = parts.length === 3 ? parseInt(parts[0], 10) : referenceDate.getFullYear();
  const month = parseInt(parts[parts.length - 2], 10) - 1; // 0-indexed
  const day = parseInt(parts[parts.length - 1], 10);

  if (isNaN(month) || isNaN(day)) return null;

  const currentYear = referenceDate.getFullYear();
  const todayAtMidnight = new Date(currentYear, referenceDate.getMonth(), referenceDate.getDate());
  
  // This year's occurrence
  let targetOccurrence = new Date(currentYear, month, day);

  // If already passed this year (before today at midnight), look ahead to next year
  if (targetOccurrence.getTime() < todayAtMidnight.getTime()) {
    targetOccurrence = new Date(currentYear + 1, month, day);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((targetOccurrence.getTime() - todayAtMidnight.getTime()) / msPerDay);
  const yearsElapsed = targetOccurrence.getFullYear() - originYear;

  return {
    daysUntil,
    celebrationDate: targetOccurrence,
    yearsElapsed: Math.max(0, yearsElapsed)
  };
}

/**
 * Cross-references member profiles with the current date to detect upcoming birthdays and anniversaries
 * @param members List of church members
 * @param referenceDate Base date to check against (defaults to now)
 * @param lookaheadDays Number of days ahead to scan (default 14 days)
 */
export function checkMemberCelebrations(
  members: ChurchMember[],
  referenceDate: Date = new Date(),
  lookaheadDays: number = 14
): CelebrationAlert[] {
  const alerts: CelebrationAlert[] = [];

  for (const member of members) {
    const fullName = `${member.firstName} ${member.lastName}`;

    // 1. Birthday Cross-Reference
    if (member.birthDate) {
      const bdayResult = calculateDaysUntilAnnualDate(member.birthDate, referenceDate);
      if (bdayResult && bdayResult.daysUntil >= 0 && bdayResult.daysUntil <= lookaheadDays) {
        const { daysUntil, celebrationDate, yearsElapsed } = bdayResult;
        const dateFormatted = celebrationDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        let message = '';
        if (daysUntil === 0) {
          message = `🎉 TODAY is ${fullName}'s ${yearsElapsed > 0 ? `${yearsElapsed}th ` : ''}Birthday! Send pastoral greetings and blessings.`;
        } else if (daysUntil === 1) {
          message = `🎂 Tomorrow (${dateFormatted}) is ${fullName}'s ${yearsElapsed > 0 ? `${yearsElapsed}th ` : ''}Birthday.`;
        } else {
          message = `🎂 Upcoming Birthday: ${fullName}${yearsElapsed > 0 ? ` (${yearsElapsed} yrs)` : ''} in ${daysUntil} days on ${dateFormatted}.`;
        }

        alerts.push({
          id: `bday-${member.id}-${celebrationDate.getFullYear()}`,
          memberId: member.id,
          memberName: fullName,
          fellowship: member.fellowship,
          role: member.role,
          email: member.email,
          phone: member.phone,
          type: 'Birthday',
          originalDate: member.birthDate,
          daysUntil,
          ageOrYears: yearsElapsed > 0 ? yearsElapsed : undefined,
          celebrationDateFormatted: dateFormatted,
          message,
          priority: daysUntil <= 1 ? 'today' : 'upcoming'
        });
      }
    }

    // 2. Wedding Anniversary Cross-Reference
    if (member.weddingAnniversary) {
      const annivResult = calculateDaysUntilAnnualDate(member.weddingAnniversary, referenceDate);
      if (annivResult && annivResult.daysUntil >= 0 && annivResult.daysUntil <= lookaheadDays) {
        const { daysUntil, celebrationDate, yearsElapsed } = annivResult;
        const dateFormatted = celebrationDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        let message = '';
        if (daysUntil === 0) {
          message = `💍 TODAY is ${fullName}'s ${yearsElapsed > 0 ? `${yearsElapsed}th ` : ''}Wedding Anniversary! Celebrate God's marital covenant.`;
        } else if (daysUntil === 1) {
          message = `💍 Tomorrow (${dateFormatted}) is ${fullName}'s ${yearsElapsed > 0 ? `${yearsElapsed}th ` : ''}Wedding Anniversary.`;
        } else {
          message = `💍 Upcoming Anniversary: ${fullName}${yearsElapsed > 0 ? ` (${yearsElapsed}th yr)` : ''} in ${daysUntil} days on ${dateFormatted}.`;
        }

        alerts.push({
          id: `anniv-${member.id}-${celebrationDate.getFullYear()}`,
          memberId: member.id,
          memberName: fullName,
          fellowship: member.fellowship,
          role: member.role,
          email: member.email,
          phone: member.phone,
          type: 'Wedding Anniversary',
          originalDate: member.weddingAnniversary,
          daysUntil,
          ageOrYears: yearsElapsed > 0 ? yearsElapsed : undefined,
          celebrationDateFormatted: dateFormatted,
          message,
          priority: daysUntil <= 1 ? 'today' : 'upcoming'
        });
      }
    }
  }

  // Sort by earliest celebration first (today at top, then tomorrow, then upcoming)
  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Initiates a recurring background checker that monitors member celebrations
 * and invokes callback whenever updates or new day changes occur.
 */
export function startCelebrationWatcher(
  getMembers: () => ChurchMember[],
  onAlertsUpdated: (alerts: CelebrationAlert[]) => void,
  intervalMs: number = 60000
): () => void {
  const executeCheck = () => {
    const members = getMembers();
    const alerts = checkMemberCelebrations(members);
    onAlertsUpdated(alerts);
  };

  // Immediate check on startup
  executeCheck();

  // Recurring background interval check
  const intervalId = window.setInterval(executeCheck, intervalMs);

  return () => {
    window.clearInterval(intervalId);
  };
}

/**
 * Prepares a customized pastoral blessing scripture and message for milestone celebrations
 */
export function generatePastoralMilestoneGreeting(alert: CelebrationAlert): {
  scripture: string;
  reference: string;
  prayerText: string;
} {
  if (alert.type === 'Birthday') {
    return {
      reference: 'Numbers 6:24-26',
      scripture: 'The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.',
      prayerText: `Beloved ${alert.memberName}, on your special birthday celebration, the church leadership and congregation pray that Almighty God fills your new year with divine strength, health, spiritual illumination, and unending joy in Christ Jesus!`
    };
  } else {
    return {
      reference: 'Colossians 3:14',
      scripture: 'And above all these things put on charity, which is the bond of perfectness.',
      prayerText: `Beloved ${alert.memberName}, on this joyous wedding anniversary milestone, we praise the Lord for His faithfulness over your marriage. May the Holy Spirit continue to deepen your love, peace, and covenant unity for the glory of His Kingdom!`
    };
  }
}
