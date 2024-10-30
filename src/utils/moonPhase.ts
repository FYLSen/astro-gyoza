export type MoonPhaseConfig = {
  image: string
  name: string
  description: string
}

export const MOON_PHASES: MoonPhaseConfig[] = [
  {
    image: 'new-moon.svg',
    name: '新月',
    description: '🌑 新月伊始，万籁俱寂',
  },
  {
    image: 'waxing-crescent.svg',
    name: '娥眉月',
    description: '🌒 娥眉玉钩，清辉初现',
  },
  {
    image: 'first-quarter.svg',
    name: '上弦月',
    description: '🌓 上弦之月，流光渐盈',
  },
  {
    image: 'waxing-gibbous.svg',
    name: '盈凸月',
    description: '🌔 晶莹玉盘，清辉胜昼',
  },
  {
    image: 'full-moon.svg',
    name: '满月',
    description: '🌕 皓月当空，星月赴约',
  },
  {
    image: 'waning-gibbous.svg',
    name: '亏凸月',
    description: '🌖 月色渐敛，光华万千',
  },
  {
    image: 'last-quarter.svg',
    name: '下弦月',
    description: '🌗 下弦之月，余晖尚存',
  },
  {
    image: 'waning-crescent.svg',
    name: '残月',
    description: '🌘 残月将逝，静待新生',
  },
]

export function getMoonPhase(): number {
  const date = new Date()
  const referenceNewMoon = new Date(2024, 9, 2, 18, 49).getTime()
  const currentDate = date.getTime()
  const diffDays = (currentDate - referenceNewMoon) / (1000 * 60 * 60 * 24)
  const phase = ((diffDays % 29.53059) / 29.53059) * 8
  return Math.floor(phase + 8) % 8
}

export function getCurrentMoonPhase(): MoonPhaseConfig {
  const currentPhase = getMoonPhase()
  return MOON_PHASES[currentPhase]
}
