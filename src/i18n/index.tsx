import { createContext, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import ru from './ru'
import en from './en'
import uz from './uz'
import type { Dict, LangCode } from './types'

export const dictionaries: Record<LangCode, Dict> = { ru, en, uz }
export const LANGS: LangCode[] = ['ru', 'uz', 'en']
export const DEFAULT_LANG: LangCode = 'ru'

const FLAGS: Record<LangCode, string> = {
  ru: '/flags/ru_RU.png',
  uz: '/flags/uz_UZ.png',
  en: '/flags/en_US.png',
}

export const flagOf = (lang: LangCode) => FLAGS[lang]

/** Reads the language out of the URL prefix: /en/... and /uz/... , everything else is Russian. */
export function langFromPath(pathname: string): LangCode {
  const seg = pathname.split('/').filter(Boolean)[0]
  return seg === 'en' || seg === 'uz' ? seg : DEFAULT_LANG
}

/** Builds a path for the given language: ("/products", "en") -> "/en/products". */
export function localizePath(path: string, lang: LangCode): string {
  const clean = '/' + path.replace(/^\/(en|uz)(?=\/|$)/, '').replace(/^\//, '')
  if (lang === DEFAULT_LANG) return clean === '/' ? '/' : clean.replace(/\/$/, '')
  return `/${lang}${clean === '/' ? '' : clean.replace(/\/$/, '')}`
}

interface I18nValue {
  lang: LangCode
  t: Dict
  path: (p: string) => string
}

const I18nContext = createContext<I18nValue>({
  lang: DEFAULT_LANG,
  t: ru,
  path: (p) => p,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const value = useMemo<I18nValue>(() => {
    const lang = langFromPath(pathname)
    return { lang, t: dictionaries[lang], path: (p: string) => localizePath(p, lang) }
  }, [pathname])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
export type { Dict, LangCode }
