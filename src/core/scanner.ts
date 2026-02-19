import { promises as fs } from 'fs';
import * as path from 'path';
import ignore from 'ignore';
import isBinaryPath from 'is-binary-path';

export interface FileEntry {
  path: string;
  isBinary: boolean;
}

export class CodeScanner {
  private rootDir: string;
  private ig: ReturnType<typeof ignore>;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.ig = ignore();
  }

  async initialize() {
    // Add default exclusions (hardcoded safety)
    this.ig.add(['.git', 'node_modules', '.env', 'dist', 'out', '.d2f_tmp', 'd2f_dump.txt']);

    // Load .gitignore if exists
    try {
      const gitignorePath = path.join(this.rootDir, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');
      this.ig.add(content);
    } catch (e) {
      // No .gitignore or error reading, ignore
    }
  }

  async *getFiles(): AsyncGenerator<FileEntry> {
    yield* this.walk(this.rootDir, '');
  }

  private async *walk(dir: string, relativeDir: string): AsyncGenerator<FileEntry> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      // Sort entries: directories first, then files (alphabetical)
      entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of entries) {
        const relativePath = path.join(relativeDir, entry.name);

        // Check ignore
        // ignore library expects relative paths.
        // For directories, it's safer to ensure it handles them correctly.
        // But ignore() handles 'node_modules' as directory if it matches rule.
        if (this.ig.ignores(relativePath)) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          yield* this.walk(fullPath, relativePath);
        } else {
          yield {
            path: relativePath,
            isBinary: isBinaryPath(entry.name)
          };
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
}
