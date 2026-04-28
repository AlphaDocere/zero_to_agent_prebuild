export interface Participant {
  name: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  used_vercel_before: string
  company: string
  role: string
  ai_agents_experience: string
  source: string
  created_at: string
  approval_status: string
}



export interface SurveyResponse {
  email: string
  submitted_at: string
  attending?: string
  needs_team?: string
  build_goal?: string
  confidence?: number
  // Esta línea es la clave: permite cualquier campo adicional 
  // que venga del formulario (como los perfiles técnicos)
  [key: string]: any 
}

export type ParticipantLevel = 'Explorer' | 'Builder' | 'Operator' | 'Architect' | 'Curious'

export interface CheckUserResult {
  found: boolean
  participant?: Participant
  level?: ParticipantLevel
  surveySubmitted?: boolean
}

const levelMap = {
  1: 'Curious',
  2: 'Explorer',
  3: 'Builder',
  4: 'Operator',
  5: 'Architect'
};