import path from "path";
import fs from "fs";

/**
 * Recursively discover all .rt4 files under `dir`, returned sorted by path.
 */
export async function findRt4FilesInDir(dir: string): Promise<string[]> {
  const result: string[] = [];
  async function recurse(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await recurse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".rt4")) {
        result.push(fullPath);
      }
    }
  }
  await recurse(dir);
  return result.sort();
}
