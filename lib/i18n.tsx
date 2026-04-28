'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type Language = 'es' | 'en'

const translations = {
  es: {
    // Header
    eventCheckin: 'Registro del Evento',
    workshopTitle: 'Vercel & AI Workshop',
    
    // Email Check
    welcomeToEvent: 'Bienvenido al Evento',
    enterEmailToCheckin: 'Ingresa tu correo de registro para hacer check-in',
    emailAddress: 'Correo Electrónico',
    emailPlaceholder: 'tu@correo.com',
    emailRegisteredWith: 'Usa el correo con el que te registraste en Luma',
    checkIn: 'Hacer Check-in',
    continueAsGuest: 'Continuar como Invitado',
    emailNotFound: 'Correo no encontrado en la lista de registro. Puedes continuar como invitado.',
    errorCheckingEmail: 'Error al verificar el correo. Por favor intenta de nuevo.',
    
    // Survey
    welcomeUser: 'Bienvenido/a',
    status: 'Estado',
    guestCheckin: 'Check-in de Invitado',
    tellUsAboutYourself: 'Cuéntanos un poco sobre ti',
    willYouAttend: '¿Asistirás al evento?',
    yesWillAttend: 'Sí, asistiré',
    noCannotMakeIt: 'No, no podré asistir',
   
    doYouNeedTeam: "Dinámica de Trabajo",
    helpMatchTeammates: "La competencia es individual, pero ¿prefieres compartir ideas en una mesa colaborativa?",
    yesHelpFindTeam: "Mesa Colaborativa (Compartir prompts e ideas)",
    noHaveTeam: "Modo Solo (Foco total en mi agente)",
    whatToBuild: "¿Qué misión cumplirá tu Agente?",
    buildPlaceholder: "Ej: Un agente que automatice mis cobranzas por WhatsApp...",

    aiConfidence: 'Qué tan seguro te sientes con herramientas de IA',
    confidenceDescription: '1 = Principiante total, 10 = Nivel experto',
    beginner: 'Principiante',
    expert: 'Experto',
    submitSurvey: 'Enviar Encuesta',
    surveyComplete: 'Encuesta Completada',
    thankYouResponse: 'Gracias por tu respuesta. ¡Nos vemos en el evento!',
    
    // Complete / Access Granted
    youreAllSet: '¡Todo listo!',
    excitedToSeeYou: 'Estamos emocionados de verte en el evento.',
    checkInAnother: 'Registrar otro participante',
    accessGranted: 'Acceso Concedido',
    readyToEnter: 'Ya estas listo para entrar a Zero to Agent.',
    joinWhatsApp: 'Unirse al Grupo de WhatsApp',
    startTutorial: 'Comenzar Tutorial Basico',
    tutorialUnlocked: 'Tutorial Desbloqueado',
    prepareBeforeEvent: 'Preparate antes del evento con estos recursos:',
    whatIsV0: '¿Que es v0?',
    whatIsV0Desc: 'Herramienta de IA que ayuda a generar interfaces rapidamente.',
    whatIsVercel: '¿Que es Vercel?',
    whatIsVercelDesc: 'La forma mas facil de desplegar tu app online.',
    whatIsNextjs: '¿Que es Next.js?',
    whatIsNextjsDesc: 'Framework web full-stack moderno.',
    whatIsAgent: '¿Que es un Agente de IA?',
    whatIsAgentDesc: 'Un sistema que puede razonar, decidir y actuar.',
    howToWin: '¿Como ganar el Hackathon?',
    howToWinDesc: 'Construye algo util rapidamente.',
    learnMore: 'Aprender mas',
    
    // Level Selection
    selectYourLevel: 'Selecciona tu nivel de preparacion',
    selectLevelDesc: 'Esto nos ayudara a personalizar tu experiencia en el hackathon',
    yourMission: 'Tu Mision en el Hackathon',
    
    // Level Journeys
    level1Curious: 'Nivel 1: Curioso',
    level1Desc: 'Recien llegas al mundo de la IA y desarrollo',
    level1Mission: 'Tu Aventura Comienza',
    level1Journey: 'Bienvenido al punto de partida. Tu mision es observar, aprender y absorber todo lo posible. Conecta con un Builder o Architect que sera tu guia. En las primeras 2 horas, dominaras v0 creando tu primera interfaz. Luego, ayudaras a tu equipo con ideas frescas mientras aprendes deployment en Vercel.',
    level1Actions: 'Explorar v0 con tutorial guiado|Conectar con un mentor del equipo|Contribuir ideas al proyecto grupal',
    
    level2Explorer: 'Nivel 2: Explorador',
    level2Desc: 'Has probado algunas herramientas, quieres profundizar',
    level2Mission: 'Descubre Nuevos Territorios',
    level2Journey: 'Ya conoces lo basico, ahora es tiempo de expandir. Tu mision es dominar Next.js y conectar tu primera API. Seras el puente entre los Curiosos y los Builders. Ensena lo que aprendas a alguien nuevo - ensenar es la mejor forma de aprender.',
    level2Actions: 'Completar proyecto Next.js basico|Integrar una API externa|Mentorear a un Curioso',
    
    level3Builder: 'Nivel 3: Constructor',
    level3Desc: 'Sabes construir, quieres agregar IA',
    level3Mission: 'Construye con Inteligencia',
    level3Journey: 'Tienes las habilidades tecnicas. Ahora integraras LLMs usando Vercel AI SDK. Tu rol es crear el backbone del proyecto mientras guias a Exploradores en buenas practicas. Documenta tu proceso - otros aprenderan de ti.',
    level3Actions: 'Implementar AI SDK con streaming|Crear endpoints de API robustos|Guiar a Exploradores en codigo',
    
    level4Operator: 'Nivel 4: Operador',
    level4Desc: 'Dominas herramientas, quieres automatizar',
    level4Mission: 'Orquesta la Inteligencia',
    level4Journey: 'Tu dominio es la automatizacion y los workflows. Implementaras comportamiento agentico: tool calling, memoria, y decision loops. Seras responsable de que el agente "piense" correctamente. Comparte patterns con otros Operators.',
    level4Actions: 'Configurar tool calling avanzado|Implementar memoria de contexto|Disenar flujos de decision del agente',
    
    level5Architect: 'Nivel 5: Arquitecto',
    level5Desc: 'Lideras equipos, disenas sistemas',
    level5Mission: 'Disena el Futuro',
    level5Journey: 'Eres el estratega. Tu mision es disenar la arquitectura del sistema completo: como se conectan los agentes, como escala, como se mantiene. Pero tu mayor impacto sera elevar a tu equipo. Dedica 30% de tu tiempo a desbloquear a otros.',
    level5Actions: 'Disenar arquitectura del sistema|Definir interfaces entre componentes|Mentorear y desbloquear al equipo',
    
    // Levels
    levelExplorer: 'Explorador',
    levelBuilder: 'Constructor',
    levelOperator: 'Operador',
    levelArchitect: 'Arquitecto',
    levelCurious: 'Curioso',
    levelDescExplorer: 'Nuevo en Vercel y herramientas de IA - listo para descubrir',
    levelDescBuilder: 'Tiene experiencia con herramientas de desarrollo',
    levelDescOperator: 'Experimentado con agentes de IA y automatización',
    levelDescArchitect: 'Rol senior/liderazgo con experiencia avanzada',
    levelDescCurious: 'Interesado en aprender más',
  },
  en: {
    // Header
    eventCheckin: 'Event Check-in',
    workshopTitle: 'Vercel & AI Workshop',
    
    // Email Check
    welcomeToEvent: 'Welcome to the Event',
    enterEmailToCheckin: 'Enter your registration email to check in',
    emailAddress: 'Email Address',
    emailPlaceholder: 'your@email.com',
    emailRegisteredWith: 'Use the email you registered with on Luma',
    checkIn: 'Check In',
    continueAsGuest: 'Continue as Guest',
    emailNotFound: 'Email not found in registration list. You can continue as a guest.',
    errorCheckingEmail: 'Error checking email. Please try again.',
    
    // Survey
    welcomeUser: 'Welcome',
    status: 'Status',
    guestCheckin: 'Guest Check-in',
    tellUsAboutYourself: 'Tell us a bit about yourself',
    willYouAttend: 'Will you be attending?',
    yesWillAttend: 'Yes, I will attend',
    noCannotMakeIt: 'No, I cannot make it',
    doYouNeedTeam: 'Do you need a team?',
    helpMatchTeammates: 'We can help match you with other participants',
    yesHelpFindTeam: 'Yes, please help me find teammates',
    noHaveTeam: 'No, I have a team or prefer to work solo',
    whatToBuild: 'What do you want to build?',
    buildPlaceholder: 'Describe your project idea or what you hope to create...',
    aiConfidence: 'How confident are you with AI tools',
    confidenceDescription: '1 = Complete beginner, 10 = Expert level',
    beginner: 'Beginner',
    expert: 'Expert',
    submitSurvey: 'Submit Survey',
    surveyComplete: 'Survey Complete!',
    thankYouResponse: 'Thank you for your response. See you at the event!',
    
    // Complete / Access Granted
    youreAllSet: "You're all set!",
    excitedToSeeYou: "We're excited to see you at the event.",
    checkInAnother: 'Check in another participant',
    accessGranted: 'Access Granted',
    readyToEnter: 'You are now ready to enter Zero to Agent.',
    joinWhatsApp: 'Join Official WhatsApp Group',
    startTutorial: 'Start Basic Tutorial',
    tutorialUnlocked: 'Tutorial Unlocked',
    prepareBeforeEvent: 'Prepare before the event with these resources:',
    whatIsV0: 'What is v0?',
    whatIsV0Desc: 'AI tool that helps generate interfaces fast.',
    whatIsVercel: 'What is Vercel?',
    whatIsVercelDesc: 'The easiest way to deploy your app online.',
    whatIsNextjs: 'What is Next.js?',
    whatIsNextjsDesc: 'Modern full-stack web framework.',
    whatIsAgent: 'What is an AI Agent?',
    whatIsAgentDesc: 'A system that can reason, decide and act.',
    howToWin: 'How to Win the Hackathon?',
    howToWinDesc: 'Build something useful fast.',
    learnMore: 'Learn more',
    
    // Level Selection
    selectYourLevel: 'Select your readiness level',
    selectLevelDesc: 'This will help us personalize your hackathon experience',
    yourMission: 'Your Hackathon Mission',
    
    // Level Journeys
    level1Curious: 'Level 1: Curious',
    level1Desc: 'Just arriving to the world of AI and development',
    level1Mission: 'Your Adventure Begins',
    level1Journey: 'Welcome to the starting point. Your mission is to observe, learn, and absorb as much as possible. Connect with a Builder or Architect who will be your guide. In the first 2 hours, you will master v0 by creating your first interface. Then, you will help your team with fresh ideas while learning Vercel deployment.',
    level1Actions: 'Explore v0 with guided tutorial|Connect with a team mentor|Contribute ideas to the group project',
    
    level2Explorer: 'Level 2: Explorer',
    level2Desc: 'You have tried some tools, want to go deeper',
    level2Mission: 'Discover New Territories',
    level2Journey: 'You know the basics, now its time to expand. Your mission is to master Next.js and connect your first API. You will be the bridge between Curious and Builders. Teach what you learn to someone new - teaching is the best way to learn.',
    level2Actions: 'Complete basic Next.js project|Integrate an external API|Mentor a Curious',
    
    level3Builder: 'Level 3: Builder',
    level3Desc: 'You know how to build, want to add AI',
    level3Mission: 'Build with Intelligence',
    level3Journey: 'You have the technical skills. Now you will integrate LLMs using Vercel AI SDK. Your role is to create the backbone of the project while guiding Explorers in best practices. Document your process - others will learn from you.',
    level3Actions: 'Implement AI SDK with streaming|Create robust API endpoints|Guide Explorers in code',
    
    level4Operator: 'Level 4: Operator',
    level4Desc: 'You master tools, want to automate',
    level4Mission: 'Orchestrate Intelligence',
    level4Journey: 'Your domain is automation and workflows. You will implement agentic behavior: tool calling, memory, and decision loops. You will be responsible for the agent "thinking" correctly. Share patterns with other Operators.',
    level4Actions: 'Configure advanced tool calling|Implement context memory|Design agent decision flows',
    
    level5Architect: 'Level 5: Architect',
    level5Desc: 'You lead teams, design systems',
    level5Mission: 'Design the Future',
    level5Journey: 'You are the strategist. Your mission is to design the complete system architecture: how agents connect, how it scales, how it is maintained. But your biggest impact will be elevating your team. Dedicate 30% of your time to unblocking others.',
    level5Actions: 'Design system architecture|Define interfaces between components|Mentor and unblock the team',
    
    // Levels
    levelExplorer: 'Explorer',
    levelBuilder: 'Builder',
    levelOperator: 'Operator',
    levelArchitect: 'Architect',
    levelCurious: 'Curious',
    levelDescExplorer: 'New to Vercel and AI tools - ready to discover',
    levelDescBuilder: 'Has experience with development tools',
    levelDescOperator: 'Experienced with AI agents and automation',
    levelDescArchitect: 'Senior/leadership role with advanced experience',
    levelDescCurious: 'Interested in learning more',
  },
}

type Translations = typeof translations.es

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')
  
  const t = translations[language]
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
