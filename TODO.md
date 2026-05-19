# TODO — RetroTINK-4K Settings

Based on the full feature set documented at https://consolemods.org/wiki/AV:RetroTINK-4K

## Input

| Status | Setting | Values |
|--------|---------|--------|
| ✅ | Input Source | `HDMI`, `Front\|Composite`, `Front\|S-Video`, `RCA\|YPbPr`, `RCA\|RGsB`, `RCA\|CVBS on Green`, `SCART\|RGBS (75 Ohm)`, `SCART\|RGsB`, `SCART\|YPbPr`, `SCART\|CVBS on Pin 20`, `SCART\|CVBS on Green`, `SCART\|Y/C on Pin 20/Red`, `HD-15\|RGBHV`, `HD-15\|RGBS`, `HD-15\|RGsB`, `HD-15\|YPbPr`, `HD-15\|CVBS on Hsync`, `HD-15\|CVBS on Green`, `HD-15\|Y/C on Green/Red`, `HD-15\|Y/C on G/R (Enh.)` |

## HDMI Output

| Status | Setting | Values |
|--------|---------|--------|
| ✅ | Resolution | `4K60`, `4K50`, `1080p60`, `1080p50`, `1440p60`, `1440p50`, `1080p100`, `1440p100`, `1080p120`, `1440p120`, `480p60`, `Custom 1–4` |
| ✅ | HDR | `Off`, `HDR10 [8-bit]`, `HLG [8-bit]` |
| ✅ | Deep Color | `true`, `false` |
| ✅ | VRR | `Off`, `FreeSync`, `VESA` |
| ⬜ | Colorimetry | `BT.601`, `BT.709`, `BT.2020` |
| ⬜ | RGB Range | `Auto`, `Limited`, `Full` |
| ⬜ | Sync Lock | `Gen Lock`, `Frame Lock`, `Triple Buffer` |
| ⬜ | BFI Control | `Off`, `On`, `various patterns` |
| ⬜ | Audio Output | `(if stored in profile)` |

## Scaling / Cropping

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Input Crop | `Top / Bottom / Left / Right values` |
| ⬜ | Vertical Pre-Scale | `Pre-scale factor` |
| ⬜ | RoTATE | `Off`, `90° CW`, `90° CCW` (Pro only) |
| ⬜ | Auto Crop | `Mode selection` |
| ⬜ | Scaler → Aspect Correction | `Off`, `4:3`, `16:9` |
| ⬜ | Scaler → Scaling Mode | `Integer`, `Fit`, `Fill`, `Custom` |
| ⬜ | Scaler → H Scale | `Horizontal scaling factor` |
| ⬜ | Scaler → V Scale | `Vertical scaling factor` |
| ⬜ | Scaler → H Position | `Horizontal position offset` |
| ⬜ | Scaler → V Position | `Vertical position offset` |
| ⬜ | Scaler → Buffer Length | `Buffer size` |
| ⬜ | Scaler → Blank Resolution Change | `On`, `Off` |
| ⬜ | Masking Color | `RGB color for letterbox/pillarbox` |

## Processing / Effects — Interpolation

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Vertical Kernel | `Sharp`, `Smooth`, `Lanczos`, `etc.` |
| ⬜ | Horizontal Kernel | `Sharp`, `Smooth`, `Lanczos`, `etc.` |
| ⬜ | Anti-Ringing | `On`, `Off`, `value` |
| ⬜ | Linear Light | `On`, `Off` |

## Processing / Effects — Scanlines

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Scanline Mode | `Off`, `Normal`, `Interlaced`, `etc.` |
| ⬜ | Scanline Strength | `0–100%` |
| ⬜ | Scanline Beam | `Thin`, `Normal`, `Wide`, `etc.` |
| ⬜ | LCD Effects | `Off`, `various modes` |
| ⬜ | Color Bleed | `Off`, `On`, `strength` |

## Processing / Effects — Masks

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Mask Mode | `Off`, `Aperture Grille`, `Slot`, `Shadow`, `Custom` |
| ⬜ | Mask Strength | `0–100%` |
| ⬜ | Mask File | `path to custom .bmp mask` |

## Processing / Effects — Other

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Horizontal Blur | `IIR LPF`, `IIR HPF` (Pro only) |
| ⬜ | Smoothing | `Off`, `xBR` (Pro only) |

## Color Correction

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Gamma | `value / mode (Conventional, Approximated)` |
| ⬜ | PQ (Perceptual Quantizer) | `HDR gamma curve settings` |
| ⬜ | Color Space Conversion (CSC) | `Profile selection / custom matrix` |
| ⬜ | Input RGB to XYZ | `Color matrix values` |
| ⬜ | Brightness | `adjustment value` |
| ⬜ | Contrast | `adjustment value` |
| ⬜ | Saturation | `adjustment value` |
| ⬜ | Hue | `adjustment value` |

## Black Frame Insertion (BFI)

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | BFI Mode | `Off`, `On`, `pattern` |
| ⬜ | BFI Strength | `intensity value` |
| ⬜ | BFI Color | `RGB color of inserted frame` (Pro only) |
| ⬜ | BFI Rolling | `On`, `Off` (Pro only) |

## Deinterlacer / Film

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Deinterlace Mode | `Bob`, `Weave`, `Motion Adaptive`, `CRT Simulation` |
| ⬜ | Smooth I/P Switch | `On`, `Off` |
| ⬜ | Field Inversion | `On`, `Off` |
| ⬜ | Motion Adaptive Sensitivity | `value` (Pro only) |
| ⬜ | Motion Adaptive Noise Threshold | `value` (Pro only) |
| ⬜ | Edge Adaptive | `On`, `Off` (Pro only) |
| ⬜ | Bob Scanline | `On`, `Off` |
| ⬜ | Film Mode | `Off`, `3:2`, `2:2` (Pro only for IVTC) |
| ⬜ | Cadence Detection | `Auto`, `Manual` |

## HDMI Receiver

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Input Decimation | `factor / auto` |
| ⬜ | Colorspace | `Auto`, `RGB`, `YCbCr 4:4:4`, `YCbCr 4:2:2` |
| ⬜ | MiSTer DV1 | `On`, `Off`, `Auto Decimate`, `Auto Crop` |
| ⬜ | A/DAC | `settings` |
| ⬜ | Target Decimate | `value` |

## RGB / Component ADC

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Sampling Phase | `0–31` |
| ⬜ | Sampling Rate | `value (pixels per line)` |
| ⬜ | Sync → Hsync Polarity | `Auto`, `Positive`, `Negative` |
| ⬜ | Sync → Vsync Polarity | `Auto`, `Positive`, `Negative` |
| ⬜ | Sync → SOG Threshold | `value` |
| ⬜ | Gain → Red | `value` |
| ⬜ | Gain → Green | `value` |
| ⬜ | Gain → Blue | `value` |
| ⬜ | Offset → Red | `value` |
| ⬜ | Offset → Green | `value` |
| ⬜ | Offset → Blue | `value` |

## Sample Rate Detection

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | SRD Control | `On`, `Off`, `per-console modes` |
| ⬜ | Progressive Detection | `settings` |
| ⬜ | Interlace Detection | `settings` |

## SDP Decoder (Composite / S-Video)

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Gain → Luma | `value` |
| ⬜ | Gain → Chroma | `value` |
| ⬜ | Balance | `value` |
| ⬜ | 2D Processing | `Notch`, `Comb`, `Adaptive` |
| ⬜ | 3D Processing | `Off`, `On` (Pro only) |
| ⬜ | Sync → Mode | `settings` |
| ⬜ | Enhanced S-Video | `On`, `Off` (Pro only, HD-15 port) |

## Audio Input

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | Audio Sampling Rate | `48kHz`, `96kHz` |
| ⬜ | Audio Source | `Auto`, `Analog`, `Optical`, `HDMI` |

## System / OSD

| Status | Setting | Values |
|--------|---------|--------|
| ⬜ | OSD Position | `value` |
| ⬜ | OSD Timeout | `value` |
| ⬜ | Banner Image | `file path` |
| ⬜ | Auto-Sleep Timer | `Off`, `duration` |
| ⬜ | Power On State | `Last`, `On`, `Off` |
