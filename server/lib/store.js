import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Content store.
 *
 * Holds only *overrides* — what an editor has actually changed. Everything else
 * falls back to the values compiled into the frontend bundle, so an empty (or
 * unreachable) store leaves the site exactly as it ships. That keeps a bad edit
 * or a missing file from blanking a page.
 */

const dataDir = fileURLToPath(new URL('../data/', import.meta.url))
const file = join(dataDir, 'overrides.json')

/** Shape kept stable so the admin UI can rely on every section existing. */
const EMPTY = { seo: {}, contacts: {}, texts: {}, lists: {} }

let cache = null

export async function readOverrides() {
  if (cache) return cache
  try {
    cache = { ...EMPTY, ...JSON.parse(await readFile(file, 'utf8')) }
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('overrides.json unreadable:', err.message)
    cache = { ...EMPTY }
  }
  return cache
}

export async function writeSection(section, value) {
  if (!Object.hasOwn(EMPTY, section)) throw new Error(`Unknown section: ${section}`)
  const current = await readOverrides()
  const next = { ...current, [section]: value }

  await mkdir(dirname(file), { recursive: true })
  // Write to a temp file and rename: a crash mid-write must not leave the site
  // reading half a JSON document.
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(next, null, 2), 'utf8')
  await rename(tmp, file)

  cache = next
  return next
}
