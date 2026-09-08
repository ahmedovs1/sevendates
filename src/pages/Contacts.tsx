import { useI18n } from '../i18n'
import { offices } from '../data/site'

export default function Contacts() {
  const { t } = useI18n()

  return (
    <section className="py-16 lg:py-22">
      <div className="container-page">
        <h2 className="section-title">{t.contactsPage.title}</h2>

        <div className="mt-12 grid gap-10">
          {offices.map((office) => (
            <div
              key={office.key}
              className={`grid items-stretch gap-8 rounded-[18px] border border-line p-6 lg:p-8 ${
                office.map ? 'lg:grid-cols-2' : ''
              }`}
            >
              <div>
                <span className="kicker">{t.countries[office.key]}</span>
                <h1 className="mt-2 text-[clamp(22px,2.6vw,32px)] text-brand">
                  {office.company ?? t.countries[office.key]}
                </h1>
                {office.tin && <p className="text-sm text-muted">{office.tin}</p>}

                {office.address && (
                  <>
                    <h3 className="mt-6 text-[17px] text-brand-dark">
                      {t.contactsPage.locationTitle}
                    </h3>
                    <p className="mt-1 text-muted">{office.address}</p>
                  </>
                )}

                <h3 className="mt-6 text-[17px] text-brand-dark">{t.contactsPage.contactTitle}</h3>
                <a href={office.phoneHref} className="mt-1 block text-muted hover:text-brand">
                  {office.phone}
                </a>

                {office.emails.length > 0 && (
                  <>
                    <h3 className="mt-6 text-[17px] text-brand-dark">{t.contactsPage.mailTitle}</h3>
                    {office.emails.map((mail) => (
                      <a
                        key={mail}
                        href={`mailto:${mail}`}
                        className="mt-1 block text-muted hover:text-brand"
                      >
                        {mail}
                      </a>
                    ))}
                  </>
                )}
              </div>

              {office.map && (
                <iframe
                  src={office.map}
                  title={t.countries[office.key]}
                  loading="lazy"
                  className="min-h-[320px] w-full rounded-[18px] border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
