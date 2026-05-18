import { DataType } from './types';

export class RetroTinkProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidProfileFormatError extends RetroTinkProfileError {
  constructor(message = 'Invalid profile format') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ProfileNotFoundError extends RetroTinkProfileError {
  constructor(message = 'Profile not found') {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SettingNotSupportedError extends RetroTinkProfileError {
  constructor(settingKey: string, message = `Setting not supported: ${settingKey}`) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SettingNotWritableError extends RetroTinkProfileError {
  constructor(settingKey: string, message = `Setting is Read-Only and may not be set directly: ${settingKey}`) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SettingTypeError extends RetroTinkProfileError {
  constructor(
    settingKey: string,
    expected: DataType,
    val: unknown,
    message = `Wrong Type for Setting '${settingKey}' (expected: ${expected}, received: ${typeof val})`,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SettingValidationError extends RetroTinkProfileError {
  constructor(settingKey: string, val: unknown, message: string) {
    super(`(${settingKey}) failed validation with (${val}) (${message})`);
    this.name = this.constructor.name;
  }
}

export class SettingDeserializationError extends RetroTinkProfileError {
  constructor(message = 'Failed to deserialize values') {
    super(message);
    this.name = this.constructor.name;
  }
}
