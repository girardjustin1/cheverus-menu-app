/// <reference types="vitest/config" />
import netlify from '@netlify/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = import.meta.dirname;

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
// Netlify emulation (functions under /api, Netlify Database) for the app's dev server only —
// not for Storybook or the test runners, which use in-memory fixtures.
const npmScript = process.env.npm_lifecycle_event ?? '';
const withNetlify = ['dev', 'prototype', 'preview'].includes(npmScript);

export default defineConfig({
  // No edge functions in this app, so skip the Deno-based edge emulator.
  plugins: [react(), ...(withNetlify ? [netlify({ edgeFunctions: { enabled: false } })] : [])],
  build: {
    // Ship the click-through prototype alongside the app.
    rollupOptions: {
      input: {
        main: path.join(dirname, 'index.html'),
        prototype: path.join(dirname, 'prototype.html'),
      },
    },
  },
  test: {
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        include: ['src/**/*.test.ts'],
        environment: 'node',
      },
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});