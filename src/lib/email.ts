import { fmtLongDate, fmtMonthDay } from './dates';
import { DIET_PROFILE_LABELS, lunchFit } from './diet';
import { dayStatus, lunchLabel, sidesFor, type PlanState, type Week } from './plan';

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export interface EmailScope {
  /** When set, the email covers only this date instead of the whole week. */
  date?: string;
  /** Sign-off name when the plan doesn't set one (e.g. the signed-in account). */
  fallbackSignOff?: string;
  /** Leave out days before this date (ISO) — past days are already done. */
  fromDate?: string;
}

export function buildEmail(week: Week, plan: PlanState, scope: EmailScope = {}): EmailDraft {
  const { childName, classroom, teacherName, parentName, to } = plan.details;
  const child = childName.trim() || 'my child';
  const who = classroom.trim() ? `${child} (${classroom.trim()})` : child;

  const sections: string[] = [];
  const days = scope.date
    ? week.days.filter((d) => d.date === scope.date)
    : week.days.filter((d) => !scope.fromDate || d.date >= scope.fromDate);
  for (const day of days) {
    const dayPlan = plan.days[day.date];
    const status = dayStatus(day, dayPlan);
    if (status === 'no-school') {
      sections.push(`${fmtLongDate(day.date)}\n• No school`);
      continue;
    }
    if (status === 'empty' || !dayPlan) continue;

    const lines = [fmtLongDate(day.date)];
    if (dayPlan.breakfast) {
      const { grain, fruit, milk } = dayPlan.breakfastPicks ?? {};
      const picks = [grain, fruit, milk].filter(Boolean);
      lines.push(picks.length ? `• Breakfast: Grab & Go — ${picks.join(', ')}` : '• Breakfast: Grab & Go breakfast, please');
    }
    if (dayPlan.lunch) {
      const lunch = lunchLabel(day, dayPlan.lunch);
      lines.push(`• Lunch: ${dayPlan.lunch === 'hot' && day.theme ? `${lunch} ("${day.theme}" hot lunch)` : lunch}`);
      if (lunchFit(day, dayPlan.lunch, plan.diet).fit === 'ask') {
        lines.push(`• Please confirm this works for a ${DIET_PROFILE_LABELS[plan.diet.profile].toLowerCase()} diet`);
      }
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

  const when = scope.date ? fmtLongDate(scope.date) : `the week of Monday, ${fmtMonthDay(week.monday)}`;
  const subjectWhen = scope.date ? fmtLongDate(scope.date) : `week of ${fmtMonthDay(week.monday)}`;
  const subject = `${childName.trim() || 'Lunch'} — lunch & Extended Day plan, ${subjectWhen}`;
  const signOff = parentName.trim() || scope.fallbackSignOff?.trim() || '';
  const teacher = teacherName.trim();
  const greeting = teacher ? `Hi ${teacher} and the Cheverus team,` : 'Hi Cheverus team,';
  const intro = `Here is ${who}'s lunch and Extended Day plan for ${when}:`;
  const body = [
    greeting,
    intro,
    ...dietNotes(child, plan),
    sections.length ? sections.join('\n\n') : scope.date ? '(Nothing planned for this day yet.)' : '(No days planned yet.)',
    'Please let me know if anything on the menu changes. Thank you!',
    signOff ? `Best,\n${signOff}` : 'Best,',
  ].join('\n\n');

  return { to: to.trim(), subject, body };
}

function dietNotes(child: string, plan: PlanState): string[] {
  const notes: string[] = [];
  const { profile, nutAllergy } = plan.diet;
  if (profile !== 'none') notes.push(`Diet: ${child} eats ${DIET_PROFILE_LABELS[profile].toLowerCase()}.`);
  if (nutAllergy) {
    notes.push(
      `Allergy: ${child} has a nut allergy. The posted menu doesn't list allergens, so please double-check each meal and snack.`,
    );
  }
  return notes.length ? [notes.join('\n')] : [];
}

export function mailtoHref(draft: EmailDraft): string {
  const params = new URLSearchParams({ subject: draft.subject, body: draft.body });
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${encodeURIComponent(draft.to)}?${params.toString().replace(/\+/g, '%20')}`;
}
