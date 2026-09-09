/*
 * Per-page metadata, injected into index.html before the HTML leaves the server.
 *
 * This has to happen server-side: crawlers for Telegram, WhatsApp and Facebook
 * fetch the raw HTML and never run JavaScript, so tags added by React would be
 * invisible to them. Google renders JS but still prefers meta present up front.
 */

const LANGS = ['ru', 'en', 'uz']
const HTML_LANG = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' }

/** Route key -> per-language title/description. Overridable from the admin. */
export const DEFAULT_SEO = {
  home: {
    ru: {
      title: 'Seven Dates — натуральный финиковый напиток из Италии',
      description:
        'PREMIUM HALAL напиток на основе финика, созданный в Италии. Без сахара, консервантов, красителей и кофеина. Winner Gold Award 2024, London.',
    },
    en: {
      title: 'Seven Dates — natural date drink from Italy',
      description:
        'PREMIUM HALAL date-based drink made in Italy. No added sugar, preservatives, colours or caffeine. Winner Gold Award 2024, London.',
    },
    uz: {
      title: 'Seven Dates — Italiyadan tabiiy xurmo ichimligi',
      description:
        'Italiyada yaratilgan PREMIUM HALOL xurmo ichimligi. Shakarsiz, konservantsiz, bo‘yoqsiz va kofeinsiz. Winner Gold Award 2024, London.',
    },
  },
  products: {
    ru: {
      title: 'О продукте — Seven Dates Original',
      description:
        'Состав и польза Seven Dates Original: концентрат отборных фиников, натуральный лимонный сок, газированная вода. Без бисфенола A.',
    },
    en: {
      title: 'The product — Seven Dates Original',
      description:
        'What is inside Seven Dates Original: concentrate of selected dates, natural lemon juice, sparkling water. Bisphenol A free.',
    },
    uz: {
      title: 'Mahsulot haqida — Seven Dates Original',
      description:
        'Seven Dates Original tarkibi: saralangan xurmo konsentrati, tabiiy limon sharbati, gazlangan suv. Bisfenol A yo‘q.',
    },
  },
  about: {
    ru: {
      title: 'Преимущества — чем Seven Dates отличается от газировки',
      description:
        'Сравнение Seven Dates Original с обычными напитками: без сахара, консервантов и красителей, халяль-стандарт, эко-упаковка.',
    },
    en: {
      title: 'Advantages — how Seven Dates differs from ordinary soda',
      description:
        'Seven Dates Original next to ordinary drinks: no sugar, preservatives or colours, halal certified, eco packaging.',
    },
    uz: {
      title: 'Afzalliklari — Seven Dates oddiy gazli ichimlikdan farqi',
      description:
        'Seven Dates Original va oddiy ichimliklar solishtirmasi: shakarsiz, konservantsiz, halol standart, eko qadoq.',
    },
  },
  media: {
    ru: {
      title: 'Медиа, события и выставки — Seven Dates',
      description:
        'Видео о бренде и выставки, в которых участвует Seven Dates: Gulfood Dubai, Anuga, TUTTOFOOD Milano, Food Expo Kazakhstan и другие.',
    },
    en: {
      title: 'Media, events and expos — Seven Dates',
      description:
        'Brand films and the trade fairs Seven Dates takes part in: Gulfood Dubai, Anuga, TUTTOFOOD Milano, Food Expo Kazakhstan and more.',
    },
    uz: {
      title: 'Media, tadbirlar va ko‘rgazmalar — Seven Dates',
      description:
        'Brend videolari va Seven Dates ishtirok etadigan ko‘rgazmalar: Gulfood Dubai, Anuga, TUTTOFOOD Milano, Food Expo Kazakhstan.',
    },
  },
  mixology: {
    ru: {
      title: 'Миксология — коктейли и моктейли на Seven Dates',
      description:
        'Рецепты на основе Seven Dates Original: безалкогольные моктейли и коктейли для баров и дома.',
    },
    en: {
      title: 'Mixology — cocktails and mocktails with Seven Dates',
      description:
        'Recipes built on Seven Dates Original: non-alcoholic mocktails and cocktails for bars and home.',
    },
    uz: {
      title: 'Miksologiya — Seven Dates bilan kokteyl va mokteyllar',
      description:
        'Seven Dates Original asosidagi retseptlar: alkogolsiz mokteyllar va kokteyllar.',
    },
  },
  contacts: {
    ru: {
      title: 'Контакты — Seven Dates в Узбекистане, России и Казахстане',
      description:
        'Телефоны, адреса и почта офисов Seven Dates в Ташкенте, Москве и Алматы. Сотрудничество и дистрибуция.',
    },
    en: {
      title: 'Contacts — Seven Dates in Uzbekistan, Russia and Kazakhstan',
      description:
        'Phones, addresses and e-mail of the Seven Dates offices in Tashkent, Moscow and Almaty. Partnership and distribution.',
    },
    uz: {
      title: 'Aloqa — Seven Dates O‘zbekiston, Rossiya va Qozog‘istonda',
      description:
        'Toshkent, Moskva va Olmatidagi Seven Dates ofislari telefonlari, manzillari va pochtasi. Hamkorlik va distribusiya.',
    },
  },
  police: {
    ru: { title: 'Политика конфиденциальности — Seven Dates', description: 'Как Seven Dates обрабатывает персональные данные посетителей сайта.' },
    en: { title: 'Privacy policy — Seven Dates', description: 'How Seven Dates handles the personal data of site visitors.' },
    uz: { title: 'Maxfiylik siyosati — Seven Dates', description: 'Seven Dates sayt tashrifchilarining shaxsiy ma’lumotlarini qanday qayta ishlaydi.' },
  },
  rules: {
    ru: { title: 'Согласие на обработку данных — Seven Dates', description: 'Условия согласия на обработку персональных данных.' },
    en: { title: 'Consent to data processing — Seven Dates', description: 'Terms of consent to the processing of personal data.' },
    uz: { title: 'Ma’lumotlarni qayta ishlashga rozilik — Seven Dates', description: 'Shaxsiy ma’lumotlarni qayta ishlashga rozilik shartlari.' },
  },
  soon: {
    ru: { title: 'Скоро — Seven Dates', description: 'Раздел готовится к запуску.' },
    en: { title: 'Coming soon — Seven Dates', description: 'This section is on its way.' },
    uz: { title: 'Tez orada — Seven Dates', description: 'Bo‘lim tayyorlanmoqda.' },
  },
  news: {
    ru: { title: 'Новости — Seven Dates', description: 'Публикации и материалы о напитке Seven Dates Original.' },
    en: { title: 'News — Seven Dates', description: 'Articles and coverage about Seven Dates Original.' },
    uz: { title: 'Yangiliklar — Seven Dates', description: 'Seven Dates Original haqida maqolalar.' },
  },
}

/** URL path -> { lang, route, pathWithoutLang }. */
export function resolveRoute(urlPath) {
  const clean = (urlPath.split('?')[0] || '/').replace(/\/+$/, '') || '/'
  const segments = clean.split('/').filter(Boolean)

  let lang = 'ru'
  if (LANGS.includes(segments[0]) && segments[0] !== 'ru') {
    lang = segments.shift()
  }

  const first = segments[0]
  const route = !first
    ? 'home'
    : first === 'news'
      ? 'news'
      : Object.hasOwn(DEFAULT_SEO, first)
        ? first
        : 'home'

  return { lang, route, rest: segments.join('/') }
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/**
 * Builds the head block for one URL.
 * `overrides` is `{ [route]: { [lang]: { title, description, ogImage } } }`.
 */
export function buildMeta(urlPath, overrides = {}, origin = '') {
  const { lang, route, rest } = resolveRoute(urlPath)
  const base = DEFAULT_SEO[route]?.[lang] ?? DEFAULT_SEO.home[lang]
  const custom = overrides?.[route]?.[lang] ?? {}

  const title = custom.title?.trim() || base.title
  const description = custom.description?.trim() || base.description
  const image = custom.ogImage?.trim() || '/images/background.png'

  const suffix = route === 'home' ? '' : rest && route === 'news' ? `/news/${rest}` : `/${route}`
  const pathFor = (l) => (l === 'ru' ? '' : `/${l}`) + suffix || '/'
  const canonical = origin + pathFor(lang)

  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(origin + pathFor(l))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + pathFor('ru'))}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Seven Dates" />`,
    `<meta property="og:locale" content="${HTML_LANG[lang].replace('-', '_')}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(origin + image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(origin + image)}" />`,
  ]

  return { lang: HTML_LANG[lang], head: tags.join('\n    ') }
}

/** Replaces the build-time title/description in index.html with per-route tags. */
export function injectMeta(html, urlPath, overrides, origin) {
  const { lang, head } = buildMeta(urlPath, overrides, origin)
  return html
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace('</head>', `  ${head}\n  </head>`)
}

export { LANGS }
