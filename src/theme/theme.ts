import { alpha, createTheme } from '@mui/material/styles';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';

/** Sampled from cheverus-schoolLogo.png. */
export const CHEVERUS = {
  navy: '#19044F',
  navyDeep: '#10013F',
  yellow: '#F4F00E',
  yellowSoft: '#FFFBD1',
  cream: '#FBFAF4',
} as const;

/** Apple HIG minimum touch target, in CSS px. */
export const TOUCH_TARGET = 44;

/** The app fills the screen on every phone (up to the widest Androids); larger screens get a centered column. */
export const APP_MAX_WIDTH = 480;

/** Small phones (iPhone SE / mini, 320–359px wide): tighten layouts that would otherwise wrap or clip. */
export const NARROW = '@media (max-width: 359.98px)';

/** iPhone 17 logical viewport, in CSS px. */
export const IPHONE_17 = { width: 402, height: 874 } as const;

export const theme = createTheme({
  palette: {
    primary: { main: CHEVERUS.navy, dark: CHEVERUS.navyDeep, contrastText: '#FFFFFF' },
    secondary: { main: CHEVERUS.yellow, contrastText: CHEVERUS.navy },
    background: { default: CHEVERUS.cream, paper: '#FFFFFF' },
    text: { primary: '#17112E', secondary: '#5B5670' },
    success: { main: '#2E7D4F' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Nunito", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.25rem', fontWeight: 800 },
    h3: { fontSize: '1.05rem', fontWeight: 800 },
    subtitle1: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
    overline: { fontWeight: 800, letterSpacing: '0.08em' },
  },
  components: {
    MuiTypography: {
      // Subtitles are labels (often inside buttons), not document headings.
      defaultProps: { variantMapping: { subtitle1: 'p', subtitle2: 'p' } },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitTapHighlightColor: 'transparent' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18, minHeight: TOUCH_TARGET },
        sizeLarge: { minHeight: 52, fontSize: '1rem' },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { minHeight: TOUCH_TARGET } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
        // Tappable chips get a full-height target; read-only chips stay compact.
        clickable: { height: TOUCH_TARGET, borderRadius: 999, paddingInline: 4, fontSize: '0.875rem' },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { minHeight: 56 } },
    },
    MuiAccordionSummary: {
      styleOverrides: { root: { minHeight: 56 } },
    },
    MuiFormControlLabel: {
      // The whole label row toggles the control, so make the row the tap target.
      styleOverrides: { root: { minHeight: TOUCH_TARGET, marginLeft: -8 } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderColor: alpha(CHEVERUS.navy, 0.12) } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 700, minWidth: 0 } },
    },
  },
});
