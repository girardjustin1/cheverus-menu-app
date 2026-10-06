import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import { MENU_MONTHS, monthOf } from '../data/months';
import { fmtLongDate, fmtMonthDay, fmtWeekdayShort, mondayOf, parseISODate, toISODate } from '../lib/dates';
import { dailyItems, isDraft, orderType, type DailyEmailItem, type OrderMethod, type OrderRecord } from '../lib/history';
import { groupWeeks, type PlanMode } from '../lib/plan';
import { CHEVERUS } from '../theme/theme';
import { WeekSelector } from './WeekSelector';

export interface OrderHistoryProps {
  orders: OrderRecord[];
  onRemove?: (id: string) => void;
  /** Weekly emails, or single-day emails (weekly ones split per day). Defaults to the newest order's type. */
  type?: PlanMode;
  onTypeChange?: (type: PlanMode) => void;
  /** Monday of the week to show; '' = all weeks. Defaults to this week when it has emails, else all. */
  week?: string;
  onWeekChange?: (monday: string) => void;
  /** Reopen an email's week (weekly) or day (daily) in the planner. */
  onEdit?: (target: { mode: PlanMode; weekMonday: string; date?: string }) => void;
  today?: string;
}

const ALL_WEEKS = MENU_MONTHS.flatMap((m) => groupWeeks(m.days));

const fmtSentAt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function tally(items: { method: OrderMethod }[]) {
  const drafts = items.filter(isDraft).length;
  const sent = items.length - drafts;
  return [sent ? `${sent} sent` : '', drafts ? plural(drafts, 'draft', 'drafts') : ''].filter(Boolean).join(' · ');
}

/** The email itself: subject and body, as it will be sent. */
function EmailPreview({ subject, body }: { subject: string; body: string }) {
  return (
    <Box sx={{ p: 1.5, mb: 2, borderRadius: '8px', bgcolor: alpha(CHEVERUS.navy, 0.04), border: `1px solid ${alpha(CHEVERUS.navy, 0.08)}` }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        SUBJECT
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {subject}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        MESSAGE
      </Typography>
      <Typography component="pre" sx={{ m: 0, mt: 0.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, userSelect: 'text' }}>
        {body}
      </Typography>
    </Box>
  );
}

/** What was ordered, day by day — for sent weekly emails. */
function DaySummary({ order }: { order: OrderRecord }) {
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {order.days.map((d) => (
        <Box key={d.date} sx={{ display: 'flex', gap: 1.5 }}>
          <Box sx={{ width: 40, flexShrink: 0, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
              {fmtWeekdayShort(d.date)}
            </Typography>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {parseISODate(d.date).getDate()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {d.lunch ?? 'Lunch not set'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {[d.drink, d.edp].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

function OrderCard({
  title,
  method,
  sentAt,
  extraChip,
  children,
  actions,
}: {
  title: string;
  method: OrderMethod;
  sentAt: string;
  extraChip?: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const draft = method === 'draft';
  return (
    <Accordion disableGutters sx={{ borderRadius: '8px', '&::before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2">{title}</Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.25, flexWrap: 'wrap', rowGap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {draft ? 'Saved' : 'Sent'} {fmtSentAt(sentAt)}
            </Typography>
            <Chip
              size="small"
              label={draft ? 'Draft' : method === 'mail' ? 'Mail' : 'Copied'}
              color={draft ? 'secondary' : 'default'}
              sx={{ height: 20, fontSize: 11 }}
            />
            {extraChip && <Chip size="small" variant="outlined" label={extraChip} sx={{ height: 20, fontSize: 11 }} />}
          </Stack>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        <Stack direction="row" spacing={1}>
          {actions}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/** Drafts and sent emails, newest first. A week carousel and a Weekly / Daily toggle filter them. */
export function OrderHistory({
  orders,
  onRemove,
  type: typeProp,
  onTypeChange,
  week: weekProp,
  onWeekChange,
  onEdit,
  today: todayProp,
}: OrderHistoryProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [today] = useState(() => todayProp ?? toISODate(new Date()));
  const thisMonday = mondayOf(today);
  const [ownType, setOwnType] = useState<PlanMode>();
  const [ownWeek, setOwnWeek] = useState<string>();
  const daily = useMemo(() => dailyItems(orders), [orders]);

  const type = typeProp ?? ownType ?? (orders[0] ? orderType(orders[0]) : 'week');
  const week = weekProp ?? ownWeek ?? (orders.some((o) => o.weekMonday === thisMonday) ? thisMonday : '');
  const setType = (next: PlanMode) => {
    setOwnType(next);
    onTypeChange?.(next);
  };
  const setWeek = (next: string) => {
    setOwnWeek(next);
    onWeekChange?.(next);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('Email copied');
    } catch {
      setToast('Copy failed — open the email and long-press the text');
    }
  };

  if (orders.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          Past orders
        </Typography>
        <Box sx={{ textAlign: 'center', py: 6, px: 3, border: '2px dashed', borderColor: 'divider', borderRadius: '8px' }}>
          <Typography aria-hidden sx={{ fontSize: 44 }}>
            🧾
          </Typography>
          <Typography variant="h3" component="p">
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Save a draft or copy an email and it shows up here, so you can pick up where you left off or resend it.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Week carousel captions: what's saved or sent for each week.
  const captions: Record<string, string> = {};
  for (const w of ALL_WEEKS) captions[w.monday] = tally(orders.filter((o) => o.weekMonday === w.monday)) || 'Nothing yet';

  const inWeek = <T extends { weekMonday: string }>(items: T[]) => (week ? items.filter((i) => i.weekMonday === week) : items);
  const weekly = inWeek(orders.filter((o) => orderType(o) === 'week'));
  const days = inWeek(daily);
  const shown: { method: OrderMethod }[] = type === 'week' ? weekly : days;

  const weekLabel = week ? (week === thisMonday ? 'this week' : `the week of ${fmtMonthDay(week)}`) : 'any week';

  return (
    <Box>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="h2" component="h2">
          Past orders
        </Typography>
      </Box>

      <WeekSelector
        weeks={ALL_WEEKS}
        selected={week}
        onSelect={setWeek}
        today={today}
        captions={captions}
        allowPast
        allOption={{ label: 'All weeks', caption: tally(orders) }}
        ariaLabel="Choose a week of orders"
      />

      <Box sx={{ px: 2 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={type}
          onChange={(_, next: PlanMode | null) => next && setType(next)}
          aria-label="Show weekly or daily emails"
          sx={{
            mb: 1,
            bgcolor: alpha(CHEVERUS.navy, 0.06),
            borderRadius: '10px',
            p: 0.5,
            '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '8px !important', fontWeight: 700 },
            '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
              bgcolor: CHEVERUS.navy,
              color: '#FFFFFF',
            },
          }}
        >
          <ToggleButton value="week">🗓️ Weekly · {weekly.length}</ToggleButton>
          <ToggleButton value="day">☀️ Daily · {days.length}</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {shown.length === 0
            ? `No ${type === 'week' ? 'weekly' : 'daily'} emails for ${weekLabel} yet.`
            : type === 'day'
              ? `${tally(shown)} · each day can be sent on its own`
              : `${tally(shown)} for ${weekLabel}`}
        </Typography>

        {type === 'week' ? (
          <WeeklyList
            orders={weekly}
            onCopy={copy}
            onRemove={onRemove}
            onEdit={onEdit && ((o) => onEdit({ mode: 'week', weekMonday: o.weekMonday }))}
          />
        ) : (
          <DailyList
            items={days}
            onCopy={copy}
            onRemove={onRemove}
            onEdit={onEdit && ((i) => onEdit({ mode: 'day', weekMonday: i.weekMonday, date: i.date }))}
          />
        )}
      </Box>

      <Snackbar open={toast !== null} autoHideDuration={2200} onClose={() => setToast(null)}>
        <Alert severity={toast?.startsWith('Copy failed') ? 'warning' : 'success'} variant="filled" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

/** Weekly emails: drafts first (shown as the email), then sent ones by menu month (shown as a day summary). */
function WeeklyList({
  orders,
  onCopy,
  onRemove,
  onEdit,
}: {
  orders: OrderRecord[];
  onCopy: (text: string) => void;
  onRemove?: (id: string) => void;
  onEdit?: (order: OrderRecord) => void;
}) {
  const groups = new Map<string, OrderRecord[]>();
  const drafts = orders.filter(isDraft);
  if (drafts.length) groups.set('Drafts', drafts);
  for (const o of orders.filter((x) => !isDraft(x))) {
    const label = monthOf(o.weekMonday, MENU_MONTHS)?.label ?? 'Other';
    groups.set(label, [...(groups.get(label) ?? []), o]);
  }
  return (
    <>
      {[...groups.entries()].map(([label, group]) => (
        <Group key={label} label={label}>
          {group.map((o) => (
            <OrderCard
              key={o.id}
              title={`Week of ${fmtMonthDay(o.weekMonday)}${o.childName ? ` · ${o.childName}` : ''}`}
              method={o.method}
              sentAt={o.sentAt}
              actions={
                <>
                  <Button fullWidth variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={() => onCopy(o.body)}>
                    {isDraft(o) ? 'Copy email' : 'Copy again'}
                  </Button>
                  {isDraft(o) && onEdit && (
                    <Button fullWidth variant="contained" startIcon={<EditRoundedIcon />} onClick={() => onEdit(o)}>
                      Edit in planner
                    </Button>
                  )}
                  {onRemove && (
                    <IconButton aria-label={isDraft(o) ? 'Delete this draft' : 'Delete this order'} onClick={() => onRemove(o.id)}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  )}
                </>
              }
            >
              {isDraft(o) ? <EmailPreview subject={o.subject} body={o.body} /> : <DaySummary order={o} />}
            </OrderCard>
          ))}
        </Group>
      ))}
    </>
  );
}

/** Daily emails: single-day orders plus each day of every weekly email, drafts first, by date. */
function DailyList({
  items,
  onCopy,
  onRemove,
  onEdit,
}: {
  items: DailyEmailItem[];
  onCopy: (text: string) => void;
  onRemove?: (id: string) => void;
  onEdit?: (item: DailyEmailItem) => void;
}) {
  const drafts = items.filter(isDraft);
  const sent = items.filter((i) => !isDraft(i));
  const card = (i: DailyEmailItem) => (
    <OrderCard
      key={i.key}
      title={`${fmtLongDate(i.date)}${i.childName ? ` · ${i.childName}` : ''}`}
      method={i.method}
      sentAt={i.sentAt}
      extraChip={i.source === 'week' ? 'From weekly email' : undefined}
      actions={
        <>
          <Button fullWidth variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={() => onCopy(i.body)}>
            Copy email
          </Button>
          {onEdit && (
            <Button fullWidth variant="contained" startIcon={<EditRoundedIcon />} onClick={() => onEdit(i)}>
              Edit day
            </Button>
          )}
          {/* Days split from a weekly email are deleted with that weekly email. */}
          {onRemove && i.source === 'day' && (
            <IconButton aria-label="Delete this email" onClick={() => onRemove(i.orderId)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          )}
        </>
      }
    >
      <EmailPreview subject={i.subject} body={i.body} />
    </OrderCard>
  );
  return (
    <>
      {drafts.length > 0 && <Group label="Drafts">{drafts.map(card)}</Group>}
      {sent.length > 0 && <Group label="Sent">{sent.map(card)}</Group>}
    </>
  );
}
