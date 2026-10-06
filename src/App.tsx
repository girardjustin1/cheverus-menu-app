import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppShell } from './components/AppShell';
import { HashRouter } from './lib/RouterProvider';
import { theme } from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppShell />
      </HashRouter>
    </ThemeProvider>
  );
}
