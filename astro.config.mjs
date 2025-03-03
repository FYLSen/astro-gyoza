import { defineConfig } from 'astro/config'
import { remarkReadingTime } from './src/plugins/remarkReadingTime.js'
import { rehypeCodeBlock } from './src/plugins/rehypeCodeBlock.js'
import { rehypeTableBlock } from './src/plugins/rehypeTableBlock.js'
import { rehypeCodeHighlight } from './src/plugins/rehypeCodeHighlight.js'
import { rehypeImage } from './src/plugins/rehypeImage.js'
import { rehypeLink } from './src/plugins/rehypeLink.js'
import { rehypeHeading } from './src/plugins/rehypeHeading.js'
import { rehypeEncryption } from './src/plugins/rehypeEncryption.js'
import remarkDirective from 'remark-directive'
import { remarkSpoiler } from './src/plugins/remarkSpoiler.js'
import { remarkEmbed } from './src/plugins/remarkEmbed.js'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import swup from '@swup/astro'
import { site } from './src/config.json' assert { type: 'json' }

// https://astro.build/config
export default defineConfig({
  site: site.url,
  integrations: [
    tailwind(),
    react(),
    sitemap(),
    swup({
      theme: false,
      animationClass: 'swup-transition-',
      containers: ['main'],
      morph: ['[component-export="Provider"]'],
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
    remarkPlugins: [remarkMath, remarkDirective, remarkEmbed, remarkSpoiler, remarkReadingTime],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeKatex,
      rehypeLink,
      rehypeImage,
      rehypeHeading,
      rehypeCodeBlock,
      rehypeCodeHighlight,
      rehypeTableBlock,
      [rehypeEncryption, {}],
    ],
    remarkRehype: {
      footnoteLabel: '参考',
      footnoteBackLabel: '返回正文',
      passThrough: ['yaml'],
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
})
