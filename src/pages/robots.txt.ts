import type { APIRoute } from 'astro'

const getRobotsTxt = (site: string) => `
User-agent: *
Allow: /

Disallow: /_astro/
Disallow: /fonts/

Sitemap: ${new URL('sitemap-index.xml', site).href}
Sitemap: ${new URL('gallery/sitemap.xml', site).href}
`

export const GET: APIRoute = ({ site }) => {
  return new Response(getRobotsTxt(site!.toString()), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
