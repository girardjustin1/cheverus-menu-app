import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { CHEVERUS } from '../theme/theme';
import { SectionHeader } from './SectionHeader';

export interface CarouselOption<T extends string> {
  value: T;
  title: string;
  overline?: string;
  subtitle?: string;
  emoji?: string;
  badges?: string[];
  /** Diet match shown under the card: ok = green, warn = amber, no = dimmed card. */
  fit?: { tone: 'ok' | 'warn' | 'no'; label: string };
}

const FIT_COLOR = { ok: 'success.main', warn: '#9A6B00', no: 'text.secondary' } as const;

export interface ChoiceCarouselProps<T extends string> {
  title: string;
  hint?: string;
  required?: boolean;
  options: CarouselOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  /** Rendered at the right of the header, e.g. a "Same all week" button. */
  action?: ReactNode;
}

/** Single-select, horizontally scrolling cards with scroll-snap. */
export function ChoiceCarousel<T extends string>({
  title,
  hint,
  required,
  options,
  value,
  onChange,
  action,
}: ChoiceCarouselProps<T>) {
  return (
    <Box component="section" aria-label={title}>
      <SectionHeader title={title} hint={hint} required={required} done={value !== undefined} action={action} />
      <Box
        role="radiogroup"
        aria-label={title}
        sx={{
          display: 'flex',
          gap: 1.25,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: 16,
          px: 2,
          pb: 1,
          mx: -2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <ButtonBase
              key={option.value}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              sx={{
                flex: '0 0 auto',
                width: options.length <= 2 ? 'calc(50% - 5px)' : 168,
                minHeight: 128,
                scrollSnapAlign: 'start',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                textAlign: 'left',
                p: 1.5,
                borderRadius: '8px',
                border: '2px solid',
                borderColor: selected ? 'primary.main' : alpha(CHEVERUS.navy, 0.12),
                bgcolor: selected ? CHEVERUS.yellowSoft : 'background.paper',
                opacity: option.fit?.tone === 'no' && !selected ? 0.55 : 1,
                transition: 'border-color 120ms, background-color 120ms, opacity 120ms',
              }}
            >
              {selected && (
                <CheckCircleRoundedIcon
                  color="primary"
                  sx={{ position: 'absolute', top: 8, right: 8, fontSize: 22 }}
                />
              )}
              {option.emoji && (
                <Box component="span" aria-hidden sx={{ fontSize: 30, lineHeight: 1, mb: 1 }}>
                  {option.emoji}
                </Box>
              )}
              {option.overline && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {option.overline}
                </Typography>
              )}
              <Typography variant="subtitle2" sx={{ lineHeight: 1.25, mt: 0.25 }}>
                {option.title}
              </Typography>
              {option.subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                  {option.subtitle}
                </Typography>
              )}
              {option.badges && option.badges.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 'auto', pt: 1 }}>
                  {option.badges.map((badge) => (
                    <Chip key={badge} label={badge} size="small" color="secondary" sx={{ height: 20, fontSize: 11 }} />
                  ))}
                </Stack>
              )}
              {option.fit && (
                <Typography
                  variant="caption"
                  sx={{ color: FIT_COLOR[option.fit.tone], fontWeight: 700, lineHeight: 1.25, mt: option.badges?.length ? 0.75 : 'auto', pt: option.badges?.length ? 0 : 1 }}
                >
                  {option.fit.tone === 'ok' ? '✓ ' : option.fit.tone === 'warn' ? '⚠ ' : '✕ '}
                  {option.fit.label}
                </Typography>
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
