import { getSettingDef } from '@rt4k-mod/shared'
import type { SettingDef } from '@rt4k-mod/shared'
import type { CoreSettings } from '@rt4k-mod/shared'

const HEADER = 'RT4K Profile'
const CRC_WRITE_INDEX = 32
const DATA_START_INDEX = 128

// CRC16-CCITT implementation
function crc16ccitt(data: Uint8Array, start: number): number {
  let crc = 0xFFFF
  for (let i = start; i < data.length; i++) {
    crc ^= data[i] << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
    }
  }
  return crc & 0xFFFF
}

export class BrowserProfile {
  private bytes: Uint8Array

  private constructor(bytes: Uint8Array) {
    this.bytes = new Uint8Array(bytes)
  }

  static fromBytes(bytes: Uint8Array): BrowserProfile {
    const header = String.fromCharCode(...bytes.slice(0, HEADER.length))
    if (header !== HEADER) {
      throw new Error(`Invalid profile header: ${header}`)
    }
    return new BrowserProfile(bytes)
  }

  clone(): BrowserProfile {
    return new BrowserProfile(new Uint8Array(this.bytes))
  }

  setValue(name: string, value: string | number | boolean): void {
    const def = getSettingDef(name)
    const encoded = this.encodeValue(def, value)
    this.writeBytes(def, encoded)
  }

  private encodeValue(def: SettingDef, value: string | number | boolean): Uint8Array {
    switch (def.type) {
      case 'ENUM': {
        const entry = def.enums?.find(e => e.name === value)
        if (!entry) throw new Error(`Invalid enum value "${value}" for ${def.name}`)
        return entry.value
      }
      case 'BIT': {
        const val = typeof value === 'boolean' ? (value ? 1 : 0) : (value ? 1 : 0)
        return new Uint8Array([val])
      }
      case 'SIGNED_INTEGER': {
        const num = Number(value)
        const buf = new ArrayBuffer(4)
        new DataView(buf).setInt32(0, num, true)
        return new Uint8Array(buf)
      }
      case 'SIGNED_SHORT': {
        const num = Number(value)
        const buf = new ArrayBuffer(2)
        new DataView(buf).setInt16(0, num, true)
        return new Uint8Array(buf)
      }
      case 'INTEGER': {
        const num = Number(value)
        const buf = new ArrayBuffer(4)
        new DataView(buf).setUint32(0, num, true)
        return new Uint8Array(buf)
      }
      case 'STRING': {
        const str = String(value)
        const fieldLength = def.byteRanges.reduce((sum, r) => sum + r.length, 0)
        const bytes = new Uint8Array(fieldLength)
        // Preserve existing bytes from the profile (including garbled tails)
        let offset = 0
        for (const range of def.byteRanges) {
          for (let i = 0; i < range.length; i++) {
            bytes[offset] = this.bytes[range.address + i]
            offset++
          }
        }
        // Overwrite with new string value
        for (let i = 0; i < str.length && i < bytes.length - 1; i++) {
          bytes[i] = str.charCodeAt(i)
        }
        // Null terminate after string
        if (str.length < bytes.length) {
          bytes[str.length] = 0
        }
        return bytes
      }
      default:
        throw new Error(`Unsupported type: ${def.type}`)
    }
  }

  private writeBytes(def: SettingDef, value: Uint8Array): void {
    let offset = 0
    for (const range of def.byteRanges) {
      for (let i = 0; i < range.length; i++) {
        this.bytes[range.address + i] = value[offset] ?? 0
        offset++
      }
    }
  }

  private writeCrc(): void {
    const crc = crc16ccitt(this.bytes, DATA_START_INDEX)
    this.bytes[CRC_WRITE_INDEX] = crc & 0xFF
    this.bytes[CRC_WRITE_INDEX + 1] = (crc >> 8) & 0xFF
  }

  toBytes(): Uint8Array {
    this.writeCrc()
    return new Uint8Array(this.bytes)
  }
}

export function applySettings(profile: BrowserProfile, settings: CoreSettings): void {
  for (const [key, value] of Object.entries(settings)) {
    profile.setValue(key, value)
  }
}

export async function fetchBaseProfile(url: string): Promise<BrowserProfile> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch base profile: ${res.statusText}`)
  const buffer = await res.arrayBuffer()
  return BrowserProfile.fromBytes(new Uint8Array(buffer))
}
