'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription, FieldGroup } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useLanguage } from '@/lib/i18n'
import type { CheckUserResult, ParticipantLevel } from '@/lib/types'

interface SurveyFormProps {
  userResult: CheckUserResult | null
  email: string
  onComplete: () => void
}

const levelColors: Record<ParticipantLevel, string> = {
  Explorer: 'bg-emerald-500',
  Builder: 'bg-blue-500',
  Operator: 'bg-amber-500',
  Architect: 'bg-rose-500',
  Curious: 'bg-slate-500',
}

export function SurveyForm({ userResult, email: initialEmail, onComplete }: SurveyFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState(initialEmail)
  const [attending, setAttending] = useState('Yes')
  const [needsTeam, setNeedsTeam] = useState('No')
  const [buildGoal, setBuildGoal] = useState('')
  const [confidence, setConfidence] = useState([5])
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const participant = userResult?.participant
  const level = userResult?.level

  const getLevelName = (lvl: ParticipantLevel) => {
    const levelNames: Record<ParticipantLevel, string> = {
      Explorer: t.levelExplorer,
      Builder: t.levelBuilder,
      Operator: t.levelOperator,
      Architect: t.levelArchitect,
      Curious: t.levelCurious,
    }
    return levelNames[lvl]
  }

  const getLevelDescription = (lvl: ParticipantLevel) => {
    const levelDescs: Record<ParticipantLevel, string> = {
      Explorer: t.levelDescExplorer,
      Builder: t.levelDescBuilder,
      Operator: t.levelDescOperator,
      Architect: t.levelDescArchitect,
      Curious: t.levelDescCurious,
    }
    return levelDescs[lvl]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || initialEmail,
          attending,
          needs_team: needsTeam,
          build_goal: buildGoal,
          confidence: confidence[0],
          selected_level: selectedLevel,
          timestamp: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsComplete(true)
      } else {
        throw new Error(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Survey submission error:', error)
      alert("Error: " + (error instanceof Error ? error.message : "Hubo un problema al enviar"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-emerald-500">{t.accessGranted}</h2>
            <p className="text-muted-foreground mb-6">{t.readyToEnter}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <a href="https://chat.whatsapp.com/CmHTWuI9Yp8DWZ6IeZnpeK" target="_blank" rel="noopener noreferrer">
                  {t.joinWhatsApp}
                </a>
              </Button>
              <Button variant="outline" onClick={onComplete}>
                {t.checkInAnother}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mantenemos el resto de tu UI de éxito igual */}
        {selectedLevel && (
           <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t.yourMission}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">
                   {selectedLevel === 1 ? t.level1Journey : selectedLevel === 2 ? t.level2Journey : selectedLevel === 3 ? t.level3Journey : selectedLevel === 4 ? t.level4Journey : t.level5Journey}
                 </p>
              </CardContent>
           </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        {participant ? (
          <>
            <CardTitle className="text-2xl">{t.welcomeUser}, {participant.first_name}!</CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">{t.status}: {participant.approval_status}</span>
              {level && <Badge className={levelColors[level]}>{getLevelName(level)}</Badge>}
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl">{t.guestCheckin}</CardTitle>
            <CardDescription>{t.tellUsAboutYourself}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {!participant && (
              <Field>
                <FieldLabel htmlFor="guest-email">{t.emailAddress}</FieldLabel>
                <Input id="guest-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
            )}

            <Field>
              <FieldLabel>{t.willYouAttend}</FieldLabel>
              <RadioGroup value={attending} onValueChange={setAttending}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Yes" id="attending-yes" />
                  <label htmlFor="attending-yes" className="text-sm cursor-pointer">{t.yesWillAttend}</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="No" id="attending-no" />
                  <label htmlFor="attending-no" className="text-sm cursor-pointer">{t.noCannotMakeIt}</label>
                </div>
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="build-goal">{t.whatToBuild}</FieldLabel>
              <Textarea
                id="build-goal"
                placeholder={t.buildPlaceholder}
                value={buildGoal}
                onChange={(e) => setBuildGoal(e.target.value)}
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel>{t.selectYourLevel}</FieldLabel>
              <div className="grid gap-2 mt-3">
                {[
                  { level: 1, name: t.level1Curious, color: 'border-slate-500 bg-slate-500/10' },
                  { level: 2, name: t.level2Explorer, color: 'border-emerald-500 bg-emerald-500/10' },
                  { level: 3, name: t.level3Builder, color: 'border-blue-500 bg-blue-500/10' },
                  { level: 4, name: t.level4Operator, color: 'border-amber-500 bg-amber-500/10' },
                  { level: 5, name: t.level5Architect, color: 'border-rose-500 bg-rose-500/10' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSelectedLevel(item.level)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedLevel === item.level ? `${item.color} border-opacity-100` : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{item.name}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting || !selectedLevel}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {t.submitSurvey}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}