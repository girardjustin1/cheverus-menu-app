import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Chip } from '@mui/material';
import { foodEmoji } from '../lib/foodEmoji';
import { SectionHeader } from './SectionHeader';

export interface ChipSelectProps {
  title: string;
  hint?: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  /** At most one pick: announces as a radio group. */
  single?: boolean;
}

/** Multi-select chips, e.g. which sides to keep or fruit & veggie bar extras. */
export function ChipSelect({ title, hint, options, selected, onToggle, single }: ChipSelectProps) {
  return (
    <Box component="section" aria-label={title}>
      <SectionHeader title={title} hint={hint} />
      <Box role={single ? 'radiogroup' : 'group'} aria-label={title} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <Chip
              key={option}
              label={`${foodEmoji(option)} ${option}`}
              onClick={() => onToggle(option)}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
              icon={on ? <CheckRoundedIcon /> : undefined}
              {...(single ? { role: 'radio', 'aria-checked': on } : { 'aria-pressed': on })}
            />
          );
        })}
      </Box>
    </Box>
  );
}
