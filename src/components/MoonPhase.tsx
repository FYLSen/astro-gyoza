import { motion } from 'framer-motion'
import { useState } from 'react'
import type { MoonPhaseConfig } from '@/utils/moonPhase'

interface MoonPhaseProps {
  phaseConfig: MoonPhaseConfig
}

export default function MoonPhase({ phaseConfig }: MoonPhaseProps) {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)

  return (
    <div className="relative mb-8 group flex flex-col items-center">
      <div className="relative w-[180px] h-[180px] md:w-[180px] md:h-[180px] sm:w-[120px] sm:h-[120px]">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 rounded-full transition-all duration-700
                        bg-gradient-to-r from-amber-200/20 via-orange-200/30 to-yellow-200/20
                        dark:from-blue-100/10 dark:via-slate-200/20 dark:to-blue-100/10
                        animate-[pulse_4s_ease-in-out_infinite]"
          />
          <div
            className="absolute inset-0 rounded-full blur-xl transition-all duration-700
                        bg-gradient-to-tr from-amber-200/30 via-orange-300/40 to-yellow-200/30
                        dark:from-blue-200/20 dark:via-slate-100/30 dark:to-blue-200/20
                        animate-[pulse_6s_ease-in-out_infinite]"
          />
          <div
            className="absolute inset-0 rounded-full opacity-0 dark:opacity-40
                        dark:bg-gradient-to-tr from-slate-100/10 via-white/20 to-slate-100/10
                        dark:blur-2xl dark:animate-[pulse_8s_ease-in-out_infinite]
                        transition-all duration-700"
          />
        </div>

        <motion.button
          className="relative w-full h-full rounded-full outline-none focus:outline-none 
                     touch-manipulation select-none z-10"
          aria-label={`今日月相：${phaseConfig.name}`}
          onClick={() => {
            setIsDescriptionVisible(true)
            setTimeout(() => setIsDescriptionVisible(false), 4000)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div className="relative w-full h-full">
            <div
              className="absolute inset-0 rounded-full transition-all duration-700
                          bg-gradient-to-tr from-amber-100/50 via-orange-50/60 to-yellow-100/50
                          dark:from-slate-200/20 dark:via-white/30 dark:to-slate-200/20
                          border border-amber-200/30 dark:border-white/30
                          shadow-[inset_0_0_20px_rgba(251,191,36,0.2)]
                          dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"
            />

            <motion.img
              src={`/moon/${phaseConfig.image}`}
              alt={`今日月相：${phaseConfig.name}`}
              className="w-full h-full object-contain rounded-full transition-all duration-700
                       bg-[rgba(28,28,30,0.03)] dark:bg-transparent
                       drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]
                       dark:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]
                       group-hover:drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]
                       group-hover:dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]
                       active:drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]
                       active:dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              draggable="false"
            />
          </motion.div>
        </motion.button>
      </div>

      <motion.div
        className="mt-6 text-primary/90 text-base px-4 absolute top-full z-20
                   backdrop-blur-sm rounded-lg py-2 
                   shadow-lg dark:shadow-black/20 shadow-amber-900/10
                   transition-all duration-700
                   md:text-base sm:text-sm"
        initial={{ opacity: 0, y: -8 }}
        animate={{
          opacity: isDescriptionVisible ? 1 : 0,
          y: isDescriptionVisible ? 0 : -8,
        }}
        transition={{ duration: 0.3 }}
      >
        {phaseConfig.description}
      </motion.div>
    </div>
  )
}
