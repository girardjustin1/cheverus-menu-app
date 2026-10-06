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
}

/** Multi-select chips, e.g. which sides to keep or fruit & veggie bar extras. */
export function ChipSelect({ title, hint, options, selected, onToggle }: ChipSelectProps) {
  return (
    <Box component="section" aria-label={title}>
      <SectionHeader title={title} hint={hint} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
              aria-pressed={on}
            />
          );
        })}
      </Box>
    </Box>
  );
}
