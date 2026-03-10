import React, { useState, useRef, useEffect } from 'react'
import { Shield, Lock, Unlock, AlertCircle, KeyRound } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ITERATIONS = 333333
const KEY_LENGTH = 256
const ERROR_DISPLAY_DURATION = 3000

interface ContentDecryptionProps {
    onUnlock: () => void
}

interface FeedbackMessage {
    type: 'error' | 'info'
    message: string
}

const base64ToBuffer = (base64: string): Uint8Array => {
    const normalizedBase64 = base64
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

    try {
        const binaryStr = atob(normalizedBase64)
        return Uint8Array.from(binaryStr, (c) => c.charCodeAt(0))
    } catch (e) {
        throw new Error('Invalid base64 string')
    }
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

const DecryptButton = ({
    onClick,
    isDecrypting,
}: {
    onClick: () => void
    isDecrypting: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <button
            className="absolute right-1.5 sm:right-2 h-7 sm:h-8 bg-teal-600 dark:bg-teal-400 hover:bg-teal-600/90 dark:bg-teal-400/90 active:bg-teal-600/80 dark:bg-teal-400/80 text-white dark:text-black text-sm px-3 sm:px-4 rounded-full transition-colors duration-200 shadow-sm flex items-center justify-center"
            onClick={onClick}
            disabled={isDecrypting}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-1">
                {isDecrypting ? (
                    <>
                        <Unlock size={15} />
                        <span className="hidden sm:inline">解密中</span>
                    </>
                ) : (
                    <>
                        {isHovered ? <Unlock size={15} /> : <Lock size={15} />}
                        <span className="hidden sm:inline">解密</span>
                    </>
                )}
            </div>
        </button>
    )
}

export const ContentDecryption: React.FC<ContentDecryptionProps> = ({ onUnlock }) => {
    const [isDecrypting, setIsDecrypting] = useState(false)
    const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)
    const [isDecrypted, setIsDecrypted] = useState(false)
    const passwordInputRef = useRef<HTMLInputElement>(null)
    const feedbackTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

    useEffect(() => {
        if (feedback) {
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
        encryptedBase64: string,
        ivBase64: string,
        saltBase64: string,
        password: string,
    ) => {
        try {
            const encrypted = base64ToBuffer(encryptedBase64)
            const iv = base64ToBuffer(ivBase64)
            const salt = base64ToBuffer(saltBase64)

            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey'],
            )

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt as BufferSource,
                    iterations: ITERATIONS,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: KEY_LENGTH },
                false,
                ['decrypt'],
            )

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv as BufferSource,
                },
                key,
                encrypted as BufferSource,
            )

            return new TextDecoder().decode(decrypted)
        } catch (error) {
            console.error('Decryption error:', error)
            throw new Error('密码错误')
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
            const article = document.getElementById('markdown-wrapper')
            const encryptedDiv = article?.querySelector('#encrypted-content')
            if (!encryptedDiv) {
                throw new Error('找不到加密内容')
            }

            const encrypted = encryptedDiv.getAttribute('data-encrypted')
            const iv = encryptedDiv.getAttribute('data-iv')
            const salt = encryptedDiv.getAttribute('data-salt')

            if (!encrypted || !iv || !salt) {
                throw new Error('加密数据不完整')
            }

            const htmlContent = await performDecryption(encrypted, iv, salt, inputPassword)

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

            setIsDecrypted(true)
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err instanceof Error ? err.message : '解密失败',
            })

            if (passwordInputRef.current) {
                passwordInputRef.current.select()
            }
        } finally {
            setIsDecrypting(false)
        }
    }

    const handleDecryption = () => {
        if (passwordInputRef.current) {
            decryptContent(passwordInputRef.current.value)
        }
    }

    if (isDecrypted) return null

    return (
        <div className="my-8 p-6 bg-gray-50/50 dark:bg-neutral-800/80 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield size={20} className="text-teal-600 dark:text-teal-400" />
                这是受保护的加密文章
            </h2>
            <div className="space-y-4">
                <div className="relative flex items-center group">
                    <div className="absolute left-3.5 sm:left-4 text-neutral-500/70 dark:text-neutral-400/70 group-hover:text-teal-600 dark:text-teal-400 dark:text-neutral-500/60 dark:text-neutral-400/60 dark:group-hover:text-teal-600/90 dark:text-teal-400/90 transition-colors duration-200 hidden sm:block">
                        <KeyRound size={16} strokeWidth={2} />
                    </div>
                    <input
                        ref={passwordInputRef}
                        type="password"
                        disabled={isDecrypting}
                        className="w-full h-10 sm:h-11 pl-10 sm:pl-12 pr-20 sm:pr-24 rounded-full border border-neutral-200 dark:border-neutral-700 dark:border-neutral-200/40 dark:border-neutral-700/40 bg-white/90 dark:bg-neutral-800/90 text-gray-900 dark:text-gray-100 placeholder:text-neutral-500/60 dark:text-neutral-400/60 dark:placeholder:text-neutral-500/50 dark:text-neutral-400/50 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:ring-teal-400/30 dark:focus:ring-teal-600/30 dark:ring-teal-400/30 focus:border-teal-600 dark:border-teal-400 hover:border-teal-600/60 dark:border-teal-400/60 dark:hover:border-teal-600/50 dark:border-teal-400/50 shadow-sm hover:shadow transition-all duration-200"
                        placeholder="请输入密码"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isDecrypting) {
                                handleDecryption()
                            }
                        }}
                    />
                    <DecryptButton onClick={handleDecryption} isDecrypting={isDecrypting} />
                </div>
                <AnimatePresence mode="wait">
                    {feedback && <FeedbackAlert feedback={feedback} />}
                </AnimatePresence>
            </div>
        </div>
    )
}
