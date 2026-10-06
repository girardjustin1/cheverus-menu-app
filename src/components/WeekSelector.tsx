import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef } from 'react';
import type { Week } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export interface WeekProgress {
  done: number;
  total: number;
}

export interface WeekSelectorProps {
  weeks: Week[];
  selected: string;
  onSelect: (monday: string) => void;
  progress?: Record<string, WeekProgress>;
}

/** Horizontally scrolling week pills, Monday-anchored. */
export function WeekSelector({ weeks, selected, onSelect, progress = {} }: WeekSelectorProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [selected]);

  return (
    <Box
      role="tablist"
      aria-label="Choose a week"
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        px: 2,
        py: 1.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {weeks.map((week) => {
        const active = week.monday === selected;
        const p = progress[week.monday];
        return (
          <ButtonBase
            key={week.monday}
            ref={active ? selectedRef : undefined}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(week.monday)}
            sx={{
              flex: '0 0 auto',
              flexDirection: 'column',
              alignItems: 'flex-start',
              px: 1.75,
              py: 1,
              borderRadius: 3,
              border: '2px solid',
              borderColor: active ? 'primary.main' : alpha(CHEVERUS.navy, 0.12),
              bgcolor: active ? 'primary.main' : 'background.paper',
              color: active ? 'primary.contrastText' : 'text.primary',
            }}
          >
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {week.label}
            </Typography>
            {p && (
              <Typography
                variant="caption"
                sx={{ lineHeight: 1.2, color: active ? CHEVERUS.yellow : 'text.secondary', fontWeight: 700 }}
              >
                {p.done === p.total ? 'All set ✓' : `${p.done}/${p.total} days planned`}
              </Typography>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
