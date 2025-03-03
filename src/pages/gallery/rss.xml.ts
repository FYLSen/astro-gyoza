import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { site, gallery, follow } from '@/config.json'
import { getCollection } from 'astro:content'

export async function GET(context: APIContext) {
  const photosCollection = await getCollection('photos')
  const allPhotos = photosCollection.flatMap((entry) => entry.data)
  const sortedPhotos = allPhotos.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const generateCustomData = () => {
    let customData = `<language>${site.lang}</language>\n`

    if (follow?.enable && follow.galleryFeedId && follow.userId) {
      customData += `
    <follow_challenge>
      <feedId>${follow.galleryFeedId}</feedId>
      <userId>${follow.userId}</userId>
    </follow_challenge>`
    }
    return customData
  }

  return rss({
    title: `${site.title} - ${gallery.subtitle}@${gallery.title}`,
    description: `${gallery.description}`,
    site: context.site!,
    items: sortedPhotos.map((photo) => ({
      link: photo.url,
      title: photo.name || `${gallery.subtitle}@${gallery.title}`,
      pubDate: new Date(photo.date),
      description: `<img src="${photo.url}" alt="${photo.name || ''}" />${photo.description ? `<br />${photo.description}` : ''} ${photo.tag ? `<br/>标签：${photo.tag.join(', ')}` : ''}`,
    })),
    customData: generateCustomData(),
  })
}
