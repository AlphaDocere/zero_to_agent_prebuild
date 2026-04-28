'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Search, Mail, UserPlus, Zap, Target, MessageSquare, ShieldCheck } from 'lucide-react'
import type { Participant, SurveyResponse, ParticipantLevel } from '@/lib/types'

// 1. Mover los colores FUERA del componente para asegurar disponibilidad global en el archivo
const levelColors: Record<ParticipantLevel, string> = {
  Explorer: 'bg-emerald-500 text-white',
  Builder: 'bg-blue-500 text-white',
  Operator: 'bg-amber-500 text-white',
  Architect: 'bg-rose-500 text-white',
  Curious: 'bg-slate-500 text-white',
}

interface AdminStats {
  totalParticipants: number
  totalResponses: number
  attendingCount: number
  needsTeamCount: number
  levelCounts: Record<ParticipantLevel, number>
  usersNeedingTeams: Array<any>
  participants: Participant[]
  responses: SurveyResponse[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState(false)
  
  // Estados para Modal de Observaciones
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [note, setNote] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<ParticipantLevel | 'All'>('All')

  const MASTER_KEY = "zerotoagent" 

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (passInput === MASTER_KEY) {
      setIsAuthorized(true)
      setAuthError(false)
    } else {
      setAuthError(true)
      setPassInput('')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Error cargando datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchStats()
  }, [isAuthorized])

  // CORRECCIÓN EN EL FILTRADO: 
  // La interfaz Participant usa 'role' para el nivel técnico según lo que vimos antes
  const filteredParticipants = useMemo(() => {
    if (!stats?.participants) return []
    return stats.participants.filter(p => {
      const nameMatch = (p.name || `${p.first_name} ${p.last_name}`).toLowerCase().includes(searchTerm.toLowerCase())
      const emailMatch = p.email.toLowerCase().includes(searchTerm.toLowerCase())
      const companyMatch = p.company?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Usamos p.role porque ahí es donde guardamos el Level en la tabla de participantes
      const currentLevel = (p.role as ParticipantLevel) || 'Curious'
      const matchesLevel = activeTab === 'All' || currentLevel === activeTab
      
      return (nameMatch || emailMatch || companyMatch) && matchesLevel
    })
  }, [stats, searchTerm, activeTab])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 shadow-2xl">
          <CardHeader>
            <div className="flex justify-center mb-2"><ShieldCheck className="h-10 w-10 text-indigo-500" /></div>
            <CardTitle className="text-slate-100 text-center">Acceso Organizador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Keyphrase..." 
                className="bg-slate-800 border-slate-700 text-white"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
              />
              <Button type="submit" className="w-full bg-indigo-600">Entrar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b pb-6 border-slate-200">
          <div>
            <h1 className="text-3xl font-black">TALENT <span className="text-indigo-600">MATRIX</span></h1>
            <p className="text-slate-500">Gestión de Talento Alpha Docere</p>
          </div>
          <Button variant="outline" onClick={() => setIsAuthorized(false)}>Cerrar</Button>
        </header>

        {/* Buscador y Filtros */}
        <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <Button variant={activeTab === 'All' ? 'default' : 'ghost'} onClick={() => setActiveTab('All')}>Todos</Button>
            {Object.keys(levelColors).map((level) => (
              <Button
                key={level}
                variant={activeTab === level ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab(level as ParticipantLevel)}
              >
                {level}
              </Button>
            ))}
          </div>
        </section>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((participant) => {
            const details = stats?.responses.find(r => r.email === participant.email)
            const level = (participant.role as ParticipantLevel) || 'Curious'
            
            return (
              <Card key={participant.email} className="group overflow-hidden hover:shadow-lg transition-all dark:bg-slate-900">
                <div className={`h-1.5 w-full ${levelColors[level]}`} />
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg leading-none">{participant.name || `${participant.first_name} ${participant.last_name}`}</h3>
                      <p className="text-sm text-slate-500 mt-1">{participant.company}</p>
                    </div>
                    <Badge className={levelColors[level]}>{level}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Confianza</p>
                      <p className="font-bold">{details?.confidence || 0}/10</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Equipo</p>
                      <p className="font-bold text-[10px]">{details?.needs_team === 'Yes' ? 'BUSCA' : 'TIENE'}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Goal
                    </p>
                    <p className="text-xs italic line-clamp-2">"{details?.build_goal || 'Sin definir'}"</p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" variant="secondary" asChild>
                      <a href={`mailto:${participant.email}`}><Mail className="h-4 w-4 mr-2" /> Email</a>
                    </Button>
                    <Button variant="outline" onClick={() => {
                        setSelectedUser({...participant, ...details});
                        setNote((participant as any).observation || '');
                    }}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}