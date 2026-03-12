import { promises as fs } from 'fs';
import path from 'path';

export class AppState {
  selectedFiles: Set<string> = new Set();
  totalTokens: number = 0;
  rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async toggleFile(filePath: string): Promise<boolean> {
    const isSelected = this.selectedFiles.has(filePath);
<<<<<<< HEAD

    // update tokens
    const tokens = await this.estimateFileTokens(filePath);

=======

    // update tokens
    const tokens = await this.estimateFileTokens(filePath);

>>>>>>> origin/main
    if (isSelected) {
      this.selectedFiles.delete(filePath);
      this.totalTokens -= tokens;
    } else {
      this.selectedFiles.add(filePath);
      this.totalTokens += tokens;
    }

    return !isSelected;
  }

  async selectAll(files: string[]) {
    this.selectedFiles.clear();
    this.totalTokens = 0;
<<<<<<< HEAD

=======

>>>>>>> origin/main
    // This might be slow if we stat every file sequentially.
    // Optimally, we should parallelize.
    const promises = files.map(async (file) => {
        const tokens = await this.estimateFileTokens(file);
        return tokens;
    });
<<<<<<< HEAD

    const results = await Promise.all(promises);
    this.totalTokens = results.reduce((acc, val) => acc + val, 0);

    files.forEach(f => this.selectedFiles.add(f));
  }

  clearSelection() {
    this.selectedFiles.clear();
    this.totalTokens = 0;
  }
=======

    const results = await Promise.all(promises);
    this.totalTokens = results.reduce((acc, val) => acc + val, 0);

    files.forEach(f => this.selectedFiles.add(f));
  }
>>>>>>> origin/main

  private async estimateFileTokens(filePath: string): Promise<number> {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      const stats = await fs.stat(fullPath);
      // Heuristic: 1 token ~= 4 bytes
      return Math.ceil(stats.size / 4);
    } catch (e) {
      return 0;
    }
  }
}
