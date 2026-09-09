import type { Dict, LangCode } from '../i18n/types'
import type { Office } from '../data/site'
import type { Drink, EventItem } from './types'

/**
 * Editable content, stored server-side as *overrides* on top of what is
 * compiled into this bundle. A missing key means "use the built-in value", so
 * an empty store — or an unreachable API — leaves the site exactly as shipped.
 */
export interface Overrides {
  seo: Record<string, Record<string, { title?: string; description?: string; ogImage?: string }>>
  contacts: {
    offices?: Office[]
    socials?: { label: string; href: string }[]
    primaryPhone?: { label: string; href: string }
  }
  /**
   * Flat dot-paths into the dictionary. A string replaces one line
   * (`hero.title`); an array replaces a whole list (`pure.badges`), which is how
   * entries get added or removed.
   */
  texts: Partial<Record<LangCode, Record<string, string | string[]>>>
  lists: {
    events?: EventItem[]
    cocktails?: Drink[]
    mocktails?: Drink[]
    awards?: { src: string; alt: string }[]
  }
}

export const EMPTY_OVERRIDES: Overrides = { seo: {}, contacts: {}, texts: {}, lists: {} }

/** Built-in metadata, served alongside the overrides so both sides agree. */
export type SeoDefaults = Record<string, Record<string, { title: string; description: string }>>

/**
 * Flattens the dictionary to `path -> string` so the admin can edit any single
 * line without shipping the whole nested shape back and forth.
 */
export function flattenDict(value: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (typeof value === 'string') {
    if (prefix) out[prefix] = value
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => Object.assign(out, flattenDict(item, `${prefix}.${i}`)))
    return out
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      Object.assign(out, flattenDict(child, prefix ? `${prefix}.${key}` : key))
    }
  }
  return out
}

/** Writes `value` at a dot-path, cloning only the nodes along the way. */
function setPath(root: unknown, path: string[], value: string | string[]): unknown {
  const [head, ...rest] = path
  if (head === undefined) return value

  if (Array.isArray(root)) {
    const index = Number(head)
    if (!Number.isInteger(index) || index < 0 || index >= root.length) return root
    const copy = root.slice()
    copy[index] = setPath(copy[index], rest, value)
    return copy
  }
  if (root && typeof root === 'object') {
    const source = root as Record<string, unknown>
    // Only patch keys that already exist: the admin edits the site, it does not
    // invent new fields the components would never read.
    if (!Object.prototype.hasOwnProperty.call(source, head)) return root
    return { ...source, [head]: setPath(source[head], rest, value) }
  }
  return root
}

/** Applies flat text overrides for one language onto the compiled dictionary. */
export function applyTexts(
  dict: Dict,
  patch: Record<string, string | string[]> | undefined,
): Dict {
  if (!patch) return dict
  let next: unknown = dict
  for (const [path, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      // An empty list would erase a section, so treat it as "no override".
      if (!value.length) continue
    } else if (typeof value !== 'string' || !value.trim()) {
      continue
    }
    next = setPath(next, path.split('.'), value)
  }
  return next as Dict
}

/**
 * Splits the dictionary into single lines and lists of lines. The admin needs
 * the difference: a list can gain and lose entries, a single line cannot.
 */
export function collectFields(
  value: unknown,
  prefix = '',
): { scalars: string[]; arrays: string[] } {
  const out: { scalars: string[]; arrays: string[] } = { scalars: [], arrays: [] }
  if (typeof value === 'string') {
    if (prefix) out.scalars.push(prefix)
    return out
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      if (prefix) out.arrays.push(prefix)
      return out
    }
    value.forEach((item, i) => {
      const child = collectFields(item, `${prefix}.${i}`)
      out.scalars.push(...child.scalars)
      out.arrays.push(...child.arrays)
    })
    return out
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const sub = collectFields(child, prefix ? `${prefix}.${key}` : key)
      out.scalars.push(...sub.scalars)
      out.arrays.push(...sub.arrays)
    }
  }
  return out
}

/** Reads the current value at a dot-path from the compiled dictionary. */
export function readPath(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (Array.isArray(node)) return node[Number(key)]
    if (node && typeof node === 'object') return (node as Record<string, unknown>)[key]
    return undefined
  }, root)
}

/** Takes the override when it is a non-empty array, otherwise the built-in. */
export function pickList<T>(override: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(override) && override.length > 0 ? override : fallback
}
