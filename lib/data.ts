import { promises as fs } from 'fs'
import path from 'path'
import type { Participant, SurveyResponse, ParticipantLevel } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json')
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function ensureFile(filePath: string, defaultContent: string = '[]') {
  await ensureDataDir()
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, defaultContent, 'utf-8')
  }
}

export async function getParticipants(): Promise<Participant[]> {
  await ensureFile(PARTICIPANTS_FILE)
  const data = await fs.readFile(PARTICIPANTS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function saveParticipants(participants: Participant[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(participants, null, 2), 'utf-8')
}

export async function getResponses(): Promise<SurveyResponse[]> {
  await ensureFile(RESPONSES_FILE)
  const data = await fs.readFile(RESPONSES_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function saveResponse(response: SurveyResponse): Promise<void> {
  const responses = await getResponses()
  // Update existing response or add new one
  const existingIndex = responses.findIndex(r => r.email === response.email)
  if (existingIndex >= 0) {
    responses[existingIndex] = response
  } else {
    responses.push(response)
  }
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2), 'utf-8')
}

export async function findParticipantByEmail(email: string): Promise<Participant | null> {
  const participants = await getParticipants()
  return participants.find(p => p.email.toLowerCase() === email.toLowerCase()) || null
}

export async function hasSubmittedSurvey(email: string): Promise<boolean> {
  const responses = await getResponses()
  return responses.some(r => r.email.toLowerCase() === email.toLowerCase())
}

export function determineLevel(participant: Participant): ParticipantLevel {
  const usedVercel = participant.used_vercel_before.toLowerCase()
  const aiExperience = participant.ai_agents_experience.toLowerCase()
  const role = participant.role.toLowerCase()
  const company = participant.company.toLowerCase()

  // Architect: advanced/company founder keywords
  const architectKeywords = ['founder', 'cto', 'ceo', 'architect', 'lead', 'director', 'vp', 'head of']
  if (architectKeywords.some(keyword => role.includes(keyword) || company.includes(keyword))) {
    return 'Architect'
  }

  // Operator: has AI agent experience
  if (aiExperience.includes('sí') || aiExperience.includes('si') || aiExperience === 'yes') {
    return 'Operator'
  }

  // Builder: has used tools before
  if (usedVercel.includes('sí') || usedVercel.includes('si') || usedVercel === 'yes' || 
      usedVercel.includes('he usado') || usedVercel.includes('usado antes')) {
    return 'Builder'
  }

  // Explorer: no Vercel experience + no AI agents
  if ((usedVercel.includes('no') || usedVercel === '') && 
      (aiExperience.includes('no') || aiExperience === '')) {
    return 'Explorer'
  }

  // Curious: default
  return 'Curious'
}

// CSV field mapping from Spanish headers to our schema
export const CSV_FIELD_MAP: Record<string, keyof Participant> = {
  'name': 'name',
  'first_name': 'first_name',
  'last_name': 'last_name',
  'email': 'email',
  'phone_number': 'phone_number',
  '¿Has usado Vercel o v0 anteriormente?': 'used_vercel_before',
  '¿Para qué empresa trabajas o representas?': 'company',
  '¿Cuál es tu cargo?': 'role',
  '¿Tienes experiencia creando agentes de IA?': 'ai_agents_experience',
  '¿ Cómo te enteraste de este evento?': 'source',
  'created_at': 'created_at',
  'approval_status': 'approval_status',
}
