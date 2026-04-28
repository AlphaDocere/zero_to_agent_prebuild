'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CsvUploader } from '@/components/csv-uploader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Participant, SurveyResponse, ParticipantLevel } from '@/lib/types'

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

const levelColors: Record<string, string> = {
  Explorer: 'bg-emerald-500 text-white',
  Builder: 'bg-blue-600 text-white',
  Operator: 'bg-amber-500 text-white',
  Architect: 'bg-rose-600 text-white',
  Curious: 'bg-slate-500 text-white',
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState(false)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [note, setNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

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
    if (!isAuthorized) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedUser) return
    setIsSavingNote(true)
    try {
      await fetch('/api/admin/observe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, observation: note })
      })
      await fetchStats()
      setSelectedUser(null)
    } catch (err) {
      alert('Error al guardar observación')
    } finally {
      setIsSavingNote(false)
    }
  }

  useEffect(() => {
    if (isAuthorized) fetchStats()
  }, [isAuthorized])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-slate-100">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Keyphrase..." 
                className="bg-slate-800 border-slate-700 text-white"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                autoFocus
              />
              {authError && <p className="text-xs text-red-500 text-center">Llave incorrecta.</p>}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">Verificar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-100 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic text-white">
              ZERO TO AGENT <span className="text-indigo-500">ADMIN</span>
            </h1>
            <p className="text-slate-500 text-sm font-mono">Control de Misión Alpha Docere</p>
          </div>
          <Button variant="ghost" onClick={() => setIsAuthorized(false)} className="text-slate-500 hover:text-white">Salir</Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Participantes', value: stats?.totalParticipants },
            { label: 'Respuestas', value: stats?.totalResponses },
            { label: 'Confirmados', value: stats?.attendingCount },
            { label: 'Sin Equipo', value: stats?.needsTeamCount, color: "text-amber-400" },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold text-slate-500">{s.label}</CardDescription>
                <CardTitle className={`text-3xl font-black ${s.color || 'text-white'}`}>{s.value || 0}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="participants">Lista Maestra</TabsTrigger>
            <TabsTrigger value="teams">Mesas de Trabajo</TabsTrigger>
            <TabsTrigger value="import">Importar CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950">
                  <TableRow className="border-slate-800">
                    <TableHead className="text-slate-400">Nivel</TableHead>
                    <TableHead className="text-slate-400">Nombre</TableHead>
                    <TableHead className="text-slate-400">Empresa</TableHead>
                    <TableHead className="text-slate-400 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.participants?.map((p, i) => {
                    const currentLevel = (p.ai_agents_experience || p.role || 'Curious');
                    const colorClass = levelColors[currentLevel] || levelColors["Curious"];
                    return (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>
                          <Badge className={`${colorClass} border-none`}>{currentLevel}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-200">
                          {p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email}
                        </TableCell>
                        <TableCell className="text-slate-400">{p.company || 'Independiente'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="border-slate-700 h-8" onClick={() => {
                            setSelectedUser(p);
                            setNote((p as any).observation || '');
                          }}>Ficha</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats?.usersNeedingTeams.map((user, i) => {
                const colorClass = levelColors[user.level] || levelColors["Curious"];
                return (
                  <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                    onClick={() => { setSelectedUser(user); setNote(user.observation || ''); }}>
                    <div className={`h-1 w-full ${colorClass}`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className={`${colorClass} border-none text-[10px]`}>{user.level}</Badge>
                        <span className="text-[10px] text-indigo-400 font-black">★ {user.confidence}/10</span>
                      </div>
                      <CardTitle className="text-lg mt-2 text-white group-hover:text-indigo-400">{user.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-400 italic line-clamp-3">"{user.build_goal}"</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="import">
            <Card className="max-w-md bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <CsvUploader onUploadComplete={fetchStats} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MODAL DE INSPECCIÓN */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 text-slate-100 shadow-2xl">
              <CardHeader className="border-b border-slate-800 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-black">{selectedUser.name || selectedUser.first_name}</CardTitle>
                  <p className="text-indigo-400 text-sm font-mono">{selectedUser.email}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white">Cerrar</Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Empresa / Rol</label>
                    <p>{selectedUser.company || 'N/A'} - {selectedUser.level || selectedUser.role}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Confianza AI</label>
                    <p className="text-indigo-400 font-bold">{selectedUser.confidence || '0'}/10</p>
                  </div>
                  <div className="col-span-2 bg-slate-950 p-3 rounded border border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Objetivo del Proyecto</label>
                    <p className="italic text-slate-300">"{selectedUser.build_goal || 'Sin proyecto definido'}"</p>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Observaciones Alpha Docere</label>
                  <textarea 
                    className="w-full h-32 bg-black border border-slate-700 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200"
                    placeholder="Perfil observado, habilidades clave, notas del taller..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button onClick={handleSaveNote} disabled={isSavingNote} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                    {isSavingNote ? 'Sincronizando...' : 'Guardar en Perfil'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}