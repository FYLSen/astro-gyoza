import { useEffect, useRef } from 'react'
import { init } from '@waline/client'
import '@waline/client/style'
import '@/styles/waline.css'
export function Waline({ serverURL }: { serverURL: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const walineInst = init({
      el: ref.current,
      serverURL,
      dark: "[data-theme='dark']",
      login: 'enable',
      imageUploader: false,
      search: false,
      noCopyright: true,
      noRss: true,
      reaction: [],
      locale: {
        placeholder: '要不要分享下想法～',
      },
      emoji: ['//unpkg.com/@waline/emojis@1.2.0/bmoji'],
    })

    return () => {
      if (ref.current) {
        walineInst?.destroy()
      }
    }
  }, [serverURL])

  return <div ref={ref}></div>
}
