import { author, site } from '@/config.json'
import { getFormattedShortDate } from '@/utils/date'
import { AnimatedSignature } from '../AnimatedSignature'
import { useEffect, useState } from 'react'
import config from '@/config.json'
import { CopyLink } from '@/components/CopyLink'

function getPostUrl(slug: string) {
  return new URL(slug, site.url).href
}

interface License {
  name: string
  url?: string
  description: string
}

export function PostCopyright({
  title,
  slug,
  lastMod,
  license,
}: {
  title: string
  slug: string
  lastMod: Date
  license?: License
}) {
  const [lastModStr, setLastModStr] = useState('')
  const url = getPostUrl(slug)
  const currentLicense = license || config.license

  useEffect(() => {
    setLastModStr(getFormattedShortDate(lastMod))
  }, [lastMod])

  return (
    <section className="text-xs leading-loose text-neutral-500 dark:text-neutral-400">
      <p>文章标题：{title}</p>
      <p>文章作者：{author.name}</p>
      <p>
        <span>文章链接：{url}</span>
        <CopyLink url={url} successMessage="已复制文章链接">
          <span className="ml-2">[复制]</span>
        </CopyLink>
      </p>
      <p>最后修改时间：{lastModStr}</p>
      <hr className="my-3 border-neutral-200 dark:border-neutral-700" />
      <div>
        <div className="float-right ml-4 my-2">
          <AnimatedSignature />
        </div>
        <p>
          {currentLicense.description}
          <br />
          本文遵循&nbsp;
          <a
            className="hover:underline hover:text-teal-600 dark:text-teal-400 underline-offset-2"
            href={currentLicense.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentLicense.name}
          </a>
          &nbsp;许可协议。
        </p>
      </div>
    </section>
  )
}
