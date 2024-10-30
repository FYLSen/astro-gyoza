import { themeAtom } from '@/store/theme'
import { useAtom } from 'jotai'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSwitch() {
  const [theme, setTheme] = useAtom(themeAtom)

  const left = { light: 4, system: 36, dark: 68 }[theme]

  return (
    <div className="relative inline-block">
      <div
        className="absolute -z-1 top-1 size-8 rounded-full bg-primary transition-transform duration-200 ease-out shadow-sm"
        style={{
          transform: `translateX(${left}px)`,
        }}
      ></div>
      <div
        className="p-[3px] flex rounded-full border border-primary bg-white/50 dark:bg-zinc-800/50 backdrop-blur"
        role="radiogroup"
      >
        <button
          className="size-[32px] flex items-center justify-center"
          type="button"
          aria-label="Switch to light theme"
          onClick={() => setTheme('light')}
        >
          <Sun size={16} strokeWidth={2} />
        </button>
        <button
          className="size-[32px] flex items-center justify-center"
          type="button"
          aria-label="Switch to system theme"
          onClick={() => setTheme('system')}
        >
          <Monitor size={16} strokeWidth={2} />
        </button>
        <button
          className="size-[32px] flex items-center justify-center"
          type="button"
          aria-label="Switch to dark theme"
          onClick={() => setTheme('dark')}
        >
          <Moon size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
