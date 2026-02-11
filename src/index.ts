#!/usr/bin/env node
import { startTUI } from './tui/index';

(async () => {
  try {
    await startTUI();
  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  }
})();
