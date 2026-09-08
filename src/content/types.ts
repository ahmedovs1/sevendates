export interface ContentNode {
  type: 'h2' | 'h3' | 'p' | 'li'
  text: string
}

export interface LegalDoc {
  title: string
  body: ContentNode[]
}

export interface NewsDoc {
  title: string
  body: ContentNode[]
  image: string
}

/** Events & Expo entry, mirrored from drink7dates.com/news.html. */
export interface EventItem {
  slug: string
  image: string
  title: string
  dates: string
  text: string
}

/** A mixology recipe — used for both the alcoholic and non-alcoholic lists. */
export interface Drink {
  slug: string
  image: string
  name: string
  text: string
}
