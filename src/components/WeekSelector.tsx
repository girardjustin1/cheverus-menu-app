import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef } from 'react';
import { mondayOf } from '../lib/dates';
import { isPastWeek, type Week } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export interface WeekProgress {
  done: number;
  total: number;
}

export interface WeekSelectorProps {
  weeks: Week[];
  /** Monday of the selected week; '' selects the "All weeks" pill. */
  selected: string;
  onSelect: (monday: string) => void;
  /** ISO date of today: its week is labeled "This week"; finished weeks are greyed out unless `allowPast`. */
  today?: string;
  progress?: Record<string, WeekProgress>;
  /** Custom caption per week (overrides progress), e.g. "1 sent · 1 draft". */
  captions?: Record<string, string>;
  /** Keep past weeks selectable (history, not planning). */
  allowPast?: boolean;
  /** Adds a leading pill that selects '' — e.g. { label: 'All weeks', caption: '3 emails' }. */
  allOption?: { label: string; caption?: string };
  ariaLabel?: string;
}

interface PillProps {
  active: boolean;
  disabled?: boolean;
  title: string;
  caption?: string;
  ariaLabel?: string;
  onClick: () => void;
  pillRef?: React.Ref<HTMLButtonElement>;
}

function Pill({ active, disabled, title, caption, ariaLabel, onClick, pillRef }: PillProps) {
  return (
    <ButtonBase
      ref={pillRef}
      role="tab"
      aria-selected={active}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
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
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
      {caption && (
        <Typography variant="caption" sx={{ lineHeight: 1.2, color: active ? CHEVERUS.yellow : 'text.secondary', fontWeight: 700 }}>
          {caption}
        </Typography>
      )}
    </ButtonBase>
  );
}

/** Horizontally scrolling week pills, Monday-anchored. */
export function WeekSelector({
  weeks,
  selected,
  onSelect,
  progress = {},
  today,
  captions,
  allowPast,
  allOption,
  ariaLabel = 'Choose a week',
}: WeekSelectorProps) {
  const thisMonday = today ? mondayOf(today) : undefined;
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [selected]);

  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
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
      {allOption && (
        <Pill
          active={selected === ''}
          pillRef={selected === '' ? selectedRef : undefined}
          title={allOption.label}
          caption={allOption.caption}
          onClick={() => onSelect('')}
        />
      )}
      {weeks.map((week) => {
        const active = week.monday === selected;
        const p = progress[week.monday];
        const past = !allowPast && today !== undefined && isPastWeek(week, today);
        const title = week.monday === thisMonday ? `This week · ${week.label.replace('Week of ', '')}` : week.label;
        const caption = past
          ? 'Past week'
          : (captions?.[week.monday] ?? (p ? (p.done === p.total ? 'All set ✓' : `${p.done}/${p.total} days planned`) : undefined));
        return (
          <Pill
            key={week.monday}
            active={active}
            disabled={past}
            pillRef={active ? selectedRef : undefined}
            title={title}
            caption={caption}
            ariaLabel={past ? `${week.label}, past week` : undefined}
            onClick={() => onSelect(week.monday)}
          />
        );
      })}
    </Box>
  );
}
