import { RetroTinkProfile } from "rt4k-profile";
import { SETTINGS_MAP } from "./settings-map.js";
import path from "path";
import fs from "fs";

export interface ProcessSingleFileOptions {
  inputPath: string;
  outputDir: string;
  settings: Array<{ path: string; value: string }>;
  dryRun?: boolean;
}

export interface ProcessResult {
  success: boolean;
  inputPath: string;
  outputPath: string;
  error?: string;
  changes?: Array<{ settingPath: string; oldValue: string; newValue: string }>;
}

export async function processSingleFile(options: ProcessSingleFileOptions): Promise<ProcessResult> {
  const { inputPath, outputDir, settings, dryRun = false } = options;
  const filename = path.basename(inputPath);
  const outputPath = path.join(outputDir, filename);

  let profile: RetroTinkProfile;
  try {
    profile = await RetroTinkProfile.build(inputPath);
  } catch (err: unknown) {
    return {
      success: false,
      inputPath,
      outputPath,
      error: `Failed to load: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const changes: Array<{ settingPath: string; oldValue: string; newValue: string }> = [];

  for (const { path: settingPath, value } of settings) {
    try {
      const oldValue = profile.getValue(settingPath).asString();
      profile.setValue(settingPath, value);
      changes.push({ settingPath, oldValue, newValue: value });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const entry = SETTINGS_MAP.find((e) => e.settingPath === settingPath);
      const validValuesMsg =
        entry?.validValues ? ` Valid values: ${entry.validValues.join(", ")}` : "";
      return {
        success: false,
        inputPath,
        outputPath,
        error: `${errMsg}${validValuesMsg}`,
        changes,
      };
    }
  }

  if (!dryRun) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      await profile.save(outputPath);
    } catch (err: unknown) {
      return {
        success: false,
        inputPath,
        outputPath,
        error: `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return { success: true, inputPath, outputPath, changes };
}

export interface BatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: ProcessResult[];
}

export async function findRt4FilesInDir(dir: string): Promise<string[]> {
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

export async function processDirectory(
  inputDir: string,
  outputDir: string,
  settings: Array<{ path: string; value: string }>,
  dryRun: boolean = false
): Promise<BatchResult> {
  const files = await findRt4FilesInDir(inputDir);
  const results: ProcessResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const filePath of files) {
    const relativePath = path.relative(inputDir, filePath);
    const fileOutputDir = path.join(outputDir, path.dirname(relativePath));
    const result = await processSingleFile({
      inputPath: filePath,
      outputDir: fileOutputDir,
      settings,
      dryRun,
    });
    results.push(result);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return { total: files.length, succeeded, failed, results };
}
