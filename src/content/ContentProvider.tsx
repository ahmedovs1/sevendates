import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  apiUrl,
  offices as builtInOffices,
  socials as builtInSocials,
  primaryPhone as builtInPhone,
  images,
} from '../data/site'
import eventContent from './events.json'
import cocktailContent from './cocktails.json'
import mocktailContent from './mocktails.json'
import type { Drink, EventItem } from './types'
import { EMPTY_OVERRIDES, pickList, type Overrides, type SeoDefaults } from './overrides'

/**
 * Loads editor overrides once and exposes the *effective* content: overrides
 * where they exist, compiled values everywhere else.
 *
 * Children render immediately with the built-in content rather than waiting on
 * the network — a CMS outage must not blank the site, and most fields are never
 * overridden anyway.
 */

interface ContentValue {
  overrides: Overrides
  seoDefaults: SeoDefaults
  offices: typeof builtInOffices
  socials: typeof builtInSocials
  primaryPhone: typeof builtInPhone
  events: EventItem[]
  cocktails: Drink[]
  mocktails: Drink[]
  awards: { src: string; alt: string }[]
  /** True once the fetch settled either way; the admin waits for it. */
  loaded: boolean
}

const builtInEvents = eventContent as EventItem[]
const builtInCocktails = cocktailContent as Drink[]
const builtInMocktails = mocktailContent as Drink[]
const builtInAwards = images.awards

function effective(overrides: Overrides, loaded: boolean, seoDefaults: SeoDefaults = {}): ContentValue {
  return {
    overrides,
    seoDefaults,
    offices: pickList(overrides.contacts?.offices, builtInOffices),
    socials: pickList(overrides.contacts?.socials, builtInSocials),
    primaryPhone: overrides.contacts?.primaryPhone ?? builtInPhone,
    events: pickList(overrides.lists?.events, builtInEvents),
    cocktails: pickList(overrides.lists?.cocktails, builtInCocktails),
    mocktails: pickList(overrides.lists?.mocktails, builtInMocktails),
    awards: pickList(overrides.lists?.awards, builtInAwards),
    loaded,
  }
}

const ContentContext = createContext<ContentValue>(effective(EMPTY_OVERRIDES, false))

export function ContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(() => effective(EMPTY_OVERRIDES, false))

  useEffect(() => {
    let alive = true
    fetch(apiUrl('content'))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Partial<Overrides> & { seoDefaults?: SeoDefaults }) => {
        if (!alive) return
        const { seoDefaults = {}, ...rest } = data
        setValue(effective({ ...EMPTY_OVERRIDES, ...rest }, true, seoDefaults))
      })
      .catch(() => {
        // No CMS reachable (static preview, service down) — keep the built-ins.
        if (alive) setValue(effective(EMPTY_OVERRIDES, true))
      })
    return () => {
      alive = false
    }
  }, [])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export const useContent = () => useContext(ContentContext)
