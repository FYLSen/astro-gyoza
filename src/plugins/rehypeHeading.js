import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

export function rehypeHeading() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'h1' ||
        node.tagName === 'h2' ||
        node.tagName === 'h3' ||
        node.tagName === 'h4' ||
        node.tagName === 'h5' ||
        node.tagName === 'h6'
      ) {
        const link = h(
          'a',
          {
            href: `#${node.properties.id}`,
            class: 'heading-anchor',
            ariaLabel: 'Heading Anchor',
          },
          h(
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
              class: 'inline-block ml-2 align-text-bottom translate-y-[-4px] transform -rotate-45',
            },
            [
              h('path', { d: 'M9 17H7A5 5 0 0 1 7 7h2' }),
              h('path', { d: 'M15 7h2a5 5 0 1 1 0 10h-2' }),
              h('line', { x1: '8', x2: '16', y1: '12', y2: '12' }),
            ],
          ),
        )
        node.children.push(link)
        node.properties = {
          ...node.properties,
          class: 'heading',
        }
        parent.children[index] = node
      }
    })
  }
}
