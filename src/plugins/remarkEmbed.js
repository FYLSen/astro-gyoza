import { visit } from 'unist-util-visit'

export function remarkEmbed() {
  return function (tree) {
    visit(tree, (node) => {
      if (node.type === 'leafDirective') {
        if (!['youtube', 'bilibili', 'codepen', 'video', 'audio'].includes(node.name)) return

        const data = node.data || (node.data = {})
        const attributes = node.attributes || {}
        const id = attributes.id
        const src = attributes.src

        if (!id && !src) return

        data.hName = 'iframe'
        switch (node.name) {
          case 'youtube':
            data.hProperties = {
              class: 'video',
              title: 'YouTube Video Player',
              src: `https://www.youtube.com/embed/${id}`,
              frameBorder: 0,
              allow:
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
              allowFullScreen: true,
              loading: 'lazy',
            }
            break
          case 'bilibili':
            data.hProperties = {
              class: 'video',
              title: 'Bilibili Video Player',
              src: `//player.bilibili.com/player.html?isOutside=true&bvid=${id}`,
              frameBorder: 0,
              allowFullScreen: true,
              loading: 'lazy',
            }
            break
          case 'codepen':
            data.hProperties = {
              class: 'codepen',
              title: 'CodePen Embed',
              src: `https://codepen.io/${attributes.author}/embed/${id}`,
              frameBorder: 0,
              allowFullScreen: true,
              loading: 'lazy',
            }
            break
          case 'video':
            data.hName = 'video'
            data.hProperties = {
              class: 'w-full max-w-3xl mx-auto my-4 rounded-lg shadow-lg',
              controls: true,
              preload: 'metadata',
              playsInline: true,
              src: src,
              poster: attributes.poster || '',
              loop: attributes.loop || false,
              muted: attributes.muted || false,
              autoplay: attributes.autoplay || false,
            }
            break
          case 'audio':
            data.hName = 'audio'
            data.hProperties = {
              class: 'w-full max-w-2xl mx-auto my-4',
              controls: true,
              preload: 'metadata',
              src: src,
              loop: attributes.loop || false,
              muted: attributes.muted || false,
              autoplay: attributes.autoplay || false,
            }
            break
        }
      }
    })
  }
}
