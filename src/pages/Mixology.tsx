import { useState } from 'react'
import { useI18n } from '../i18n'
import Reveal from '../components/Reveal'
import { useContent } from '../content/ContentProvider'

export default function Mixology() {
  const { t } = useI18n()
  const { cocktails, mocktails } = useContent()
  /** Mocktails open by default; the alcoholic tab is gated. */
  const [tab, setTab] = useState<'mocktails' | 'cocktails'>('mocktails')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [askingAge, setAskingAge] = useState(false)

  const openCocktails = () => {
    if (ageConfirmed) {
      setTab('cocktails')
      return
    }
    setAskingAge(true)
  }

  const confirmAge = () => {
    setAgeConfirmed(true)
    setAskingAge(false)
    setTab('cocktails')
  }

  const drinks = tab === 'cocktails' ? cocktails : mocktails

  return (
    <>
      <section className="bg-brand-dark py-16 text-white lg:py-20">
        <div className="container-page text-center">
          <Reveal>
            <div className="tricolore-rule mx-auto mb-6" />
            <h1 className="text-[clamp(28px,4vw,46px)]">{t.mixologyPage.title}</h1>
            <p className="mx-auto mt-4 max-w-[720px] text-white/85">{t.mixologyPage.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-22">
        <div className="container-page">
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setTab('mocktails')}
              className={`rounded-full border-[1.5px] px-6 py-2.5 text-[15px] font-semibold transition ${
                tab === 'mocktails'
                  ? 'border-brand bg-brand text-white'
                  : 'border-line text-muted hover:border-brand hover:text-brand'
              }`}
            >
              {t.mixologyPage.tabMocktails}
            </button>
            <button
              type="button"
              onClick={openCocktails}
              className={`rounded-full border-[1.5px] px-6 py-2.5 text-[15px] font-semibold transition ${
                tab === 'cocktails'
                  ? 'border-accent bg-accent text-white'
                  : 'border-line text-muted hover:border-accent hover:text-accent'
              }`}
            >
              {t.mixologyPage.tabCocktails}
            </button>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {drinks.map((item) => (
              // keyed by tab so switching re-runs the entrance animation
              <Reveal key={`${tab}-${item.slug}`}>
                <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-brand">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h2 className="text-[22px] text-brand">{item.name}</h2>
                    <p className="text-[15px] text-muted">{item.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {askingAge && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-brand-deep/55 p-5"
          role="dialog"
          aria-modal="true"
          aria-label={t.mixologyPage.ageTitle}
          onClick={() => setAskingAge(false)}
        >
          <div
            className="w-full max-w-[460px] rounded-[22px] bg-white p-9 text-center shadow-brand"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl text-brand">{t.mixologyPage.ageTitle}</h2>
            <p className="mb-7 mt-3 text-[15px] text-muted">{t.mixologyPage.ageText}</p>
            <button type="button" onClick={confirmAge} className="btn-accent w-full">
              {t.mixologyPage.ageYes}
            </button>
            <button
              type="button"
              onClick={() => setAskingAge(false)}
              className="btn-outline mt-3 w-full"
            >
              {t.mixologyPage.ageNo}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
