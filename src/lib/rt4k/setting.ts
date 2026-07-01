import { SettingTypeError, SettingValidationError } from './exceptions';
import { addValueToObject } from './object-utils';
import { type SettingDef } from './schema';
import { DataType } from './types';

type SettingPlainObjectValue = string | number | boolean;

export class RetroTinkSettingValue {
  public value: Uint8Array;
  private readonly def: SettingDef;

  constructor(def: SettingDef, bytes?: Uint8Array) {
    this.def = def;
    this.value = bytes ?? new Uint8Array(this.length());
    if (bytes && this.def.type === DataType.ENUM) {
      this.validate();
    }
  }

  get name(): string {
    return this.def.name;
  }

  get desc(): string {
    return this.def.desc;
  }

  get byteRanges(): { address: number; length: number }[] {
    return this.def.byteRanges;
  }

  get type(): DataType {
    return this.def.type;
  }

  get enums(): { name: string; value: Uint8Array }[] | undefined {
    return this.def.enums;
  }

  get readOnly(): boolean {
    return this.def.readOnly ?? false;
  }

  length(): number {
    return this.def.byteRanges.reduce((sum, r) => sum + r.length, 0);
  }

  validValues(): string {
    switch (this.def.type) {
      case DataType.ENUM:
        return this.def.enums?.map(e => e.name).join(', ') ?? '';
      case DataType.INT:
        return 'number between 0 and 255';
      case DataType.SIGNED_INT:
        return 'number between -128 and 127';
      case DataType.BIT:
        return 'boolean or number between 0 and 1';
      case DataType.STR:
        return 'string';
    }
  }

  static compareUint8Array(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  validate(): void {
    if (this.def.type !== DataType.ENUM) return;

    const valid = this.def.enums?.some(e => RetroTinkSettingValue.compareUint8Array(e.value, this.value)) ?? false;
    if (!valid) {
      throw new SettingValidationError(this.name, this.value, `Must be one of: ${this.enumNames()}`);
    }
  }

  asString(): string {
    if (this.def.type === DataType.ENUM) {
      const enumVal = this.def.enums?.find(e => RetroTinkSettingValue.compareUint8Array(e.value, this.value));
      if (!enumVal) {
        throw new SettingValidationError(this.name, this.value, `Must be one of: ${this.enumNames()}`);
      }
      return enumVal.name;
    }

    if (this.def.type === DataType.STR) {
      if (this.value[0] === 0) return '';
      return String.fromCharCode(...this.value.filter(byte => byte !== 0));
    }

    return this.asInt().toString();
  }

  asBoolean(): boolean {
    return this.value[0] !== 0;
  }

  asInt(): number {
    const length = this.length();
    if (length !== 1) {
      throw new SettingTypeError(this.name, this.type, this.value, 'Not Implemented');
    }

    if (this.def.type === DataType.SIGNED_INT) {
      return this.value[0] > 127 ? this.value[0] - 256 : this.value[0];
    }

    return this.value[0];
  }

  set(val: string | number | boolean): void {
    if (typeof val === 'string') {
      this.fromString(val);
      return;
    }

    if (typeof val === 'number') {
      this.fromInt(val);
      return;
    }

    this.fromBool(val);
  }

  fromString(str: string): void {
    if (this.def.type === DataType.BIT) {
      if (str === 'true') {
        this.value[0] = 1;
        return;
      }
      if (str === 'false') {
        this.value[0] = 0;
        return;
      }
      throw new SettingTypeError(this.name, this.type, str);
    }

    if (this.def.type === DataType.ENUM) {
      const enumVal = this.def.enums?.find(e => e.name.toLowerCase() === str.toLowerCase());
      if (!enumVal) {
        throw new SettingValidationError(this.name, str, `Must be one of: ${this.enumNames()}`);
      }
      this.value = new Uint8Array(enumVal.value);
      return;
    }

    if (this.def.type === DataType.STR) {
      const length = this.length();
      this.value = new Uint8Array(length);
      for (let i = 0; i < str.length && i < length; i += 1) {
        this.value[i] = str.charCodeAt(i);
      }
      if (str.length < length) {
        this.value[str.length] = 0;
      }
      return;
    }

    const num = Number.parseInt(str, 10);
    if (Number.isNaN(num)) throw new SettingTypeError(this.name, this.type, str);
    this.fromInt(num);
  }

  fromInt(num: number): void {
    if (this.def.type === DataType.ENUM) {
      const enumVal = this.def.enums?.[num];
      if (!enumVal) {
        throw new SettingValidationError(this.name, num, `Must be one of: ${this.enumNames()}`);
      }
      this.value = new Uint8Array(enumVal.value);
      return;
    }

    const length = this.length();
    if (length !== 1) {
      throw new SettingTypeError(this.name, this.type, num, 'Not Implemented');
    }

    if (this.def.type === DataType.SIGNED_INT) {
      if (num < -128 || num > 127) {
        throw new SettingValidationError(this.name, num, 'Value out of range for signed 8-bit integer');
      }
      this.value[0] = num < 0 ? 256 + num : num;
      return;
    }

    if (this.def.type === DataType.BIT) {
      if (num !== 0 && num !== 1) throw new SettingTypeError(this.name, this.type, num);
      this.value[0] = num;
      return;
    }

    if (this.def.type === DataType.INT) {
      if (num < 0 || num > 255) {
        throw new SettingValidationError(this.name, num, 'Value out of range for 8-bit integer');
      }
      this.value[0] = num;
      return;
    }

    throw new SettingTypeError(this.name, this.type, num);
  }

  fromBool(bool: boolean): void {
    this.value[0] = bool ? 1 : 0;
  }

  asPlainObject(): Record<string, unknown> {
    const pojo: Record<string, unknown> = {};
    let value: SettingPlainObjectValue;

    switch (this.def.type) {
      case DataType.STR:
      case DataType.ENUM:
        value = this.asString();
        break;
      case DataType.BIT:
        value = this.asBoolean();
        break;
      case DataType.INT:
      case DataType.SIGNED_INT:
        value = this.asInt();
        break;
    }

    addValueToObject(pojo, this.name.split('.'), value);
    return pojo;
  }

  private enumNames(): string {
    return this.def.enums?.map(e => e.name).join(', ') ?? '';
  }
}
