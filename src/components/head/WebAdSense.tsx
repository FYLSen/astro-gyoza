import { adsense } from '@/config.json'

export function WebAdSense() {
  if (import.meta.env.DEV || !adsense.enable) return null

  return <>{adsense.google.client && <GoogleAdSense {...adsense.google} />}</>
}

function GoogleAdSense({ client }: { client: string }) {
  return (
    <>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      />
    </>
  )
}
