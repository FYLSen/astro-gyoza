import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const photosCollection = await getCollection('photos')
  const allPhotos = photosCollection.flatMap((entry) => entry.data)

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${new URL('/gallery', context.site).toString()}</loc>
    ${allPhotos
      .map(
        (photo) => `
      <image:image>
        <image:loc>${photo.url}</image:loc>
      </image:image>`,
      )
      .join('')}
  </url>
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
