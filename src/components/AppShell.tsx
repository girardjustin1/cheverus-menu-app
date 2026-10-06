import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { Alert, Box, Button, Snackbar } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useAccount, type Account } from '../lib/account';
import type { ApiError } from '../lib/api';
import { toISODate } from '../lib/dates';
import { isDraft, useOrderHistory, type OrderRecord } from '../lib/history';
import type { PlanMode, PlanState } from '../lib/plan';
import { usePlan } from '../lib/usePlan';
import { useRouter } from '../lib/router';
import { EnsureRouter } from '../lib/RouterProvider';
import { CHEVERUS, IPHONE_17 } from '../theme/theme';
import { AppHeader } from './AppHeader';
import { AppMenu, type AppView } from './AppMenu';
import type { ProfileSection } from './FamilyInfoForm';
import { Onboarding } from './Onboarding';
import { ProfilePage } from './ProfilePage';
import { Splash } from './Splash';
import { LoginScreen } from './LoginScreen';
import { LunchPlanner } from './LunchPlanner';
import { OrderHistory } from './OrderHistory';

const SHELL_WIDTH = IPHONE_17.width + 28;
const MENU_WIDTH = 296;
const SLIDE = 'transform 260ms cubic-bezier(0.2, 0, 0, 1)';

export interface AppShellProps {
  /**
   * Story fixtures. When given, nothing is read from or written to localStorage.
   * `account: null` shows the login screen.
   */
  fixture?: {
    account?: Account | null;
    plan?: PlanState;
    history?: OrderRecord[];
    mode?: PlanMode;
    view?: AppView;
    menuOpen?: boolean;
    monthId?: string;
    /** Start at a specific deep link instead, e.g. "#/profile/child". */
    route?: string;
  };
  today?: string;
}

function SignedIn({
  account,
  onSignOut,
  onAccountChange,
  fixture,
  today: todayProp,
}: {
  account: Account;
  onSignOut: () => void;
  onAccountChange: (patch: Partial<Account>) => Promise<ApiError | null> | void;
} & AppShellProps) {
  // Real app: data lives in Netlify Database via /api. Stories and the prototype pass fixtures (memory).
  const remote = fixture === undefined;
  const [today] = useState(() => todayProp ?? toISODate(new Date()));
  const planApi = usePlan(remote, fixture?.plan);
  const orders = useOrderHistory(remote, fixture?.history);
  const { history, logOrder, removeOrder } = orders;
  const loaded = planApi.status === 'ready' && orders.status === 'ready';
  const loadFailed = planApi.status === 'error' || orders.status === 'error';
  const { route, navigate: go } = useRouter();
  const view = viewFor(route.path);
  const profileTab: ProfileSection = route.path === '/profile/child' ? 'child' : 'parent';
  const menuOpen = route.params.menu === 'open';
  const setMenuOpen = (open: boolean) => go({ params: { menu: open ? 'open' : undefined }, replace: !open });

  // Remember where you were in the planner, so coming back from Profile or Past orders
  // returns to the same week and day instead of starting over.
  const lastPlanParams = useRef<Record<string, string>>({});
  useEffect(() => {
    if (route.path !== '/plan') return;
    const { modal: _modal, menu: _menu, ...rest } = route.params;
    lastPlanParams.current = rest;
  }, [route]);

  // Sign-up steps always show a real deep link (#/welcome/parent or #/welcome/child).
  const needsOnboarding = loaded && !planApi.plan.onboarded;
  useEffect(() => {
    if (needsOnboarding && !route.path.startsWith('/welcome')) go({ path: '/welcome/parent', replace: true });
  }, [needsOnboarding, route.path, go]);
  const menuRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  // Move focus into the menu when it opens, and back to the hamburger when it closes.
  const wasOpen = useRef(menuOpen);
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>('nav [role="button"], nav a')?.focus();
    else if (wasOpen.current) hamburgerRef.current?.querySelector('button')?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  // New parents fill in Parent info and Child info before planning (`#/welcome/parent|child`).
  if (loadFailed) {
    return (
      <Splash
        error="Couldn't load your plans. Check your connection and try again."
        onRetry={() => {
          if (planApi.status === 'error') planApi.retry();
          if (orders.status === 'error') orders.retry();
        }}
      />
    );
  }
  if (!loaded) return <Splash />;

  if (needsOnboarding) {
    return (
      <Onboarding
        step={route.path === '/welcome/child' ? 'child' : 'parent'}
        onStepChange={(step) => {
          go({ path: `/welcome/${step}` });
          window.scrollTo({ top: 0 });
        }}
        account={account}
        onAccountChange={onAccountChange}
        details={planApi.plan.details}
        onDetailsChange={planApi.updateDetails}
        onFinish={() => {
          planApi.finishOnboarding();
          go({ path: '/plan' });
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  const navigate = (next: AppView, tab?: ProfileSection) => {
    if (next === 'plan') go({ path: '/plan', params: lastPlanParams.current });
    else go({ path: next === 'profile' ? `/profile/${tab ?? profileTab}` : `/${next}` });
    window.scrollTo({ top: 0 });
  };

  return (
    <Box
      onKeyDown={(e) => e.key === 'Escape' && menuOpen && setMenuOpen(false)}
      sx={{
        maxWidth: SHELL_WIDTH,
        mx: 'auto',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        position: 'relative',
        // clip (not hidden) so sticky bars inside still stick to the page scroll.
        overflowX: 'clip',
        '@media (prefers-reduced-motion: reduce)': { '& *': { transition: 'none !important' } },
      }}
    >
      <Box
        component="aside"
        id="app-menu"
        ref={menuRef}
        aria-label="App menu"
        inert={!menuOpen}
        sx={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          // Line up with the centered app column on wide screens.
          left: `max(0px, calc((100vw - ${SHELL_WIDTH}px) / 2))`,
          width: MENU_WIDTH,
          zIndex: 20,
          bgcolor: 'background.paper',
          overflowY: 'auto',
          transform: menuOpen ? 'none' : 'translateX(-100%)',
          visibility: menuOpen ? 'visible' : 'hidden',
          transition: `${SLIDE}, visibility 0s linear ${menuOpen ? '0s' : '260ms'}`,
          boxShadow: menuOpen ? 8 : 0,
        }}
      >
        <AppMenu
          account={account}
          details={planApi.plan.details}
          view={view}
          onNavigate={navigate}
          ordersCount={history.filter((o) => !isDraft(o)).length}
          draftsCount={history.filter(isDraft).length}
          onSignOut={onSignOut}
        />
      </Box>

      {/* Page content. Slides right ("push") while the menu is open. */}
      <Box
        inert={menuOpen}
        sx={{ transform: menuOpen ? `translateX(${MENU_WIDTH}px)` : 'none', transition: SLIDE, minHeight: '100dvh' }}
      >
        <Box ref={hamburgerRef}>
          <AppHeader
            onMenuClick={() => setMenuOpen(true)}
            menuOpen={menuOpen}
            action={
              <Button
                startIcon={<EventNoteRoundedIcon />}
                aria-haspopup="dialog"
                onClick={() =>
                  view === 'plan'
                    ? go({ params: { modal: 'plan', menu: undefined } })
                    : go({ path: '/plan', params: { ...lastPlanParams.current, modal: 'plan' } })
                }
                sx={{ flexShrink: 0, px: 2, color: CHEVERUS.navy, bgcolor: CHEVERUS.yellow, '&:hover': { bgcolor: CHEVERUS.yellow } }}
              >
                Plan
              </Button>
            }
          />
        </Box>

        <Box hidden={view !== 'plan'}>
          <LunchPlanner
            planApi={planApi}
            today={today}
            firstName={account.fullName.split(/\s+/)[0]}
            signOffName={account.fullName}
            onOrderSent={logOrder}
            onEditDetails={() => navigate('profile', 'parent')}
          />
        </Box>

        {view === 'orders' && (
          <OrderHistory
            orders={history}
            onRemove={removeOrder}
            type={route.params.type === 'day' || route.params.type === 'week' ? route.params.type : undefined}
            onTypeChange={(type) => go({ params: { type }, replace: true })}
            week={route.params.week === 'all' ? '' : route.params.week}
            onWeekChange={(week) => go({ params: { week: week || 'all' }, replace: true })}
            today={today}
            onEdit={({ mode, weekMonday, date }) => {
              go({ path: '/plan', params: { mode, week: weekMonday, day: date } });
              window.scrollTo({ top: 0 });
            }}
          />
        )}

        {view === 'profile' && (
          <ProfilePage
            tab={profileTab}
            onTabChange={(tab) => go({ path: `/profile/${tab}`, replace: true })}
            details={planApi.plan.details}
            onDetailsChange={planApi.updateDetails}
            account={account}
            onAccountChange={onAccountChange}
            onDone={() => navigate('plan')}
          />
        )}
      </Box>

      <Snackbar open={planApi.saveError || orders.saveError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" variant="filled" sx={{ width: '100%' }}>
          Couldn't save your latest change. It will retry on your next edit — check your connection.
        </Alert>
      </Snackbar>

      {/* Scrim over the pushed page; tap to close. */}
      <Box
        aria-hidden
        onClick={() => setMenuOpen(false)}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 15,
          bgcolor: 'rgba(16, 1, 63, 0.35)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 260ms',
        }}
      />
    </Box>
  );
}

const viewFor = (path: string): AppView =>
  path.startsWith('/orders') ? 'orders' : path.startsWith('/profile') ? 'profile' : 'plan';

/** Initial deep link for a story fixture. */
function fixtureRoute(fixture: NonNullable<AppShellProps['fixture']>): string {
  if (fixture.route) return fixture.route;
  const path = fixture.view === 'orders' ? '/orders' : fixture.view === 'profile' ? '/profile/parent' : '/plan';
  const params = new URLSearchParams();
  if (fixture.mode) params.set('mode', fixture.mode);
  if (fixture.monthId) params.set('month', fixture.monthId);
  if (fixture.menuOpen) params.set('menu', 'open');
  const query = params.toString();
  return `#${path}${query ? `?${query}` : ''}`;
}

/**
 * Login gate, header (hamburger + Plan), left push menu, and the views. Every screen is a
 * deep link: the app and prototype use the URL hash; stories use an in-memory router.
 */
export function AppShell(props: AppShellProps) {
  return (
    <EnsureRouter initial={props.fixture ? fixtureRoute(props.fixture) : undefined}>
      <AppShellInner {...props} />
    </EnsureRouter>
  );
}

function AppShellInner({ fixture, today }: AppShellProps) {
  const { account, status, retry, session, signIn, signOut, updateAccount } = useAccount(
    fixture ? (fixture.account ?? null) : undefined,
  );
  if (status === 'loading') return <Splash />;
  if (status === 'error') return <Splash error="Couldn't reach the server. Check your connection and try again." onRetry={retry} />;
  if (!account) return <LoginScreen onSignIn={signIn} />;
  // Remount per sign-in session (not per email edit), so each sign-in loads that person's plan.
  return (
    <SignedIn
      key={session}
      account={account}
      onSignOut={signOut}
      onAccountChange={updateAccount}
      fixture={fixture}
      today={today}
    />
  );
}
