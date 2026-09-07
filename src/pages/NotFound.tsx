import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { routes } from '../data/site'

export default function NotFound() {
  const { t, path } = useI18n()

  return (
    <section className="flex min-h-[60vh] items-center py-22">
      <div className="container-page text-center">
        <h1 className="font-heading text-[clamp(60px,10vw,120px)] text-brand">404</h1>
        <p className="section-subtitle">{t.footer.desc}</p>
        <Link to={path(routes.home)} className="btn-primary mt-8">
          Seven Dates
        </Link>
      </div>
    </section>
  )
}
