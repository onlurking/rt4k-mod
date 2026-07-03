import { Command } from "commander";
import path from "path";
import fs from "fs";
import { RetroTinkProfile } from "../lib/rt4k/index.js";

interface CoreSettings {
  [settingPath: string]: string | number | boolean;
}

interface GenerateConfig {
  base_profile: string;
  output_dir?: string;
  defaults?: CoreSettings;
  cores: Record<string, CoreSettings | null>;
}

interface GenerateOptions {
  baseProfile?: string;
  outputDir?: string;
  cores?: string;
  misterPath?: string;
  config?: string;
  force?: boolean;
}

const MISTER_CORE_DIRS = ["_Console", "_Computer", "_Utility", "_Arcade"];

const RENAMING_RULES: Record<string, string> = {
  TurboGrafx16: "TGFX16",
  GameboyColor: "GBC",
  PocketChallengeV2: "PocketChalleng",
  WonderSwanColor: "WonderSwanColo",
  CDi: "cd-i",
};

async function scanMisterCores(misterPath: string): Promise<string[]> {
  const cores: string[] = [];

  for (const dir of MISTER_CORE_DIRS) {
    const fullPath = path.join(misterPath, dir);
    if (!fs.existsSync(fullPath)) continue;

    const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (ext === ".rbf" || ext === ".mgl") {
        const coreName = path.basename(entry.name, ext);
        const name = ext === ".rbf" ? coreName.split("_")[0] : coreName;
        if (name && !cores.includes(name)) {
          cores.push(name);
        }
      }
    }
  }

  const arcadePath = path.join(misterPath, "_Arcade");
  if (fs.existsSync(arcadePath)) {
    const entries = await fs.promises.readdir(arcadePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".mra")) continue;

      const content = await fs.promises.readFile(path.join(arcadePath, entry.name), "utf-8");
      const match = content.match(/<setname>([^<]+)<\/setname>/);
      if (match?.[1] && !cores.includes(match[1])) {
        cores.push(match[1]);
      }
    }
  }

  return cores.sort();
}

function applySettings(profile: RetroTinkProfile, settings: CoreSettings): void {
  for (const [key, value] of Object.entries(settings)) {
    profile.setValue(key, value);
  }
}

export async function runGenerate(options: GenerateOptions): Promise<{
  created: number;
  skipped: number;
  errors: string[];
}> {
  const { config: configPath, force = false } = options;

  let config: GenerateConfig | null = null;
  if (configPath) {
    const resolved = path.resolve(configPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Config file not found: ${resolved}`);
    }
    config = JSON.parse(await fs.promises.readFile(resolved, "utf-8"));
  }

  const baseProfilePath = path.resolve(
    options.baseProfile ?? config?.base_profile ?? "",
  );
  if (!baseProfilePath || !fs.existsSync(baseProfilePath)) {
    throw new Error(`Base profile not found: ${baseProfilePath}`);
  }

  const outputDirPath = path.resolve(
    options.outputDir ?? config?.output_dir ?? "",
  );

  await fs.promises.mkdir(outputDirPath, { recursive: true });

  const coreEntries: Array<{ name: string; settings: CoreSettings }> = [];

  if (config) {
    for (const [coreName, coreSettings] of Object.entries(config.cores)) {
      coreEntries.push({
        name: coreName,
        settings: { ...config.defaults, ...coreSettings ?? {} },
      });
    }
  } else if (options.cores) {
    const names = options.cores
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    for (const name of names) {
      coreEntries.push({ name, settings: {} });
    }
  } else if (options.misterPath) {
    const misterPathResolved = path.resolve(options.misterPath);
    if (!fs.existsSync(misterPathResolved)) {
      throw new Error(`MiSTer path not found: ${misterPathResolved}`);
    }
    const names = await scanMisterCores(misterPathResolved);
    for (const name of names) {
      coreEntries.push({ name, settings: {} });
    }
  } else {
    throw new Error("Must provide --config, --cores, or --mister-path");
  }

  if (coreEntries.length === 0) {
    throw new Error("No cores found");
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const { name: coreName, settings } of coreEntries) {
    const outputName = RENAMING_RULES[coreName] ?? coreName;
    const outputPath = path.join(outputDirPath, `${outputName}.rt4`);

    if (fs.existsSync(outputPath) && !force) {
      skipped++;
      continue;
    }

    try {
      const profile = await RetroTinkProfile.build(baseProfilePath);
      profile.setValue("input", "HDMI");
      applySettings(profile, settings);
      await profile.save(outputPath);
      created++;
    } catch (err) {
      errors.push(`${coreName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { created, skipped, errors };
}

export const generateCommand = new Command("generate")
  .description("Generate DV1 profiles for MiSTer cores")
  .option("--base-profile <path>", "Base .rt4 profile to copy")
  .option("--output-dir <path>", "Output directory for generated profiles")
  .option("--cores <list>", "Comma-separated list of core names")
  .option("--mister-path <path>", "Path to MiSTer SD card (scan for cores)")
  .option("--config <path>", "JSON config file with core settings")
  .option("--force", "Overwrite existing profiles")
  .action(async (options) => {
    try {
      const result = await runGenerate({
        baseProfile: options.baseProfile,
        outputDir: options.outputDir,
        cores: options.cores,
        misterPath: options.misterPath,
        config: options.config,
        force: options.force,
      });

      console.log(`Profiles created: ${result.created}`);
      if (result.skipped > 0) {
        console.log(`Profiles skipped: ${result.skipped}`);
      }
      if (result.errors.length > 0) {
        console.error(`Errors: ${result.errors.length}`);
        for (const err of result.errors) {
          console.error(`  - ${err}`);
        }
        process.exit(1);
      }
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });
