#!/usr/bin/env bun
import { readdir, readFile, mkdir, writeFile, cp } from 'node:fs/promises'
import { join, extname, dirname } from 'node:path'

const PROFILES_DIR = join(import.meta.dir, '../../../profiles/SD/profile/_CRT Emulation')
const OUTPUT_DIR = join(import.meta.dir, '../public/profiles')

interface ProfileEntry {
  name: string
  path: string
}

async function scanProfiles(dir: string, base = ''): Promise<ProfileEntry[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const results: ProfileEntry[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relPath = base ? `${base}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      const nested = await scanProfiles(fullPath, relPath)
      results.push(...nested)
    } else if (entry.isFile() && extname(entry.name) === '.rt4') {
      const name = relPath.replace(/\.rt4$/, '')
      results.push({ name, path: relPath })
    }
  }

  return results
}

async function main() {
  console.log('Scanning profiles...')
  const profiles = await scanProfiles(PROFILES_DIR)
  console.log(`Found ${profiles.length} profiles`)

  // Clean and recreate output dir
  await mkdir(OUTPUT_DIR, { recursive: true })

  // Copy each profile maintaining directory structure
  for (const profile of profiles) {
    const src = join(PROFILES_DIR, profile.path)
    const dest = join(OUTPUT_DIR, profile.path)
    await mkdir(dirname(dest), { recursive: true })
    await cp(src, dest)
  }

  // Write manifest
  const manifestPath = join(OUTPUT_DIR, 'manifest.json')
  await writeFile(manifestPath, JSON.stringify(profiles, null, 2))

  console.log(`Copied ${profiles.length} profiles to ${OUTPUT_DIR}`)
  console.log(`Manifest: ${manifestPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
