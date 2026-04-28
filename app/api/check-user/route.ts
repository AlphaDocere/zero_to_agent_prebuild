import { NextRequest, NextResponse } from 'next/server'
import { findParticipantByEmail, hasSubmittedSurvey, determineLevel } from '@/lib/data'
import type { CheckUserResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const participant = await findParticipantByEmail(email)
    
    if (!participant) {
      const result: CheckUserResult = { found: false }
      return NextResponse.json(result)
    }

    const level = determineLevel(participant)
    const surveySubmitted = await hasSubmittedSurvey(email)

    const result: CheckUserResult = {
      found: true,
      participant,
      level,
      surveySubmitted,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { error: 'Failed to check user', details: String(error) }, 
      { status: 500 }
    )
  }
}
