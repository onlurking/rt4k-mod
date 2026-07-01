import type { FileIO } from '../../src/lib/rt4k/file-io';
import { ProfileNotFoundError } from '../../src/lib/rt4k/exceptions';

/**
 * In-memory FileIO for testing. Supports a virtual filesystem backed by a Map.
 */
export function memFileIO(): FileIO & { store: Map<string, Uint8Array> } {
  const store = new Map<string, Uint8Array>();

  return {
    store,
    async read(path: string): Promise<Uint8Array> {
      const data = store.get(path);
      if (!data) {
        throw new ProfileNotFoundError(`File not found in memFileIO: ${path}`);
      }
      return data;
    },
    async write(path: string, data: Uint8Array): Promise<void> {
      store.set(path, new Uint8Array(data));
    },
  };
}
