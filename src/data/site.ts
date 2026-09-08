export interface Office {
  key: 'uz' | 'ru' | 'kz'
  /** Falls back to the country name where a legal entity is not published. */
  company?: string
  tin?: string
  phone: string
  phoneHref: string
  address?: string
  /** May be empty — the contact blocks hide the section rather than show a gap. */
  emails: string[]
  /** Google Maps embed used on the contacts page, same query as the original site. */
  map?: string
}

export const offices: Office[] = [
  {
    key: 'uz',
    company: 'CП OOO «METAMED»',
    tin: 'ИНН: 309116608',
    phone: '+998 (97) 757-44-88',
    phoneHref: 'tel:+998977574488',
    address: 'Сергелийский район, Олтинводий 111, Ташкент, 100046',
    emails: ['info@sevendates.uz', 'partner@sevendates.uz'],
    map: 'https://maps.google.com/maps?q=%D0%A3%D0%B7%D0%B1%D0%B5%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD%20%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%20%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C%20Metamed&t=m&z=16&output=embed&iwloc=near',
  },
  {
    key: 'ru',
    company: 'OOO JVGENERIKA',
    phone: '+7 (960) 709-52-81',
    phoneHref: 'tel:+79607095281',
    address: 'Терновая 20, Троицк, Mосква',
    emails: ['partner@sevendates.ru'],
    map: 'https://maps.google.com/maps?q=%D0%A2%D0%B5%D1%80%D0%BD%D0%BE%D0%B2%D0%B0%D1%8F%2020%2C%20%D0%A2%D1%80%D0%BE%D0%B8%D1%86%D0%BA%2C%20M%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&t=m&z=14&output=embed&iwloc=near',
  },
  {
    key: 'kz',
    company: 'ТОО GENERIKAKZ',
    phone: '+7 (777) 030-66-88',
    phoneHref: 'tel:+77770306688',
    address: 'ул. Карасай баты 90/92, 33, г. Алматы',
    emails: ['partner@sevendates.ru'],
    map: 'https://maps.google.com/maps?q=%D1%83%D0%BB.%20%D0%9A%D0%B0%D1%80%D0%B0%D1%81%D0%B0%D0%B9%20%D0%B1%D0%B0%D1%82%D1%8B%2090%2F92%2C%20%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C%20%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD&t=m&z=16&output=embed&iwloc=near',
  },
]

export const primaryPhone = {
  label: '+998 97 757-44-88',
  href: 'tel:+998977574488',
}

/** Where a callback request is delivered: every address published on the site… */
export const formRecipients = offices.flatMap((office) => office.emails)

/** …plus the WhatsApp line that should receive the same request. */
export const formWhatsapp = {
  label: '+971 58 576 3933',
  /** digits only — wa.me rejects spaces and a leading "+" */
  number: '971585763933',
}

/**
 * Delivery is configured with env vars so no keys live in the repo.
 *
 * VITE_WEB3FORMS_KEY — the one-step option: https://web3forms.com/ mails you an
 *   access key, requests then land in that inbox the moment a visitor submits.
 * VITE_FORM_ENDPOINT — any endpoint of your own (serverless function, CRM…)
 *   that accepts a JSON POST. Takes priority when both are set.
 *
 * With neither set there is nothing that can send mail, so the modal falls back
 * to handing the message to the visitor's own mail client or WhatsApp.
 */
export const formEndpoint = import.meta.env.VITE_FORM_ENDPOINT ?? ''
export const web3formsKey = import.meta.env.VITE_WEB3FORMS_KEY ?? ''
export const web3formsUrl = 'https://api.web3forms.com/submit'

/** True when a submit can be delivered without the visitor doing anything. */
export const canSendDirectly = Boolean(formEndpoint || web3formsKey)

export const socials = [
  { label: 'WhatsApp', href: `https://wa.me/${formWhatsapp.number}` },
  { label: 'Instagram', href: 'https://www.instagram.com/seven_dates.uz/' },
  { label: 'Telegram', href: 'https://t.me/sevendatesuz' },
  { label: 'Youtube', href: 'https://www.youtube.com/@SEVENDATES-h9' },
]

export const images = {
  logo: '/images/Logo.png',
  can: '/images/sevendates.png',
  heroBg: '/images/hero-1-scaled.webp',
  heroBgMobile: '/images/mobileBGimg.webp',
  cross: '/images/xicon.png',
  plus: '/images/plus.png',
  about: '/images/flags.webp',
  video: '/media/viid.mp4',
  videoPoster: '/images/pr.webp',
  youtubeId: 'YAxfArXFKOY',
  product: '/images/Sevendates_rus.png',
  compareRegular: '/images/othe.png',
  compareSeven: '/images/seven-dates-original.png',
  articleCard: '/images/image.png',
  gallery: [
    '/images/pic1-scaled.webp',
    '/images/pic2-scaled.webp',
    '/images/photo_2025-05-09_15-15-57.jpg',
    '/images/photo_2025-05-09_15-16-01.jpg',
  ],
  /** icon set used on the home page */
  why: [
    '/images/alternativeSostav.png',
    '/images/healthy.png',
    '/images/halal.png',
    '/images/vegan.png',
    '/images/eco.png',
    '/images/premiumquality.png',
  ],
  /** the advantages page uses a different icon set for the same six points */
  advantages: [
    '/images/sugarfree.png',
    '/images/health.png',
    '/images/halalIcon.png',
    '/images/veg.png',
    '/images/ecoPack.png',
    '/images/premiumIcon.png',
  ],
  partnership: ['/images/distributors.webp', '/images/retail.webp', '/images/horeca.webp'],
  /** Award badges. The names are proper nouns, so they stay untranslated. */
  awards: [
    { src: '/images/reward1.jpg', alt: 'Free From Product Awards 2025 — Most Healthy' },
    { src: '/images/reward3.png', alt: 'Anuga Taste Innovation Show — Top Innovation 2025' },
    { src: '/images/reward2.jpg', alt: 'Plant-Based Excellence Awards 2024' },
  ],
}

/** Route slugs, shared by the nav and the router (language prefix is added by `path()`). */
export const routes = {
  home: '/',
  product: '/products',
  advantages: '/about',
  media: '/media',
  mixology: '/mixology',
  contacts: '/contacts',
  policy: '/police',
  consent: '/rules',
  soon: '/soon',
  news: '/news/seven-dates-premium-revolutionary-italian-health-drink',
}
