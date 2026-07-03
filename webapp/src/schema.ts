import { DataType, type SettingDef, type SettingGroup } from './types'

export const SCHEMA: SettingDef[] = [
  {
    name: 'header',
    desc: 'File Header (Read-Only)',
    byteRanges: [{ address: 0x0000, length: 12 }],
    type: DataType.STR,
    readOnly: true,
  },
  {
    name: 'output.transmitter.vrr',
    desc: 'HDMI Output → Transmitter → VRR',
    byteRanges: [{ address: 0x02dc, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Off', value: [0] },
      { name: 'FreeSync', value: [1] },
      { name: 'VESA', value: [2] },
    ],
    flagName: 'vrr',
    cliDesc: 'VRR mode',
  },
  {
    name: 'output.resolution',
    desc: 'HDMI Output → Resolution',
    byteRanges: [{ address: 0x036c, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: '4K60', value: [0] },
      { name: '4K50', value: [1] },
      { name: '1080p60', value: [2] },
      { name: '1080p50', value: [3] },
      { name: '1440p60', value: [4] },
      { name: '1440p50', value: [5] },
      { name: '1080p100', value: [6] },
      { name: '1440p100', value: [7] },
      { name: '1080p120', value: [8] },
      { name: '1440p120', value: [9] },
      { name: '480p60', value: [13] },
      { name: 'Custom 1', value: [69] },
      { name: 'Custom 2', value: [70] },
      { name: 'Custom 3', value: [71] },
      { name: 'Custom 4', value: [72] },
    ],
    flagName: 'resolution',
    cliDesc: 'Output resolution',
  },
  {
    name: 'output.transmitter.hdr',
    desc: 'HDMI Output → Transmitter → HDR',
    byteRanges: [{ address: 0x02d0, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Off', value: [0] },
      { name: 'HDR10 [8-bit]', value: [1] },
      { name: 'HLG [8-bit]', value: [2] },
    ],
    flagName: 'hdr',
    cliDesc: 'HDR mode',
  },
  {
    name: 'output.transmitter.deep_color',
    desc: 'HDMI Output → Transmitter → Deep Color',
    byteRanges: [{ address: 0x02d4, length: 1 }],
    type: DataType.BIT,
    flagName: 'deep-color',
    cliDesc: 'Deep color (10-bit output)',
  },
  {
    name: 'output.transmitter.sync_lock',
    desc: 'HDMI Output → Transmitter → Sync Lock',
    byteRanges: [{ address: 0x02d8, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Triple Buffer', value: [0] },
      { name: 'Gen Lock', value: [1] },
      { name: 'Frame Lock', value: [2] },
    ],
    flagName: 'sync-lock',
    cliDesc: 'Sync lock mode',
  },
  {
    name: 'output.transmitter.colorimetry',
    desc: 'HDMI Output → Transmitter → Colorimetry',
    byteRanges: [{ address: 0x1ec8, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Auto-Rec.709', value: [0] },
      { name: 'Rec.709', value: [1] },
      { name: 'Rec.2020', value: [2] },
      { name: 'Adobe RGB', value: [3] },
      { name: 'Display-P3', value: [4] },
    ],
    flagName: 'colorimetry',
    cliDesc: 'Output colorimetry',
  },
  {
    name: 'output.transmitter.rgb_range',
    desc: 'HDMI Output → Transmitter → RGB Range',
    byteRanges: [{ address: 0x1f08, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Full', value: [0] },
      { name: 'Limited', value: [1] },
    ],
    flagName: 'rgb-range',
    cliDesc: 'RGB range',
  },
  {
    name: 'input',
    desc: 'Input Source',
    byteRanges: [
      { address: 0x0368, length: 1 },
      { address: 0x5869, length: 1 },
    ],
    type: DataType.ENUM,
    enums: [
      { name: 'HDMI', value: [5, 0] },
      { name: 'Front|Composite', value: [3, 3] },
      { name: 'Front|S-Video', value: [3, 4] },
      { name: 'RCA|YPbPr', value: [0, 7] },
      { name: 'RCA|RGsB', value: [0, 8] },
      { name: 'RCA|CVBS on Green', value: [0, 9] },
      { name: 'SCART|RGBS (75 Ohm)', value: [2, 12] },
      { name: 'SCART|RGsB', value: [2, 13] },
      { name: 'SCART|YPbPr', value: [2, 14] },
      { name: 'SCART|CVBS on Pin 20', value: [2, 15] },
      { name: 'SCART|CVBS on Green', value: [2, 16] },
      { name: 'SCART|Y/C on Pin 20/Red', value: [2, 17] },
      { name: 'HD-15|RGBHV', value: [1, 20] },
      { name: 'HD-15|RGBS', value: [1, 21] },
      { name: 'HD-15|RGsB', value: [1, 22] },
      { name: 'HD-15|YPbPr', value: [1, 23] },
      { name: 'HD-15|CVBS on Hsync', value: [1, 24] },
      { name: 'HD-15|CVBS on Green', value: [1, 25] },
      { name: 'HD-15|Y/C on Green/Red', value: [1, 26] },
      { name: 'HD-15|Y/C on G/R (Enh.)', value: [1, 27] },
    ],
    flagName: 'input',
    cliDesc: 'Input source',
  },
  {
    name: 'advanced.effects.mask.enabled',
    desc: 'Effects → Mask → Enabled',
    byteRanges: [{ address: 0x008c, length: 1 }],
    type: DataType.BIT,
    flagName: 'mask-enabled',
    cliDesc: 'CRT mask enabled',
  },
  {
    name: 'advanced.effects.mask.strength',
    desc: 'Effects → Mask → Strength',
    byteRanges: [{ address: 0x02a0, length: 1 }],
    type: DataType.SIGNED_INT,
    flagName: 'mask-strength',
    cliDesc: 'CRT mask strength (-128 to 127)',
  },
  {
    name: 'advanced.effects.mask.path',
    desc: 'Effects → Mask → Path',
    byteRanges: [{ address: 0x0090, length: 256 }],
    type: DataType.STR,
    flagName: 'mask-path',
    cliDesc: 'CRT mask BMP file path',
  },
  {
    name: 'advanced.system.osd_firmware.banner_image.load_banner',
    desc: 'System → OSD → Banner Image',
    byteRanges: [{ address: 0x1644, length: 256 }],
    type: DataType.STR,
    flagName: 'banner',
    cliDesc: 'Banner image BMP file path',
  },
  {
    name: 'advanced.system.osd_firmware.on_screen_display.position',
    desc: 'System → OSD → Position',
    byteRanges: [{ address: 0x184c, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Left', value: [0] },
      { name: 'Center', value: [1] },
      { name: 'Right', value: [2] },
    ],
    flagName: 'osd-position',
    cliDesc: 'OSD position',
  },
  {
    name: 'advanced.system.osd_firmware.on_screen_display.auto_off',
    desc: 'System → OSD → Auto-Off',
    byteRanges: [{ address: 0x1848, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Off', value: [0] },
      { name: '10sec', value: [1] },
      { name: '20sec', value: [2] },
      { name: '30sec', value: [3] },
      { name: '40sec', value: [4] },
      { name: '50sec', value: [5] },
      { name: '60sec', value: [6] },
      { name: '70sec', value: [7] },
      { name: '80sec', value: [8] },
      { name: '90sec', value: [9] },
      { name: '100sec', value: [10] },
    ],
    flagName: 'osd-auto-off',
    cliDesc: 'OSD auto-off timeout',
  },
  {
    name: 'advanced.system.osd_firmware.on_screen_display.hide_input_res',
    desc: 'System → OSD → Hide Input Res.',
    byteRanges: [{ address: 0x1ef8, length: 1 }],
    type: DataType.BIT,
    flagName: 'osd-hide-input-res',
    cliDesc: 'Hide input resolution in OSD',
  },
  {
    name: 'advanced.system.osd_firmware.on_screen_display.enable_debug_osd',
    desc: 'System → OSD → Debug OSD',
    byteRanges: [{ address: 0x1854, length: 1 }],
    type: DataType.ENUM,
    enums: [
      { name: 'Off', value: [0] },
      { name: 'Status Pg 1', value: [1] },
      { name: 'Status Pg 2', value: [2] },
      { name: 'Status Pg 3', value: [3] },
      { name: 'Console', value: [4] },
    ],
    flagName: 'debug-osd',
    cliDesc: 'Debug OSD page',
  },
  {
    name: 'advanced.effects.interpolation.linear_light',
    desc: 'Effects → Interpolation → Linear Light',
    byteRanges: [{ address: 0x02e4, length: 1 }],
    type: DataType.BIT,
    flagName: 'linear-light',
    cliDesc: 'Linear light processing',
  },
  {
    name: 'advanced.effects.interpolation.anti_ringing',
    desc: 'Effects → Interpolation → Anti-Ringing',
    byteRanges: [{ address: 0x02e8, length: 1 }],
    type: DataType.BIT,
    flagName: 'anti-ringing',
    cliDesc: 'Anti-ringing filter',
  },
  {
    name: 'hdmi_receiver.mister_dv1.auto_crop',
    desc: 'DV1 → Auto-Crop',
    byteRanges: [{ address: 0x1f0c, length: 1 }],
    type: DataType.BIT,
    flagName: 'dv1-auto-crop',
    cliDesc: 'DV1 auto-crop',
  },
  {
    name: 'hdmi_receiver.mister_dv1.auto_decimate',
    desc: 'DV1 → Auto-Decimate',
    byteRanges: [{ address: 0x1f10, length: 1 }],
    type: DataType.BIT,
    flagName: 'dv1-auto-decimate',
    cliDesc: 'DV1 auto-decimate',
  },
  {
    name: 'hdmi_receiver.mister_dv1.enabled',
    desc: 'DV1 → Enabled',
    byteRanges: [{ address: 0x20d0, length: 1 }],
    type: DataType.BIT,
    flagName: 'dv1-enabled',
    cliDesc: 'DV1 mode enabled',
  },
  {
    name: 'scaling.crop.top',
    desc: 'Scaling → Crop → Top',
    byteRanges: [{ address: 0x0694, length: 2 }],
    type: DataType.SIGNED_INT,
    flagName: 'crop-top',
    cliDesc: 'Top crop (signed, pixels)',
  },
  {
    name: 'scaling.crop.bottom',
    desc: 'Scaling → Crop → Bottom',
    byteRanges: [{ address: 0x0794, length: 2 }],
    type: DataType.SIGNED_INT,
    flagName: 'crop-bottom',
    cliDesc: 'Bottom crop (signed, pixels)',
  },
  {
    name: 'scaling.crop.left',
    desc: 'Scaling → Crop → Left',
    byteRanges: [{ address: 0x0594, length: 2 }],
    type: DataType.SIGNED_INT,
    flagName: 'crop-left',
    cliDesc: 'Left crop (signed, pixels)',
  },
  {
    name: 'scaling.crop.right',
    desc: 'Scaling → Crop → Right',
    byteRanges: [{ address: 0x0494, length: 2 }],
    type: DataType.SIGNED_INT,
    flagName: 'crop-right',
    cliDesc: 'Right crop (signed, pixels)',
  },
]

export function getSettingDef(name: string): SettingDef {
  const def = SCHEMA.find((s) => s.name === name)
  if (!def) throw new Error(`Setting not found: ${name}`)
  return def
}

export function getEnumOptions(name: string): string[] {
  const def = getSettingDef(name)
  if (def.type !== DataType.ENUM || !def.enums) return []
  return def.enums.map((e) => e.name)
}

export function getValidValuesHint(def: SettingDef): string | undefined {
  switch (def.type) {
    case DataType.ENUM:
      return def.enums?.map((e) => e.name).join(', ')
    case DataType.BIT:
      return 'true, false'
    default:
      return undefined
  }
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    label: 'Output / Transmitter',
    settingNames: [
      'output.resolution',
      'output.transmitter.hdr',
      'output.transmitter.deep_color',
      'output.transmitter.vrr',
      'output.transmitter.sync_lock',
      'output.transmitter.colorimetry',
      'output.transmitter.rgb_range',
      'input',
    ],
  },
  {
    label: 'Scaling / Crop',
    settingNames: [
      'scaling.crop.top',
      'scaling.crop.bottom',
      'scaling.crop.left',
      'scaling.crop.right',
    ],
  },
  {
    label: 'Effects / Processing',
    settingNames: [
      'advanced.effects.mask.enabled',
      'advanced.effects.mask.strength',
      'advanced.effects.mask.path',
      'advanced.effects.interpolation.linear_light',
      'advanced.effects.interpolation.anti_ringing',
    ],
  },
  {
    label: 'System / OSD',
    settingNames: [
      'advanced.system.osd_firmware.banner_image.load_banner',
      'advanced.system.osd_firmware.on_screen_display.position',
      'advanced.system.osd_firmware.on_screen_display.auto_off',
      'advanced.system.osd_firmware.on_screen_display.hide_input_res',
      'advanced.system.osd_firmware.on_screen_display.enable_debug_osd',
    ],
  },
  {
    label: 'DV1',
    settingNames: [
      'hdmi_receiver.mister_dv1.enabled',
      'hdmi_receiver.mister_dv1.auto_crop',
      'hdmi_receiver.mister_dv1.auto_decimate',
    ],
  },
]
