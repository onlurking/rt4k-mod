import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { RetroTinkProfile } from '../../../src/lib/rt4k/index';

const SNES_FIXTURE = 'tests/fixtures/SNES.rt4';
const GENESIS_FIXTURE = 'tests/fixtures/Genesis.rt4';
const NES_FIXTURE = 'tests/fixtures/NES.rt4';

const tempFiles = [
  '/tmp/parity-input-test.rt4',
  '/tmp/parity-vrr-test.rt4',
  '/tmp/parity-crc-test.rt4',
];

afterAll(async () => {
  await Promise.all(tempFiles.map(path => Bun.file(path).delete().catch(() => undefined)));
});

describe('Parity tests - SNES.rt4 known values', () => {
  let profile: RetroTinkProfile;

  beforeAll(async () => {
    profile = await RetroTinkProfile.build(SNES_FIXTURE);
  });

  test('serializeValues contains all expected keys', () => {
    const parsed = JSON.parse(profile.serializeValues()) as Record<string, unknown>;

    expect(parsed['input']).toBe('HDMI');
    expect((parsed['output'] as Record<string, unknown>)['resolution']).toBe('4K60');

    const transmitter = ((parsed['output'] as Record<string, unknown>)['transmitter']) as Record<string, unknown>;
    expect(transmitter['vrr']).toBe('FreeSync');
    expect(transmitter['hdr']).toBe('HDR10 [8-bit]');
    expect(transmitter['colorimetry']).toBe('Auto-Rec.709');
    expect(transmitter['rgb_range']).toBe('Full');
    expect(transmitter['sync_lock']).toBe('Gen Lock');
    expect(transmitter['deep_color']).toBe(true);

    const mask = (((parsed['advanced'] as Record<string, unknown>)['effects']) as Record<string, unknown>)['mask'] as Record<string, unknown>;
    expect(mask['enabled']).toBe(true);
    expect(mask['strength']).toBe(-2);
    expect(typeof mask['path']).toBe('string');
    expect((mask['path'] as string).includes('RGB Masks')).toBe(true);
  });

  test("mask.strength is -2 (SIGNED_INT two's complement, raw byte 0xFE)", () => {
    expect(profile.getValue('advanced.effects.mask.strength').asInt()).toBe(-2);
  });

  test('multi-range write round-trip - input set to Front|Composite', async () => {
    const altInput = 'Front|Composite';
    const p = await RetroTinkProfile.build(SNES_FIXTURE);
    p.setValue('input', altInput);
    await p.save('/tmp/parity-input-test.rt4');
    const reloaded = await RetroTinkProfile.build('/tmp/parity-input-test.rt4');
    expect(reloaded.getValue('input').asString()).toBe(altInput);
  });

  test('VRR Off round-trip - other parity values unchanged', async () => {
    const p = await RetroTinkProfile.build(SNES_FIXTURE);
    p.setValue('output.transmitter.vrr', 'Off');
    await p.save('/tmp/parity-vrr-test.rt4');
    const reloaded = await RetroTinkProfile.build('/tmp/parity-vrr-test.rt4');

    expect(reloaded.getValue('output.transmitter.vrr').asString()).toBe('Off');

    expect(reloaded.getValue('input').asString()).toBe('HDMI');
    expect(reloaded.getValue('output.resolution').asString()).toBe('4K60');
    expect(reloaded.getValue('output.transmitter.hdr').asString()).toBe('HDR10 [8-bit]');
    expect(reloaded.getValue('output.transmitter.colorimetry').asString()).toBe('Auto-Rec.709');
    expect(reloaded.getValue('output.transmitter.rgb_range').asString()).toBe('Full');
    expect(reloaded.getValue('output.transmitter.sync_lock').asString()).toBe('Gen Lock');
    expect(reloaded.getValue('output.transmitter.deep_color').asBoolean()).toBe(true);
    expect(reloaded.getValue('advanced.effects.mask.enabled').asBoolean()).toBe(true);
    expect(reloaded.getValue('advanced.effects.mask.strength').asInt()).toBe(-2);
    expect(reloaded.getValue('advanced.effects.mask.path').asString().includes('RGB Masks')).toBe(true);
  });

  test('CRC validity - saved file has non-zero CRC bytes at [32] and [33]', async () => {
    const p = await RetroTinkProfile.build(SNES_FIXTURE);
    await p.save('/tmp/parity-crc-test.rt4');
    const bytes = new Uint8Array(await Bun.file('/tmp/parity-crc-test.rt4').arrayBuffer());
    expect(bytes[32] !== 0 || bytes[33] !== 0).toBe(true);
  });

  test('VRR diff - only output.transmitter.vrr changes when set to Off', async () => {
    const original = await RetroTinkProfile.build(SNES_FIXTURE);
    const modified = await RetroTinkProfile.build(SNES_FIXTURE);
    modified.setValue('output.transmitter.vrr', 'Off');

    const before = original.getValues().items;
    const after  = modified.getValues().items;

    const changed = before
      .map((sv, i) => ({
        name: sv.name,
        before: sv.asString(),
        after: after[i].asString(),
      }))
      .filter(d => d.before !== d.after);

    expect(changed).toEqual([
      { name: 'output.transmitter.vrr', before: 'FreeSync', after: 'Off' },
    ]);
  });

  test('all 3 fixtures load and serializeValues returns valid JSON', async () => {
    for (const fixture of [SNES_FIXTURE, GENESIS_FIXTURE, NES_FIXTURE]) {
      const p = await RetroTinkProfile.build(fixture);
      expect(() => JSON.parse(p.serializeValues())).not.toThrow();
    }
  });
});
