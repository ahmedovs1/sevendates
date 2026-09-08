import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { images, offices, routes, socials } from '../data/site'
import { useCallbackModal } from './CallbackModal'

export default function Footer() {
  const { t, path } = useI18n()
  const { open } = useCallbackModal()

  const links = [
    { to: routes.product, label: t.nav.product },
    { to: routes.advantages, label: t.nav.advantages },
    { to: routes.media, label: t.nav.media },
    { to: routes.contacts, label: t.nav.contacts },
  ]

  return (
    <footer className="bg-brand-dark text-[15px] text-white/80">
      <div className="tricolore h-1" />
      <div className="container-page pb-6 pt-16">
        <div className="grid gap-9 md:grid-cols-2 xl:grid-cols-[1.2fr_0.7fr_repeat(3,1fr)]">
          <div>
            <img
              src={images.logo}
              alt="Seven Dates"
              className="mb-4 h-11 w-auto brightness-0 invert"
            />
            <p>{t.footer.desc}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-white/30 px-4 py-1.5 text-[13px] hover:border-white hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-lg text-white">{t.footer.navTitle}</h4>
            <ul className="grid gap-2.5">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={path(link.to)} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {offices.map((office) => (
            <div key={office.key}>
              <h4 className="mb-4 text-lg text-white">{t.countries[office.key]}</h4>
              <ul className="grid gap-2.5">
                <li>
                  <a href={office.phoneHref} className="hover:text-white">
                    {office.phone}
                  </a>
                  <button type="button" onClick={open} className="block text-xs underline">
                    {t.footer.call}
                  </button>
                </li>
                {office.emails.length > 0 && (
                  <li>
                    {office.emails.map((mail) => (
                      <a key={mail} href={`mailto:${mail}`} className="block hover:text-white">
                        {mail}
                      </a>
                    ))}
                    <span className="block text-xs text-white/60">{t.footer.mail}</span>
                  </li>
                )}
                {office.address && (
                  <li>
                    <span className="block text-white">{t.footer.address}</span>
                    {office.address}
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/15 pt-5 text-[13px] text-white/60">
          <span>{t.footer.legal}</span>
          <span className="flex gap-4">
            <Link to={path(routes.policy)} className="hover:text-white">
              {t.modal.policy}
            </Link>
            <Link to={path(routes.consent)} className="hover:text-white">
              {t.modal.agreement}
            </Link>
            <span>{t.footer.rights}</span>
          </span>
        </div>
          <span className="flex justify-end gap-4">
            <Link to={"https://www.instagram.com/ahmedow.ll7/"} className="text-[12px] hover:text-white">
              Created by Muhammadaziz Ahmadjanov
            </Link>
          </span>
      </div>
    </footer>
  )
}
