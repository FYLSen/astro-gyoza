import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

export function rehypeImage() {
  return function (tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'p' && node.children.length === 1) {
        const child = node.children[0]
        if (child.tagName === 'img') {
          parent.children[index] = buildFigure(child)
        }
      } else if (node.tagName === 'img') {
        parent.children[index] = buildImage(node)
      }
    })
  }
}

function parseImageParams(src) {
  if (!src) return { url: src }

  const [baseUrl, ...params] = src.split('#')
  if (params.length === 0) return { url: src }

  const paramString = params.join('#')
  const matches = paramString.match(/^([^|]+)?(?:\|(.+))?$/)

  if (!matches) return { url: src }

  const [, classes, title] = matches

  return {
    url: baseUrl,
    classes: classes?.trim(),
    title: title?.trim(),
  }
}

function getImageClasses(width, height) {
  const baseClasses = ['max-w-full', 'h-auto', 'object-contain', 'mx-auto', 'my-4', 'modal-trigger']

  // 如果没有宽高信息，返回基础类
  if (!width || !height) {
    return [...baseClasses, 'w-full md:w-4/5 lg:w-3/4']
  }

  const aspectRatio = width / height
  const isWide = aspectRatio > 2 // 特宽图片
  const isNarrow = aspectRatio < 0.5 // 特窄图片
  const isSmall = width < 300 // 小图
  const isLarge = width > 1200 // 大图

  if (isSmall) {
    return [...baseClasses, 'w-auto md:w-1/3 lg:w-1/4']
  }

  if (isWide) {
    return [...baseClasses, 'w-full']
  }

  if (isNarrow) {
    return [...baseClasses, 'w-auto md:w-1/2 lg:w-1/3']
  }

  if (isLarge) {
    return [...baseClasses, 'w-full md:w-4/5 lg:w-3/4']
  }

  // 普通图片
  return [...baseClasses, 'w-full md:w-2/3 lg:w-1/2']
}

function buildImage(node) {
  const imgProps = { ...node.properties }
  const { url, classes, title } = parseImageParams(imgProps.src)
  imgProps.src = url

  if (title) {
    imgProps.title = title
  }

  const width = parseInt(imgProps.width)
  const height = parseInt(imgProps.height)
  const defaultClasses = getImageClasses(width, height)

  // 用户自定义类会覆盖默认类
  let className = classes ? [...defaultClasses, classes] : defaultClasses

  return h('img', {
    ...imgProps,
    loading: 'lazy',
    class: className.join(' '),
    style: 'cursor: zoom-in',
  })
}

function buildFigure(node) {
  const { title } = parseImageParams(node.properties.src)

  if (title) {
    return h(
      'figure',
      {
        class: 'w-full my-8 flex flex-col items-center',
      },
      [
        buildImage(node),
        h(
          'figcaption',
          {
            class: 'mt-2 text-sm text-gray-600 text-center',
          },
          title,
        ),
      ],
    )
  }

  return buildImage(node)
}
