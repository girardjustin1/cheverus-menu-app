import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { mailtoHref, type EmailDraft } from '../lib/email';
import type { SendMethod } from '../lib/history';
import type { ParentDetails } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';
import { FamilyInfoForm } from './FamilyInfoForm';

export interface EmailDraftCardProps {
  draft: EmailDraft;
  details: ParentDetails;
  onDetailsChange: (patch: Partial<ParentDetails>) => void;
  plannedDays: number;
  schoolDays: number;
  /** Overrides the progress line, e.g. in single-day mode. */
  statusText?: string;
  /** Called when the email is copied or opened in Mail — used to log the order. */
  onSent?: (method: SendMethod) => void;
  /** When given, details show as a summary with an Edit button instead of inline fields. */
  onEditDetails?: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function EmailDraftCard({
  draft,
  details,
  onDetailsChange,
  plannedDays,
  schoolDays,
  statusText,
  onSent,
  onEditDetails,
}: EmailDraftCardProps) {
  const [toast, setToast] = useState<string | null>(null);

  const copy = async (label: string, text: string) => {
    const ok = await copyText(text);
    setToast(ok ? `${label} copied` : 'Copy failed — long-press the text to copy');
  };

  return (
    <Box component="section" id="email" aria-label="Email draft" sx={{ p: 2 }}>
      <Typography variant="overline" color="text.secondary">
        Step 2
      </Typography>
      <Typography variant="h2" component="h2" sx={{ mb: 0.5 }}>
        Draft the email
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {statusText ??
          (plannedDays === schoolDays
            ? `All ${schoolDays} school days are planned.`
            : `${plannedDays} of ${schoolDays} school days fully planned. Days you haven't touched are left out.`)}
      </Typography>

      {onEditDetails ? (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2, p: 1.5, borderRadius: '8px', bgcolor: 'action.hover' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
              For: {[details.childName, details.classroom, details.teacherName].filter(Boolean).join(' · ') || 'not set'}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={onEditDetails} sx={{ flexShrink: 0 }}>
            Edit info
          </Button>
        </Stack>
      ) : (
        <Box sx={{ mb: 2 }}>
          <FamilyInfoForm details={details} onChange={onDetailsChange} />
        </Box>
      )}

      <Card sx={{ bgcolor: '#FFFFFF' }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            SUBJECT
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            {draft.subject}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            MESSAGE
          </Typography>
          <Typography
            component="pre"
            data-testid="email-body"
            sx={{
              m: 0,
              mt: 0.5,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: 14,
              lineHeight: 1.5,
              userSelect: 'text',
            }}
          >
            {draft.body}
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={1} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" onClick={() => copy('Subject', draft.subject)}>
            Copy subject
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<MailOutlineRoundedIcon />}
            href={mailtoHref(draft)}
            onClick={() => onSent?.('mail')}
            sx={{ '&:hover': { bgcolor: CHEVERUS.yellow } }}
          >
            Open in Mail
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={toast !== null}
        autoHideDuration={2200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.startsWith('Copy failed') ? 'warning' : 'success'} variant="filled" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
