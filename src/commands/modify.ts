import { Command } from "commander";
import { runModify } from "../lib/modify-pipeline.js";

export const modifyCommand = new Command("modify")
  .description("Batch modify .rt4 profile settings")
  .option("--vrr <value>", "VRR mode (Off, FreeSync, VESA)")
  .option("--resolution <value>", "Output resolution")
  .option("--hdr <value>", "HDR mode")
  .option("--deep-color <value>", "Deep color")
  .option("--input <value>", "Input source")
  .option("--input-dir <path>", "Input directory")
  .option("--output-dir <path>", "Output directory")
  .option("--file <path>", "Single input file")
  .option("--dry-run", "Preview changes")
  .action(async (options) => {
    const result = await runModify({
      file: options.file,
      inputDir: options.inputDir,
      outputDir: options.outputDir,
      dryRun: options.dryRun,
      vrr: options.vrr,
      resolution: options.resolution,
      hdr: options.hdr,
      deepColor: options.deepColor,
      input: options.input,
    });

    if (result.error) {
      console.error(`Error: ${result.error}`);
    }

    for (const line of result.fileResults ?? []) {
      if (line.changes && line.changes.length > 0) {
        for (const change of line.changes) {
          console.log(
            `[${line.displayPath}] Would set ${change.settingPath}: ${change.oldValue} → ${change.newValue}`,
          );
        }
      } else if (line.success) {
        console.log(`Modified: ${line.displayPath}`);
      } else {
        console.error(`Error processing ${line.displayPath}: ${line.error}`);
      }
    }

    if (result.summary) {
      console.log(result.summary);
    }

    process.exit(result.exitCode);
  });
