import { NextRequest, NextResponse } from 'next/server'
import { saveResponse, getResponses } from '@/lib/data'
import type { SurveyResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validación básica: El email es el identificador único
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    /**
     * Usamos el spread operator (...body) para capturar dinámicamente 
     * todos los campos enviados desde SurveyForm.tsx (Explorer, Builder, Architect, etc.)
     * sin necesidad de definirlos uno por uno aquí.
     */
    const response: SurveyResponse = {
      ...body,
      email: body.email.toLowerCase().trim(), // Normalizamos el email
      submitted_at: new Date().toISOString(),
    }

    // Guardamos en data/responses.json a través de la librería de datos
    await saveResponse(response)

    return NextResponse.json({ 
      success: true, 
      message: 'Survey response saved successfully',
      data: response // Devolvemos lo guardado para confirmación en consola
    })
  } catch (error) {
    console.error('Survey submission error:', error)
    return NextResponse.json(
      { error: 'Failed to save survey response', details: String(error) }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const responses = await getResponses()
    return NextResponse.json({ 
      responses, 
      count: responses.length 
    })
  } catch (error) {
    console.error('Get responses error:', error)
    return NextResponse.json(
      { error: 'Failed to get responses', details: String(error) }, 
      { status: 500 }
    )
  }
}