import { Command } from "commander";
import { runModify } from "../lib/modify-pipeline.js";

export const modifyCommand = new Command("modify")
  .description("Batch modify .rt4 profile settings")
  .option("--vrr <value>", "VRR mode (Off, FreeSync, VESA)")
  .option("--resolution <value>", "Output resolution")
  .option("--hdr <value>", "HDR mode")
  .option("--deep-color <value>", "Deep color")
  .option("--input <value>", "Input source")
  .option("--scaling-mode <value>", "Scaling mode (Auto Fill, Proportional, Free Form, Auto Fill Integer)")
  .option("--rotation <value>", "Output rotation (None, Right 90, Left 90)")
  .option("--auto-rotate <value>", "Auto rotate (On, Off)")
  .option("--auto-crop <value>", "Auto crop (Off, On)")
  .option("--crop-240p-top <value>", "240p manual crop top (-32768 to 32767)")
  .option("--crop-240p-bottom <value>", "240p manual crop bottom (-32768 to 32767)")
  .option("--crop-240p-left <value>", "240p manual crop left (-32768 to 32767)")
  .option("--crop-240p-right <value>", "240p manual crop right (-32768 to 32767)")
  .option("--crop-480i-top <value>", "480i manual crop top (-32768 to 32767)")
  .option("--crop-480i-bottom <value>", "480i manual crop bottom (-32768 to 32767)")
  .option("--crop-480i-left <value>", "480i manual crop left (-32768 to 32767)")
  .option("--crop-480i-right <value>", "480i manual crop right (-32768 to 32767)")
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
      scalingMode: options.scalingMode,
      rotation: options.rotation,
      autoRotate: options.autoRotate,
      autoCrop: options.autoCrop,
      crop240pTop: options.crop240pTop,
      crop240pBottom: options.crop240pBottom,
      crop240pLeft: options.crop240pLeft,
      crop240pRight: options.crop240pRight,
      crop480iTop: options.crop480iTop,
      crop480iBottom: options.crop480iBottom,
      crop480iLeft: options.crop480iLeft,
      crop480iRight: options.crop480iRight,
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
