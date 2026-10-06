import { fmtLongDate, fmtMonthDay } from './dates';
import { dayStatus, lunchLabel, sidesFor, type PlanState, type Week } from './plan';

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export function buildEmail(week: Week, plan: PlanState): EmailDraft {
  const { childName, classroom, parentName, to } = plan.details;
  const child = childName.trim() || 'my child';
  const who = classroom.trim() ? `${child} (${classroom.trim()})` : child;

  const sections: string[] = [];
  for (const day of week.days) {
    const dayPlan = plan.days[day.date];
    const status = dayStatus(day, dayPlan);
    if (status === 'no-school') {
      sections.push(`${fmtLongDate(day.date)}\n• No school`);
      continue;
    }
    if (status === 'empty' || !dayPlan) continue;

    const lines = [fmtLongDate(day.date)];
    if (dayPlan.breakfast) lines.push('• Breakfast: Grab & Go breakfast, please');
    if (dayPlan.lunch) {
      const lunch = lunchLabel(day, dayPlan.lunch);
      lines.push(`• Lunch: ${dayPlan.lunch === 'hot' && day.theme ? `${lunch} ("${day.theme}" hot lunch)` : lunch}`);
      if (dayPlan.lunch !== 'home') {
        const sides = sidesFor(day, dayPlan);
        const skipped = day.sides.filter((s) => !sides.includes(s));
        if (sides.length) lines.push(`• Sides: ${sides.join(', ')}`);
        if (skipped.length) lines.push(`• Please skip: ${skipped.join(', ')}`);
        if (dayPlan.extras.length) lines.push(`• From the fruit & veggie bar: ${dayPlan.extras.join(', ')}`);
      }
    }
    if (dayPlan.drink) lines.push(`• Drink: ${dayPlan.drink === 'none' ? 'No milk — sending a drink from home' : dayPlan.drink}`);
    if (dayPlan.edp) {
      lines.push(
        dayPlan.edp === 'no'
          ? '• Extended Day: No — picking up at dismissal'
          : `• Extended Day: Yes — pickup by ${dayPlan.edp}`,
      );
    }
    if (dayPlan.note.trim()) lines.push(`• Note: ${dayPlan.note.trim()}`);
    sections.push(lines.join('\n'));
  }

  const subject = `${childName.trim() || 'Lunch'} — lunch & Extended Day plan, week of ${fmtMonthDay(week.monday)}`;
  const greeting = 'Hi Cheverus team,';
  const intro = `Here is ${who}'s lunch and Extended Day plan for the week of Monday, ${fmtMonthDay(week.monday)}:`;
  const body = [
    greeting,
    intro,
    sections.length ? sections.join('\n\n') : '(No days planned yet.)',
    'Please let me know if anything on the menu changes. Thank you!',
    parentName.trim() ? `Best,\n${parentName.trim()}` : 'Best,',
  ].join('\n\n');

  return { to: to.trim(), subject, body };
}

export function mailtoHref(draft: EmailDraft): string {
  const params = new URLSearchParams({ subject: draft.subject, body: draft.body });
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${encodeURIComponent(draft.to)}?${params.toString().replace(/\+/g, '%20')}`;
}
