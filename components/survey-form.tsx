import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const newResponse = await request.json();
    if (!newResponse.email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // Leemos de Redis
    let responsesData = await kv.get<any[]>('responses') || [];

    // Actualizamos o insertamos
    const index = responsesData.findIndex(r => r.email.toLowerCase() === newResponse.email.toLowerCase());
    if (index !== -1) {
      responsesData[index] = { ...responsesData[index], ...newResponse };
    } else {
      responsesData.push(newResponse);
    }

    // Guardamos en Redis
    await kv.set('responses', responsesData);

    return NextResponse.json({ success: true, message: "Response KABOOM! to KV" });
  } catch (error: any) {
    // Si falla, mostramos el error real para dejar de adivinar
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}