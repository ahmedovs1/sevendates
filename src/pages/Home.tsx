import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { images, routes } from '../data/site'
import { useCallbackModal } from '../components/CallbackModal'

export default function Home() {
  const { t, path } = useI18n()
  const { open } = useCallbackModal()
  const [tab, setTab] = useState(0)
  const activeTab = t.partnership.tabs[tab]

  return (
    <>
      {/* 1. hero — headline, product shot and the "pure composition" block share one backdrop */}
      <section className="hero-bg relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-linear-to-b from-brand-dark/80 via-brand-dark/65 to-brand-dark/85" />

        <div className="container-page relative z-2 py-16 lg:py-20">
          <div className="max-w-4xl text-center lg:text-left">
            <h1 className="text-[clamp(34px,5.2vw,62px)] leading-[1.08]">{t.hero.title}</h1>
            <p className="mt-5 font-heading text-[clamp(16px,1.6vw,21px)] tracking-[0.08em] text-sand">
              {t.hero.award}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3.5 lg:justify-start">
              <Link to={path(routes.product)} className="btn-light">
                {t.hero.cta}
              </Link>
              <button type="button" onClick={open} className="btn-ghost-light">
                {t.header.cta}
              </button>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <img
              src={images.can}
              alt="Seven Dates Original"
              className="mx-auto max-h-[520px] w-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)]"
            />
            <div className="text-center lg:text-left">
              <h2 className="text-[clamp(28px,4vw,46px)]">{t.pure.title}</h2>
              <p className="mt-4 text-white/85">{t.pure.text}</p>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {t.pure.badges.map((badge) => (
                  <div
                    key={badge}
                    className="rounded-[18px] border border-white/20 bg-white/10 p-5 text-center backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
                  >
                    <img src={images.cross} alt="" className="mx-auto mb-3 h-10 w-10 object-contain" />
                    <h5 className="text-[15px] text-white">{badge}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. why seven dates — gold backdrop, six icon cards */}
      <section className="why-bg relative py-22">
        <div className="absolute inset-0 bg-gold/80" />
        <div className="container-page relative z-2 min-h-[700px] content-center">
          <h2 className="section-title text-white">{t.why.title}</h2>
          <p className="section-subtitle text-white/85">{t.why.subtitle}</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.why.cards.map((card, i) => (
              <div
                key={card}
                className="rounded-[18px] bg-white/95 p-8 text-center shadow-card transition hover:-translate-y-1 hover:shadow-brand"
              >
                <img src={images.why[i]} alt="" className="mx-auto mb-4 h-19 w-19 object-contain" />
                <h4 className="text-[19px] text-brand-dark">{card}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. what makes it different */}
      <section className="bg-brand py-22 text-white">
        <div className="container-page grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-[clamp(24px,3vw,36px)] text-white">{t.diff.title}</h2>
            <p className="mt-5 font-heading text-xl text-sand">{t.diff.philosophy}</p>
            <p className="mt-3 text-white/85">{t.diff.text}</p>
            <ul className="mt-7 grid gap-3.5">
              {t.diff.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[17px]">
                  <img src={images.plus} alt="" className="h-6 w-6 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={images.can}
            alt="Seven Dates Original"
            className="order-first mx-auto max-h-[560px] w-auto lg:order-none"
          />
        </div>
      </section>

      {/* 4. about */}
      <section className="py-22">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="font-heading text-base uppercase tracking-[0.16em] text-gold">
              {t.about.kicker}
            </span>
            <h2 className="mt-2.5 text-[clamp(26px,3.2vw,40px)] text-brand">{t.about.title}</h2>
            <p className="mt-4 text-muted">{t.about.text}</p>
            <Link to={path(routes.product)} className="btn-outline mt-7">
              {t.about.cta}
            </Link>
          </div>
          <img
            src={images.about}
            alt=""
            className="order-first rounded-[18px] shadow-brand lg:order-none"
          />
        </div>
      </section>

      {/* 5. partnership */}
      <section className="bg-cream py-22">
        <div className="container-page">
          <h2 className="section-title">{t.partnership.title}</h2>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {t.partnership.tabs.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setTab(i)}
                className={`rounded-full border-[1.5px] px-6 py-2.5 text-[15px] font-semibold transition ${
                  i === tab
                    ? 'border-brand bg-brand text-white'
                    : 'border-line text-muted hover:border-brand hover:text-brand'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <img
              src={images.partnership[tab]}
              alt={activeTab.label}
              className="rounded-[18px] shadow-brand"
            />
            <div>
              <p className="text-lg text-muted">{activeTab.text}</p>
              <ul className="my-6 grid gap-3">
                {activeTab.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={open} className="btn-primary">
                {t.partnership.cta}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
