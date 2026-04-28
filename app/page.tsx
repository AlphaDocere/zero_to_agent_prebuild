'use client'

import { useState } from 'react'
import { EmailCheck } from '@/components/email-check'
import { SurveyForm } from '@/components/survey-form'
import { LanguageSelector } from '@/components/language-selector'
import { LanguageProvider, useLanguage } from '@/lib/i18n'
import type { CheckUserResult } from '@/lib/types'

type Step = 'check' | 'survey' | 'complete'

function HomeContent() {
  const { t } = useLanguage()
  const [step, setStep] = useState<Step>('check')
  const [userResult, setUserResult] = useState<CheckUserResult | null>(null)
  const [guestEmail, setGuestEmail] = useState('')

  const handleUserFound = (result: CheckUserResult) => {
    setUserResult(result)
    setStep('survey')
  }

  const handleGuestMode = () => {
    setUserResult(null)
    setStep('survey')
  }

  const handleSurveyComplete = () => {
    setStep('complete')
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl" role="img" aria-label="Bandera de Chile">🇨🇱</span>
            <span className="text-4xl" role="img" aria-label="Bandera de Argentina">🇦🇷</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t.eventCheckin}
          </h1>
          <p className="text-muted-foreground mb-3">
            {t.workshopTitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span>🇨🇱</span>
              <span>Santiago, Chile</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground/50">|</span>
            <span className="flex items-center gap-1.5">
              <span>🇦🇷</span>
              <span>Mendoza, Argentina</span>
            </span>
          </div>
        </header>

        {step === 'check' && (
          <EmailCheck
            onUserFound={handleUserFound}
            onGuestMode={handleGuestMode}
          />
        )}

        {step === 'survey' && (
          <SurveyForm
            userResult={userResult}
            email={userResult?.participant?.email || guestEmail}
            onComplete={handleSurveyComplete}
          />
        )}

        {step === 'complete' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">&#127881;</div>
            <h2 className="text-2xl font-bold mb-2">{t.youreAllSet}</h2>
            <p className="text-muted-foreground mb-6">
              {t.excitedToSeeYou}
            </p>
            <button
              onClick={() => {
                setStep('check')
                setUserResult(null)
                setGuestEmail('')
              }}
              className="text-sm text-primary underline underline-offset-4"
            >
              {t.checkInAnother}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}
