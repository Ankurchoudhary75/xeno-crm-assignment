import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(segments);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const segment = await prisma.segment.create({
      data: {
        name: data.name,
        criteria: JSON.stringify({ prompt: data.prompt, sql: data.sql })
      }
    });
    return NextResponse.json(segment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save segment' }, { status: 500 });
  }
}
