import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import { images, primaryPhone, routes } from '../data/site'
import { useCallbackModal } from './CallbackModal'
import LangSwitcher from './LangSwitcher'

export default function Header() {
  const { t, path } = useI18n()
  const { open } = useCallbackModal()
  const { pathname } = useLocation()
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    setDrawer(false)
  }, [pathname])

  const links = [
    { to: routes.product, label: t.nav.product },
    { to: routes.advantages, label: t.nav.advantages },
    { to: routes.media, label: t.nav.media },
    { to: routes.mixology, label: t.nav.mixology },
    { to: routes.contacts, label: t.nav.contacts },
  ]

  return (
    <header className="sticky top-0 z-60 border-b border-line bg-white/95 backdrop-blur">
      <div className="tricolore h-[3px]" />
      <div className="container-page flex min-h-[120px] items-center gap-6">
        <Link to={path(routes.home)} className="shrink-0">
          <img src={images.logo} alt="Seven Dates" className="h-20 w-auto" />
        </Link>

        <nav className="ml-auto hidden gap-6 text-[15px] font-medium lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={path(link.to)}
              className={({ isActive }) => (isActive ? 'text-brand' : 'hover:text-brand')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">

          <LangSwitcher />

          <button type="button" onClick={open} className="btn-primary hidden sm:inline-flex">
            {t.header.cta}
          </button>

          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Menu"
            className="text-2xl leading-none text-brand lg:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-80 bg-brand-dark/45 lg:hidden" onClick={() => setDrawer(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 flex w-[min(320px,86vw)] flex-col gap-4 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Close"
              className="self-end text-2xl text-brand"
            >
              ×
            </button>
            {links.map((link) => (
              <Link key={link.to} to={path(link.to)} className="text-lg font-semibold text-brand-dark">
                {link.label}
              </Link>
            ))}
            <a
              href={primaryPhone.href}
              className="mt-2 font-body text-lg font-semibold tabular-nums tracking-tight text-brand"
            >
              {primaryPhone.label}
            </a>
            <button type="button" onClick={open} className="btn-primary mt-2">
              {t.header.cta}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
