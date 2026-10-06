import { Box, Tab, Tabs, Typography } from '@mui/material';
import type { MenuDay } from '../data/menu';
import { fmtWeekday, fmtWeekdayShort, parseISODate, relativeDayLabel } from '../lib/dates';
import type { DayStatus } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export interface DayTabsProps {
  days: MenuDay[];
  selected: string;
  onSelect: (date: string) => void;
  statuses: Record<string, DayStatus>;
  /** ISO date of today: labels Today / Tomorrow, and days before it are greyed out and can't be picked. */
  today?: string;
}

const DOT: Record<DayStatus, string> = {
  done: '#2E7D4F',
  partial: CHEVERUS.yellow,
  empty: 'transparent',
  'no-school': '#B8B5C4',
};

const STATUS_LABEL: Record<DayStatus, string> = {
  done: 'planned',
  partial: 'in progress',
  empty: 'not planned',
  'no-school': 'no school',
};

/**
 * Mon–Fri tiles. The selected day is a filled navy tile; today is labeled "Today".
 * Status dot: green = done, yellow = in progress, grey = no school.
 */
export function DayTabs({ days, selected, onSelect, statuses, today }: DayTabsProps) {
  return (
    <Tabs
      value={selected}
      onChange={(_, value: string) => onSelect(value)}
      variant="fullWidth"
      aria-label="Choose a day"
      slotProps={{ indicator: { sx: { display: 'none' } } }}
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 1, py: 1 }}
    >
      {days.map((day) => {
        const status = statuses[day.date] ?? 'empty';
        const active = day.date === selected;
        const isToday = day.date === today;
        const past = today !== undefined && day.date < today;
        const relative = today ? relativeDayLabel(day.date, today) : undefined;
        const fg = active ? CHEVERUS.yellow : isToday ? 'primary.main' : 'text.secondary';
        return (
          <Tab
            key={day.date}
            value={day.date}
            disabled={past}
            aria-label={`${relative ? `${relative}, ` : ''}${fmtWeekday(day.date)} ${parseISODate(day.date).getDate()}, ${past ? 'past' : STATUS_LABEL[status]}`}
            sx={{ p: 0, mx: 0.5, minHeight: 72, opacity: past ? 0.35 : status === 'no-school' && !active ? 0.55 : 1 }}
            label={
              <Box
                sx={{
                  width: '100%',
                  py: 1,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: active ? 'primary.main' : isToday ? CHEVERUS.yellowSoft : 'transparent',
                  border: '2px solid',
                  borderColor: active ? 'primary.main' : isToday ? CHEVERUS.yellow : 'transparent',
                  boxShadow: active ? 3 : 0,
                  transition: 'background-color 150ms, box-shadow 150ms',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: fg, textTransform: relative ? 'uppercase' : 'none', fontSize: relative ? 10 : undefined, letterSpacing: relative ? '0.06em' : undefined }}
                >
                  {relative ?? fmtWeekdayShort(day.date)}
                </Typography>
                <Typography
                  variant="h2"
                  component="span"
                  sx={{ lineHeight: 1.15, color: active ? 'primary.contrastText' : 'text.primary' }}
                >
                  {parseISODate(day.date).getDate()}
                </Typography>
                <Box
                  aria-hidden
                  sx={{
                    mt: 0.5,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: past ? 'transparent' : DOT[status],
                    visibility: past ? 'hidden' : 'visible',
                    border:
                      status === 'empty'
                        ? `1.5px solid ${active ? 'rgba(255,255,255,0.6)' : `${CHEVERUS.navy}33`}`
                        : status === 'partial'
                          ? `1.5px solid ${active ? CHEVERUS.yellow : CHEVERUS.navy}`
                          : 'none',
                  }}
                />
              </Box>
            }
          />
        );
      })}
    </Tabs>
  );
}
