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
