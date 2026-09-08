import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { images, routes } from '../data/site'
import newsContent from '../content/news.json'
import type { NewsDoc } from '../content/types'
import Reveal from '../components/Reveal'

const news = newsContent as Record<string, NewsDoc>

export default function Media() {
  const { t, lang, path } = useI18n()
  const article = news[lang]

  return (
    <>
      <section className="py-16 lg:py-22">
        <div className="container-page">
          <h1 className="section-title">{t.mediaPage.title}</h1>

          {/* brand film, hosted with the site */}
          <Reveal className="mx-auto mt-10 max-w-[760px] overflow-hidden rounded-[18px] shadow-brand">
            <video
              className="w-full"
              src={images.video}
              poster={images.videoPoster}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
            />
          </Reveal>

          <p className="mx-auto mt-14 max-w-[860px] text-center font-heading text-[clamp(20px,2.6vw,30px)] text-brand-dark">
            {t.mediaPage.tagline}
          </p>

          <Reveal stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {images.gallery.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-4/3 w-full rounded-[18px] object-cover shadow-card"
              />
            ))}
          </Reveal>

          <p className="mt-14 text-center font-heading text-[clamp(20px,2.4vw,28px)] text-brand">
            {t.mediaPage.subtitle}
          </p>

          {/* youtube feature that follows the same heading on the original page */}
          <div className="mx-auto mt-10 max-w-[760px] overflow-hidden rounded-[18px] shadow-brand">
            <iframe
              className="aspect-video w-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${images.youtubeId}`}
              title="Seven Dates"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="bg-cream py-22">
        <div className="container-page">
          <h3 className="section-title">{t.mediaPage.articlesTitle}</h3>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {article && (
              <Link
                to={path(routes.news)}
                className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-brand"
              >
                <img src={images.articleCard} alt="" className="aspect-16/10 w-full object-cover" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h4 className="text-[19px] text-brand-dark">{article.title}</h4>
                  <span className="mt-auto text-sm font-semibold text-brand">
                    {t.mediaPage.readMore}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
