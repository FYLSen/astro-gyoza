import { atom } from 'jotai'

// 存储滚动位置和方向
export const pageScrollLocationAtom = atom(0)
export const pageScrollDirectionAtom = atom<'up' | 'down' | null>(null)

// 管理滚动状态的原子
export const scrollStateAtom = atom(
  (get) => ({
    scrollY: get(pageScrollLocationAtom),
    direction: get(pageScrollDirectionAtom),
  }),
  (get, set, newScrollY: number) => {
    const prevScrollY = get(pageScrollLocationAtom)
    const direction = newScrollY > prevScrollY ? 'down' : 'up'

    set(pageScrollLocationAtom, newScrollY)
    set(pageScrollDirectionAtom, direction)
  },
)
