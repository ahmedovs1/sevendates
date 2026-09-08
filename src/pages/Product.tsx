import { useI18n } from '../i18n'
import { images } from '../data/site'
import Reveal from '../components/Reveal'

export default function Product() {
  const { t } = useI18n()

  return (
    <>
      {/* product shot next to the description, same as the original page */}
      <section className="py-16 lg:py-22">
        <div className="container-page">
          <h2 className="section-title">{t.productPage.title}</h2>

          <Reveal stagger className="mt-12 grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <img
              src={images.product}
              alt={t.productPage.subtitle}
              className="mx-auto rounded-[18px] shadow-brand"
            />
            <div>
              <h1 className="text-[clamp(28px,3.6vw,44px)] text-brand">{t.productPage.subtitle}</h1>
              <p className="mt-5 text-muted">{t.productPage.intro}</p>
              <p className="mt-4 text-muted">{t.pure.text}</p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {t.productPage.nutrients.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-cream px-4.5 py-2 text-sm font-medium text-brand-dark"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* what makes it different */}
      <section className="bg-brand py-22 text-white">
        <Reveal stagger className="container-page grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
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
            alt=""
            className="order-first mx-auto max-h-[560px] w-auto lg:order-none"
          />
        </Reveal>
      </section>
    </>
  )
}
