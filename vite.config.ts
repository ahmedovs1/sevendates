import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API = 'http://localhost:8787'

/**
 * In production nginx routes page requests through the Node service, which
 * stitches the per-page SEO tags into the HTML. The dev server serves
 * index.html untouched, so `npm run dev` would show the build-time title and an
 * edit would look like it had not applied. This borrows the same tags from the
 * running service so dev matches production.
 */
function seoFromServer(): Plugin {
  return {
    name: 'seo-from-server',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      async handler(html, ctx) {
        try {
          const res = await fetch(API + (ctx.originalUrl || '/'), {
            headers: { accept: 'text/html' },
          })
          if (!res.ok) return html
          const served = await res.text()
          const head = served.match(/<title>[\s\S]*?(?=<\/head>)/)
          if (!head) return html
          return html
            .replace(/\s*<title>[\s\S]*?<\/title>/, '')
            .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
            .replace('</head>', `  ${head[0].trim()}\n  </head>`)
        } catch {
          // Service not running — dev still works, just without the tags.
          return html
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoFromServer()],
  server: {
    port: 5173,
    open: true,
    // same relative /api/send path as production, where nginx does this
    proxy: { '/api': API, '/uploads': API },
  },
})
