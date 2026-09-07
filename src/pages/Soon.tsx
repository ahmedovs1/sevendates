import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { images, routes } from '../data/site'

export default function Soon() {
  const { t, path } = useI18n()

  return (
    <section className="flex min-h-[70vh] items-center bg-cream py-22">
      <div className="container-page text-center">
        <img src={images.logo} alt="Seven Dates" className="mx-auto h-16 w-auto" />
        <h1 className="mt-8 text-[clamp(30px,4.4vw,50px)] text-brand">Coming soon</h1>
        <p className="section-subtitle">{t.footer.desc}</p>
        <Link to={path(routes.home)} className="btn-primary mt-8">
          {t.nav.product}
        </Link>
      </div>
    </section>
  )
}
