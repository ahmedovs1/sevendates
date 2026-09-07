import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { routes } from '../data/site'
import RichText from '../components/RichText'
import newsContent from '../content/news.json'
import type { NewsDoc } from '../content/types'

const news = newsContent as Record<string, NewsDoc>

export default function NewsArticle() {
  const { t, lang, path } = useI18n()
  const article = news[lang]

  if (!article) {
    return (
      <section className="py-22">
        <div className="container-page text-center">
          <Link to={path(routes.media)} className="btn-outline">
            {t.nav.media}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <article className="py-16">
      <div className="container-page max-w-[820px]">
        <Link to={path(routes.media)} className="text-sm font-semibold text-brand hover:underline">
          ← {t.nav.media}
        </Link>
        <h1 className="mt-4 text-[clamp(26px,3.6vw,40px)] text-brand">{article.title}</h1>
        <img src={article.image} alt="" className="mt-8 rounded-[18px]" />
        <div className="mt-8">
          <RichText nodes={article.body} />
        </div>
      </div>
    </article>
  )
}
