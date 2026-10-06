import { Box, Stack, Typography } from '@mui/material';
import type { MenuMonth } from '../data/months';
import { fmtMonthDay, mondayOf, parseISODate, toISODate } from '../lib/dates';

export interface ComingSoonMonthProps {
  month: MenuMonth;
}

/** Placeholder for a month whose menu hasn't been posted — shows where it will go. */
export function ComingSoonMonth({ month }: ComingSoonMonthProps) {
  const mondays: string[] = [];
  for (let d = mondayOf(month.start); d <= month.end; ) {
    mondays.push(d);
    const next = parseISODate(d);
    next.setDate(next.getDate() + 7);
    d = toISODate(next);
  }
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ textAlign: 'center', py: 4, px: 2, border: '2px dashed', borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper' }}>
        <Typography aria-hidden sx={{ fontSize: 44 }}>
          🍂
        </Typography>
        <Typography variant="h2" component="h2">
          {month.label} menu
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Not posted yet. Once it's added, you'll plan these weeks here.
        </Typography>
      </Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3, mb: 1 }}>
        Weeks coming up
      </Typography>
      <Stack spacing={1}>
        {mondays.map((monday) => (
          <Box
            key={monday}
            aria-label={`Week of ${fmtMonthDay(monday)}, menu not posted`}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, minHeight: 56, borderRadius: '8px', bgcolor: 'action.hover' }}
          >
            <Typography variant="subtitle2">Week of {fmtMonthDay(monday)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Menu coming soon
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
