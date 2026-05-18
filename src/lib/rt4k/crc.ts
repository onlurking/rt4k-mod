export class CRC16CCITT {
  private static readonly CRC_TABLE: readonly number[] = [
    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad,
    0xe1ce, 0xf1ef,
  ];

  public static calculate(data: Uint8Array, startIndex: number = 0): number {
    return data.slice(startIndex).reduce(CRC16CCITT.updateCrc, 0) & 0xffff;
  }

  private static updateCrc(crc: number, byte: number): number {
    const updateStep = (c: number, b: number) => CRC16CCITT.CRC_TABLE[((c >> 12) ^ b) & 0x0f] ^ (c << 4);

    return updateStep(updateStep(crc, byte >> 4), byte);
  }
}
