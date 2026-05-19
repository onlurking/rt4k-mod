# rt4k-mod

Batch-modify RetroTINK-4K `.rt4` profile settings from the command line.

## Install

```bash
bun install
```

## Usage

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

# Preview changes without writing
bun run src/index.ts modify --file ./PSX.rt4 --output-dir ./out --vrr Off --dry-run
```

## Inspect

Dump current settings from `.rt4` profiles as JSON.

```bash
# Single file → JSON
bun run src/index.ts inspect --file ./PSX.rt4

# Pretty-printed
bun run src/index.ts inspect --file ./PSX.rt4 --pretty

# Directory → NDJSON (one JSON object per line)
bun run src/index.ts inspect --input-dir ./profiles
```

## Flags

| Flag | Values | Description |
|------|--------|-------------|
| `--vrr` | `Off`, `FreeSync`, `VESA` | Variable refresh rate mode |
| `--resolution` | `4K60`, `4K50`, `1080p60`, `1080p50`, `1440p60`, `1440p50`, `1080p100`, `1440p100`, `1080p120`, `1440p120`, `480p60` | Output resolution |
| `--hdr` | `Off`, `HDR10 [8-bit]`, `HLG [8-bit]` | HDR mode |
| `--deep-color` | `true`, `false` | Deep color (10-bit output) |
| `--input` | `HDMI`, `Front\|Composite`, `Front\|S-Video`, `RCA\|YPbPr`, `RCA\|RGsB`, `RCA\|CVBS on Green`, `SCART\|RGBS (75 Ohm)`, `SCART\|RGsB`, `SCART\|YPbPr`, `SCART\|CVBS on Pin 20`, `SCART\|CVBS on Green`, `SCART\|Y/C on Pin 20/Red`, `HD-15\|RGBHV`, `HD-15\|RGBS`, `HD-15\|RGsB`, `HD-15\|YPbPr`, `HD-15\|CVBS on Hsync`, `HD-15\|CVBS on Green`, `HD-15\|Y/C on Green/Red`, `HD-15\|Y/C on G/R (Enh.)` | Input source |

### Infrastructure flags

| Flag | Description |
|------|-------------|
| `--file <path>` | Single input file |
| `--input-dir <path>` | Input directory (recursive) |
| `--output-dir <path>` | Output directory (required) |
| `--dry-run` | Preview changes without writing |

## Dev Tools

### Binary diff

Compare two `.rt4` files byte-by-byte to analyze format differences:

```bash
bun run diff -- \
  --original ./PSX-Freesync.rt4 \
  --modified ./PSX-Off.rt4 \
  --original-option="vrr: Freesync" \
  --modified-option="vrr: Off"
```

## Testing

```bash
bun test
```

## Dependencies

- [`commander`](https://www.npmjs.com/package/commander) - CLI argument parsing

## Credits

- [`rt4k-profile`](https://www.npmjs.com/package/rt4k-profile) - reads/writes `.rt4` binary format

## License

The MIT License (MIT)

Copyright (c) 2026 Diogo Felix

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
