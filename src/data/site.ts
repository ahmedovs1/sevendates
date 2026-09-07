export interface Office {
  key: 'uz' | 'ru'
  company: string
  tin?: string
  phone: string
  phoneHref: string
  address: string
  emails: string[]
  /** Google Maps embed used on the contacts page, same query as the original site. */
  map: string
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
    phone: '+7 (916) 184-59-20',
    phoneHref: 'tel:+79161845920',
    address: 'Терновая 20, Троицк, Mосква',
    emails: ['partner@sevendates.ru', 'jvgenerika@mail.ru'],
    map: 'https://maps.google.com/maps?q=%D0%A2%D0%B5%D1%80%D0%BD%D0%BE%D0%B2%D0%B0%D1%8F%2020%2C%20%D0%A2%D1%80%D0%BE%D0%B8%D1%86%D0%BA%2C%20M%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&t=m&z=14&output=embed&iwloc=near',
  },
]

export const primaryPhone = {
  label: '+998 97 757-44-88',
  href: 'tel:+998977574488',
}

export const socials = [
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
  compareSeven: '/images/pr2.webp',
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
}

/** Route slugs, shared by the nav and the router (language prefix is added by `path()`). */
export const routes = {
  home: '/',
  product: '/products',
  advantages: '/about',
  media: '/media',
  contacts: '/contacts',
  policy: '/police',
  consent: '/rules',
  soon: '/soon',
  news: '/news/seven-dates-premium-revolutionary-italian-health-drink',
}
