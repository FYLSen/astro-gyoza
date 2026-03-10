import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { site, gallery, follow } from '@/config.json'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const photosCollection = await getCollection('photos')
  const allPhotos = photosCollection.flatMap((entry) => entry.data)

  const sortedPhotos = allPhotos
    .map((photo) => ({
      ...photo,
      date: photo.date ? new Date(photo.date) : new Date(0),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20)

  const customData = `
    <language>${site.lang}</language>
    ${
      follow?.enable && follow.galleryFeedId && follow.userId
        ? `<follow_challenge>
        <feedId>${follow.galleryFeedId}</feedId>
        <userId>${follow.userId}</userId>
      </follow_challenge>`
        : ''
    }`

  return rss({
    title: `${site.title} - ${gallery.subtitle}@${gallery.title}`,
    description: `${gallery.description}`,
    site: context.site!,
    items: sortedPhotos.map((photo) => ({
      link: photo.url,
      title: photo.name || `${gallery.subtitle}@${gallery.title}`,
      pubDate: photo.date,
      description: `<img src="${photo.url}" alt="${photo.name || ''}" />
        ${photo.description ? `<p>${photo.description}</p>` : ''} 
        ${photo.location ? `<p>拍摄于${photo.location}</p>` : ''}
        ${Array.isArray(photo.tag) && photo.tag.length > 0 ? `<p>标签：${photo.tag.join(', ')}</p>` : ''}`,
    })),
    customData,
  })
}
