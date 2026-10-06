import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { theme } from '../theme/theme';
import { Prototype } from './Prototype';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Prototype />
    </ThemeProvider>
  </StrictMode>,
);
