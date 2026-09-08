import { useI18n } from '../i18n'
import { images } from '../data/site'
import eventContent from '../content/events.json'
import type { EventItem } from '../content/types'
import Reveal from '../components/Reveal'

const events = eventContent as EventItem[]

export default function Media() {
  const { t } = useI18n()

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

      {/* events & expos, mirrored from drink7dates.com/news.html */}
      <section className="bg-cream py-16 lg:py-22">
        <div className="container-page">
          <Reveal>
            <h2 className="section-title">{t.eventsPage.title}</h2>
            <p className="section-subtitle">{t.eventsPage.intro}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Reveal key={event.slug}>
                <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-brand">
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-2.5 p-6">
                    <span className="kicker">{event.dates}</span>
                    <h3 className="text-[20px] text-brand">{event.title}</h3>
                    <p className="text-[15px] text-muted">{event.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
