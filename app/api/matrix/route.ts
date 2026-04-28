import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const levelMap: Record<number, string> = {
  1: 'Curious', 2: 'Explorer', 3: 'Builder', 4: 'Operator', 5: 'Architect'
};

export async function GET() {
  try {
    // Leemos directamente de la base de datos
    const participants = await kv.get<any[]>('participants') || [];
    const responses = await kv.get<any[]>('responses') || [];

    const enriched = participants.map((p: any) => {
      const resp = responses.find((r: any) => r.email.toLowerCase() === p.email.toLowerCase());
      const level = resp?.selected_level ? levelMap[resp.selected_level] : 'Curious';
      return { ...p, ...resp, level, hasSurvey: !!resp };
    });

    return NextResponse.json({ 
      stats: { 
        total: participants.length, 
        withSurvey: responses.length, 
        needsTeam: responses.filter((r: any) => r.needs_team === 'Yes').length 
      }, 
      participants: enriched 
    });
  } catch (error) {
    console.error("Error en KV:", error);
    return NextResponse.json({ error: "Error de conexión con la base de datos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newResp = await request.json();
    let currentResponses = await kv.get<any[]>('responses') || [];
    
    const idx = currentResponses.findIndex(r => r.email.toLowerCase() === newResp.email.toLowerCase());
    if (idx !== -1) {
      currentResponses[idx] = { ...currentResponses[idx], ...newResp };
    } else {
      currentResponses.push(newResp);
    }

    await kv.set('responses', currentResponses);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo guardar en la base de datos" }, { status: 500 });
  }
}