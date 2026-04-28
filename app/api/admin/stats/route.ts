import { NextResponse } from 'next/server'
import { getParticipants, getResponses, determineLevel } from '@/lib/data'
import type { Participant, SurveyResponse, ParticipantLevel } from '@/lib/types'

export async function GET() {
  try {
    const participants: Participant[] = await getParticipants()
    const responses: SurveyResponse[] = await getResponses()

    // 1. Helper para validar los strings de los formularios
    const isAffirmative = (val?: string) => {
      if (!val) return false
      const v = val.toLowerCase().trim()
      return v === 'yes' || v === 'sí' || v === 'si'
    }

    // 2. Métricas Base
    const totalParticipants = participants.length
    const totalResponses = responses.length
    
    const attendingCount = responses.filter(r => isAffirmative(r.attending)).length
    const needsTeamCount = responses.filter(r => isAffirmative(r.needs_team)).length

    // 3. Distribución por Niveles (según tu ParticipantLevel)
    const levelCounts: Record<ParticipantLevel, number> = {
      Explorer: 0,
      Builder: 0,
      Operator: 0,
      Architect: 0,
      Curious: 0,
    }

    participants.forEach(p => {
      const level = determineLevel(p) as ParticipantLevel
      if (levelCounts[level] !== undefined) {
        levelCounts[level]++
      }
    })

    // 4. Mapeo detallado de colaboración (Células de trabajo)
    const usersNeedingTeams = responses
      .filter(r => isAffirmative(r.needs_team))
      .map(r => {
        // Buscamos al participante por email para obtener su nombre real y empresa
        const participant = participants.find(p => 
          p.email.toLowerCase().trim() === r.email.toLowerCase().trim()
        )

        // Priorizamos name, luego concatenamos nombres si existen
        const fullName = participant?.name || 
                        (participant?.first_name ? `${participant.first_name} ${participant.last_name}` : 'Invitado')

        return {
          email: r.email,
          name: fullName,
          company: participant?.company || 'N/A',
          build_goal: r.build_goal || 'Sin proyecto definido',
          confidence: r.confidence || 0,
          level: participant ? determineLevel(participant) : 'Curious'
        }
      })

    // 5. Respuesta JSON estructurada para el Dashboard
    return NextResponse.json({
      totalParticipants,
      totalResponses,
      attendingCount,
      needsTeamCount,
      levelCounts,
      usersNeedingTeams,
      participants, // Data cruda para la tabla de gestión
      responses     // Data cruda para la tabla de encuestas
    })

  } catch (error) {
    console.error('[ADMIN_STATS_API_ERROR]:', error)
    return NextResponse.json(
      { error: 'Error al generar estadísticas', details: String(error) }, 
      { status: 500 }
    )
  }
}