import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const redis = new Redis(process.env.seed_REDIS_URL as string);

export async function GET() {
  try {
    const raw = await redis.get('responses');
    const data = raw ? JSON.parse(raw) : [];

    // Mapeamos los datos para asegurar que el frontend los entienda
    const participants = data.map((p: any) => ({
      ...p,
      // Forzamos hasSurvey a true si existe el objeto, 
      // o usa la lógica: p.build_goal ? true : false
      hasSurvey: p.hasSurvey ?? true, 
      name: p.name || "Sin Nombre",
      level: p.level || "Curious",
      company: p.company || "Independiente",
      build_goal: p.build_goal || "Sin objetivo definido aún.",
      confidence: p.confidence || 0,
      needs_team: p.needs_team || "No"
    }));

    const stats = {
      total: participants.length,
      withSurvey: participants.filter((p: any) => p.hasSurvey).length,
      needsTeam: participants.filter((p: any) => p.needs_team === 'Yes').length,
    };

    return NextResponse.json({ participants, stats });
  } catch (error) {
    return NextResponse.json({ error: "Error de lectura" }, { status: 500 });
  }
}