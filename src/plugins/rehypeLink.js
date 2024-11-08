import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

const createExternalLinkIcon = () => {
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1em',
      height: '1em',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      class: 'inline-block mx-1 align-text-bottom -translate-y-1',
    },
    [
      h('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
      h('polyline', { points: '15 3 21 3 21 9' }),
      h('line', { x1: '10', y1: '14', x2: '21', y2: '3' }),
    ],
  )
}

export function rehypeLink() {
  return (tree) => {
    visit(tree, { tagName: 'a' }, (node, index, parent) => {
      const isExternal = node.properties.href.startsWith('http')
      if (isExternal) {
        node.properties = {
          ...node.properties,
          rel: 'noopener noreferrer',
          target: '_blank',
        }
        parent.children[index] = node

        const icon = createExternalLinkIcon()
        parent.children.splice(index + 1, 0, icon)
      }
    })
  }
}
