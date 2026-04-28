import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { saveParticipants, CSV_FIELD_MAP } from '@/lib/data'
import type { Participant } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    
    // Parse CSV with headers
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    })

    // Map CSV records to our Participant schema
    const participants: Participant[] = records.map((record: Record<string, string>) => {
      const participant: Partial<Participant> = {}
      
      for (const [csvField, jsonField] of Object.entries(CSV_FIELD_MAP)) {
        const value = record[csvField]
        if (value !== undefined) {
          participant[jsonField] = value
        }
      }

      // Ensure all required fields have at least empty strings
      return {
        name: participant.name || '',
        first_name: participant.first_name || '',
        last_name: participant.last_name || '',
        email: participant.email || '',
        phone_number: participant.phone_number || '',
        used_vercel_before: participant.used_vercel_before || '',
        company: participant.company || '',
        role: participant.role || '',
        ai_agents_experience: participant.ai_agents_experience || '',
        source: participant.source || '',
        created_at: participant.created_at || new Date().toISOString(),
        approval_status: participant.approval_status || 'pending',
      } as Participant
    })

    // Filter out records without valid emails
    const validParticipants = participants.filter(p => p.email && p.email.includes('@'))

    await saveParticipants(validParticipants)

    return NextResponse.json({ 
      success: true, 
      count: validParticipants.length,
      message: `Successfully imported ${validParticipants.length} participants`
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to parse CSV file', details: String(error) }, 
      { status: 500 }
    )
  }
}
