import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react-vite';
import { IPHONE_17, theme } from '../src/theme/theme';

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {context.parameters.layout === 'fullscreen' ? (
          <Story />
        ) : (
          <Box sx={{ p: 2, maxWidth: IPHONE_17.width, mx: 'auto' }}>
            <Story />
          </Box>
        )}
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        iphone17: {
          name: 'iPhone 17',
          styles: { width: `${IPHONE_17.width}px`, height: `${IPHONE_17.height}px` },
          type: 'mobile',
        },
        iphone17ProMax: {
          name: 'iPhone 17 Pro Max',
          styles: { width: '440px', height: '956px' },
          type: 'mobile',
        },
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: 'todo',
    },
  },
  initialGlobals: {
    viewport: { value: 'iphone17', isRotated: false },
  },
};

export default preview;
