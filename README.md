# rt4k-mod

Batch-modify RetroTINK-4K `.rt4` profile settings from the command line.

## Install Dependencies

```bash
bun install
```

## Usage

Apply setting overrides to one or many `.rt4` profiles. Outputs are written to a separate directory — originals are never touched.

```bash
# Single file
bun run src/index.ts modify --file ./SNES.rt4 --output-dir ./out --vrr Off

# Entire directory (recursive)
bun run src/index.ts modify \
  --input-dir "./Retrotink-DV1-Profile-Repository/Raw Files/Latest Releases/God's Chosen/" \
  --output-dir ./modified-profiles \
  --vrr Off

# Multiple flags at once
bun run src/index.ts modify --input-dir ./profiles --output-dir ./out --vrr Off --input HDMI --hdr Off

# Preview changes without writing
bun run src/index.ts modify --input-dir ./profiles --output-dir ./out --vrr Off --dry-run
```

## Usage — inspect

Dump current settings from `.rt4` profiles as JSON.

```bash
# Single file → JSON
bun run src/index.ts inspect --file ./SNES.rt4

# Directory → NDJSON (one JSON object per line)
# https://ndjson.com/definition/
bun run src/index.ts inspect --input-dir ./profiles
```

## Flags

| Flag | Values | Description |
|------|--------|-------------|
| `--input` | `HDMI`, `Front\|Composite`, `SCART\|RGBS (75 Ohm)`, `HD-15\|RGBHV`, ... | Input source |
| `--resolution` | `4K60`, `4K50`, `1080p60`, `1080p50`, `1440p60`, `1440p50`, ... | Output resolution |
| `--hdr` | `Off`, `HDR10 [8-bit]`, `HLG [8-bit]` | HDR mode |
| `--colorimetry` | `Auto-Rec.709`, `Rec.709`, `Rec.2020`, `Adobe RGB`, `Display-P3` | Colorimetry |
| `--rgb-range` | `Full`, `Limited` | RGB range |
| `--sync-lock` | `Triple Buffer`, `Gen Lock`, `Frame Lock` | Sync lock mode |
| `--vrr` | `Off`, `FreeSync`, `VESA` | Variable refresh rate |
| `--deep-color` | `true`, `false` | Deep color (10-bit) |
| `--mask-enabled` | `true`, `false` | CRT mask overlay |
| `--mask-strength` | integer | Mask intensity |
| `--mask-path` | string | Path to mask BMP file |

## Testing

```bash
bun test
```

## Dependencies

- [`rt4k-profile`](https://www.npmjs.com/package/rt4k-profile) — reads/writes `.rt4` binary format
- [`commander`](https://www.npmjs.com/package/commander) — CLI argument parsing
