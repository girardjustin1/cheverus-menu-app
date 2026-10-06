import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  hint?: string;
  required?: boolean;
  done?: boolean;
  action?: ReactNode;
}

/** "Choose a drink · Required · Select 1" — the pattern from the ordering references. */
export function SectionHeader({ title, hint, required, done, action }: SectionHeaderProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 1, gap: 1 }}>
      <Box>
        <Typography variant="h3" component="h3">
          {title}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25 }}>
          {required && !done && (
            <>
              <WarningAmberRoundedIcon sx={{ fontSize: 15, color: '#9A6B00' }} />
              <Typography variant="caption" sx={{ color: '#9A6B00', fontWeight: 700 }}>
                Required
              </Typography>
            </>
          )}
          {required && done && (
            <>
              <CheckRoundedIcon color="success" sx={{ fontSize: 15 }} />
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                Done
              </Typography>
            </>
          )}
          {!required && (
            <Typography variant="caption" color="text.secondary">
              (Optional)
            </Typography>
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary">
              · {hint}
            </Typography>
          )}
        </Stack>
      </Box>
      {action}
    </Stack>
  );
}
