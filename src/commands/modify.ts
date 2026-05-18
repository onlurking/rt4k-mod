import { Command } from "commander";
import { processSingleFile, processDirectory, findRt4FilesInDir } from "../lib/profile-processor.js";
import { getSettingsFromFlags } from "../lib/settings-map.js";
import path from "path";
import fs from "fs";

export const modifyCommand = new Command("modify")
  .description("Batch modify .rt4 profile settings")
  .option("--vrr <value>", "VRR mode (Off, FreeSync, VESA)")
  .option("--input-dir <path>", "Input directory (recursive .rt4 search)")
  .option("--output-dir <path>", "Output directory (required)")
  .option("--file <path>", "Single input file")
  .option("--dry-run", "Preview changes without writing files")
  .action(async (options) => {
    if (!options.inputDir && !options.file) {
      console.error("Error: Must provide --input-dir or --file");
      process.exit(1);
    }

    if (!options.outputDir) {
      console.error("Error: --output-dir is required");
      process.exit(1);
    }

    const rawFlags: Record<string, string | undefined> = {
      "vrr": options.vrr,
    };

    const settingOverrides = getSettingsFromFlags(rawFlags);

    if (settingOverrides.length === 0) {
      console.error("Error: No settings specified. Use --help to see available flags.");
      process.exit(1);
    }

    const settings = settingOverrides.map(({ path, value }) => ({ path, value }));
    const outputDir = path.resolve(options.outputDir);
    const dryRun = options.dryRun === true;

    if (options.inputDir) {
      const resolvedInputDir = path.resolve(options.inputDir);
      const resolvedOutputDir = outputDir;
      if (resolvedOutputDir === resolvedInputDir || resolvedOutputDir.startsWith(resolvedInputDir + path.sep)) {
        console.error("Error: Output directory must differ from and not be inside the input directory.");
        process.exit(1);
      }
    }

    if (options.file) {
      const inputPath = path.resolve(options.file);
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
      }

      const outputPath = path.join(outputDir, path.basename(inputPath));
      if (outputPath === inputPath) {
        console.error("Error: Output directory would overwrite the input file. Use a different --output-dir.");
        process.exit(1);
      }

      const result = await processSingleFile({ inputPath, outputDir, settings, dryRun });

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      if (dryRun) {
        for (const change of result.changes ?? []) {
          console.log(`Would set ${change.settingPath}: ${change.oldValue} → ${change.newValue}`);
        }
      } else {
        console.log(`Modified: ${path.basename(inputPath)} → ${result.outputPath}`);
      }
    } else {
      const inputDirPath = path.resolve(options.inputDir);
      if (!fs.existsSync(inputDirPath)) {
        console.error(`Error: Directory not found: ${inputDirPath}`);
        process.exit(1);
      }

      const files = await findRt4FilesInDir(inputDirPath);
      if (files.length === 0) {
        console.error("Error: No .rt4 files found in the input directory.");
        process.exit(1);
      }

      const batchResult = await processDirectory(inputDirPath, outputDir, settings, dryRun);

      if (dryRun) {
        for (const r of batchResult.results) {
          if (r.success) {
            for (const change of r.changes ?? []) {
              const rel = path.relative(inputDirPath, r.inputPath);
              console.log(`[${rel}] Would set ${change.settingPath}: ${change.oldValue} → ${change.newValue}`);
            }
          }
        }
      } else {
        for (const r of batchResult.results) {
          if (r.success) {
            console.log(`Modified: ${path.relative(inputDirPath, r.inputPath)}`);
          } else {
            console.error(`Error [${path.relative(inputDirPath, r.inputPath)}]: ${r.error}`);
          }
        }
      }

      console.log(`\nSummary: Modified ${batchResult.succeeded}/${batchResult.total} files.${batchResult.failed > 0 ? ` ${batchResult.failed} failed.` : ""}`);

      if (batchResult.failed > 0 && batchResult.succeeded === 0) {
        process.exit(1);
      } else if (batchResult.failed > 0) {
        process.exit(2);
      } else {
        process.exit(0);
      }
    }
  });
