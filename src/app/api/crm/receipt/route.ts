import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { communicationId, status } = await req.json();

    await prisma.communication.update({
      where: { id: communicationId },
      data: { status }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Receipt API error:", error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}
