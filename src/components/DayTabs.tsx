import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { MenuDay } from '../data/menu';
import { fmtWeekdayShort, parseISODate } from '../lib/dates';
import type { DayStatus } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export interface DayTabsProps {
  days: MenuDay[];
  selected: string;
  onSelect: (date: string) => void;
  statuses: Record<string, DayStatus>;
}

const DOT: Record<DayStatus, string> = {
  done: '#2E7D4F',
  partial: CHEVERUS.yellow,
  empty: 'transparent',
  'no-school': '#B8B5C4',
};

/** Mon–Fri tabs with a status dot: green = done, yellow = in progress, grey = no school. */
export function DayTabs({ days, selected, onSelect, statuses }: DayTabsProps) {
  return (
    <Tabs
      value={selected}
      onChange={(_, value: string) => onSelect(value)}
      variant="fullWidth"
      aria-label="Choose a day"
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      {days.map((day) => {
        const status = statuses[day.date] ?? 'empty';
        return (
          <Tab
            key={day.date}
            value={day.date}
            aria-label={`${fmtWeekdayShort(day.date)} ${parseISODate(day.date).getDate()}${status === 'no-school' ? ', no school' : ''}`}
            sx={{ px: 0.5, py: 1, opacity: status === 'no-school' ? 0.6 : 1 }}
            label={
              <Stack sx={{ alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {fmtWeekdayShort(day.date)}
                </Typography>
                <Typography variant="h3" component="span" sx={{ lineHeight: 1.2 }}>
                  {parseISODate(day.date).getDate()}
                </Typography>
                <Box
                  aria-hidden
                  sx={{
                    mt: 0.5,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: DOT[status],
                    border: status === 'empty' ? `1.5px solid ${CHEVERUS.navy}33` : status === 'partial' ? `1.5px solid ${CHEVERUS.navy}` : 'none',
                  }}
                />
              </Stack>
            }
          />
        );
      })}
    </Tabs>
  );
}
