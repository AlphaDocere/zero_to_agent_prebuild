'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Mail, Zap, UserPlus, Star, Info, ShieldCheck } from 'lucide-react'

const levelColors: Record<string, string> = {
  Explorer: 'bg-emerald-500 text-white',
  Builder: 'bg-blue-600 text-white',
  Operator: 'bg-amber-500 text-white',
  Architect: 'bg-rose-600 text-white',
  Curious: 'bg-slate-500 text-white',
}

export default function TalentMatrixPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeLevel, setActiveLevel] = useState('All')
  
  // --- SEGURIDAD: Máscara ZeroToAgent ---
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState(false)
  const MASTER_KEY = "zerotoagent"

  useEffect(() => {
    if (isAuthorized) {
      async function load() {
        try {
          const res = await fetch('/api/matrix')
          const json = await res.json()
          setData(json)
        } catch (e) {
          console.error("Error loading data")
        } finally {
          setLoading(false)
        }
      }
      load()
    }
  }, [isAuthorized])

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

  const filtered = useMemo(() => {
    if (!data?.participants) return []
    return data.participants.filter((p: any) => {
      const name = p.name || ""
      const email = p.email || ""
      const company = p.company || ""
      const searchString = `${name} ${email} ${company}`.toLowerCase()
      const matchesSearch = searchString.includes(searchTerm.toLowerCase())
      const matchesLevel = activeLevel === 'All' || p.level === activeLevel
      return matchesSearch && matchesLevel
    })
  }, [data, searchTerm, activeLevel])

  // --- VISTA DE LOGIN (MÁSCARA) ---
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <ShieldCheck className="h-12 w-12 text-indigo-500" />
            </div>
            <CardTitle className="text-slate-100 text-center text-xl tracking-tight">Acceso Organizador</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Ingresa la llave maestra para gestionar el evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Keyphrase..." 
                className="bg-slate-800 border-slate-700 text-slate-100 focus:ring-indigo-500"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                autoFocus
              />
              {authError && <p className="text-xs text-red-500 text-center font-medium">Llave incorrecta.</p>}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
                Entrar al Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-indigo-500 font-mono animate-pulse italic">
      &gt; CONNECTING_TO_MATRIX...
    </div>
  )

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic">
              TALENT<span className="text-indigo-500">MATRIX</span> v2
            </h1>
            <p className="text-slate-500 text-sm font-mono">Acceso: {MASTER_KEY}</p>
          </div>
          <div className="flex gap-4">
            <StatBlock label="Total" value={data?.stats?.total} />
            <StatBlock label="Encuestas" value={data?.stats?.withSurvey} color="text-indigo-400" />
            <StatBlock label="Sin Equipo" value={data?.stats?.needsTeam} color="text-amber-400" />
            <Button variant="ghost" size="sm" onClick={() => setIsAuthorized(false)} className="text-slate-500 hover:text-white">Salir</Button>
          </div>
        </div>

        {/* Filtros y Buscador */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Filtro rápido..." 
              className="pl-10 bg-slate-900 border-slate-800 h-12 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {['All', 'Curious', 'Explorer', 'Builder', 'Operator', 'Architect'].map(lvl => (
              <Button 
                key={lvl}
                variant={activeLevel === lvl ? 'default' : 'ghost'}
                size="sm"
                className={activeLevel === lvl ? 'bg-indigo-600' : 'text-slate-400'}
                onClick={() => setActiveLevel(lvl)}
              >
                {lvl === 'All' ? 'Todos' : lvl}
              </Button>
            ))}
          </div>
        </div>

        {/* Listado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p: any) => (
            <Card key={p.email} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all group overflow-hidden">
              <div className={`h-1 w-full ${levelColors[p.level] || 'bg-slate-500'}`} />
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">
                      {p.company || 'Independiente'}
                    </p>
                  </div>
                  <Badge className={`${levelColors[p.level] || 'bg-slate-500'} border-none`}>{p.level}</Badge>
                </div>

                {p.hasSurvey ? (
                  <div className="space-y-3">
                    <div className="bg-black/50 p-3 rounded-lg border border-slate-800/50">
                      <p className="text-sm text-slate-300 italic line-clamp-2">"{p.build_goal}"</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                      <span>{p.needs_team === 'Yes' ? '⚠️ Busca Equipo' : '✅ Equipo Ok'}</span>
                      <span className="text-indigo-400 text-sm">★ {p.confidence}/10</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center border border-dashed border-slate-800 rounded-lg opacity-40">
                    <p className="text-[10px] font-bold">SIN DATOS DE ENCUESTA</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 text-xs h-9" asChild>
                    <a href={`mailto:${p.email}`}>Mail</a>
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs h-9 border-slate-700">Perfil</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

function StatBlock({ label, value, color = "text-white" }: any) {
  return (
    <div className="text-center px-4 border-r border-slate-800 last:border-0">
      <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value || 0}</p>
    </div>
  )
}