import { DataType, type SettingDef } from "./types";

export const SCHEMA: SettingDef[] = [
  {
    name: "header",
    desc: "File Header (Read-Only)",
    byteRanges: [{ address: 0x0000, length: 12 }],
    type: DataType.STR,
    readOnly: true,
  },
  {
    name: "output.transmitter.vrr",
    desc: "HDMI Output -> Transmitter -> VRR",
    byteRanges: [{ address: 0x02dc, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Off", value: new Uint8Array([0]) },
      { name: "FreeSync", value: new Uint8Array([1]) },
      { name: "VESA", value: new Uint8Array([2]) },
    ],
    flagName: "vrr",
    cliDesc: "VRR mode",
  },
  {
    name: "output.resolution",
    desc: "HDMI Output -> Resolution",
    byteRanges: [{ address: 0x036c, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "4K60", value: new Uint8Array([0]) },
      { name: "4K50", value: new Uint8Array([1]) },
      { name: "1080p60", value: new Uint8Array([2]) },
      { name: "1080p50", value: new Uint8Array([3]) },
      { name: "1440p60", value: new Uint8Array([4]) },
      { name: "1440p50", value: new Uint8Array([5]) },
      { name: "1080p100", value: new Uint8Array([6]) },
      { name: "1440p100", value: new Uint8Array([7]) },
      { name: "1080p120", value: new Uint8Array([8]) },
      { name: "1440p120", value: new Uint8Array([9]) },
      { name: "480p60", value: new Uint8Array([13]) },
      { name: "Custom 1", value: new Uint8Array([69]) },
      { name: "Custom 2", value: new Uint8Array([70]) },
      { name: "Custom 3", value: new Uint8Array([71]) },
      { name: "Custom 4", value: new Uint8Array([72]) },
    ],
    flagName: "resolution",
    cliDesc: "Output resolution",
  },
  {
    name: "output.transmitter.hdr",
    desc: "HDMI Output -> Transmitter -> HDR",
    byteRanges: [{ address: 0x02d0, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Off", value: new Uint8Array([0]) },
      { name: "HDR10 [8-bit]", value: new Uint8Array([1]) },
      { name: "HLG [8-bit]", value: new Uint8Array([2]) },
    ],
    flagName: "hdr",
    cliDesc: "HDR mode",
  },
  {
    name: "output.transmitter.deep_color",
    desc: "HDMI Output -> Transmitter -> Deep Color",
    byteRanges: [{ address: 0x02d4, length: 1 }],
    type: DataType.BIT,
    flagName: "deep-color",
    cliDesc: "Deep color (10-bit output)",
  },
  {
    name: "output.transmitter.sync_lock",
    desc: "HDMI Output -> Transmitter -> Sync Lock",
    byteRanges: [{ address: 0x02d8, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Triple Buffer", value: new Uint8Array([0]) },
      { name: "Gen Lock", value: new Uint8Array([1]) },
      { name: "Frame Lock", value: new Uint8Array([2]) },
    ],
    flagName: "sync-lock",
    cliDesc: "Sync lock mode",
  },
  {
    name: "output.transmitter.colorimetry",
    desc: "HDMI Output -> Transmitter -> Colorimetry",
    byteRanges: [{ address: 0x1ec8, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Auto-Rec.709", value: new Uint8Array([0]) },
      { name: "Rec.709", value: new Uint8Array([1]) },
      { name: "Rec.2020", value: new Uint8Array([2]) },
      { name: "Adobe RGB", value: new Uint8Array([3]) },
      { name: "Display-P3", value: new Uint8Array([4]) },
    ],
    flagName: "colorimetry",
    cliDesc: "Output colorimetry",
  },
  {
    name: "output.transmitter.rgb_range",
    desc: "HDMI Output -> Transmitter -> RGB Range",
    byteRanges: [{ address: 0x1f08, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Full", value: new Uint8Array([0]) },
      { name: "Limited", value: new Uint8Array([1]) },
    ],
    flagName: "rgb-range",
    cliDesc: "RGB range",
  },
  {
    name: "input",
    desc: "Input",
    byteRanges: [
      { address: 0x0368, length: 1 },
      { address: 0x5869, length: 1 },
    ],
    type: DataType.ENUM,
    enums: [
      { name: "HDMI", value: new Uint8Array([5, 0]) },
      { name: "Front|Composite", value: new Uint8Array([3, 3]) },
      { name: "Front|S-Video", value: new Uint8Array([3, 4]) },
      { name: "RCA|YPbPr", value: new Uint8Array([0, 7]) },
      { name: "RCA|RGsB", value: new Uint8Array([0, 8]) },
      { name: "RCA|CVBS on Green", value: new Uint8Array([0, 9]) },
      { name: "SCART|RGBS (75 Ohm)", value: new Uint8Array([2, 12]) },
      { name: "SCART|RGsB", value: new Uint8Array([2, 13]) },
      { name: "SCART|YPbPr", value: new Uint8Array([2, 14]) },
      { name: "SCART|CVBS on Pin 20", value: new Uint8Array([2, 15]) },
      { name: "SCART|CVBS on Green", value: new Uint8Array([2, 16]) },
      { name: "SCART|Y/C on Pin 20/Red", value: new Uint8Array([2, 17]) },
      { name: "HD-15|RGBHV", value: new Uint8Array([1, 20]) },
      { name: "HD-15|RGBS", value: new Uint8Array([1, 21]) },
      { name: "HD-15|RGsB", value: new Uint8Array([1, 22]) },
      { name: "HD-15|YPbPr", value: new Uint8Array([1, 23]) },
      { name: "HD-15|CVBS on Hsync", value: new Uint8Array([1, 24]) },
      { name: "HD-15|CVBS on Green", value: new Uint8Array([1, 25]) },
      { name: "HD-15|Y/C on Green/Red", value: new Uint8Array([1, 26]) },
      { name: "HD-15|Y/C on G/R (Enh.)", value: new Uint8Array([1, 27]) },
    ],
    flagName: "input",
    cliDesc: "Input source",
  },
  {
    name: "advanced.effects.mask.enabled",
    desc: "Advanced -> Processing -> Mask -> Enabled",
    byteRanges: [{ address: 0x008c, length: 1 }],
    type: DataType.BIT,
    flagName: "mask-enabled",
    cliDesc: "CRT mask enabled",
  },
  {
    name: "advanced.effects.mask.strength",
    desc: "Advanced -> Processing -> Mask -> Strength",
    byteRanges: [{ address: 0x02a0, length: 1 }],
    type: DataType.SIGNED_INT,
    flagName: "mask-strength",
    cliDesc: "CRT mask strength (-128 to 127)",
  },
  {
    name: "advanced.effects.mask.path",
    desc: "Advanced -> Processing -> Mask -> Path",
    byteRanges: [{ address: 0x0090, length: 256 }],
    type: DataType.STR,
    flagName: "mask-path",
    cliDesc: "CRT mask BMP file path",
  },
  {
    name: "advanced.system.osd_firmware.banner_image.load_banner",
    desc: "Advanced -> System -> OSD/Firmware -> Banner Image -> Load Banner",
    byteRanges: [{ address: 0x1644, length: 256 }],
    type: DataType.STR,
    flagName: "banner",
    cliDesc: "Banner image BMP file path",
  },
  {
    name: "advanced.system.osd_firmware.on_screen_display.position",
    desc: "Advanced -> System -> OSD/Firmware -> On Screen Display -> Position",
    byteRanges: [{ address: 0x184c, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Left", value: new Uint8Array([0]) },
      { name: "Center", value: new Uint8Array([1]) },
      { name: "Right", value: new Uint8Array([2]) },
    ],
    flagName: "osd-position",
    cliDesc: "OSD position",
  },
  {
    name: "advanced.system.osd_firmware.on_screen_display.auto_off",
    desc: "Advanced -> System -> OSD/Firmware -> On Screen Display -> Auto-Off",
    byteRanges: [{ address: 0x1848, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Off", value: new Uint8Array([0]) },
      { name: "10sec", value: new Uint8Array([1]) },
      { name: "20sec", value: new Uint8Array([2]) },
      { name: "30sec", value: new Uint8Array([3]) },
      { name: "40sec", value: new Uint8Array([4]) },
      { name: "50sec", value: new Uint8Array([5]) },
      { name: "60sec", value: new Uint8Array([6]) },
      { name: "70sec", value: new Uint8Array([7]) },
      { name: "80sec", value: new Uint8Array([8]) },
      { name: "90sec", value: new Uint8Array([9]) },
      { name: "100sec", value: new Uint8Array([10]) },
    ],
    flagName: "osd-auto-off",
    cliDesc: "OSD auto-off timeout",
  },
  {
    name: "advanced.system.osd_firmware.on_screen_display.hide_input_res",
    desc: "Advanced -> System -> OSD/Firmware -> On Screen Display -> Hide Input Res.",
    byteRanges: [{ address: 0x1ef8, length: 1 }],
    type: DataType.BIT,
    flagName: "osd-hide-input-res",
    cliDesc: "Hide input resolution in OSD",
  },
  {
    name: "advanced.system.osd_firmware.on_screen_display.enable_debug_osd",
    desc: "Advanced -> System -> OSD/Firmware -> On Screen Display -> Enable Debug OSD",
    byteRanges: [{ address: 0x1854, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Off", value: new Uint8Array([0]) },
      { name: "Status Pg 1", value: new Uint8Array([1]) },
      { name: "Status Pg 2", value: new Uint8Array([2]) },
      { name: "Status Pg 3", value: new Uint8Array([3]) },
      { name: "Console", value: new Uint8Array([4]) },
    ],
    flagName: "debug-osd",
    cliDesc: "Debug OSD page",
  },
  {
    name: "advanced.effects.interpolation.linear_light",
    desc: "Advanced -> Processing -> Interpolation -> Linear Light",
    byteRanges: [{ address: 0x02e4, length: 1 }],
    type: DataType.BIT,
    flagName: "linear-light",
    cliDesc: "Linear light processing",
  },
  {
    name: "advanced.effects.interpolation.anti_ringing",
    desc: "Advanced -> Processing -> Interpolation -> Anti-Ringing",
    byteRanges: [{ address: 0x02e8, length: 1 }],
    type: DataType.BIT,
    flagName: "anti-ringing",
    cliDesc: "Anti-ringing filter",
  },
  {
    name: "hdmi_receiver.mister_dv1.auto_crop",
    desc: "HDMI Receiver -> MiSTer DV1 -> Auto-Crop",
    byteRanges: [{ address: 0x1f0c, length: 1 }],
    type: DataType.BIT,
    flagName: "dv1-auto-crop",
    cliDesc: "DV1 auto-crop",
  },
  {
    name: "hdmi_receiver.mister_dv1.auto_decimate",
    desc: "HDMI Receiver -> MiSTer DV1 -> Auto-Decimate",
    byteRanges: [{ address: 0x1f10, length: 1 }],
    type: DataType.BIT,
    flagName: "dv1-auto-decimate",
    cliDesc: "DV1 auto-decimate",
  },
  {
    name: "hdmi_receiver.mister_dv1.enabled",
    desc: "HDMI Receiver -> MiSTer DV1 -> Enabled",
    byteRanges: [{ address: 0x20d0, length: 1 }],
    type: DataType.BIT,
    flagName: "dv1-enabled",
    cliDesc: "DV1 mode enabled",
  },
  {
    name: "output.scaling_mode",
    desc: "HDMI Output -> Scaling Mode",
    byteRanges: [{ address: 0x091c, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Auto Fill", value: new Uint8Array([0]) },
      { name: "Proportional", value: new Uint8Array([1]) },
      { name: "Free Form", value: new Uint8Array([2]) },
      { name: "Auto Fill Integer", value: new Uint8Array([3]) },
    ],
    flagName: "scaling-mode",
    cliDesc: "Scaling mode",
  },
  {
    name: "output.rotation",
    desc: "HDMI Output -> Rotation",
    byteRanges: [{ address: 0x1868, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "None", value: new Uint8Array([0]) },
      { name: "Right 90", value: new Uint8Array([1]) },
      { name: "Left 90", value: new Uint8Array([2]) },
    ],
    flagName: "rotation",
    cliDesc: "Output rotation",
  },
  {
    name: "output.auto_rotate",
    desc: "HDMI Output -> Auto Rotate",
    byteRanges: [{ address: 0x1f64, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "On", value: new Uint8Array([0]) },
      { name: "Off", value: new Uint8Array([1]) },
    ],
    flagName: "auto-rotate",
    cliDesc: "Auto rotate",
  },
  {
    name: "output.auto_crop",
    desc: "HDMI Output -> Auto Crop",
    byteRanges: [{ address: 0x1888, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: "Off", value: new Uint8Array([0]) },
      { name: "On", value: new Uint8Array([1]) },
      { name: "Off", value: new Uint8Array([8]) },
    ],
    flagName: "auto-crop",
    cliDesc: "Auto crop",
  },
  {
    name: "output.crop_240p.top",
    desc: "HDMI Output -> Manual Crop -> 240p Top",
    byteRanges: [{ address: 0x0694, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-240p-top",
    cliDesc: "240p manual crop top (-32768 to 32767)",
  },
  {
    name: "output.crop_240p.bottom",
    desc: "HDMI Output -> Manual Crop -> 240p Bottom",
    byteRanges: [{ address: 0x0794, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-240p-bottom",
    cliDesc: "240p manual crop bottom (-32768 to 32767)",
  },
  {
    name: "output.crop_240p.left",
    desc: "HDMI Output -> Manual Crop -> 240p Left",
    byteRanges: [{ address: 0x0594, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-240p-left",
    cliDesc: "240p manual crop left (-32768 to 32767)",
  },
  {
    name: "output.crop_240p.right",
    desc: "HDMI Output -> Manual Crop -> 240p Right",
    byteRanges: [{ address: 0x0494, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-240p-right",
    cliDesc: "240p manual crop right (-32768 to 32767)",
  },
  {
    name: "output.crop_480i.top",
    desc: "HDMI Output -> Manual Crop -> 480i Top",
    byteRanges: [{ address: 0x0696, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-480i-top",
    cliDesc: "480i manual crop top (-32768 to 32767)",
  },
  {
    name: "output.crop_480i.bottom",
    desc: "HDMI Output -> Manual Crop -> 480i Bottom",
    byteRanges: [{ address: 0x0796, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-480i-bottom",
    cliDesc: "480i manual crop bottom (-32768 to 32767)",
  },
  {
    name: "output.crop_480i.left",
    desc: "HDMI Output -> Manual Crop -> 480i Left",
    byteRanges: [{ address: 0x0596, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-480i-left",
    cliDesc: "480i manual crop left (-32768 to 32767)",
  },
  {
    name: "output.crop_480i.right",
    desc: "HDMI Output -> Manual Crop -> 480i Right",
    byteRanges: [{ address: 0x0496, length: 2 }],
    type: DataType.SIGNED_SHORT,
    flagName: "crop-480i-right",
    cliDesc: "480i manual crop right (-32768 to 32767)",
  },
];

export function getSettingDef(name: string): SettingDef {
  const def = SCHEMA.find((s) => s.name === name);
  if (!def) throw new Error(`Setting not found: ${name}`);
  return def;
}

export function getSettingsFromFlags(
  flags: Record<string, string | undefined>,
): Array<{ path: string; value: string; def: SettingDef }> {
  const results: Array<{ path: string; value: string; def: SettingDef }> = [];
  for (const def of SCHEMA) {
    if (!def.flagName) continue;
    const value = flags[def.flagName];
    if (value !== undefined) {
      results.push({ path: def.name, value, def });
    }
  }
  return results;
}

export function getValidValuesHint(def: SettingDef): string | undefined {
  switch (def.type) {
    case DataType.ENUM:
      return def.enums?.map(e => e.name).join(", ");
    case DataType.BIT:
      return "true, false";
    default:
      return undefined;
  }
}
