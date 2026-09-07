import { useI18n } from '../i18n'
import RichText from '../components/RichText'
import legalContent from '../content/legal.json'
import type { LegalDoc } from '../content/types'

const legal = legalContent as Record<string, Record<string, LegalDoc>>

export default function Legal({ doc }: { doc: 'police' | 'rules' }) {
  const { lang } = useI18n()
  const page = legal[lang]?.[doc] ?? legal.ru[doc]

  return (
    <>
      <section className="bg-brand py-16 text-center text-white">
        <div className="container-page">
          <h1 className="text-[clamp(26px,3.6vw,42px)]">{page.title}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-[900px] text-[15px]">
          <RichText nodes={page.body} />
        </div>
      </section>
    </>
  )
}
