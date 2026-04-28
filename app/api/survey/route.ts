import { NextResponse } from 'next/server';
import Redis from 'ioredis';

// ioredis sí entiende el protocolo "redis://"
const redis = new Redis(process.env.seed_REDIS_URL as string);

export async function POST(request: Request) {
  try {
    const newResponse = await request.json();

    // Obtener datos
    const rawData = await redis.get('responses');
    let responsesData = rawData ? JSON.parse(rawData) : [];

    // Lógica de guardado...
    const index = responsesData.findIndex((r: any) => r.email === newResponse.email);
    if (index !== -1) {
      responsesData[index] = { ...responsesData[index], ...newResponse };
    } else {
      responsesData.push(newResponse);
    }

    // Guardar (en ioredis hay que convertir a string)
    await redis.set('responses', JSON.stringify(responsesData));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}