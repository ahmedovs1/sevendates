# sevendates

PREMIUM HALAL Натуральный напиток на основе финика.

React + TypeScript + Tailwind версия сайта sevendates.ru.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build -> dist/
npm run preview  # предпросмотр собранной версии
npm run typecheck
```

## Стек

- **React 18** + **TypeScript** (strict)
- **Vite 5**
- **Tailwind CSS v4** (`@tailwindcss/vite`, токены в `@theme`)
- **React Router v6**

## Структура

```
public/
  images/  fonts/  media/  flags/   ассеты и шрифты Belwe с оригинального сайта
src/
  i18n/          словари ru / en / uz, контекст языка, разбор языка из URL
  data/site.ts   контакты офисов, соцсети, пути к картинкам, слаги маршрутов
  content/       тексты юридических страниц и статьи (JSON, вытянуты со старого сайта)
  components/    Header, Footer, Layout, CallbackModal, LangSwitcher, RichText
  pages/         Home, Product, Advantages, Media, NewsArticle, Contacts, Legal, Soon, NotFound
```

## Языки

Русский обслуживается по корню, английский и узбекский — по префиксам `/en` и `/uz`
(как на оригинальном сайте). Язык определяется из URL в `src/i18n/index.tsx`,
переключатель меняет только префикс, сохраняя текущую страницу.

## Маршруты

| Путь | Страница |
| --- | --- |
| `/` | Главная |
| `/products` | О продукте |
| `/about` | Преимущества (сравнение с другими напитками) |
| `/media` | Медиа: видео и статьи |
| `/news/:slug` | Статья |
| `/contacts` | Контакты |
| `/police` | Политика конфиденциальности |
| `/rules` | Согласие на обработку персональных данных |
| `/soon` | Coming soon |

Те же пути доступны с префиксами `/en/...` и `/uz/...`.

## Что нужно доделать

Форма обратного звонка (`src/components/CallbackModal.tsx`) сейчас только показывает
подтверждение — на оригинале она уходила в WordPress. Подключите свой API в обработчике
`submit`.
