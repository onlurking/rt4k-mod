import { DataType } from "./types";

export interface SettingDef {
  name: string;
  desc: string;
  byteRanges: { address: number; length: number }[];
  type: DataType;
  readOnly?: boolean;
  enums?: { name: string; value: Uint8Array }[];
}

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
    ],
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
  },
  {
    name: "output.transmitter.deep_color",
    desc: "HDMI Output -> Transmitter -> Deep Color",
    byteRanges: [{ address: 0x02d4, length: 1 }],
    type: DataType.BIT,
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
  },
];

export function getSettingDef(name: string): SettingDef {
  const def = SCHEMA.find((s) => s.name === name);
  if (!def) throw new Error(`Setting not found: ${name}`);
  return def;
}

