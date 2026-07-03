# TODO2 — Unmapped Binary Regions

Reverse-engineered from 2,041 DV1 profiles (God's Chosen + Standard packs).
Each offset has 2–20 unique values across profiles (settings-like distribution).

## Status Legend

- ✅ Mapped — confirmed setting with known values
- 🔍 Candidate — clean distribution, needs identification
- ⬜ Unknown — noisy or complex, needs more data

---

## Mask Parameters (0x02a0–0x02cf)

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x02a0 | ✅ | Mask strength (-128..127) | SIGNED_INT | Mapped |
| 0x02a4 | 2 | {0: 88%, 255: 12%} | Control byte | Padding/flag |
| 0x02a5 | 2 | {0: 88%, 255: 12%} | Control byte | Padding/flag |
| 0x02a6 | 2 | {0: 88%, 255: 12%} | Control byte | Padding/flag |
| 0x02a7 | 2 | {0: 88%, 255: 12%} | Control byte | Padding/flag |
| 0x02ac | 2 | {0: 88%, 1: 12%} | Boolean | Likely scanline flag |
| 0x02bc | 2 | {0: 88%, 1: 12%} | Control byte | Mask control |
| 0x02c0 | 2 | {0: 88%, 1: 12%} | Control byte | Mask control |
| 0x02c4 | 2 | {0: 88%, 255: 12%} | Control byte | Inverted flag |
| 0x02c5 | 2 | {0: 12%, 255: 88%} | Control byte | Inverted flag |
| 0x02c6 | 2 | {0: 12%, 255: 88%} | Control byte | Inverted flag |
| 0x02c7 | 2 | {0: 12%, 255: 88%} | Control byte | Inverted flag |
| 0x02c8 | 2 | {0: 88%, 255: 12%} | Control byte | Mask control |
| 0x02cc | 2 | {0: 88%, 255: 12%} | Control byte | Mask control |

---

## Scaling / Crop (0x0300–0x0fff)

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x0370 | 2 | {0: 74%, 1: 26%} | Boolean | Input resolution related |
| 0x0379 | 2 | {0: 95%, 1: 5%} | Boolean | Blank Res. Change |
| 0x037d | 2 | {0: 95%, 1: 5%} | Boolean | Related scaling flag |
| 0x0381 | 2 | {0: 95%, 1: 5%} | Boolean | Related scaling flag |
| 0x0494 | ✅ | 240p crop right | SIGNED_SHORT | Mapped |
| 0x0496 | ✅ | 480i crop right | SIGNED_SHORT | Mapped |
| 0x0594 | ✅ | 240p crop left | SIGNED_SHORT | Mapped |
| 0x0596 | ✅ | 480i crop left | SIGNED_SHORT | Mapped |
| 0x0694 | ✅ | 240p crop top | SIGNED_SHORT | Mapped |
| 0x0696 | ✅ | 480i crop top | SIGNED_SHORT | Mapped |
| 0x0794 | ✅ | 240p crop bottom | SIGNED_SHORT | Mapped |
| 0x0796 | ✅ | 480i crop bottom | SIGNED_SHORT | Mapped |
| 0x091c | ✅ | Scaling mode | ENUM | Mapped |

---

## Scaling Data (0x0400–0x0fff)

These are adjacent to crop values (0x0494, 0x0594, 0x0694, 0x0794). Likely control bytes for each crop axis.

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x0495 | 2 | {0: 92%, 255: 8%} | Control byte | Adjacent to crop_right |
| 0x049d | 2 | {0: 97%, 255: 3%} | Control byte | Near crop_right |
| 0x0595 | 2 | {0: 85%, 255: 15%} | Control byte | Adjacent to crop_left |
| 0x059d | 2 | {0: 94%, 255: 6%} | Control byte | Near crop_left |
| 0x0695 | 2 | {0: 92%, 255: 8%} | Control byte | Adjacent to crop_top |
| 0x069d | 2 | {0: 97%, 255: 3%} | Control byte | Near crop_top |
| 0x0795 | 2 | {0: 95%, 255: 5%} | Control byte | Adjacent to crop_bottom |
| 0x079d | 2 | {0: 97%, 255: 3%} | Control byte | Near crop_bottom |
| 0x0c26 | 2 | {0: 88%, 1: 12%} | Control byte | Scaling control |
| 0x0c93 | 2 | {0: 88%, 1: 12%} | Control byte | Scaling control |
| 0x0d28 | 2 | {0: 82%, 1: 18%} | Integer | Scaling parameter |
| 0x0d29 | 2 | {0: 99%, 1: 1%} | Integer | Scaling parameter |
| 0x0d2c | 2 | {0: 70%, 1: 30%} | Integer | Scaling parameter |
| 0x0d30 | 2 | {0: 100%, 1: 0%} | Integer | Scaling parameter (always differs) |
| 0x0d31 | 2 | {0: 85%, 1: 15%} | Integer | Scaling parameter |
| 0x0d38 | 2 | {0: 100%, 1: 0%} | Integer | Scaling parameter (always differs) |
| 0x0d39 | 2 | {0: 100%, 1: 0%} | Integer | Scaling parameter (always differs) |
| 0x0d3a | 2 | {0: 99%, 1: 1%} | Integer | Scaling parameter |
| 0x0d3b | 3 | {63: 12%, 64: 20%, 65: 68%} | Enum | Scaling parameter |
| 0x0d3c | 2 | {0: 76%, 1: 24%} | Integer | Scaling parameter |
| 0x0d3d | 2 | {0: 76%, 1: 24%} | Integer | Scaling parameter |
| 0x0d3e | 2 | {0: 95%, 1: 5%} | Integer | Scaling parameter |
| 0x0d3f | 2 | {64: 14%, 65: 86%} | Enum | Scaling parameter |
| 0x0d40 | 2 | {0: 99%, 1: 1%} | Integer | Scaling parameter |
| 0x0d41 | 2 | {0: 99%, 1: 1%} | Integer | Scaling parameter |
| 0x0d42 | 2 | {0: 74%, 1: 26%} | Integer | Scaling parameter |
| 0x0d43 | 2 | {0: 71%, 1: 29%} | Integer | Scaling parameter |
| 0x0d48 | 2 | {0: 93%, 20: 7%} | Integer | Possibly decimate factor |
| 0x0ee3 | 2 | {0: 38%, 1: 62%} | Integer | Scaling control |
| 0x0ef0 | 2 | {0: 99%, 1: 1%} | Integer | Scaling control |
| 0x0ef4 | 2 | {0: 99%, 1: 1%} | Integer | Scaling control |

---

## Banner / OSD (0x1600–0x18ff)

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x1868 | ✅ | Rotation (None/Right 90/Left 90) | ENUM | Mapped |
| 0x186c | 2 | {0: 66%, 1: 34%} | Boolean | System flag |
| 0x1888 | ✅ | Auto crop (Off/On) | ENUM | Mapped |
| 0x18ec | 2 | {0: 84%, 1: 16%} | Boolean | System flag |
| 0x18f3 | 2 | {0: 61%, 1: 39%} | Boolean | System flag |
| 0x1900 | 2 | {1: 87%, 5: 13%} | Enum | System mode |

---

## Processing / Effects (0x1c00–0x1fff)

### Color Correction Matrix (0x1ea0–0x1ec3)

These offsets contain float values (4 bytes each) forming a 3×3 color matrix.

| Offset | Size | Unique | Distribution | Notes |
|--------|------|--------|--------------|-------|
| 0x1ea3 | 1B | 2 | {0: 88%, 62: 12%} | Matrix byte |
| 0x1ea7 | 1B | 2 | {0: 88%, 62: 12%} | Matrix byte |
| 0x1eab | 1B | 2 | {0: 88%, 62: 12%} | Matrix byte |
| 0x1eaf | 1B | 2 | {0: 88%, 62: 12%} | Matrix byte |
| 0x1eb3 | 1B | 2 | {0: 88%, 63: 12%} | Matrix byte |
| 0x1ec3 | 1B | 2 | {0: 88%, 63: 12%} | Matrix byte |

### Transfer Function / Gamma (0x1ed4–0x1ee3)

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x1ed4 | 2 | {0: 89%, 51: 11%} | Control byte | Transfer function flag |
| 0x1ed5 | 2 | {0: 89%, 32: 11%} | Enum | Transfer function param |
| 0x1ed6 | 2 | {0: 89%, 82: 11%} | Enum | Transfer function param |
| 0x1ed7 | 2 | {0: 89%, 97: 11%} | Enum | Transfer function param |
| 0x1ed8 | 2 | {0: 88%, 3: 12%} | Enum | Transfer function mode |
| 0x1ee0 | 2 | {0: 88%, 236: 12%} | Control byte | Gamma flag |
| 0x1ee1 | 2 | {0: 88%, 255: 12%} | Control byte | Gamma flag |
| 0x1ee2 | 2 | {0: 88%, 255: 12%} | Control byte | Gamma flag |
| 0x1ee3 | 2 | {0: 88%, 255: 12%} | Control byte | Gamma flag |

### Other Processing (0x1f00–0x1f6f)

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x1f2c | 2 | {0: 48%, 1: 52%} | Boolean | Common processing flag |
| 0x1f50 | 2 | {0: 88%, 5: 12%} | Enum | Processing mode |
| 0x1f62 | 2 | {0: 94%, 128: 6%} | Control byte | Processing flag |
| 0x1f63 | 2 | {0: 94%, 63: 6%} | Control byte | Processing flag |
| 0x1f64 | ✅ | Auto rotate (On/Off) | ENUM | Mapped |

---

## Input Data (0x5800–0x58ff)

This region is adjacent to the input mode byte (0x5869). Contains input-specific scaling and processing data.

| Offset | Unique | Distribution | Likely Type | Notes |
|--------|--------|--------------|-------------|-------|
| 0x586a | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x586b | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x586c | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x586d | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x5870 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x5871 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x5872 | 2 | {0: 68%, 1: 32%} | Integer | Input parameter |
| 0x587c | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x587d | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x587e | 2 | {0: 60%, 1: 40%} | Integer | Input parameter |
| 0x5880 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5881 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5882 | 2 | {0: 52%, 1: 48%} | Integer | Input parameter |
| 0x5884 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5885 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5886 | 2 | {0: 66%, 1: 34%} | Integer | Input parameter |
| 0x5888 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5889 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x588a | 2 | {0: 60%, 1: 40%} | Integer | Input parameter |
| 0x588b | 2 | {54: 91%, 55: 9%} | Enum | Input parameter |
| 0x5890 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5891 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5892 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x5894 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5895 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5896 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x5897 | 3 | {64: 38%, 65: 53%, 66: 9%} | Enum | Input parameter |
| 0x5898 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x5899 | 2 | {0: 99%, 1: 1%} | Integer | Input parameter |
| 0x589a | 2 | {0: 98%, 1: 2%} | Integer | Input parameter |
| 0x589b | 2 | {0: 49%, 1: 51%} | Integer | Input parameter |
| 0x589c | 2 | {0: 94%, 238: 6%} | Control byte | Input flag |
| 0x589d | 2 | {125: 6%, 128: 94%} | Integer | Input parameter |
| 0x58a0 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58a8 | 2 | {0: 12%, 254: 88%} | Control byte | Input flag |
| 0x58bc | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58bd | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58be | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58c0 | 2 | {0: 12%, 127: 88%} | Control byte | Input flag |
| 0x58c1 | 2 | {0: 12%, 215: 88%} | Control byte | Input flag |
| 0x58c2 | 2 | {0: 12%, 69: 88%} | Control byte | Input flag |
| 0x58c3 | 2 | {0: 12%, 63: 88%} | Control byte | Input flag |
| 0x58c4 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58c5 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58c6 | 2 | {0: 100%, 1: 0%} | Integer | Input data (always differs) |
| 0x58d8 | 2 | {0: 4%, 1: 96%} | Boolean | DV1/system flag |
| 0x58dc | 2 | {0: 20%, 1: 80%} | Boolean | DV1/system flag |
| 0x58f6 | 2 | {0: 55%, 128: 45%} | Control byte | Input flag |
| 0x58f7 | 2 | {0: 55%, 255: 45%} | Control byte | Input flag |
| 0x58fa | 2 | {0: 55%, 128: 45%} | Control byte | Input flag |
| 0x58fb | 2 | {0: 55%, 255: 45%} | Control byte | Input flag |

---

## Summary

| Region | Mapped | Candidates | Likely Contents |
|--------|--------|------------|-----------------|
| Mask Params | 1 | 14 | Scanline/mask control bytes |
| Scaling/Crop | 9 | 30+ | Crop values, scaling parameters |
| Banner/OSD | 1 | 5 | System flags |
| Color Matrix | 0 | 6 | CSC float values |
| Transfer/Gamma | 0 | 9 | Transfer function params |
| Processing | 1 | 4 | Processing flags |
| Input Data | 0 | 45+ | Input-specific parameters |
| **Total** | **12** | **113+** | |

## Key Observations

1. **Scaling region (0x0D28-0x0D48)**: Very high change rates (70-100%) suggest core-specific scaling parameters
2. **Input data (0x586A-0x58FB)**: 100% change rates on many offsets indicate input-specific calibration data
3. **Color matrix (0x1EA0-0x1EC3)**: 88% change rate suggests color correction matrix that varies by display type
4. **Transfer function (0x1ECC-0x1ED8)**: 88% change rate suggests gamma/HDR transfer function parameters
5. **Mask region (0x0080-0x02CC)**: 88% change rate on mask-related bytes indicates mask style variations

## Next Steps

1. **Create test profiles** on a real RT4K with one setting changed at a time
2. **Diff each** against a baseline to map offsets
3. **Focus on**: 0x1f2c (50/50 split = likely important), 0x58d8/0x58dc (DV1 flags)
4. **Color matrix** (0x1ea0–0x1ec3): likely 9 × 4-byte floats for CSC
5. **Transfer function** (0x1ed4–0x1ed8): likely gamma/PQ parameters
