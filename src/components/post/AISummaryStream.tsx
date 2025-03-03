import React, { useState, useEffect } from 'react'
import { AIConfig } from '@/config.json'
import { Bot, Loader2, Wand } from 'lucide-react'

interface AISummaryStreamProps {
  url: string
}

interface SummaryResponse {
  summary: string
  model: string
}

export const AISummaryStream: React.FC<AISummaryStreamProps> = ({ url }) => {
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AIConfig.enable || !AIConfig.api) {
      setError('AI summary is not enabled or API is not configured')
      setIsLoading(false)
      return
    }

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${AIConfig.api}?url=${encodeURIComponent(url)}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: SummaryResponse = await response.json()
        setSummaryData(data)
      } catch (err) {
        setError('Error fetching AI summary')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [url])

  if (!AIConfig.enable) {
    return null
  }

  return (
    <div className="my-4 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
      <h2 className="flex items-center text-base font-bold mb-3 -ml-2">
        <Bot
          size={20}
          className="mr-2 text-accent dark:text-accent/80 inline-block -translate-y-0.25 animate-hue"
          aria-hidden="true"
        />
        AI 摘要
      </h2>

      {isLoading && (
        <p className="flex items-center text-sm text-[#A5BDCA] dark:text-[#A5BDCA]-400 italic">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          奋力赶来...
        </p>
      )}

      {error && <p className="text-sm italic text-red-500/80 dark:text-red-400/80">AI 迷路了…</p>}

      {summaryData && (
        <>
          <div className="mb-3 space-y-2">
            {summaryData.summary.split('\n').map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="text-right">
            <small className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Wand size={16} className="mr-1" aria-hidden="true" />
              模型: {summaryData.model}
            </small>
          </div>
        </>
      )}
    </div>
  )
}

export default AISummaryStream
