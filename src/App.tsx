import { Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { CallbackModalProvider } from './components/CallbackModal'
import Layout from './components/Layout'
import Home from './pages/Home'
import Product from './pages/Product'
import Advantages from './pages/Advantages'
import Media from './pages/Media'
import Mixology from './pages/Mixology'
import NewsArticle from './pages/NewsArticle'
import Contacts from './pages/Contacts'
import Legal from './pages/Legal'
import Soon from './pages/Soon'
import NotFound from './pages/NotFound'

/** The original site serves Russian at the root and mirrors it under /en and /uz. */
const LANG_PREFIXES = ['/', '/en', '/uz']

/** Same page tree under every language prefix. */
const pageRoutes = () => [
  <Route key="home" index element={<Home />} />,
  <Route key="products" path="products" element={<Product />} />,
  <Route key="about" path="about" element={<Advantages />} />,
  <Route key="media" path="media" element={<Media />} />,
  <Route key="mixology" path="mixology" element={<Mixology />} />,
  <Route key="news" path="news/:slug" element={<NewsArticle />} />,
  <Route key="contacts" path="contacts" element={<Contacts />} />,
  <Route key="police" path="police" element={<Legal doc="police" />} />,
  <Route key="rules" path="rules" element={<Legal doc="rules" />} />,
  <Route key="soon" path="soon" element={<Soon />} />,
  <Route key="404" path="*" element={<NotFound />} />,
]

export default function App() {
  return (
    <I18nProvider>
      <CallbackModalProvider>
        <Routes>
          {LANG_PREFIXES.map((prefix) => (
            <Route key={prefix} path={prefix} element={<Layout />}>
              {pageRoutes()}
            </Route>
          ))}
        </Routes>
      </CallbackModalProvider>
    </I18nProvider>
  )
}
