import { parseArgs } from "node:util";
import fs from "node:fs";

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
];

function getRegionLabel(offset: number): string {
  for (const region of REGIONS) {
    if (offset >= region.start && offset <= region.end) {
      return region.name;
    }
  }
  return "data";
}

function formatHex(value: number, width: number): string {
  return "0x" + value.toString(16).toUpperCase().padStart(width, "0");
}

function formatOffset(offset: number): string {
  const hex = formatHex(offset, 4);
  const decimal = offset.toString().padStart(5, " ");
  return `${hex} (${decimal})`;
}

function formatByte(value: number): string {
  return formatHex(value, 2);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      original: { type: "string" },
      modified: { type: "string" },
      "original-option": { type: "string" },
      "modified-option": { type: "string" },
    },
    strict: true,
  });

  const originalPath = values.original as string | undefined;
  const modifiedPath = values.modified as string | undefined;
  const originalOption = values["original-option"] as string | undefined;
  const modifiedOption = values["modified-option"] as string | undefined;

  // Validate required arguments
  if (!originalPath || !modifiedPath || !originalOption || !modifiedOption) {
    console.error(
      "Error: Missing required arguments. Usage: bun run diff -- --original <path> --modified <path> --original-option <label> --modified-option <label>",
    );
    process.exit(1);
  }

  // Check file existence
  if (!fs.existsSync(originalPath)) {
    console.error(`Error: Original file not found: ${originalPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(modifiedPath)) {
    console.error(`Error: Modified file not found: ${modifiedPath}`);
    process.exit(1);
  }

  // Read files
  const originalBuffer = fs.readFileSync(originalPath);
  const modifiedBuffer = fs.readFileSync(modifiedPath);

  const fileSize = Math.max(originalBuffer.length, modifiedBuffer.length);
  const minSize = Math.min(originalBuffer.length, modifiedBuffer.length);

  // Collect differences
  const diffs: ByteDiff[] = [];
  for (let i = 0; i < minSize; i++) {
    const origByte = originalBuffer[i];
    const modByte = modifiedBuffer[i];
    if (origByte !== modByte) {
      diffs.push({ offset: i, original: origByte, modified: modByte });
    }
  }

  // Handle size mismatch
  if (originalBuffer.length !== modifiedBuffer.length) {
    const sizeDiff = Math.abs(originalBuffer.length - modifiedBuffer.length);
    console.warn(
      `Warning: File sizes differ by ${sizeDiff} bytes (${originalBuffer.length} vs ${modifiedBuffer.length})`,
    );
  }

  // Output report
  console.log("Binary Diff Report");
  console.log("==================");
  console.log(`Original : ${originalPath}   (${originalOption})`);
  console.log(`Modified : ${modifiedPath} (${modifiedOption})`);
  console.log(`File size: ${fileSize} bytes`);
  console.log("");

  if (diffs.length === 0) {
    console.log("No differences found.");
  } else {
    console.log(`Changed bytes (${diffs.length} total):`);
    for (const diff of diffs) {
      const region = getRegionLabel(diff.offset);
      const origHex = formatByte(diff.original);
      const modHex = formatByte(diff.modified);
      console.log(
        `  ${formatOffset(diff.offset)}:  ${origHex} → ${modHex}  [${region}]`,
      );
    }
    console.log("");

    // Region breakdown
    console.log("Region Breakdown:");
    for (const region of REGIONS) {
      const count = diffs.filter(
        (d) => d.offset >= region.start && d.offset <= region.end,
      ).length;
      const startHex = formatHex(region.start, 4);
      const endHex = formatHex(region.end, 4);
      console.log(
        `  ${region.name.padEnd(15)} (${startHex}–${endHex}):  ${count} changes`,
      );
    }

    // Data region
    const dataStart = 0x0080;
    const dataCount = diffs.filter((d) => d.offset >= dataStart).length;
    const dataStartHex = formatHex(dataStart, 4);
    console.log(
      `  ${"data".padEnd(15)} (${dataStartHex}–end   ):  ${dataCount} changes`,
    );

    console.log("");

    // Summary
    console.log("Summary:");
    console.log(`  Total bytes : ${fileSize}`);
    console.log(`  Changed     : ${diffs.length}`);
    console.log(`  Unchanged   : ${fileSize - diffs.length}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
