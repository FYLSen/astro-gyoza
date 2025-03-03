import { useEffect, useRef } from 'react'
import { init } from '@waline/client'
import '@waline/client/style'

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
      reaction: [],
      locale: {
        placeholder: '发条友善的评论吧（支持 Markdown 语法）…',
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
