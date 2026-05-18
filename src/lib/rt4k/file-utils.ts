import { ProfileNotFoundError } from './exceptions';

export async function readFileBinary(path: string): Promise<Uint8Array> {
  try {
    const buffer = await Bun.file(path).arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err) {
    if (err instanceof Error && (err as any).code === 'ENOENT') {
      throw new ProfileNotFoundError(err.message);
    }
    throw err;
  }
}

export async function writeFileBinary(path: string, data: Uint8Array): Promise<void> {
  await Bun.write(path, data);
}
