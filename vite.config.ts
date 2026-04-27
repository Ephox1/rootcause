import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production builds are served at https://ephox1.github.io/rootcause/, so
// emit a base path that puts assets and the <base> tag under that prefix.
// Dev still serves at /, so the dev server stays at root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/rootcause/' : '/',
}));
