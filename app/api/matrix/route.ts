import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

const levelMap: Record<number, string> = {
  1: 'Curious', 2: 'Explorer', 3: 'Builder', 4: 'Operator', 5: 'Architect'
};

export async function GET() {
  try {
    // 1. Intentamos traer datos de KV (Redis)
    let participants = await kv.get<any[]>('participants');
    let responses = await kv.get<any[]>('responses');

    // 2. MIGRACIÓN INICIAL: Si KV está vacío, cargamos los JSON del repo por única vez
    if (!participants) {
      console.log("KV vacío, migrando datos desde archivos JSON locales...");
      const dataDir = path.join(process.cwd(), 'data');
      
      try {
        participants = JSON.parse(await fs.readFile(path.join(dataDir, 'participants.json'), 'utf8'));
        responses = JSON.parse(await fs.readFile(path.join(dataDir, 'responses.json'), 'utf8'));
        
        // Guardamos en KV para que desde ahora el sistema use la DB y no el disco
        await kv.set('participants', participants);
        await kv.set('responses', responses);
      } catch (fileError) {
        console.error("No se encontraron archivos JSON para migrar.");
        participants = [];
        responses = [];
      }
    }

    // 3. Cruzamos los datos (Join) usando los datos de KV
    const enriched = participants.map((p: any) => {
      const resp = responses?.find((r: any) => r.email.toLowerCase() === p.email.toLowerCase());
      const level = resp?.selected_level ? levelMap[resp.selected_level] : 'Curious';
      return { ...p, ...resp, level, hasSurvey: !!resp };
    });

    return NextResponse.json({ 
      stats: { 
        total: participants.length, 
        withSurvey: responses?.length || 0, 
        needsTeam: responses?.filter((r: any) => r.needs_team === 'Yes').length || 0 
      }, 
      participants: enriched 
    });
  } catch (error) {
    return NextResponse.json({ error: "Fallo en la conexión con KV" }, { status: 500 });
  }
}

// 4. ELIMINAMOS FS.WRITE: Ahora guardamos encuestas directamente en KV
export async function POST(request: Request) {
  try {
    const newResp = await request.json();
    if (!newResp.email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    let currentResponses = await kv.get<any[]>('responses') || [];
    
    // Actualizamos si ya existe o agregamos si es nuevo
    const idx = currentResponses.findIndex(r => r.email.toLowerCase() === newResp.email.toLowerCase());
    if (idx !== -1) {
      currentResponses[idx] = { ...currentResponses[idx], ...newResp };
    } else {
      currentResponses.push(newResp);
    }

    // Guardamos en Redis (esto NO da error de permisos en Vercel)
    await kv.set('responses', currentResponses);
    
    return NextResponse.json({ success: true, message: "Datos guardados en KV correctamente" });
  } catch (error) {
    console.error("Error al guardar:", error);
    return NextResponse.json({ error: "Error de escritura en base de datos" }, { status: 500 });
  }
}