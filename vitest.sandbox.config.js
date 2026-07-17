import { mergeConfig } from 'vitest/config';
import base from './src/vitest.config.js';

export default mergeConfig(base, {
  server: { host: '127.0.0.1', hmr: false, watch: false },
  preview: { host: '127.0.0.1' },
});