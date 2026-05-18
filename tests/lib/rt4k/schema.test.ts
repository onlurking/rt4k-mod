import { describe, it, expect } from 'bun:test';
import { SCHEMA, getSettingDef } from '../../../src/lib/rt4k/schema';

describe('SCHEMA', () => {
  it('has exactly 17 entries', () => {
    expect(SCHEMA.length).toBe(17);
  });

  it('all settings have byteRanges with at least 1 entry', () => {
    for (const s of SCHEMA) {
      expect(s.byteRanges.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('getSettingDef', () => {
  it('throws for nonexistent setting', () => {
    expect(() => getSettingDef('nonexistent')).toThrow('Setting not found: nonexistent');
  });

  it('header is readOnly', () => {
    expect(getSettingDef('header').readOnly).toBe(true);
  });

  it('input has 2 byteRanges', () => {
    const input = getSettingDef('input');
    expect(input.byteRanges.length).toBe(2);
  });

  it('input byteRanges[0].address === 872 (0x0368)', () => {
    expect(getSettingDef('input').byteRanges[0].address).toBe(872);
  });

  it('input byteRanges[1].address === 22633 (0x5869)', () => {
    expect(getSettingDef('input').byteRanges[1].address).toBe(22633);
  });

  it('input has 20 enum entries', () => {
    expect(getSettingDef('input').enums?.length).toBe(20);
  });

  it('input enums have 2-byte Uint8Array values', () => {
    for (const e of getSettingDef('input').enums!) {
      expect(e.value.length).toBe(2);
    }
  });

  it('output.transmitter.vrr has 3 enums: Off, FreeSync, VESA', () => {
    const vrr = getSettingDef('output.transmitter.vrr');
    expect(vrr.enums?.length).toBe(3);
    expect(vrr.enums![0].name).toBe('Off');
    expect(vrr.enums![1].name).toBe('FreeSync');
    expect(vrr.enums![2].name).toBe('VESA');
  });

  it('output.transmitter.vrr enums[1].name === FreeSync', () => {
    expect(getSettingDef('output.transmitter.vrr').enums![1].name).toBe('FreeSync');
  });
});
