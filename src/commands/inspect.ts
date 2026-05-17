import { Command } from "commander";
import { RetroTinkProfile } from "rt4k-profile";
import path from "path";
import fs from "fs";

async function findRt4Files(dir: string): Promise<string[]> {
  const result: string[] = [];
  async function recurse(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
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

export const inspectCommand = new Command("inspect")
  .description("Inspect .rt4 profile settings")
  .option("--input-dir <path>", "Input directory")
  .option("--file <path>", "Single input file")
  .option("--pretty", "Pretty-print JSON output (for single file)")
  .action(async (options) => {
    if (!options.inputDir && !options.file) {
      console.error("Error: Must provide --input-dir or --file");
      process.exit(1);
    }

    if (options.file) {
      const filePath = path.resolve(options.file);
      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }
      try {
        const profile = await RetroTinkProfile.build(filePath);
        const json = profile.serializeValues(options.pretty === true);
        console.log(json);
      } catch (err: unknown) {
        console.error(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    } else {
      const dirPath = path.resolve(options.inputDir);
      if (!fs.existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        process.exit(1);
      }
      const files = await findRt4Files(dirPath);
      for (const filePath of files) {
        try {
          const profile = await RetroTinkProfile.build(filePath);
          const settings = JSON.parse(profile.serializeValues(false));
          const relativePath = path.relative(dirPath, filePath);
          const line = JSON.stringify({ file: relativePath, settings });
          console.log(line);
        } catch (err: unknown) {
          console.error(`Error reading ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  });
