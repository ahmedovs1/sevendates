import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from './ContentProvider'

/*
 * Keeps the tab title and meta tags correct while the visitor moves around.
 *
 * The server already stitches the right tags into the HTML it serves, which is
 * what crawlers read. But a single-page app never reloads that HTML, so without
 * this the title would stay frozen on whichever page was opened first — and an
 * edited title would look like it had not been applied at all.
 */

const ROUTE_KEYS = ['products', 'about', 'media', 'mixology', 'contacts', 'police', 'rules', 'news']

/** Mirrors resolveRoute() on the server so both pick the same entry. */
function resolve(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  let lang = 'ru'
  if (segments[0] === 'en' || segments[0] === 'uz') lang = segments.shift()!

  const first = segments[0]
  const route = !first ? 'home' : ROUTE_KEYS.includes(first) ? first : 'home'
  return { lang, route }
}

function setTag(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export function useDocumentMeta() {
  const { pathname } = useLocation()
  const { overrides, seoDefaults } = useContent()

  useEffect(() => {
    const { lang, route } = resolve(pathname)
    const base = seoDefaults[route]?.[lang] ?? seoDefaults.home?.[lang]
    if (!base) return

    const custom = overrides.seo?.[route]?.[lang] ?? {}
    const title = custom.title?.trim() || base.title
    const description = custom.description?.trim() || base.description
    const url = window.location.origin + pathname

    document.title = title
    setTag('meta[name="description"]', 'content', description)
    setTag('meta[property="og:title"]', 'content', title)
    setTag('meta[property="og:description"]', 'content', description)
    setTag('meta[property="og:url"]', 'content', url)
    setTag('link[rel="canonical"]', 'href', url)
  }, [pathname, overrides, seoDefaults])
}
