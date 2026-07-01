import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import path from "path";
import fs from "fs";
import { findRt4FilesInDir } from "../../src/lib/file-utils.js";

const TMP = "/tmp/rt4k-file-utils-test";

function setupFixture() {
  fs.rmSync(TMP, { recursive: true, force: true });
  // Create nested structure:
  //   TMP/
  //     a.rt4
  //     notes.txt
  //     subdir/
  //       b.rt4
  //       deep/
  //         c.rt4
  //         image.png
  fs.mkdirSync(path.join(TMP, "subdir", "deep"), { recursive: true });
  fs.writeFileSync(path.join(TMP, "a.rt4"), "a");
  fs.writeFileSync(path.join(TMP, "notes.txt"), "txt");
  fs.writeFileSync(path.join(TMP, "subdir", "b.rt4"), "b");
  fs.writeFileSync(path.join(TMP, "subdir", "deep", "c.rt4"), "c");
  fs.writeFileSync(path.join(TMP, "subdir", "deep", "image.png"), "png");
}

beforeAll(() => setupFixture());
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe("findRt4FilesInDir", () => {
  test("finds .rt4 files recursively", async () => {
    const files = await findRt4FilesInDir(TMP);
    expect(files.length).toBe(3);
    const basenames = files.map((f) => path.basename(f));
    expect(basenames).toContain("a.rt4");
    expect(basenames).toContain("b.rt4");
    expect(basenames).toContain("c.rt4");
  });

  test("ignores non-.rt4 files", async () => {
    const files = await findRt4FilesInDir(TMP);
    for (const f of files) {
      expect(f.endsWith(".rt4")).toBe(true);
    }
    const basenames = files.map((f) => path.basename(f));
    expect(basenames).not.toContain("notes.txt");
    expect(basenames).not.toContain("image.png");
  });

  test("returns results sorted by path", async () => {
    const files = await findRt4FilesInDir(TMP);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  test("returns absolute paths", async () => {
    const files = await findRt4FilesInDir(TMP);
    for (const f of files) {
      expect(path.isAbsolute(f)).toBe(true);
    }
  });

  test("returns empty array for directory with no .rt4 files", async () => {
    const emptyDir = path.join(TMP, "empty");
    fs.mkdirSync(emptyDir, { recursive: true });
    const files = await findRt4FilesInDir(emptyDir);
    expect(files).toEqual([]);
  });
});
