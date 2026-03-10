import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { site, follow } from '@/config.json'
import { getPostsNewestFirst } from '@/utils/content'

export async function GET(context: APIContext) {
  const sortedPosts = (await getPostsNewestFirst()).slice(0, 20)

  const generateCustomData = () => {
    let customData = `<language>${site.lang}</language>\n`

    customData += `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`

    if (follow?.enable && follow.feedId && follow.userId) {
      customData += `
    <follow_challenge>
      <feedId>${follow.feedId}</feedId>
      <userId>${follow.userId}</userId>
    </follow_challenge>`
    }

    return customData
  }

  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: sortedPosts.map((post) => ({
      link: `/posts/${post.slug}`,
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      customData: `<dc:creator>${site.title}</dc:creator>`,
    })),
    customData: generateCustomData(),

    xmlns: {
      dc: 'http://purl.org/dc/elements/1.1/',
      atom: 'http://www.w3.org/2005/Atom',
    },
  })
}
