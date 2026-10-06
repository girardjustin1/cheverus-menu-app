import { CssBaseline, ThemeProvider } from '@mui/material';
import { LunchPlanner } from './components/LunchPlanner';
import { theme } from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LunchPlanner />
    </ThemeProvider>
  );
}
