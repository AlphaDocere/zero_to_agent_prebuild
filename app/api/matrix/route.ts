// app/api/matrix/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const levelMap: Record<number, string> = {
  1: 'Curious',
  2: 'Explorer',
  3: 'Builder',
  4: 'Operator',
  5: 'Architect'
};

export async function GET() {
  try {
    // Definimos las rutas a los archivos
   const participantsPath = path.join(process.cwd(), 'data', 'participants.json');
    const responsesPath = path.join(process.cwd(), 'data', 'responses.json');
    // Intentamos leer los archivos
    const participantsData = JSON.parse(await fs.readFile(participantsPath, 'utf8'));
    const responsesData = JSON.parse(await fs.readFile(responsesPath, 'utf8'));

    const enriched = participantsData.map((p: any) => {
      const resp = responsesData.find((r: any) => r.email.toLowerCase() === p.email.toLowerCase());
      const level = resp?.selected_level ? levelMap[resp.selected_level] : 'Curious';
      return { ...p, ...resp, level, hasSurvey: !!resp };
    });

    const stats = {
      total: participantsData.length,
      withSurvey: responsesData.length,
      needsTeam: responsesData.filter((r: any) => r.needs_team === 'Yes').length,
    };

    return NextResponse.json({ stats, participants: enriched });

  } catch (error) {
    // ESTA ES LA PARTE QUE BUSCABAS:
    console.error("Error crítico en API Matrix:", error);
    
    // Devolvemos una estructura válida aunque esté vacía
    // para que el Frontend no se rompa al intentar leer .total o .filter()
    return NextResponse.json({ 
      stats: { 
        total: 0, 
        withSurvey: 0, 
        needsTeam: 0 
      }, 
      participants: [] 
    });
  }
}