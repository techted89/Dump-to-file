import { test, mock } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import path from 'path';
import { AppState } from '../tui/state';

test('AppState.selectAll', async (t) => {
  await t.test('should select all files and update total tokens', async () => {
    const rootDir = '/root';
    const state = new AppState(rootDir);
    const files = ['file1.txt', 'file2.txt'];

    // Mock fs.stat
    const statMock = mock.method(fs, 'stat', async (filePath: string) => {
      if (filePath.includes('file1.txt')) {
        return { size: 40 } as any; // 10 tokens
      } else if (filePath.includes('file2.txt')) {
        return { size: 100 } as any; // 25 tokens
      }
      throw new Error('File not found');
    });

    await state.selectAll(files);

    assert.strictEqual(state.selectedFiles.size, 2);
    assert.ok(state.selectedFiles.has('file1.txt'));
    assert.ok(state.selectedFiles.has('file2.txt'));
    assert.strictEqual(state.totalTokens, 35);

    statMock.mock.restore();
  });

  await t.test('should clear previous selection when selecting an empty list', async () => {
    const rootDir = '/root';
    const state = new AppState(rootDir);
    state.selectedFiles.add('old.txt');
    state.totalTokens = 100;

    await state.selectAll([]);

    assert.strictEqual(state.selectedFiles.size, 0);
    assert.strictEqual(state.totalTokens, 0);
  });

  await t.test('should handle missing files by assigning 0 tokens', async () => {
    const rootDir = '/root';
    const state = new AppState(rootDir);
    const files = ['exists.txt', 'missing.txt'];

    mock.method(fs, 'stat', async (filePath: string) => {
      if (filePath.includes('exists.txt')) {
        return { size: 12 } as any; // 3 tokens
      }
      throw new Error('File not found');
    });

    await state.selectAll(files);

    assert.strictEqual(state.selectedFiles.size, 2);
    assert.ok(state.selectedFiles.has('exists.txt'));
    assert.ok(state.selectedFiles.has('missing.txt'));
    assert.strictEqual(state.totalTokens, 3);

    mock.restoreAll();
  });
});
