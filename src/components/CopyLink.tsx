// components/CopyLink.tsx
import type { LucideIcon } from 'lucide-react'
import { Rss, Link, Copy } from 'lucide-react'
import { toast } from 'react-toastify'

interface CopyLinkProps {
  url: string
  Icon?: LucideIcon
  iconSize?: number
  iconClass?: string
  buttonClass?: string
  ariaLabel?: string
  successMessage?: string
  children?: React.ReactNode
}

export function CopyLink({
  url,
  Icon,
  iconSize = 18,
  iconClass = 'inline-block -translate-y-0.5 text-teal-600 dark:text-teal-400',
  buttonClass = 'cursor-pointer',
  ariaLabel = '复制链接',
  successMessage = '已复制链接',
  children,
}: CopyLinkProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    toast.success(successMessage)
  }

  return (
    <span role="button" aria-label={ariaLabel} className={buttonClass} onClick={handleCopy}>
      {Icon && <Icon size={iconSize} className={iconClass} />}
      {children}
    </span>
  )
}

export function RssCopyButton({
  url,
  iconSize,
  iconClass,
  buttonClass,
}: Omit<CopyLinkProps, 'Icon' | 'ariaLabel' | 'successMessage'>) {
  return (
    <CopyLink
      url={url}
      Icon={Rss}
      iconSize={iconSize}
      iconClass={iconClass}
      buttonClass={buttonClass}
      ariaLabel="复制 RSS 地址"
      successMessage="已复制 RSS 链接"
    />
  )
}

export function ArticleCopyButton({
  url,
  iconSize,
  iconClass,
  buttonClass,
}: Omit<CopyLinkProps, 'Icon' | 'ariaLabel' | 'successMessage'>) {
  return (
    <CopyLink
      url={url}
      Icon={Link}
      iconSize={iconSize}
      iconClass={iconClass}
      buttonClass={buttonClass}
      ariaLabel="复制文章链接"
      successMessage="已复制文章链接"
    />
  )
}

export function TextCopyButton({
  text,
  iconSize = 16,
  iconClass,
  buttonClass = 'cursor-pointer select-none',
}: Omit<CopyLinkProps, 'url' | 'Icon' | 'ariaLabel' | 'successMessage'> & { text: string }) {
  return (
    <CopyLink
      url={text}
      Icon={Copy}
      iconSize={iconSize}
      iconClass={iconClass}
      buttonClass={buttonClass}
      ariaLabel="复制文本"
      successMessage="已复制到剪贴板"
    >
      &nbsp;[复制]
    </CopyLink>
  )
}
