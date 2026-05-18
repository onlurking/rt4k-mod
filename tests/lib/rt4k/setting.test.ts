import { describe, expect, it } from 'bun:test';
import { SettingValidationError } from '../../../src/lib/rt4k/exceptions';
import { getSettingDef, type SettingDef } from '../../../src/lib/rt4k/schema';
import { RetroTinkSetting, RetroTinkSettingValue } from '../../../src/lib/rt4k/setting';
import { DataType } from '../../../src/lib/rt4k/types';

const vrrDef = getSettingDef('output.transmitter.vrr');

function strDef(length = 8): SettingDef {
  return {
    name: 'test.string',
    desc: 'Test string',
    byteRanges: [{ address: 0, length }],
    type: DataType.STR,
  };
}

function intDef(type: DataType.INT | DataType.SIGNED_INT | DataType.BIT): SettingDef {
  return {
    name: `test.${type}`,
    desc: 'Test integer',
    byteRanges: [{ address: 0, length: 1 }],
    type,
  };
}

describe('RetroTinkSetting', () => {
  it('exposes SettingDef fields and computed length', () => {
    const setting = new RetroTinkSetting(getSettingDef('input'));

    expect(setting.name).toBe('input');
    expect(setting.desc).toBe('Input');
    expect(setting.byteRanges).toEqual([
      { address: 0x0368, length: 1 },
      { address: 0x5869, length: 1 },
    ]);
    expect(setting.type).toBe(DataType.ENUM);
    expect(setting.enums?.length).toBe(20);
    expect(setting.readOnly).toBe(false);
    expect(setting.length()).toBe(2);
    expect(setting.validValues()).toContain('HDMI');
  });

  it('defaults readOnly to false and returns human-readable valid values', () => {
    expect(new RetroTinkSetting(getSettingDef('header')).readOnly).toBe(true);
    expect(new RetroTinkSetting(intDef(DataType.INT)).validValues()).toBe('number between 0 and 255');
    expect(new RetroTinkSetting(intDef(DataType.SIGNED_INT)).validValues()).toBe('number between -128 and 127');
    expect(new RetroTinkSetting(intDef(DataType.BIT)).validValues()).toBe('boolean or number between 0 and 1');
    expect(new RetroTinkSetting(strDef()).validValues()).toBe('string');
  });
});

describe('RetroTinkSettingValue', () => {
  describe('compareUint8Array', () => {
    it('compares byte arrays byte-by-byte', () => {
      expect(RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([1]))).toBe(true);
      expect(RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([2]))).toBe(false);
      expect(RetroTinkSettingValue.compareUint8Array(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false);
    });
  });

  describe('ENUM', () => {
    it('decodes bytes to enum names', () => {
      const settingValue = new RetroTinkSettingValue(vrrDef, new Uint8Array([0x01]));

      expect(settingValue.asString()).toBe('FreeSync');
    });

    it('sets enum bytes from case-insensitive names', () => {
      const settingValue = new RetroTinkSettingValue(vrrDef);

      settingValue.fromString('Off');
      expect(settingValue.value).toEqual(new Uint8Array([0x00]));

      settingValue.fromString('off');
      expect(settingValue.value).toEqual(new Uint8Array([0x00]));

      settingValue.fromString('OFF');
      expect(settingValue.value).toEqual(new Uint8Array([0x00]));

      settingValue.fromString('freesync');
      expect(settingValue.value).toEqual(new Uint8Array([0x01]));
    });

    it('throws SettingValidationError for invalid bytes', () => {
      expect(() => new RetroTinkSettingValue(vrrDef, new Uint8Array([0xff]))).toThrow(SettingValidationError);
      expect(() => new RetroTinkSettingValue(vrrDef, new Uint8Array([0xff]))).toThrow('Must be one of:');
    });

    it('sets enum bytes from a 0-based index', () => {
      const settingValue = new RetroTinkSettingValue(vrrDef);

      settingValue.fromInt(1);

      expect(settingValue.value).toEqual(vrrDef.enums![1].value);
    });

    it('supports multi-byte enum comparison', () => {
      const input = new RetroTinkSettingValue(getSettingDef('input'), new Uint8Array([5, 0]));

      expect(input.asString()).toBe('HDMI');
    });
  });

  describe('STR', () => {
    it('returns empty string when first byte is null', () => {
      const settingValue = new RetroTinkSettingValue(strDef(), new Uint8Array([0, 83, 78, 69, 83]));

      expect(settingValue.asString()).toBe('');
    });

    it('writes strings as char codes with null termination', () => {
      const settingValue = new RetroTinkSettingValue(strDef(8));

      settingValue.fromString('SNES');

      expect(settingValue.value).toEqual(new Uint8Array([83, 78, 69, 83, 0, 0, 0, 0]));
    });

    it('filters null bytes while decoding strings', () => {
      const settingValue = new RetroTinkSettingValue(strDef(), new Uint8Array([83, 0, 78, 69, 83, 0]));

      expect(settingValue.asString()).toBe('SNES');
    });
  });

  describe('BIT', () => {
    it('decodes booleans from first byte', () => {
      expect(new RetroTinkSettingValue(intDef(DataType.BIT), new Uint8Array([1])).asBoolean()).toBe(true);
      expect(new RetroTinkSettingValue(intDef(DataType.BIT), new Uint8Array([0])).asBoolean()).toBe(false);
    });

    it('sets bit values from strings and booleans', () => {
      const settingValue = new RetroTinkSettingValue(intDef(DataType.BIT));

      settingValue.fromString('true');
      expect(settingValue.value[0]).toBe(1);

      settingValue.fromString('false');
      expect(settingValue.value[0]).toBe(0);

      settingValue.fromBool(true);
      expect(settingValue.value[0]).toBe(1);
    });
  });

  describe('INT', () => {
    it('encodes and decodes unsigned 8-bit integers', () => {
      const settingValue = new RetroTinkSettingValue(intDef(DataType.INT));

      settingValue.fromInt(100);
      expect(settingValue.value[0]).toBe(100);
      expect(settingValue.asInt()).toBe(100);

      settingValue.fromInt(255);
      expect(settingValue.value[0]).toBe(255);
    });
  });

  describe('SIGNED_INT', () => {
    it('decodes signed 8-bit integers', () => {
      expect(new RetroTinkSettingValue(intDef(DataType.SIGNED_INT), new Uint8Array([251])).asInt()).toBe(-5);
      expect(new RetroTinkSettingValue(intDef(DataType.SIGNED_INT), new Uint8Array([127])).asInt()).toBe(127);
    });

    it('encodes signed 8-bit integers', () => {
      const settingValue = new RetroTinkSettingValue(intDef(DataType.SIGNED_INT));

      settingValue.fromInt(-5);
      expect(settingValue.value[0]).toBe(251);

      settingValue.fromInt(-128);
      expect(settingValue.value[0]).toBe(128);
    });
  });

  describe('asPlainObject', () => {
    it('builds nested objects with enum string values', () => {
      const settingValue = new RetroTinkSettingValue(vrrDef, new Uint8Array([0x01]));

      expect(settingValue.asPlainObject()).toEqual({ output: { transmitter: { vrr: 'FreeSync' } } });
    });

    it('builds nested objects with bit boolean values', () => {
      const settingValue = new RetroTinkSettingValue(getSettingDef('output.transmitter.deep_color'), new Uint8Array([0x01]));

      expect(settingValue.asPlainObject()).toEqual({ output: { transmitter: { deep_color: true } } });
    });
  });

  describe('error format', () => {
    it('uses SettingValidationError message format', () => {
      try {
        new RetroTinkSettingValue(vrrDef, new Uint8Array([0xff]));
      } catch (err) {
        expect(err).toBeInstanceOf(SettingValidationError);
        expect((err as Error).message).toContain('(output.transmitter.vrr) failed validation with (');
        expect((err as Error).message).toContain('Must be one of:');
      }
    });
  });
});
