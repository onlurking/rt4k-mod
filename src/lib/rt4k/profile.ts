import { CRC16CCITT } from './crc';
import { InvalidProfileFormatError } from './exceptions';
import { defaultFileIO, type FileIO } from './file-io';
import { deepMerge } from './object-utils';
import { SCHEMA, getSettingDef, type SettingDef } from './schema';
import { RetroTinkSettingValue } from './setting';

const HEADER = 'RT4K Profile';
const CRC_WRITE_INDEX = 32;
const DATA_START_INDEX = 128;

export class RetroTinkProfile {
  private constructor(private _bytes: Uint8Array) {}

  static async build(filename: string, io: FileIO = defaultFileIO): Promise<RetroTinkProfile> {
    const bytes = await io.read(filename);
    return RetroTinkProfile.fromBytes(bytes);
  }

  static fromBytes(bytes: Uint8Array): RetroTinkProfile {
    const actualHeader = String.fromCharCode(...bytes.slice(0, HEADER.length));
    if (actualHeader !== HEADER) {
      throw new InvalidProfileFormatError(`Header is invalid: ${actualHeader}`);
    }

    return new RetroTinkProfile(bytes);
  }

  static sliceBytes(setting: SettingDef, bytes: Uint8Array): Uint8Array {
    const parts = setting.byteRanges.map(range => bytes.slice(range.address, range.address + range.length));
    return new Uint8Array(parts.reduce<number[]>((acc, part) => [...acc, ...part], []));
  }

  getSettingsNames(): string[] {
    return SCHEMA.filter(setting => !setting.readOnly).map(setting => setting.name);
  }

  getValue(name: string): RetroTinkSettingValue {
    const def = getSettingDef(name);
    const sliced = RetroTinkProfile.sliceBytes(def, this._bytes);
    return new RetroTinkSettingValue(def, sliced);
  }

  getValues(): { items: RetroTinkSettingValue[]; asPlainObject(): Record<string, unknown> } {
    const items = SCHEMA.filter(setting => !setting.readOnly).map(setting => this.getValue(setting.name));
    return {
      items,
      asPlainObject: () => deepMerge(...items.map(settingValue => settingValue.asPlainObject())),
    };
  }

  setValue(name: string, value: string | number | boolean): void {
    const settingValue = this.getValue(name);
    settingValue.set(value);
    this._setValueWithInstance(settingValue);
  }

  private _setValueWithInstance(settingValue: RetroTinkSettingValue): void {
    const def = getSettingDef(settingValue.name);
    let offset = 0;
    const bytes = Array.from(this._bytes);

    for (const range of def.byteRanges) {
      for (let i = 0; i < range.length; i += 1) {
        bytes[range.address + i] = settingValue.value[offset];
        offset += 1;
      }
    }

    this._bytes = new Uint8Array(bytes);
  }

  async save(filePath: string, io: FileIO = defaultFileIO): Promise<void> {
    this._writeCrc();
    await io.write(filePath, this._bytes);
  }

  serializeValues(pretty: boolean = false): string {
    return JSON.stringify(this.getValues().asPlainObject(), null, pretty ? 2 : 0);
  }

  private _getCrc(): Uint8Array {
    const crc = CRC16CCITT.calculate(this._bytes, DATA_START_INDEX);
    return new Uint8Array([crc & 0xff, (crc >> 8) & 0xff]);
  }

  private _writeCrc(): void {
    const [low, high] = this._getCrc();
    this._bytes[CRC_WRITE_INDEX] = low;
    this._bytes[CRC_WRITE_INDEX + 1] = high;
  }
}
