'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CsvUploader } from '@/components/csv-uploader'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Participant, SurveyResponse, ParticipantLevel } from '@/lib/types'

interface AdminStats {
  totalParticipants: number
  totalResponses: number
  attendingCount: number
  needsTeamCount: number
  levelCounts: Record<ParticipantLevel, number>
  usersNeedingTeams: Array<any> // Ahora viene con data extendida del backend
  participants: Participant[]
  responses: SurveyResponse[]
}

const levelColors: Record<ParticipantLevel, string> = {
  Explorer: 'bg-emerald-500',
  Builder: 'bg-blue-500 text-white',
  Operator: 'bg-amber-500',
  Architect: 'bg-rose-500 text-white',
  Curious: 'bg-slate-500',
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState(false)

  // Estados para el Modal de Detalle y Observaciones
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
      await fetchStats() // Recargar para ver los cambios
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Keyphrase..." 
                className="bg-slate-800 border-slate-700"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full bg-indigo-600">Verificar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Zero to Agent Admin</h1>
            <p className="text-muted-foreground">Gestión de participantes y niveles</p>
          </div>
          <Button variant="outline" onClick={() => setIsAuthorized(false)}>Salir</Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Participantes', value: stats?.totalParticipants },
            { label: 'Respuestas', value: stats?.totalResponses },
            { label: 'Confirmados', value: stats?.attendingCount },
            { label: 'Buscan Equipo', value: stats?.needsTeamCount },
          ].map((s, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl">{s.value || 0}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList>
            <TabsTrigger value="participants">Lista Maestra</TabsTrigger>
            <TabsTrigger value="teams">Mesas de Trabajo</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="participants">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.participants?.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Badge className={levelColors[p.role as ParticipantLevel || 'Curious']}>
                            {p.role || 'Curious'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{p.name || `${p.first_name} ${p.last_name}`}</TableCell>
                        <TableCell>{p.company}</TableCell>
                        <TableCell><Badge variant="outline">{p.approval_status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedUser(p);
                            setNote((p as any).observation || '');
                          }}>Ver Ficha</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats?.usersNeedingTeams.map((user, i) => (
                <Card 
                  key={i} 
                  className="cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                  onClick={() => { setSelectedUser(user); setNote(user.observation || ''); }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={levelColors[user.level as ParticipantLevel]}>{user.level}</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Conf: {user.confidence}/10</span>
                    </div>
                    <CardTitle className="text-lg mt-2">{user.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-400 italic line-clamp-2">"{user.build_goal}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="import">
            <Card className="max-w-md"><CardContent className="pt-6">
                <CsvUploader onUploadComplete={fetchStats} />
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* --- MODAL DE INSPECCIÓN Y OBSERVACIÓN --- */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 text-slate-100 shadow-2xl">
              <CardHeader className="border-b border-slate-800 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">{selectedUser.name || selectedUser.first_name}</CardTitle>
                  <p className="text-indigo-400 text-sm">{selectedUser.email}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>Cerrar</Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa / Rol</label>
                    <p>{selectedUser.company || 'N/A'} - {selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Experiencia Agentes</label>
                    <p className="text-indigo-300">{selectedUser.ai_agents_experience || 'No especificada'}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objetivo en el evento</label>
                    <p className="italic text-slate-300">"{selectedUser.build_goal || 'Sin proyecto definido'}"</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Notas de Alpha Docere</label>
                  <textarea 
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Escribe aquí el perfil observado, habilidades clave..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button 
                    onClick={handleSaveNote} 
                    disabled={isSavingNote}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500"
                  >
                    {isSavingNote ? 'Guardando...' : 'Guardar Observación'}
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