import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const newResponse = await request.json();

    if (!newResponse.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Traemos las respuestas actuales de Redis
    let responsesData = await kv.get<any[]>('responses') || [];

    // Buscamos si el usuario ya respondió para actualizarlo, o agregamos uno nuevo
    const index = responsesData.findIndex(r => r.email.toLowerCase() === newResponse.email.toLowerCase());
    
    if (index !== -1) {
      responsesData[index] = { ...responsesData[index], ...newResponse };
    } else {
      responsesData.push(newResponse);
    }

    // Guardamos en Redis (esto SI funciona en Vercel)
    await kv.set('responses', responsesData);

    return NextResponse.json({ success: true, message: "Response saved to KV" });
  } catch (error) {
    console.error("Survey API Error:", error);
    return NextResponse.json({ error: "Failed to save survey response" }, { status: 500 });
  }
}