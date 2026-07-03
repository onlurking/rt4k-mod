import { Command } from "commander";
import path from "path";
import fs from "fs";
import { RetroTinkProfile } from "../lib/rt4k/index.js";
import { SCHEMA } from "../lib/rt4k/schema.js";

interface ByteDiff {
  offset: number;
  original: number;
  modified: number;
}

interface RegionDef {
  name: string;
  start: number;
  end: number;
}

const REGIONS: RegionDef[] = [
  { name: "header", start: 0x0000, end: 0x000b },
  { name: "crc", start: 0x0020, end: 0x0021 },
  { name: "meta-pre-crc", start: 0x000c, end: 0x001f },
  { name: "meta-post-crc", start: 0x0022, end: 0x007f },
  { name: "mask", start: 0x0080, end: 0x02cf },
  { name: "output", start: 0x02d0, end: 0x02ff },
  { name: "input-res", start: 0x0360, end: 0x03cf },
  { name: "scaling", start: 0x03d0, end: 0x0fff },
  { name: "banner-osd", start: 0x1600, end: 0x18ff },
  { name: "processing", start: 0x1c00, end: 0x1fff },
  { name: "dv1", start: 0x2000, end: 0x20ff },
  { name: "input-data", start: 0x5800, end: 0x59ff },
];

function getRegionLabel(offset: number): string {
  for (const region of REGIONS) {
    if (offset >= region.start && offset <= region.end) {
      return region.name;
    }
  }
  return "data";
}

function findSettingAtOffset(offset: number): string | undefined {
  for (const setting of SCHEMA) {
    for (const range of setting.byteRanges) {
      if (offset >= range.address && offset < range.address + range.length) {
        return setting.name;
      }
    }
  }
  return undefined;
}

function formatHex(value: number, width: number): string {
  return "0x" + value.toString(16).toUpperCase().padStart(width, "0");
}

export async function runDiff(
  originalPath: string,
  modifiedPath: string,
  originalLabel?: string,
  modifiedLabel?: string,
): Promise<string> {
  const origResolved = path.resolve(originalPath);
  const modResolved = path.resolve(modifiedPath);

  if (!fs.existsSync(origResolved)) {
    throw new Error(`Original file not found: ${origResolved}`);
  }
  if (!fs.existsSync(modResolved)) {
    throw new Error(`Modified file not found: ${modResolved}`);
  }

  const originalBuffer = fs.readFileSync(origResolved);
  const modifiedBuffer = fs.readFileSync(modResolved);

  const fileSize = Math.max(originalBuffer.length, modifiedBuffer.length);
  const minSize = Math.min(originalBuffer.length, modifiedBuffer.length);

  const diffs: ByteDiff[] = [];
  for (let i = 0; i < minSize; i++) {
    if (originalBuffer[i] !== modifiedBuffer[i]) {
      diffs.push({ offset: i, original: originalBuffer[i], modified: modifiedBuffer[i] });
    }
  }

  const lines: string[] = [];

  lines.push("Binary Diff Report");
  lines.push("==================");
  lines.push(`Original : ${originalPath}${originalLabel ? ` (${originalLabel})` : ""}`);
  lines.push(`Modified : ${modifiedPath}${modifiedLabel ? ` (${modifiedLabel})` : ""}`);
  lines.push(`File size: ${fileSize} bytes`);
  lines.push("");

  if (originalBuffer.length !== modifiedBuffer.length) {
    lines.push(
      `Warning: File sizes differ by ${Math.abs(originalBuffer.length - modifiedBuffer.length)} bytes`,
    );
    lines.push("");
  }

  if (diffs.length === 0) {
    lines.push("No differences found.");
    return lines.join("\n");
  }

  lines.push(`Changed bytes (${diffs.length} total):`);
  for (const diff of diffs) {
    const region = getRegionLabel(diff.offset);
    const setting = findSettingAtOffset(diff.offset);
    const settingLabel = setting ? ` ${setting}` : "";
    const origHex = formatHex(diff.original, 2);
    const modHex = formatHex(diff.modified, 2);
    lines.push(
      `  ${formatHex(diff.offset, 4)}:  ${origHex} → ${modHex}  [${region}]${settingLabel}`,
    );
  }
  lines.push("");

  // Region breakdown
  lines.push("Region Breakdown:");
  for (const region of REGIONS) {
    const count = diffs.filter((d) => d.offset >= region.start && d.offset <= region.end).length;
    if (count > 0) {
      lines.push(
        `  ${region.name.padEnd(15)} (${formatHex(region.start, 4)}–${formatHex(region.end, 4)}):  ${count} changes`,
      );
    }
  }

  const dataStart = 0x0080;
  const dataCount = diffs.filter((d) => d.offset >= dataStart).length;
  lines.push(`  ${"data".padEnd(15)} (${formatHex(dataStart, 4)}–end   ):  ${dataCount} changes`);
  lines.push("");

  lines.push("Summary:");
  lines.push(`  Total bytes : ${fileSize}`);
  lines.push(`  Changed     : ${diffs.length}`);
  lines.push(`  Unchanged   : ${fileSize - diffs.length}`);

  return lines.join("\n");
}

export const diffCommand = new Command("diff")
  .description("Compare two .rt4 profile files byte-by-byte")
  .requiredOption("--original <path>", "Original .rt4 file")
  .requiredOption("--modified <path>", "Modified .rt4 file")
  .option("--original-label <label>", "Label for original file")
  .option("--modified-label <label>", "Label for modified file")
  .action(async (options) => {
    try {
      const output = await runDiff(
        options.original,
        options.modified,
        options.originalLabel,
        options.modifiedLabel,
      );
      console.log(output);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });
