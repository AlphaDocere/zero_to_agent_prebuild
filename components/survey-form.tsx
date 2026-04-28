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
  const { t, language } = useLanguage()
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
          email,
          attending,
          needs_team: needsTeam,
          build_goal: buildGoal,
          confidence: confidence[0],
          selected_level: selectedLevel,
        }),
      })

      if (response.ok) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Survey submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Access Granted Card */}
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-emerald-500">{t.accessGranted}</h2>
            <p className="text-muted-foreground mb-6">
              {t.readyToEnter}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                asChild
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <a 
                  href="https://chat.whatsapp.com/your-group-link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t.joinWhatsApp}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#tutorial">
                  {t.startTutorial}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Mission Card */}
        {selectedLevel && (
          <Card className={`border-2 ${
            selectedLevel === 1 ? 'border-slate-500 bg-slate-500/5' :
            selectedLevel === 2 ? 'border-emerald-500 bg-emerald-500/5' :
            selectedLevel === 3 ? 'border-blue-500 bg-blue-500/5' :
            selectedLevel === 4 ? 'border-amber-500 bg-amber-500/5' :
            'border-rose-500 bg-rose-500/5'
          }`}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${
                  selectedLevel === 1 ? 'bg-slate-500' :
                  selectedLevel === 2 ? 'bg-emerald-500' :
                  selectedLevel === 3 ? 'bg-blue-500' :
                  selectedLevel === 4 ? 'bg-amber-500' :
                  'bg-rose-500'
                }`}>
                  {selectedLevel === 1 ? t.level1Curious :
                   selectedLevel === 2 ? t.level2Explorer :
                   selectedLevel === 3 ? t.level3Builder :
                   selectedLevel === 4 ? t.level4Operator :
                   t.level5Architect}
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {selectedLevel === 1 ? t.level1Mission :
                 selectedLevel === 2 ? t.level2Mission :
                 selectedLevel === 3 ? t.level3Mission :
                 selectedLevel === 4 ? t.level4Mission :
                 t.level5Mission}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {selectedLevel === 1 ? t.level1Journey :
                 selectedLevel === 2 ? t.level2Journey :
                 selectedLevel === 3 ? t.level3Journey :
                 selectedLevel === 4 ? t.level4Journey :
                 t.level5Journey}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {t.yourMission}:
                </h4>
                <ul className="space-y-1.5">
                  {(selectedLevel === 1 ? t.level1Actions :
                    selectedLevel === 2 ? t.level2Actions :
                    selectedLevel === 3 ? t.level3Actions :
                    selectedLevel === 4 ? t.level4Actions :
                    t.level5Actions
                  ).split('|').map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${
                        selectedLevel === 1 ? 'bg-slate-500' :
                        selectedLevel === 2 ? 'bg-emerald-500' :
                        selectedLevel === 3 ? 'bg-blue-500' :
                        selectedLevel === 4 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tutorial Section */}
        <Card id="tutorial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {t.tutorialUnlocked}
            </CardTitle>
            <CardDescription>
              {t.prepareBeforeEvent}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="v0">
                <AccordionTrigger>{t.whatIsV0}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-3">{t.whatIsV0Desc}</p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://v0.dev" target="_blank" rel="noopener noreferrer">
                      {t.learnMore} &rarr;
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="vercel">
                <AccordionTrigger>{t.whatIsVercel}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-3">{t.whatIsVercelDesc}</p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                      {t.learnMore} &rarr;
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="nextjs">
                <AccordionTrigger>{t.whatIsNextjs}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-3">{t.whatIsNextjsDesc}</p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
                      {t.learnMore} &rarr;
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="agent">
                <AccordionTrigger>{t.whatIsAgent}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-3">{t.whatIsAgentDesc}</p>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="https://sdk.vercel.ai" target="_blank" rel="noopener noreferrer">
                      {t.learnMore} &rarr;
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="win">
                <AccordionTrigger>{t.howToWin}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{t.howToWinDesc}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={onComplete}>
            {t.checkInAnother}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        {participant ? (
          <>
            <CardTitle className="text-2xl">
              {t.welcomeUser}, {participant.first_name}!
            </CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">{t.status}: {participant.approval_status}</span>
              {level && (
                <Badge className={levelColors[level]}>
                  {getLevelName(level)}
                </Badge>
              )}
              {level && (
                <span className="block text-xs mt-1">
                  {getLevelDescription(level)}
                </span>
              )}
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="text-2xl">{t.guestCheckin}</CardTitle>
            <CardDescription>
              {t.tellUsAboutYourself}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {!participant && (
              <Field>
                <FieldLabel htmlFor="guest-email">{t.emailAddress}</FieldLabel>
                <Input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
              <FieldLabel>{t.doYouNeedTeam}</FieldLabel>
              <FieldDescription>
                {t.helpMatchTeammates}
              </FieldDescription>
              <RadioGroup value={needsTeam} onValueChange={setNeedsTeam}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Yes" id="team-yes" />
                  <label htmlFor="team-yes" className="text-sm cursor-pointer">{t.yesHelpFindTeam}</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="No" id="team-no" />
                  <label htmlFor="team-no" className="text-sm cursor-pointer">{t.noHaveTeam}</label>
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
              <FieldLabel>{t.aiConfidence} ({confidence[0]}/10)</FieldLabel>
              <FieldDescription>
                {t.confidenceDescription}
              </FieldDescription>
              <Slider
                value={confidence}
                onValueChange={setConfidence}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{t.beginner}</span>
                <span>{t.expert}</span>
              </div>
            </Field>

            <Field>
              <FieldLabel>{t.selectYourLevel}</FieldLabel>
              <FieldDescription>{t.selectLevelDesc}</FieldDescription>
              <div className="grid gap-2 mt-3">
                {[
                  { level: 1, name: t.level1Curious, desc: t.level1Desc, color: 'border-slate-500 bg-slate-500/10' },
                  { level: 2, name: t.level2Explorer, desc: t.level2Desc, color: 'border-emerald-500 bg-emerald-500/10' },
                  { level: 3, name: t.level3Builder, desc: t.level3Desc, color: 'border-blue-500 bg-blue-500/10' },
                  { level: 4, name: t.level4Operator, desc: t.level4Desc, color: 'border-amber-500 bg-amber-500/10' },
                  { level: 5, name: t.level5Architect, desc: t.level5Desc, color: 'border-rose-500 bg-rose-500/10' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setSelectedLevel(item.level)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedLevel === item.level 
                        ? `${item.color} border-opacity-100` 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
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
