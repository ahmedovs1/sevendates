import { useI18n } from '../i18n'
import { images } from '../data/site'

export default function Advantages() {
  const { t } = useI18n()

  return (
    <>
      <section className="py-16 lg:py-22">
        <div className="container-page">
          <h2 className="section-title">{t.advantagesPage.title}</h2>
          <h1 className="mt-4 text-center text-[clamp(24px,3.2vw,38px)] text-brand-dark">
            {t.advantagesPage.compareTitle}
          </h1>

          <div className="mt-12 overflow-hidden rounded-[18px] border border-line">
            {/* column headers carry the two product shots, like the original */}
            <div className="grid sm:grid-cols-2">
              <div className="flex flex-col items-center gap-4 bg-[#efe9e0] p-6">
                <img
                  src={images.compareRegular}
                  alt=""
                  className="h-32 w-auto object-contain"
                />
                <h3 className="text-center font-heading text-[19px] text-gold">
                  {t.advantagesPage.colRegular}
                </h3>
              </div>
              <div className="flex flex-col items-center gap-4 bg-brand p-6">
                <img
                  src={images.compareSeven}
                  alt={t.advantagesPage.colSeven}
                  className="h-32 w-auto object-contain"
                />
                <h3 className="text-center font-heading text-[19px] text-white">
                  {t.advantagesPage.colSeven}
                </h3>
              </div>
            </div>

            {t.advantagesPage.rows.map((row) => (
              <div key={row.good} className="grid sm:grid-cols-2">
                <div className="flex gap-3 border-t border-line bg-[#fbfaf7] p-6 text-[15px] text-muted">
                  <img src={images.cross} alt="" className="h-7 w-7 shrink-0 object-contain" />
                  <span>{row.bad}</span>
                </div>
                <div className="border-t border-line p-6 text-[15px] font-medium text-brand-dark sm:border-l">
                  {row.good}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-22">
        <div className="container-page">
          <h2 className="section-title">{t.advantagesPage.title}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.why.cards.map((card, i) => (
              <div
                key={card}
                className="rounded-[18px] bg-white p-8 text-center shadow-card transition hover:-translate-y-1 hover:shadow-brand"
              >
                <img
                  src={images.advantages[i]}
                  alt=""
                  className="mx-auto mb-4 h-19 w-19 object-contain"
                />
                <h4 className="text-[19px] text-brand-dark">{card}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
