import React, { useState, useRef, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { Lock, Unlock, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ITERATIONS = 100000
const KEY_SIZE = 256 / 32
const ERROR_DISPLAY_DURATION = 3000 // 错误显示持续时间（毫秒）

interface ContentDecryptionProps {
  onUnlock: () => void
}

interface DecryptedContent {
  html: string
  isValid: boolean
}

interface FeedbackMessage {
  type: 'error' | 'info'
  message: string
}

const FeedbackAlert = ({ feedback }: { feedback: FeedbackMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
  >
    <AlertCircle className="w-4 h-4" />
    <span className="text-sm">{feedback.message}</span>
  </motion.div>
)

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === 'Malformed UTF-8 data' || error.message.includes('UTF-8')) {
      return '密码错误，请重试'
    }
    if (error.message.includes('padding')) {
      return '密码格式不正确，请重试'
    }
    return error.message
  }
  return '解密过程中出现错误，请重试'
}

export const ContentDecryption: React.FC<ContentDecryptionProps> = ({ onUnlock }) => {
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<DecryptedContent | null>(null)
  const [isRendered, setIsRendered] = useState(false)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const isHydrated = useRef(false)
  const feedbackTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleHydration = () => {
      isHydrated.current = true
    }

    if ((window as any).Astro?.isHydrated) {
      isHydrated.current = true
    }

    document.addEventListener('astro:hydrate', handleHydration)
    return () => {
      document.removeEventListener('astro:hydrate', handleHydration)
    }
  }, [])

  useEffect(() => {
    if (feedback) {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }

      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null)
      }, ERROR_DISPLAY_DURATION)
    }

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [feedback])

  const performDecryption = async (
    encrypted: string,
    iv: string,
    salt: string,
    hmac: string,
    inputPassword: string,
  ) => {
    try {
      const key = CryptoJS.PBKDF2(inputPassword, CryptoJS.enc.Hex.parse(salt), {
        keySize: KEY_SIZE,
        iterations: ITERATIONS,
        hasher: CryptoJS.algo.SHA256,
      })

      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      })

      const htmlContent = decrypted.toString(CryptoJS.enc.Utf8)
      if (!htmlContent) {
        throw new Error('密码错误')
      }

      const computedHmac = CryptoJS.HmacSHA256(encrypted, key).toString(CryptoJS.enc.Hex)
      if (computedHmac !== hmac) {
        throw new Error('内容已被篡改')
      }

      return htmlContent
    } catch (error) {
      throw error
    }
  }

  const decryptContent = async (inputPassword: string) => {
    if (!inputPassword.trim()) {
      setFeedback({ type: 'error', message: '请输入密码' })
      return
    }

    setIsDecrypting(true)
    setFeedback(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 50))

      const article = document.getElementById('markdown-wrapper')
      const encryptedDiv = article?.querySelector('#encrypted-content')
      if (!encryptedDiv) {
        throw new Error('找不到加密内容')
      }

      const encrypted = encryptedDiv.getAttribute('data-encrypted')
      const iv = encryptedDiv.getAttribute('data-iv')
      const salt = encryptedDiv.getAttribute('data-salt')
      const hmac = encryptedDiv.getAttribute('data-hmac')

      if (!encrypted || !iv || !salt || !hmac) {
        throw new Error('加密数据不完整')
      }

      const htmlContent = await performDecryption(encrypted, iv, salt, hmac, inputPassword)

      const protectedContent = document.getElementById('protected-content')
      if (!protectedContent) {
        throw new Error('找不到内容容器')
      }

      const wrapper = document.createElement('div')
      wrapper.className = 'markdown'
      wrapper.innerHTML = htmlContent

      protectedContent.innerHTML = ''
      protectedContent.appendChild(wrapper)
      protectedContent.classList.remove('hidden')

      const tocContent = document.querySelector('[data-toc-content]')
      if (tocContent) {
        tocContent.classList.remove('hidden')
      }

      window.dispatchEvent(new Event('resize'))
      document.dispatchEvent(new CustomEvent('content-unlocked'))

      if (typeof onUnlock === 'function') {
        onUnlock()
      }

      setDecryptedContent({ html: htmlContent, isValid: true })
      setIsRendered(true)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setFeedback({ type: 'error', message: errorMessage })
      setDecryptedContent(null)

      if (errorMessage.includes('密码错误') && passwordInputRef.current) {
        passwordInputRef.current.select()
      }
    } finally {
      setIsDecrypting(false)
    }
  }

  if (decryptedContent?.isValid && isRendered) {
    return null
  }

  return (
    <div className="my-8 p-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Lock size={20} className="text-primary" />
        这是一篇加密文章
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <input
            ref={passwordInputRef}
            type="password"
            disabled={isDecrypting}
            className="min-h-[36px] px-4 tracking-wider text-sm border-2 border-primary rounded-full 
                       bg-transparent backdrop-blur-sm leading-9
                       focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
                       dark:border-primary dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       sm:min-h-[28px] sm:text-xs sm:px-4 sm:rounded-[14px]"
            placeholder="请输入密码"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isDecrypting) {
                decryptContent(e.currentTarget.value)
              }
            }}
          />
          <button
            className="inline-flex items-center justify-center whitespace-nowrap tracking-wider text-sm min-h-[36px] px-6
                       border-2 border-primary text-center rounded-full
                       text-primary bg-transparent backdrop-blur-sm
                       hover:bg-primary hover:text-root
                       disabled:opacity-50 disabled:cursor-not-allowed
                       sm:min-h-[28px] sm:text-xs sm:px-4 sm:rounded-[14px]"
            onClick={() => {
              if (passwordInputRef.current && !isDecrypting) {
                decryptContent(passwordInputRef.current.value)
              }
            }}
            disabled={isDecrypting}
          >
            {isDecrypting ? (
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                <span>解密中</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>解密</span>
              </div>
            )}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {feedback && <FeedbackAlert feedback={feedback} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
