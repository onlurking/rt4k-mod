# rt4k-mod

Batch-modify RetroTINK-4K `.rt4` profile settings from the command line.

## Install

```bash
bun install
```

## Commands

### modify

Apply setting overrides to one or many `.rt4` profiles. Outputs are written to a separate directory — originals are never touched.

```bash
# Single file
bun run src/index.ts modify --file ./PSX.rt4 --output-dir ./out --vrr Off

# Entire directory (recursive)
bun run src/index.ts modify \
  --input-dir "./profiles/God's Chosen/" \
  --output-dir "./modified/God's Chosen/" \
  --vrr Off

# Multiple flags at once
bun run src/index.ts modify \
  --input-dir ./profiles \
  --output-dir ./out \
  --vrr Off \
  --resolution 4K60 \
  --hdr 'HDR10 [8-bit]' \
  --deep-color true

# Crop settings for specific resolutions
bun run src/index.ts modify \
  --file ./PSX.rt4 \
  --output-dir ./out \
  --crop-240p-top 10 \
  --crop-240p-bottom -5 \
  --crop-480i-top 8 \
  --crop-480i-bottom -4

# Preview changes without writing
bun run src/index.ts modify --file ./PSX.rt4 --output-dir ./out --vrr Off --dry-run
```

### inspect

Dump current settings from `.rt4` profiles as JSON.

```bash
# Single file → JSON
bun run src/index.ts inspect --file ./PSX.rt4

# Pretty-printed
bun run src/index.ts inspect --file ./PSX.rt4 --pretty

# Directory → NDJSON (one JSON object per line)
bun run src/index.ts inspect --input-dir ./profiles
```


### generate

Generate DV1 profiles for MiSTer cores by copying a base profile.

```bash
# From explicit core list
bun run src/index.ts generate \
  --base-profile ./profiles/JVC-D200.rt4 \
  --output-dir ./profiles/DV1 \
  --cores "NES,SNES,Genesis,PSX"

# Scan MiSTer SD card for cores
bun run src/index.ts generate \
  --base-profile ./profiles/JVC-D200.rt4 \
  --output-dir ./profiles/DV1 \
  --mister-path /media/fat

# From JSON config file (recommended)
bun run src/index.ts generate --config profiles.json --force
```

#### JSON Config

```json
{
  "base_profile": "./profiles/JVC-D200.rt4",
  "output_dir": "./profiles/DV1",
  "defaults": {
    "output.resolution": "1440p60",
    "dv1.auto_crop": true,
    "dv1.auto_decimate": true
  },
  "cores": {
    "NES": {
      "output.crop_240p.top": -1,
      "output.crop_240p.bottom": 1
    },
    "zerowing": {
      "output.crop_240p.top": 1,
      "output.crop_240p.bottom": -1,
      "output.crop_240p.right": -1
    },
    "SNES": null
  }
}
```

- `base_profile`: Base `.rt4` file to copy (required)
- `output_dir`: Output directory (optional, overrides CLI)
- `defaults`: Settings applied to all cores (optional)
- `cores`: Map of core name → settings override (required)
- `null` core value = use defaults only

Features:
- Sets input to HDMI automatically
- Applies renaming rules (TurboGrafx16→TGFX16, GameboyColor→GBC, etc.)
- Scans MiSTer directories (_Console, _Computer, _Utility, _Arcade)
- Extracts arcade setnames from `.mra` files
- Skips existing profiles (or overwrites with `--force`)

### diff

Compare two `.rt4` files byte-by-byte to analyze format differences.

```bash
# Basic diff
bun run src/index.ts diff --original ./PSX.rt4 --modified ./PSX-Vesa.rt4

# With labels
bun run src/index.ts diff \
  --original ./PSX.rt4 --original-label "FreeSync" \
  --modified ./PSX-Vesa.rt4 --modified-label "VESA"
```

Output includes:
- Hex values for each changed byte
- Region labels (header, crc, output, scaling, processing, etc.)
- Setting names for known offsets
- Region breakdown summary


## Flags

### Output / Transmitter

| Flag | Values | Description |
|------|--------|-------------|
| `--vrr` | `Off`, `FreeSync`, `VESA` | Variable refresh rate mode |
| `--resolution` | `4K60`, `4K50`, `1080p60`, `1080p50`, `1440p60`, `1440p50`, `1080p100`, `1440p100`, `1080p120`, `1440p120`, `480p60`, `Custom 1–4` | Output resolution |
| `--hdr` | `Off`, `HDR10 [8-bit]`, `HLG [8-bit]` | HDR mode |
| `--deep-color` | `true`, `false` | Deep color (10-bit output) |
| `--sync-lock` | `Triple Buffer`, `Gen Lock`, `Frame Lock` | Sync lock mode |
| `--colorimetry` | `Auto-Rec.709`, `Rec.709`, `Rec.2020`, `Adobe RGB`, `Display-P3` | Output colorimetry |
| `--rgb-range` | `Full`, `Limited` | RGB range |

### Input

| Flag | Values | Description |
|------|--------|-------------|
| `--input` | `HDMI`, `Front\|Composite`, `Front\|S-Video`, `RCA\|YPbPr`, `RCA\|RGsB`, `RCA\|CVBS on Green`, `SCART\|RGBS (75 Ohm)`, `SCART\|RGsB`, `SCART\|YPbPr`, `SCART\|CVBS on Pin 20`, `SCART\|CVBS on Green`, `SCART\|Y/C on Pin 20/Red`, `HD-15\|RGBHV`, `HD-15\|RGBS`, `HD-15\|RGsB`, `HD-15\|YPbPr`, `HD-15\|CVBS on Hsync`, `HD-15\|CVBS on Green`, `HD-15\|Y/C on Green/Red`, `HD-15\|Y/C on G/R (Enh.)` | Input source |

### Processing / Effects

| Flag | Values | Description |
|------|--------|-------------|
| `--mask-enabled` | `true`, `false` | CRT mask enabled |
| `--mask-strength` | `-128` to `127` | CRT mask strength |
| `--mask-path` | file path | CRT mask BMP file path |
| `--linear-light` | `true`, `false` | Linear light processing |
| `--anti-ringing` | `true`, `false` | Anti-ringing filter |

### System / OSD

| Flag | Values | Description |
|------|--------|-------------|
| `--banner` | file path | Banner image BMP file path |
| `--osd-position` | `Left`, `Center`, `Right` | OSD position |
| `--osd-auto-off` | `Off`, `10sec`, `20sec`, `30sec`, `40sec`, `50sec`, `60sec`, `70sec`, `80sec`, `90sec`, `100sec` | OSD auto-off timeout |
| `--osd-hide-input-res` | `true`, `false` | Hide input resolution in OSD |
| `--debug-osd` | `Off`, `Status Pg 1`, `Status Pg 2`, `Status Pg 3`, `Console` | Debug OSD page |

### MiSTer DV1

| Flag | Values | Description |
|------|--------|-------------|
| `--dv1-auto-crop` | `true`, `false` | DV1 auto-crop |
| `--dv1-auto-decimate` | `true`, `false` | DV1 auto-decimate |
| `--dv1-enabled` | `true`, `false` | DV1 mode enabled |

### Scaling / Crop

| Flag | Values | Description |
|------|--------|-------------|
| `--scaling-mode` | `Auto Fill`, `Proportional`, `Free Form`, `Auto Fill Integer` | Scaling mode |
| `--rotation` | `None`, `Right 90`, `Left 90` | Output rotation |
| `--auto-rotate` | `On`, `Off` | Auto rotate |
| `--auto-crop` | `Off`, `On` | Auto crop |
| `--crop-240p-top` | `-32768` to `32767` | 240p manual crop top |
| `--crop-240p-bottom` | `-32768` to `32767` | 240p manual crop bottom |
| `--crop-240p-left` | `-32768` to `32767` | 240p manual crop left |
| `--crop-240p-right` | `-32768` to `32767` | 240p manual crop right |
| `--crop-480i-top` | `-32768` to `32767` | 480i manual crop top |
| `--crop-480i-bottom` | `-32768` to `32767` | 480i manual crop bottom |
| `--crop-480i-left` | `-32768` to `32767` | 480i manual crop left |
| `--crop-480i-right` | `-32768` to `32767` | 480i manual crop right |

### Infrastructure flags

| Flag | Description |
|------|-------------|
| `--file <path>` | Single input file |
| `--input-dir <path>` | Input directory (recursive) |
| `--output-dir <path>` | Output directory (required) |
| `--dry-run` | Preview changes without writing |

## Testing

```bash
bun test
```

## Dependencies

- [`commander`](https://www.npmjs.com/package/commander) - CLI argument parsing

## Credits

- [`rt4k-profile`](https://github.com/boatmeme/rt4k-profile) - reads/writes `.rt4` binary format
- [`mister-rt4k-dv1-profiles-generator`](https://github.com/Matt-Retrogamer/mister-rt4k-dv1-profiles-generator) - DV1 profile generation inspiration

## License

The MIT License (MIT)

Copyright (c) 2026 Diogo Felix

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
