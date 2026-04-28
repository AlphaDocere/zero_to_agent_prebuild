'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useLanguage } from '@/lib/i18n'
import type { CheckUserResult } from '@/lib/types'

interface EmailCheckProps {
  onUserFound: (result: CheckUserResult) => void
  onGuestMode: () => void
}

export function EmailCheck({ onUserFound, onGuestMode }: EmailCheckProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result: CheckUserResult = await response.json()

      if (result.found) {
        onUserFound(result)
      } else {
        setError(t.emailNotFound)
      }
    } catch {
      setError(t.errorCheckingEmail)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.welcomeToEvent}</CardTitle>
        <CardDescription>
          {t.enterEmailToCheckin}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="email">{t.emailAddress}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FieldDescription>
              {t.emailRegisteredWith}
            </FieldDescription>
          </Field>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {t.checkIn}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onGuestMode}
            >
              {t.continueAsGuest}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
