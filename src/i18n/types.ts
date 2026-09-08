export type LangCode = 'ru' | 'en' | 'uz'

export interface PartnershipTab {
  label: string
  text: string
  bullets: string[]
}

export interface CompareRow {
  bad: string
  good: string
}

export interface Dict {
  code: LangCode
  label: string
  htmlLang: string
  nav: { product: string; advantages: string; media: string; mixology: string; contacts: string }
  header: { call: string; cta: string }
  modal: {
    title: string
    subtitle: string
    name: string
    phone: string
    email: string
    message: string
    consent: string
    policy: string
    agreement: string
    submit: string
    sending: string
    success: string
    chooseChannel: string
    sendMail: string
    sendWhatsapp: string
  }
  hero: { title: string; award: string; cta: string }
  awards: { title: string }
  eventsPage: { title: string; intro: string }
  mixologyPage: {
    title: string
    intro: string
    tabMocktails: string
    tabCocktails: string
    ageTitle: string
    ageText: string
    ageYes: string
    ageNo: string
  }
  pure: { title: string; text: string; badges: string[] }
  why: { title: string; subtitle: string; cards: string[] }
  diff: { title: string; philosophy: string; text: string; items: string[] }
  about: { kicker: string; title: string; text: string; cta: string }
  partnership: { title: string; cta: string; tabs: PartnershipTab[] }
  productPage: { title: string; subtitle: string; intro: string; nutrients: string[] }
  advantagesPage: {
    title: string
    compareTitle: string
    colRegular: string
    colSeven: string
    rows: CompareRow[]
  }
  mediaPage: {
    title: string
    tagline: string
    subtitle: string
    articlesTitle: string
    readMore: string
  }
  contactsPage: { title: string; locationTitle: string; contactTitle: string; mailTitle: string }
  footer: {
    desc: string
    navTitle: string
    call: string
    mail: string
    address: string
    legal: string
    rights: string
  }
  countries: { uz: string; ru: string; kz: string }
}
