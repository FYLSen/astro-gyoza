import { sponsor, site } from '@/config.json'
import { motion } from 'framer-motion'
import * as QR from 'qrcode.react'
import { useAtomValue } from 'jotai'
import { metaSlugAtom, metaTitleAtom } from '@/store/metaInfo'
import { toast } from 'react-toastify'
import { useModal } from '@/components/ui/modal'
import { icons } from 'lucide-react'

type iconName = keyof typeof icons

interface ShareData {
  url: string
  text: string
}

const shareList = [
  {
    name: 'Twitter',
    icon: 'Twitter',
    onClick: (data: ShareData) => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}&via=${encodeURIComponent(site.title)}`,
      )
    },
  },
  {
    name: '复制链接',
    icon: 'Link',
    onClick: (data: ShareData) => {
      navigator.clipboard.writeText(data.url)
      toast.success('已复制到剪贴板')
    },
  },
]

export function ActionAside() {
  return (
    <div
      className="absolute left-0 bottom-0 flex flex-col gap-4"
      style={{
        transform: 'translateY(calc(100% + 24px))',
      }}
    >
      <ShareButton />
      <DonateButton />
    </div>
  )
}

function ShareButton() {
  const postSlug = useAtomValue(metaSlugAtom)
  const postTitle = useAtomValue(metaTitleAtom)
  const { present } = useModal()

  const url = new URL(postSlug, site.url).href
  const text = `嘿，我发现了一片宝藏文章「${postTitle}」哩，快来看看吧！`

  const openModal = () => {
    present({
      content: <ShareModal url={url} text={text} />,
    })
  }

  return (
    <button
      type="button"
      aria-label="Share this post"
      className="size-6 text-xl leading-none hover:text-accent"
      onClick={() => openModal()}
    >
      <icons.Share2 size={20} />
    </button>
  )
}

function ShareModal({ url, text }: { url: string; text: string }) {
  return (
    <motion.div
      className="bg-primary rounded-lg p-2 min-w-[420px] border border-primary flex flex-col"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <h2 className="px-3 py-1 font-bold">分享此内容</h2>
      <hr className="my-2 border-primary" />
      <div className="px-3 py-2 grid grid-cols-[180px_auto] gap-3">
        <QR.QRCodeSVG value={url} size={180} />
        <div className="flex flex-col gap-2">
          <div className="text-sm">分享到...</div>
          <ul className="flex flex-col gap-2">
            {shareList.map((item) => (
              <li
                className="px-2 py-1 flex gap-2 cursor-pointer rounded-md hover:bg-secondary"
                key={item.name}
                onClick={() => item.onClick({ url, text })}
                role="button"
                aria-label={`Share to ${item.name}`}
              >
                <LucideIcon
                  name={item.icon as iconName}
                  size={16}
                  className="inline-block translate-y-[4px]"
                />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

function DonateButton() {
  const { present } = useModal()

  const openDonate = () => {
    present({
      content: <DonateContent />,
    })
  }

  return (
    <button
      type="button"
      aria-label="Donate to author"
      className="size-6 text-xl leading-none hover:text-accent"
      onClick={() => openDonate()}
    >
      <icons.HandCoins size={20} />
    </button>
  )
}

function DonateContent() {
  return (
    <motion.div
      className="bg-primary rounded-lg p-2 border border-primary"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
    >
      <h2 className="text-center mb-5">感谢您的支持，这将成为我前进的最大动力。</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        <img
          className="object-cover"
          width={300}
          height={300}
          src={sponsor.wechat}
          alt="微信赞赏码"
          loading="lazy"
          decoding="async"
        />
      </div>
    </motion.div>
  )
}

const LucideIcon = ({
  name,
  size,
  className,
}: {
  name: iconName
  size: number
  className?: string
}) => {
  const Icon = icons[name]
  return <Icon size={size} className={className} />
}
