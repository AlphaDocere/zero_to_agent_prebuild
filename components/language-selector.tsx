'use client'

import { useLanguage, Language } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      <Button
        variant={language === 'es' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-full px-3 h-7 text-xs font-medium"
        onClick={() => toggleLanguage('es')}
      >
        ES
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        className="rounded-full px-3 h-7 text-xs font-medium"
        onClick={() => toggleLanguage('en')}
      >
        EN
      </Button>
    </div>
  )
}
