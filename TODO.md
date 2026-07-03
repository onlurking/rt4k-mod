# TODO — RetroTINK-4K Settings

Based on the full feature set documented at https://consolemods.org/wiki/AV:RetroTINK-4K

## Input

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ✅ | Input Source | `HDMI`, `Front\|Composite`, `Front\|S-Video`, `RCA\|YPbPr`, `RCA\|RGsB`, `RCA\|CVBS on Green`, `SCART\|RGBS (75 Ohm)`, `SCART\|RGsB`, `SCART\|YPbPr`, `SCART\|CVBS on Pin 20`, `SCART\|CVBS on Green`, `SCART\|Y/C on Pin 20/Red`, `HD-15\|RGBHV`, `HD-15\|RGBS`, `HD-15\|RGsB`, `HD-15\|YPbPr`, `HD-15\|CVBS on Hsync`, `HD-15\|CVBS on Green`, `HD-15\|Y/C on Green/Red`, `HD-15\|Y/C on G/R (Enh.)` | 0x0368+0x5869 |

## HDMI Output

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ✅ | Resolution | `4K60`, `4K50`, `1080p60`, `1080p50`, `1440p60`, `1440p50`, `1080p100`, `1440p100`, `1080p120`, `1440p120`, `480p60`, `Custom 1–4` | 0x036c |
| ✅ | HDR | `Off`, `HDR10 [8-bit]`, `HLG [8-bit]` | 0x02d0 |
| ✅ | Deep Color | `true`, `false` | 0x02d4 |
| ✅ | VRR | `Off`, `FreeSync`, `VESA` | 0x02dc |
| ✅ | Colorimetry | `Auto-Rec.709`, `Rec.709`, `Rec.2020`, `Adobe RGB`, `Display-P3` | 0x1ec8 |
| ✅ | RGB Range | `Full`, `Limited` | 0x1f08 |
| ✅ | Sync Lock | `Triple Buffer`, `Gen Lock`, `Frame Lock` | 0x02d8 |
| ⬜ | BFI Control | `Off`, `On`, `various patterns` | |
| ⬜ | Audio Output | `(if stored in profile)` | |

## Scaling / Cropping

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ✅ | Input Crop (Top/Bottom/Left/Right) | `signed 16-bit pixels` | 0x0494, 0x0594, 0x0694, 0x0794 |
| ⬜ | Vertical Pre-Scale | `1/2` to `1/31` | |
| ⬜ | RoTATE | `Off`, `90° CW`, `90° CCW` (Pro only) | |
| ⬜ | Auto Crop | `Vertical Only`, `Full Crop to 4:3`, `Full Crop to 16:9` | |
| ⬜ | Scaler → Aspect Correction | `4:3 (PAR)`, `16:9 (PAR)`, `1:1 (Sq. Pixel)` | |
| ⬜ | Scaler → Scaling Mode | `Auto Fill`, `Proportional`, `Free-Form`, `Auto Fill Integer` | |
| ⬜ | Scaler → Vert. Factor | `scaling factor` | |
| ⬜ | Scaler → Hori. Factor | `scaling factor` | |
| ⬜ | Scaler → Buffer Length | `Min. Lag`, `1/2 Frame`, `1 Frame` | |
| ⬜ | Scaler → Blank Res. Change | `On`, `Off` | 0x0379 |
| ⬜ | Masking Color (R/G/B) | `0–31 each` | |
| ⬜ | Masking Color → Show | `Cropping Only`, `Always` | |

## Processing / Effects — Interpolation

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Vert. Kernel | `Bilinear Sharp`, `Bilinear Med.`, `Bilinear Std.`, `Bilinear Soft`, `Cubic`, `Lanczos2`, `Lanczos3`, `Nearest Neighbor` | |
| ⬜ | Hori. Kernel | `Bilinear Sharp`, `Bilinear Med.`, `Bilinear Std.`, `Bilinear Soft`, `Cubic`, `Lanczos2`, `Lanczos3`, `Nearest Neighbor` | |
| ✅ | Anti-Ringing | `On`, `Off` | 0x02e8 |
| ✅ | Linear Light | `On`, `Off` | 0x02e4 |

## Processing / Effects — Scanlines

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Function | `Off`, `Exponential`, `Gaussian`, `Super Gaussian`, `Linear`, `Box`, `LCD Mono 1`, `LCD Mono 2`, `LCD BGR`, `LCD RGB` | |
| ⬜ | Strength | `0–99` | |
| ⬜ | Modulation | `0–99` | |
| ⬜ | Pseudo Interlace | `Off`, `1x`, `2x` | |
| ⬜ | Red Bleed | `On`, `Off` | |
| ⬜ | Red Convergence | `-10 to +10` | |
| ⬜ | Blue Convergence | `-10 to +10` | |

## Processing / Effects — Masks

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ✅ | Mask Enabled | `true`, `false` | 0x008c |
| ✅ | Mask Strength | `-128 to 127` | 0x02a0 |
| ✅ | Mask File | `path to custom .bmp mask` | 0x0090 |

## Processing / Effects — Other

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Horizontal Blur → Function | `Off`, `IIR LPF` (Pro only) | |
| ⬜ | Horizontal Blur → Cut-Off Freq | `0.50–9.00 MHz` (Pro only) | |
| ⬜ | Smoothing → Algorithm | `Off`, `XBR Level 1`, `XBR Level 2` (Pro only) | |
| ⬜ | Smoothing → Noise Threshold | `Off`, `Low`, `Medium`, `High` (Pro only) | |

## Color Correction

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Gamma → Input Factor | `0.10–5.00` | |
| ⬜ | Gamma → Input Lift | `-1.00–+1.00` | |
| ⬜ | Gamma → Input Gain | `0.00–10.00` | |
| ⬜ | Gamma → Output Factor | `0.10–5.00` | |
| ⬜ | SMPTE 2048 PQ | `250–10,000 nits` | |
| ⬜ | CSC → Apply Preset | `file path` | |
| ⬜ | CSC → Custom Matrix | `On`, `Off` | 0x1ec4 |
| ⬜ | CSC → Prevent Clipping | `On`, `Off` | |
| ⬜ | CSC → Saturation | `-1.0–+1.0` | |
| ⬜ | Input RGB to XYZ (9 values) | `-1.75–+1.75 each` | 0x1ea0-0x1ec3 |
| ⬜ | Transfer Function | `sRGB 0.055`, `Rec.601/709 0.099`, `SMPTE 240M 0.1115`, `Gamma` | |
| ⬜ | Bit Crush | `Off` to `7 bits Removed` | |
| ⬜ | Dithering | `On`, `Off` | |

## Black Frame Insertion (BFI)

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | BFI → Strobe | `strobe count` | |
| ⬜ | BFI → Blur | `blur duration` | |
| ⬜ | BFI → LCD Saver | `On`, `Off` | |
| ⬜ | BFI → Min. BFI Limit | `On`, `Off` | |
| ⬜ | BFI Color → Blending Mode | `Solid`, `Alpha`, `Solid Color`, `Alpha Color`, `CRT Beam` (Pro), `Variable MPRT` | |
| ⬜ | BFI Color → R/G/B | `0–31 each` | |
| ⬜ | BFI Color → Variable MPRT Gain | `-10–+10` | |
| ⬜ | Rolling BFI → Beam Steepness | `Off`, `1–6` (Pro only) | |
| ⬜ | Rolling BFI → Phosphor Glow | `Off`, `1–11` (Pro only) | |

## Deinterlacer / Film

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Algorithm | `Motion Adaptive`, `Weave`, `Bob`, `Linear`, `Blend`, `CRT Simulation`, `LCD Blending` | |
| ⬜ | Field Inversion | `Off`, `On` | |
| ⬜ | Smooth I/P Switch | `Off`, `On` | |
| ⬜ | Motion Adaptive → Sensitivity | `Low`, `Medium`, `High`, `Max` (Pro only) | |
| ⬜ | Motion Adaptive → Noise Threshold | `0–63` (Pro only) | |
| ⬜ | Motion Adaptive → Interpolator | `Linear`, `Edge Adaptive` (Pro only) | |
| ⬜ | Motion Adaptive → Detector | `Zero-lag`, `Symmetric` (Pro only) | |
| ⬜ | Bob → Offset | `-3–+3` | |
| ⬜ | Film Mode → Inverse Telecine | `Off`, `3:2`, `2:2` (Pro only) | |
| ⬜ | Film Mode → Dejudder 24 Hz | `Off`, `On` (Pro only) | |
| ⬜ | Cadence Detection → Motion Digital | `0–500` | 0x1db4 |
| ⬜ | Cadence Detection → Motion CP | `0–500` | 0x1db5 |
| ⬜ | Cadence Detection → Motion SDP | `0–500` | 0x1db6 |
| ⬜ | Cadence Detection → Threshold | `0–500` | |

## HDMI Receiver

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Input Decimation → Input Pixels | `1–15` | |
| ⬜ | Input Decimation → Output Pixels | `1–15` | |
| ⬜ | Input Decimation → Initial Phase | `1 of X` to `X of X` | |
| ⬜ | Colorspace → 4:2:2 Upsampler | `Linear`, `Nearest` | |
| ⬜ | Colorspace → Input Range | `Auto`, `RGB Lim.`, `RGB Full`, `YCbCr 601`, `YCbCr 709`, `XUYCC 601`, `XUYCC 709`, `YCbCR 601 (Full)`, `YCbCR 709 (Full)` | |
| ✅ | MiSTer DV1 → Auto-Decimate | `On`, `Off` | 0x1f10 |
| ✅ | MiSTer DV1 → Auto-Crop | `On`, `Off` | 0x1f0c |
| ⬜ | MiSTer DV1 → Auto-RoTATE | `On`, `Off` (Pro only) | |
| ⬜ | A/DAC → Enable | `Off`, `NTSC`, `PAL` | |
| ⬜ | A/DAC → Auto-Decimate | `On`, `Off` | |
| ⬜ | Target Decimate | `Off`, `720`, `1024`, `1280`, `1440`, `1600` | |

## RGB / Component ADC

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Samples per Line | `integer` | |
| ⬜ | Decimation Factor | `integer` | |
| ⬜ | Decimation Phase | `integer` | |
| ⬜ | Sub-Phase | `0–348.75°` (11.25° increments) | |
| ⬜ | Anti-Alias LPF | `Auto (16MHz)`, `9MHz (Strong)`, `16 MHz (Med)`, `35 MHz (Light)`, `95 MHz (Min.)`, `Off` | |
| ⬜ | Sync → SoG Threshold | `0.00–327.42 mV` | |
| ⬜ | Sync → Pre-coast | `1–31` | |
| ⬜ | Sync → Post-coast | `1–31` | |
| ⬜ | Sync → Wide Tolerance | `On`, `Off` | |
| ⬜ | Gain → Pre-ADC | `-0.7–+0.8` | |
| ⬜ | Gain → Red | `1.000–1.996` | |
| ⬜ | Gain → Green | `1.000–1.996` | |
| ⬜ | Gain → Blue | `1.000–1.996` | |
| ⬜ | Offset → Red | `-100–+100` | |
| ⬜ | Offset → Green | `-100–+100` | |
| ⬜ | Offset → Blue | `-100–+100` | |

## Sample Rate Detection

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Auto Dec. Factor | `Off`, `On` | |
| ⬜ | Auto Dec. Phase | `Off`, `Auto` | |
| ⬜ | Detection Mode | `Generic Console`, `Saturn` | |
| ⬜ | ADC Sample Rate | `manual value` | |
| ⬜ | Progressive Detection → Enable 1/10 | `On`, `Off` | 0x1c2c |
| ⬜ | Progressive Detection → Enable 1/8 | `On`, `Off` | 0x1c2d |
| ⬜ | Progressive Detection → Enable 1/7 | `On`, `Off` | 0x1c2e |
| ⬜ | Progressive Detection → Enable 1/6 | `On`, `Off` | 0x1c30 |
| ⬜ | Progressive Detection → Enable 1/5 | `On`, `Off` | 0x1c31 |
| ⬜ | Progressive Detection → Enable 1/4 | `On`, `Off` | 0x1c32 |
| ⬜ | Interlace Detection → Enable 1/10 | `On`, `Off` | 0x1c33 |
| ⬜ | Interlace Detection → Enable 1/8 | `On`, `Off` | 0x1c34 |
| ⬜ | Interlace Detection → Enable 1/7 | `On`, `Off` | 0x1c36 |
| ⬜ | Interlace Detection → Enable 1/6 | `On`, `Off` | 0x1c37 |
| ⬜ | Interlace Detection → Enable 1/5 | `On`, `Off` | |
| ⬜ | Interlace Detection → Enable 1/4 | `On`, `Off` | |

## SDP Decoder (Composite / S-Video)

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Brightness | `-100–+100` | |
| ⬜ | Contrast | `-100–+100` | |
| ⬜ | Chroma | `-100–+100` | |
| ⬜ | Phase | `-100–+100` | |
| ⬜ | Blue Only | `On`, `Off` | |
| ⬜ | Setup | `0 IRE`, `7.5 IRE` | |
| ⬜ | 2D Y/C Filter | `Notch`, `2D Adaptive`, `2D Fixed` | |
| ⬜ | 2D Bandwidth | `Low`, `High` | |
| ⬜ | Chroma Bandwidth | `Low`, `High` | |
| ⬜ | PAL Delay Line | `On`, `Off` | |
| ⬜ | Sharpness | `0–15` | |
| ⬜ | CTIE | `0–3` | |
| ⬜ | 3D Comb Enable | `On`, `Off` (Pro only) | |
| ⬜ | 3D Noise Threshold | `Default`, `Low`, `Medium`, `High` (Pro only) | |
| ⬜ | Sync → H-Lock Speed | `Auto`, `Slow`, `Medium`, `Fast` | |
| ⬜ | Sync → Standard | `Auto`, `NTSC`, `PAL`, `SECAM`, `NTSC-443`, `PAL-M`, `PAL-N`, `PAL-60` | |
| ⬜ | Enhanced S-Video → Chroma Shift | `-100–+100` (Pro only) | |

## Audio Input

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ⬜ | Sample Rate | `48 kHz`, `96 kHz` | |
| ⬜ | Pre-amp Gain | `-24.0–+28.0 dB` | |
| ⬜ | Pre-amp Balance | `Off`, `Left +24.0 dB`, `Right +24.0 dB` | |
| ⬜ | Input Override | `Off`, `RCA`, `HD-15`, `SCART`, `Front`, `S/PDIF` | |
| ⬜ | Input Swap | `Mono (Left)`, `Mono (Right)`, `L/R Swap` | |

## System / OSD

| Status | Setting | Values | Region |
|--------|---------|--------|--------|
| ✅ | OSD Position | `Left`, `Center`, `Right` | 0x184c |
| ✅ | OSD Timeout | `Off`, `10sec`–`100sec` | 0x1848 |
| ✅ | Banner Image | `file path` | 0x1644 |
| ✅ | OSD Hide Input Res | `On`, `Off` | 0x1ef8 |
| ✅ | Debug OSD | `Off`, `Status Pg 1`–`3`, `Console` | 0x1854 |
| ⬜ | Sleep Timer | `Off`, `5 min`, `10 min`, `20 min`, `1 hr` (global) | |
| ⬜ | Auto Power Up | `On`, `Off` (global) | |

## Binary Region Map

| Range | Size | Contents | Status |
|-------|------|----------|--------|
| 0x0000–0x000f | 16B | File header (`RT4K Profile`) | ✅ Mapped |
| 0x0020–0x002f | 16B | CRC-16 (CCITT) at 0x0020, metadata | ✅ Mapped |
| 0x0080–0x008b | 12B | Profile structure flags (version, slots) | ⬜ Unknown |
| 0x008c | 1B | Mask enabled (BIT) | ✅ Mapped |
| 0x0090–0x018f | 256B | Mask BMP file path (STR) | ✅ Mapped |
| 0x02a0 | 1B | Mask strength (SIGNED_INT, -128..127) | ✅ Mapped |
| 0x02a1–0x02a3 | 3B | Mask control bytes (0x00 or 0xFF) | ⬜ Unknown |
| 0x02a4 | 1B | Scanline/padding flag | ⬜ Unknown |
| 0x02a5–0x02a7 | 3B | Mask control bytes (0x00 or 0xFF) | ⬜ Unknown |
| 0x02ac | 1B | Processing flag (0-4 values) | ⬜ Unknown |
| 0x02b8 | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x02bc | 1B | Multi-value enum (0-215) | ⬜ Unknown |
| 0x02c0 | 1B | Multi-value enum (0-253) | ⬜ Unknown |
| 0x02c4 | 1B | Multi-value enum (0-251) | ⬜ Unknown |
| 0x02c5–0x02c7 | 3B | Control bytes (0x00 or 0xFF) | ⬜ Unknown |
| 0x02c8 | 1B | Multi-value enum (0-253) | ⬜ Unknown |
| 0x02cc | 1B | Multi-value enum (0-254) | ⬜ Unknown |
| 0x02cd–0x02cf | 3B | Control bytes (0x00 or 0xFF) | ⬜ Unknown |
| 0x02d0 | 1B | HDR mode (ENUM: Off/HDR10/HLG) | ✅ Mapped |
| 0x02d4 | 1B | Deep color (BIT) | ✅ Mapped |
| 0x02d8 | 1B | Sync lock (ENUM: Triple Buffer/Gen Lock/Frame Lock) | ✅ Mapped |
| 0x02dc | 1B | VRR (ENUM: Off/FreeSync/VESA) | ✅ Mapped |
| 0x02e0 | 1B | Boolean flag (0/2) | ⬜ Unknown |
| 0x02e4 | 1B | Linear light processing (BIT) | ✅ Mapped |
| 0x02e8 | 1B | Anti-ringing filter (BIT) | ✅ Mapped |
| 0x02ec | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x02f0 | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x02f4 | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x0368 | 1B | Input port (ENUM) | ✅ Mapped |
| 0x036c | 1B | Output resolution (ENUM) | ✅ Mapped |
| 0x0370–0x0383 | 20B | Input crop (Top/Bottom/Left/Right, 4B each) | ⬜ Unknown |
| 0x0384–0x039f | 28B | Scaling factors (4B floats: Vert/Hori/Position) | ⬜ Unknown |
| 0x03a0–0x03a3 | 4B | Scaling mode / aspect | ⬜ Unknown |
| 0x03a6–0x03af | 10B | Scaling control bytes (0x00/0xFF) | ⬜ Unknown |
| 0x03b0–0x03c7 | 24B | Scaling parameters | ⬜ Unknown |
| 0x03c8–0x03cf | 8B | Scaling control | ⬜ Unknown |
| 0x0494 | 2B | Scaling crop → Right (signed 16-bit) | ✅ Mapped |
| 0x0594 | 2B | Scaling crop → Left (signed 16-bit) | ✅ Mapped |
| 0x0694 | 2B | Scaling crop → Top (signed 16-bit) | ✅ Mapped |
| 0x0794 | 2B | Scaling crop → Bottom (signed 16-bit) | ✅ Mapped |
| 0x0800–0x086f | 112B | Input detection (mode/flags, 2-4 values) | ⬜ Unknown |
| 0x0880–0x08ef | 112B | Input detection (mode/flags, 1-4 values) | ⬜ Unknown |
| 0x08a5 | 1B | Input detection enum (0-2) | ⬜ Unknown |
| 0x08a6 | 1B | Input detection enum (0-3) | ⬜ Unknown |
| 0x0900–0x094f | 80B | Input detection (scaling params) | ⬜ Unknown |
| 0x09e0–0x0a4f | 112B | Input detection (scaling params) | ⬜ Unknown |
| 0x0a28 | 1B | DV1-specific flag (0/64) | ⬜ Unknown |
| 0x0a29 | 1B | DV1-specific flag (0/252) | ⬜ Unknown |
| 0x0ae0–0x0b4f | 112B | Input detection (scaling params) | ⬜ Unknown |
| 0x0be0–0x0c3f | 96B | Input detection (scaling params) | ⬜ Unknown |
| 0x0c80–0x0cbf | 64B | Input detection (scaling params) | ⬜ Unknown |
| 0x0d00–0x0d9f | 160B | Scaling/crop float values (32-bit) | ⬜ Unknown |
| 0x0e70–0x0e8f | 32B | Scaling parameters (small ints) | ⬜ Unknown |
| 0x0ed0–0x0f0f | 64B | Scaling/processing parameters | ⬜ Unknown |
| 0x0ef0 | 1B | DV1 scaling enum (0-16) | ⬜ Unknown |
| 0x0ef4 | 1B | DV1 scaling enum (0-16) | ⬜ Unknown |
| 0x0f50–0x0f8f | 64B | Scaling/processing (0-31 values) | ⬜ Unknown |
| 0x0f7a | 1B | DV1-specific value (0/28) | ⬜ Unknown |
| 0x0ff0–0x100f | 32B | Processing flags (0-5 values) | ⬜ Unknown |
| 0x11f0–0x120f | 32B | Processing flags (0/255) | ⬜ Unknown |
| 0x12f0–0x131f | 48B | Per-resolution scaling slot 1 (64 values) | ⬜ Unknown |
| 0x13f0–0x141f | 48B | Per-resolution scaling slot 2 (64 values) | ⬜ Unknown |
| 0x14f0–0x151f | 48B | Per-resolution scaling slot 3 (64 values) | ⬜ Unknown |
| 0x15f0–0x163f | 80B | Pre-banner padding | ⬜ Unknown |
| 0x1634 | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x1644–0x1743 | 256B | Banner BMP file path (STR) | ✅ Mapped |
| 0x1848 | 1B | OSD auto-off timeout (ENUM) | ✅ Mapped |
| 0x184c | 1B | OSD position (ENUM: Left/Center/Right) | ✅ Mapped |
| 0x1854 | 1B | Debug OSD page (ENUM) | ✅ Mapped |
| 0x1868 | 1B | System enum (0-2) | ⬜ Unknown |
| 0x186c | 1B | System boolean (0/1) | ⬜ Unknown |
| 0x1889–0x188c | 4B | System boolean flags (0/1) | ⬜ Unknown |
| 0x18e0–0x193f | 96B | System settings (mostly 0/1) | ⬜ Unknown |
| 0x1c2c–0x1c32 | 7B | Sample Rate Detection progressive enables (BIT each) | ✅ Mapped |
| 0x1c33–0x1c37 | 5B | Sample Rate Detection interlace enables (BIT each) | ✅ Mapped |
| 0x1c4c | 1B | Scanline boolean (0/1) | ⬜ Unknown |
| 0x1c50 | 1B | Scanline boolean (0/1) | ⬜ Unknown |
| 0x1c54–0x1c67 | 20B | Scanline parameters (0-31 values) | ⬜ Unknown |
| 0x1c68 | 1B | Scanline/mask control | ⬜ Unknown |
| 0x1c6c–0x1c8f | 36B | Color correction small values (0-31) | ⬜ Unknown |
| 0x1c94–0x1cf7 | 100B | Color correction matrix (4B floats × 9) | ⬜ Unknown |
| 0x1cf8–0x1d1f | 40B | Color correction params | ⬜ Unknown |
| 0x1d20–0x1d5f | 64B | Color correction params | ⬜ Unknown |
| 0x1d60–0x1d9f | 64B | Color correction params | ⬜ Unknown |
| 0x1da0–0x1db3 | 20B | Color correction params | ⬜ Unknown |
| 0x1db4–0x1db6 | 3B | Cadence detection (Motion Digital/CP/SDP) | ⬜ Unknown |
| 0x1db8–0x1dd1 | 26B | Cadence detection params (3-value enums) | ⬜ Unknown |
| 0x1dd4–0x1dfc | 40B | BFI/deinterlacer parameters | ⬜ Unknown |
| 0x1e04–0x1e0f | 12B | Interpolation kernel settings (0-25) | ⬜ Unknown |
| 0x1e14–0x1e6f | 92B | Color correction matrix (floats) | ⬜ Unknown |
| 0x1e74–0x1e8f | 28B | Gamma/PQ settings (0-176 values) | ⬜ Unknown |
| 0x1e94 | 1B | Boolean flag (0/1) | ⬜ Unknown |
| 0x1e98 | 1B | Numeric value (100-105) | ⬜ Unknown |
| 0x1ea0–0x1ec3 | 36B | Input RGB to XYZ matrix (9 × 4B floats) | ⬜ Unknown |
| 0x1ec4 | 1B | CSC custom matrix enable (BIT) | ✅ Mapped |
| 0x1ec8 | 1B | Colorimetry (ENUM) | ✅ Mapped |
| 0x1ecc–0x1ed3 | 8B | CSC parameters | ⬜ Unknown |
| 0x1ed4–0x1ed8 | 5B | Transfer function / bit crush | ⬜ Unknown |
| 0x1edc–0x1ee7 | 12B | Gamma/dithering params | ⬜ Unknown |
| 0x1ef8 | 1B | Hide input resolution in OSD (BIT) | ✅ Mapped |
| 0x1f00–0x1f0b | 12B | Processing flags | ⬜ Unknown |
| 0x1f08 | 1B | RGB range (ENUM: Full/Limited) | ✅ Mapped |
| 0x1f0c | 1B | MiSTer DV1 auto-crop (BIT) | ✅ Mapped |
| 0x1f10 | 1B | MiSTer DV1 auto-decimate (BIT) | ✅ Mapped |
| 0x1f14–0x1f5f | 76B | Processing/DV1 flags | ⬜ Unknown |
| 0x20d0 | 1B | MiSTer DV1 enabled (BIT) | ✅ Mapped |
| 0x20d4–0x20df | 12B | DV1 parameters | ⬜ Unknown |
| 0x5869 | 1B | Input mode (ENUM) | ✅ Mapped |
| 0x586a–0x586b | 2B | Input detection flags | ⬜ Unknown |
| 0x586c–0x589f | 52B | Input-specific scaling data (floats/ints) | ⬜ Unknown |
| 0x58a0–0x58ff | 96B | Input-specific processing data | ⬜ Unknown |
