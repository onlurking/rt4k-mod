import { afterEach, describe, expect, it } from 'bun:test';
import { InvalidProfileFormatError, ProfileNotFoundError } from '../../../src/lib/rt4k/exceptions';
import { RetroTinkProfile } from '../../../src/lib/rt4k/profile';
import { SCHEMA } from '../../../src/lib/rt4k/schema';

const fixturePath = 'tests/fixtures/SNES.rt4';
const tempFiles = ['/tmp/rt4k-profile-save-test.rt4', '/tmp/rt4k-profile-write-test.rt4'];

afterEach(async () => {
  await Promise.all(tempFiles.map(path => Bun.file(path).delete().catch(() => undefined)));
});

async function readFixture(): Promise<Uint8Array> {
  return new Uint8Array(await Bun.file(fixturePath).arrayBuffer());
}

describe('RetroTinkProfile', () => {
  describe('build', () => {
    it('resolves for a valid profile file', async () => {
      await expect(RetroTinkProfile.build(fixturePath)).resolves.toBeInstanceOf(RetroTinkProfile);
    });

    it('throws InvalidProfileFormatError for invalid header bytes', () => {
      expect(() => RetroTinkProfile.fromBytes(new Uint8Array(23004))).toThrow(InvalidProfileFormatError);
      expect(() => RetroTinkProfile.fromBytes(new Uint8Array(23004))).toThrow('Header is invalid');
    });

    it('throws ProfileNotFoundError for a nonexistent profile path', async () => {
      await expect(RetroTinkProfile.build('/tmp/rt4k-profile-does-not-exist.rt4')).rejects.toThrow(ProfileNotFoundError);
    });
  });

  describe('getValue', () => {
    it('reads output.transmitter.vrr as FreeSync from SNES.rt4', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);

      expect(profile.getValue('output.transmitter.vrr').asString()).toBe('FreeSync');
    });

    it('reads input across multiple byte ranges as HDMI from SNES.rt4', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);

      expect(profile.getValue('input').asString()).toBe('HDMI');
    });
  });

  describe('setValue', () => {
    it('updates output.transmitter.vrr in memory', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);

      profile.setValue('output.transmitter.vrr', 'Off');

      expect(profile.getValue('output.transmitter.vrr').asString()).toBe('Off');
    });
  });

  describe('getValues', () => {
    it('returns a nested plain object containing output.transmitter.vrr', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);
      const values = profile.getValues().asPlainObject();

      expect(values).toHaveProperty('output.transmitter.vrr', 'FreeSync');
    });
  });

  describe('serializeValues', () => {
    it('returns valid JSON containing output.transmitter.vrr', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);
      const parsed = JSON.parse(profile.serializeValues()) as { output: { transmitter: { vrr: string } } };

      expect(parsed.output.transmitter.vrr).toBe('FreeSync');
    });
  });

  describe('save', () => {
    it('writes a profile that reloads and stores a non-zero CRC', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);

      await profile.save('/tmp/rt4k-profile-save-test.rt4');

      const reloaded = await RetroTinkProfile.build('/tmp/rt4k-profile-save-test.rt4');
      const bytes = new Uint8Array(await Bun.file('/tmp/rt4k-profile-save-test.rt4').arrayBuffer());
      expect(reloaded.getValue('output.transmitter.vrr').asString()).toBe('FreeSync');
      expect(bytes[32] === 0 && bytes[33] === 0).toBe(false);
    });

    it('preserves other values after setValue, save, and reload', async () => {
      const profile = await RetroTinkProfile.build(fixturePath);
      const before = {
        input: profile.getValue('input').asString(),
        resolution: profile.getValue('output.resolution').asString(),
        hdr: profile.getValue('output.transmitter.hdr').asString(),
      };

      profile.setValue('output.transmitter.vrr', 'Off');
      await profile.save('/tmp/rt4k-profile-write-test.rt4');

      const reloaded = await RetroTinkProfile.build('/tmp/rt4k-profile-write-test.rt4');
      expect(reloaded.getValue('output.transmitter.vrr').asString()).toBe('Off');
      expect(reloaded.getValue('input').asString()).toBe(before.input);
      expect(reloaded.getValue('output.resolution').asString()).toBe(before.resolution);
      expect(reloaded.getValue('output.transmitter.hdr').asString()).toBe(before.hdr);
    });

    it('persists multi-range input writes', async () => {
      const inputAllowsComposite = SCHEMA.find(setting => setting.name === 'input')?.enums?.some(e => e.name === 'Front|Composite');
      if (!inputAllowsComposite) return;

      const profile = await RetroTinkProfile.build(fixturePath);
      profile.setValue('input', 'Front|Composite');

      await profile.save('/tmp/rt4k-profile-write-test.rt4');

      const reloaded = await RetroTinkProfile.build('/tmp/rt4k-profile-write-test.rt4');
      expect(reloaded.getValue('input').asString()).toBe('Front|Composite');
    });
  });

  describe('getSettingsNames', () => {
    it('returns writable setting names only', async () => {
      const profile = RetroTinkProfile.fromBytes(await readFixture());
      const names = profile.getSettingsNames();

      expect(names.every(name => typeof name === 'string')).toBe(true);
      for (const readOnlySetting of SCHEMA.filter(setting => setting.readOnly)) {
        expect(names).not.toContain(readOnlySetting.name);
      }
    });
  });
});
