import { promises as fs } from 'fs';
import path from 'path';

export class AppState {
  selectedFiles: Set<string> = new Set();
  totalTokens: number = 0;
  rootDir: string;
  private tokenCache: Map<string, number> = new Map();

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async toggleFile(filePath: string): Promise<boolean> {
    const isSelected = this.selectedFiles.has(filePath);

    // update tokens
    const tokens = await this.estimateFileTokens(filePath);

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

    // This might be slow if we stat every file sequentially.
    // Optimally, we should parallelize.
    const promises = files.map(async (file) => {
        const tokens = await this.estimateFileTokens(file);
        return tokens;
    });

    const results = await Promise.all(promises);
    this.totalTokens = results.reduce((acc, val) => acc + val, 0);

    files.forEach(f => this.selectedFiles.add(f));
  }

  private async estimateFileTokens(filePath: string): Promise<number> {
    if (this.tokenCache.has(filePath)) {
      return this.tokenCache.get(filePath)!;
    }

    try {
      const fullPath = path.join(this.rootDir, filePath);
      const stats = await fs.stat(fullPath);
      // Heuristic: 1 token ~= 4 bytes
      const tokens = Math.ceil(stats.size / 4);
      this.tokenCache.set(filePath, tokens);
      return tokens;
    } catch (e) {
      return 0;
    }
  }
}
