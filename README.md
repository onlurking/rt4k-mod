# rt4k-mod

Batch-modify RetroTINK-4K `.rt4` profile settings from the command line.

## Install Dependencies

```bash
bun install
```

## Usage

Apply setting overrides to one or many `.rt4` profiles.

```bash
# Single file
bun run src/index.ts modify --file ./PSX.rt4 --output-dir ./out --vrr Off

# Entire directory (recursive)
bun run src/index.ts modify \
  --input-dir "./profiles/God's Chosen/" \
  --output-dir "./modified/God's Chosen/" \
  --vrr Off

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
