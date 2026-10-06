import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { mailtoHref, type EmailDraft } from '../lib/email';
import type { ParentDetails } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';

export interface EmailDraftCardProps {
  draft: EmailDraft;
  details: ParentDetails;
  onDetailsChange: (patch: Partial<ParentDetails>) => void;
  plannedDays: number;
  schoolDays: number;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function EmailDraftCard({ draft, details, onDetailsChange, plannedDays, schoolDays }: EmailDraftCardProps) {
  const [toast, setToast] = useState<string | null>(null);

  const copy = async (label: string, text: string) => {
    setToast((await copyText(text)) ? `${label} copied` : 'Copy failed — long-press the text to copy');
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
        {plannedDays === schoolDays
          ? `All ${schoolDays} school days are planned.`
          : `${plannedDays} of ${schoolDays} school days fully planned. Days you haven't touched are left out.`}
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          label="Child's name"
          value={details.childName}
          onChange={(e) => onDetailsChange({ childName: e.target.value })}
          size="small"
        />
        <TextField
          label="Grade / classroom"
          placeholder="e.g. Grade 2"
          value={details.classroom}
          onChange={(e) => onDetailsChange({ classroom: e.target.value })}
          size="small"
        />
        <TextField
          label="Your name (sign-off)"
          value={details.parentName}
          onChange={(e) => onDetailsChange({ parentName: e.target.value })}
          size="small"
        />
        <TextField
          label="Send to"
          type="email"
          placeholder="name@example.com"
          value={details.to}
          onChange={(e) => onDetailsChange({ to: e.target.value })}
          size="small"
        />
      </Stack>

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
        <Button
          variant="contained"
          size="large"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={() => copy('Email', draft.body)}
        >
          Copy email
        </Button>
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
