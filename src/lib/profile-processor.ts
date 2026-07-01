import { findRt4FilesInDir } from "./file-utils.js";
import { RetroTinkProfile } from "./rt4k/index.js";
import { getSettingDef, getValidValuesHint } from "./rt4k/schema.js";
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

export async function processSingleFile(
  options: ProcessSingleFileOptions,
): Promise<ProcessResult> {
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

  const changes: Array<{
    settingPath: string;
    oldValue: string;
    newValue: string;
  }> = [];

  for (const { path: settingPath, value } of settings) {
    try {
      const oldValue = profile.getValue(settingPath).asString();
      profile.setValue(settingPath, value);
      changes.push({ settingPath, oldValue, newValue: value });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const def = getSettingDef(settingPath);
      const hint = getValidValuesHint(def);
      const validValuesMsg = hint ? ` Valid values: ${hint}` : "";
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


export async function processDirectory(
  inputDir: string,
  outputDir: string,
  settings: Array<{ path: string; value: string }>,
  dryRun: boolean = false,
  files?: string[],
): Promise<BatchResult> {
  const resolvedFiles = files ?? (await findRt4FilesInDir(inputDir));
  const results: ProcessResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const filePath of resolvedFiles) {
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

  return { total: resolvedFiles.length, succeeded, failed, results };
}
