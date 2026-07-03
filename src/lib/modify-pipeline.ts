import path from "path";
import fs from "fs";
import { getSettingsFromFlags } from "./rt4k/schema.js";
import {
  processSingleFile,
  processDirectory,
  type ProcessResult,
} from "./profile-processor.js";
import { findRt4FilesInDir } from "./file-utils.js";

export interface ModifyPipelineInput {
  file?: string;
  inputDir?: string;
  outputDir: string;
  dryRun?: boolean;
  vrr?: string;
  resolution?: string;
  hdr?: string;
  deepColor?: string;
  input?: string;
  scalingMode?: string;
  rotation?: string;
  autoRotate?: string;
  autoCrop?: string;
  crop240pTop?: string;
  crop240pBottom?: string;
  crop240pLeft?: string;
  crop240pRight?: string;
  crop480iTop?: string;
  crop480iBottom?: string;
  crop480iLeft?: string;
  crop480iRight?: string;
}

export interface ValidatedConfig {
  mode: "file" | "directory";
  outputDir: string;
  settings: Array<{ path: string; value: string }>;
  dryRun: boolean;
  inputPath?: string;
  inputDir?: string;
}

export interface PipelineResult {
  exitCode: 0 | 1 | 2;
  error?: string;
  fileResults?: FileOutputLine[];
  summary?: string;
}

export interface FileOutputLine {
  displayPath: string;
  success: boolean;
  error?: string;
  changes?: Array<{ settingPath: string; oldValue: string; newValue: string }>;
}

class PipelineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipelineError";
  }
}

export function isOutputInsideInput(
  inputDir: string,
  outputDir: string,
): boolean {
  return (
    outputDir === inputDir ||
    outputDir.startsWith(inputDir + path.sep)
  );
}

function validate(input: ModifyPipelineInput): ValidatedConfig {
  if (!input.file && !input.inputDir) {
    throw new PipelineError(
      "Must provide --input-dir or --file",
    );
  }

  if (!input.outputDir) {
    throw new PipelineError("--output-dir is required");
  }

  const rawFlags: Record<string, string | undefined> = {
    vrr: input.vrr,
    resolution: input.resolution,
    hdr: input.hdr,
    "deep-color": input.deepColor,
    input: input.input,
    "scaling-mode": input.scalingMode,
    rotation: input.rotation,
    "auto-rotate": input.autoRotate,
    "auto-crop": input.autoCrop,
    "crop-240p-top": input.crop240pTop,
    "crop-240p-bottom": input.crop240pBottom,
    "crop-240p-left": input.crop240pLeft,
    "crop-240p-right": input.crop240pRight,
    "crop-480i-top": input.crop480iTop,
    "crop-480i-bottom": input.crop480iBottom,
    "crop-480i-left": input.crop480iLeft,
    "crop-480i-right": input.crop480iRight,
  };

  const settingOverrides = getSettingsFromFlags(rawFlags);

  if (settingOverrides.length === 0) {
    throw new PipelineError(
      "No settings specified. Use --help to see available flags.",
    );
  }

  const settings = settingOverrides.map(({ path: p, value }) => ({
    path: p,
    value,
  }));
  const outputDir = path.resolve(input.outputDir);
  const dryRun = input.dryRun === true;

  return {
    mode: input.file ? "file" : "directory",
    outputDir,
    settings,
    dryRun,
    inputPath: input.file ? path.resolve(input.file) : undefined,
    inputDir: input.inputDir ? path.resolve(input.inputDir) : undefined,
  };
}

function checkSafety(config: ValidatedConfig): void {
  if (config.mode === "directory") {
    const inputDir = config.inputDir!;
    const outputDir = config.outputDir;
    if (isOutputInsideInput(inputDir, outputDir)) {
      throw new PipelineError(
        "Output directory must differ from and not be inside the input directory.",
      );
    }
  } else {
    const inputPath = config.inputPath!;
    if (!fs.existsSync(inputPath)) {
      throw new PipelineError(`File not found: ${inputPath}`);
    }
    const outputPath = path.join(config.outputDir, path.basename(inputPath));
    if (outputPath === inputPath) {
      throw new PipelineError(
        "Output directory would overwrite the input file. Use a different --output-dir.",
      );
    }
  }
}

interface ExecuteResult {
  results: ProcessResult[];
  succeeded: number;
  failed: number;
  total: number;
}

async function execute(config: ValidatedConfig): Promise<ExecuteResult> {
  if (config.mode === "file") {
    const result = await processSingleFile({
      inputPath: config.inputPath!,
      outputDir: config.outputDir,
      settings: config.settings,
      dryRun: config.dryRun,
    });
    return {
      results: [result],
      succeeded: result.success ? 1 : 0,
      failed: result.success ? 0 : 1,
      total: 1,
    };
  }

  const inputDir = config.inputDir!;
  if (!fs.existsSync(inputDir)) {
    throw new PipelineError(`Directory not found: ${inputDir}`);
  }

  const files = await findRt4FilesInDir(inputDir);
  if (files.length === 0) {
    throw new PipelineError("No .rt4 files found in the input directory.");
  }

  return processDirectory(
    inputDir,
    config.outputDir,
    config.settings,
    config.dryRun,
    files,
  );
}

function formatResults(
  config: ValidatedConfig,
  execResult: ExecuteResult,
): PipelineResult {
  const fileResults: FileOutputLine[] = execResult.results.map(
    (r: ProcessResult) => ({
      displayPath:
        config.mode === "directory"
          ? path.relative(config.inputDir!, r.inputPath)
          : path.basename(r.inputPath),
      success: r.success,
      error: r.error,
      changes: r.changes,
    }),
  );

  let exitCode: 0 | 1 | 2;
  if (execResult.failed === 0) {
    exitCode = 0;
  } else if (execResult.succeeded === 0) {
    exitCode = 1;
  } else {
    exitCode = 2;
  }

  let summary: string | undefined;
  if (config.mode === "directory") {
    summary = `\nSummary: Modified ${execResult.succeeded}/${execResult.total} files.${execResult.failed > 0 ? ` ${execResult.failed} failed.` : ""}`;
  }

  return { exitCode, fileResults, summary };
}

export async function runModify(
  input: ModifyPipelineInput,
): Promise<PipelineResult> {
  let config: ValidatedConfig;
  try {
    config = validate(input);
  } catch (err) {
    if (err instanceof PipelineError) {
      return { exitCode: 1, error: err.message };
    }
    throw err;
  }

  try {
    checkSafety(config);
  } catch (err) {
    if (err instanceof PipelineError) {
      return { exitCode: 1, error: err.message };
    }
    throw err;
  }

  let execResult: ExecuteResult;
  try {
    execResult = await execute(config);
  } catch (err) {
    if (err instanceof PipelineError) {
      return { exitCode: 1, error: err.message };
    }
    throw err;
  }

  return formatResults(config, execResult);
}
