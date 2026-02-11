import blessed from 'neo-blessed';
import { Widgets } from 'blessed';

export interface TUILayout {
  screen: Widgets.Screen;
  fileList: Widgets.ListElement;
  statusBox: Widgets.BoxElement;
}

export function createLayout(): TUILayout {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Dump-to-File (D2F)',
    dockBorders: true,
    fullUnicode: true,
    // Mobile optimization: ensure input is handled correctly
    input: process.stdin,
    output: process.stdout,
    terminal: process.env.TERM || 'xterm-256color'
  });

  // Mobile optimization: raw mode handling is done by blessed usually.

  const fileList = blessed.list({
    top: 0,
    left: 0,
    width: '100%',
    height: '80%',
    label: ' Files (Space: Toggle, A: All, Enter: Dump, Q: Quit) ',
    border: { type: 'line' },
    style: {
      selected: { bg: 'blue', fg: 'white' },
      border: { fg: 'cyan' },
      item: { hover: { bg: 'blue' } }
    },
    keys: true,
    vi: true,
    mouse: true,
    tags: true,
    scrollable: true,
    scrollbar: {
      ch: ' '
    }
  });

  const statusBox = blessed.box({
    top: '80%',
    left: 0,
    width: '100%',
    height: '20%',
    label: ' Status ',
    border: { type: 'line' },
    content: '{center}Initializing...{/center}',
    tags: true,
    style: {
      border: { fg: 'green' }
    }
  });

  screen.append(fileList);
  screen.append(statusBox);

  return { screen, fileList, statusBox };
}
