import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const levelMap: Record<number, string> = {
  1: 'Curious', 2: 'Explorer', 3: 'Builder', 4: 'Operator', 5: 'Architect'
};

// 1. OBTENER DATOS (Para el Dashboard)
export async function GET() {
  try {
    // Obtenemos los datos de KV. Si no existen, inicializamos como array vacío.
    const participants = await kv.get<any[]>('participants') || [];
    const responses = await kv.get<any[]>('responses') || [];

    const enriched = participants.map((p: any) => {
      const resp = responses.find((r: any) => r.email?.toLowerCase() === p.email?.toLowerCase());
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
    console.error("Error en GET KV:", error);
    return NextResponse.json({ error: "Error al leer base de datos" }, { status: 500 });
  }
}

// 2. CARGAR/ACTUALIZAR DATOS (Para el Formulario y Carga Masiva)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // CASO A: Carga masiva de participantes (desde el CSV/JSON inicial)
    if (body.type === 'bulk_participants') {
      await kv.set('participants', body.data);
      return NextResponse.json({ success: true, message: "Participantes cargados" });
    }

    // CASO B: Registro de formulario individual
    const newResp = body;
    if (!newResp.email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

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
    console.error("Error en POST KV:", error);
    return NextResponse.json({ error: "Error al escribir en base de datos" }, { status: 500 });
  }
}