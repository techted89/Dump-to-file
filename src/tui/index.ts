import { CodeScanner } from '../core/scanner';
import { SnapshotFormatter } from '../exporters/formatter';
import { AppState } from './state';
import { createLayout } from './layout';
import path from 'path';

export async function startTUI() {
  const rootDir = process.cwd();

  // Initialize Layout
  const layout = createLayout();
  layout.statusBox.setContent('{center}Initializing Scanner...{/center}');
  layout.screen.render();

  const scanner = new CodeScanner(rootDir);
  await scanner.initialize();

  const state = new AppState(rootDir);

  const files: string[] = [];

  // Helper for sensitive files
  const isSensitive = (file: string) => {
    const name = path.basename(file).toLowerCase();
    return name.startsWith('.env') ||
           name.endsWith('.pem') ||
           name.endsWith('.key') ||
           name.includes('secret');
  };

  layout.statusBox.setContent('{center}Scanning files...{/center}');
  layout.screen.render();

  // Load files
  try {
    for await (const file of scanner.getFiles()) {
      files.push(file.path);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    layout.statusBox.setContent(`{center}{red-fg}Error: ${message}{/red-fg}{/center}`);
    layout.screen.render();
    return;
  }

  function formatItem(file: string, selected: boolean): string {
    const sensitive = isSensitive(file);
    const check = selected ? '[X]' : '[ ]';
    const line = `${check} ${file}`;
    if (sensitive) {
      return `{red-fg}{bold}${line} (Sensitive){/}`;
    }
    return line;
  }

  function updateList() {
    const items = files.map(f => formatItem(f, state.selectedFiles.has(f)));
    layout.fileList.setItems(items);
    layout.screen.render();
  }

  function updateStatus() {
    const count = state.selectedFiles.size;
    const tokens = state.totalTokens;
    let color = '{green-fg}';
    if (tokens > 100000) color = '{yellow-fg}';
    if (tokens > 200000) color = '{red-fg}';

    layout.statusBox.setContent(
      `{center}Files: ${count} | Est. Tokens: ${color}${tokens.toLocaleString()}{/}{/center}`
    );
    layout.screen.render();
  }

  // Initial render
  updateList();
  updateStatus();
  layout.fileList.focus();

  // --- Events ---

  // Throttled update status
  let updateTimeout: NodeJS.Timeout | null = null;
  function scheduleUpdateStatus() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateStatus, 100);
  }

  // Toggle Selection (Space)
  layout.fileList.key(['space'], async () => {
    const index = layout.fileList.selected;
    const file = files[index];
    if (!file) return;

    // Safety check
    if (isSensitive(file)) {
      layout.statusBox.setContent('{center}{red-fg}{bold}Cannot select sensitive file!{/bold}{/red-fg}{/center}');
      layout.screen.render();
      // Restore status after delay
      setTimeout(scheduleUpdateStatus, 1500);
      return;
    }

    // Toggle
    await state.toggleFile(file);

    // Update specific item (optimization)
    const display = formatItem(file, state.selectedFiles.has(file));
    layout.fileList.setItem(index, display);

    scheduleUpdateStatus();
    layout.screen.render();
  });

  // Select All (A)
  layout.screen.key(['a'], async () => {
    layout.statusBox.setContent('{center}Selecting all...{/center}');
    layout.screen.render();

    // Filter out sensitive files from Select All
    const safeFiles = files.filter(f => !isSensitive(f));
    await state.selectAll(safeFiles);

    updateList();
    updateStatus();
  });

  // Dump (Enter) - Handle both screen and list events
  const handleDump = () => {
    if (state.selectedFiles.size === 0) {
      layout.statusBox.setContent('{center}{red-fg}No files selected!{/red-fg}{/center}');
      layout.screen.render();
      setTimeout(updateStatus, 2000);
      return;
    }

    layout.statusBox.setContent('{center}Generating Snapshot...{/center}');
    layout.screen.render();

    // Use setTimeout to allow UI update
    setTimeout(async () => {
      try {
        const selectedList = Array.from(state.selectedFiles).sort();
        await SnapshotFormatter.generateSnapshot(rootDir, selectedList);
        layout.statusBox.setContent('{center}{green-fg}Snapshot Saved to d2f_dump.txt!{/green-fg}{/center}');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        layout.statusBox.setContent(`{center}{red-fg}Error: ${message}{/red-fg}{/center}`);
      }
      layout.screen.render();
      setTimeout(updateStatus, 3000);
    }, 50);
  };

  layout.screen.key(['enter'], handleDump);
  layout.fileList.key(['enter'], handleDump);

  // Quit (Q, C-c)
  layout.screen.key(['q', 'C-c'], () => {
    return process.exit(0);
  });
}
