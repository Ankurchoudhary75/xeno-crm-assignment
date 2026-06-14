import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      segment: true,
      _count: {
        select: { communications: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  try {
    const { name, segmentId, message, channel } = await req.json();

    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) throw new Error("Segment not found");

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: { name, segmentId, message, channel }
    });

    // Get the customers in this segment
    const criteria = JSON.parse(segment.criteria);
    const sql = criteria.sql;
    const customers = await prisma.$queryRawUnsafe<any[]>(sql);

    // Create communication records
    const commsData = customers.map(c => ({
      campaignId: campaign.id,
      customerId: c.id,
      status: 'PENDING'
    }));

    await prisma.communication.createMany({ data: commsData });
    const comms = await prisma.communication.findMany({ where: { campaignId: campaign.id } });

    // Send to channel service stub asynchronously without awaiting
    const channelServiceUrl = process.env.CHANNEL_SERVICE_URL || 'http://localhost:3000/api/channel/send';
    
    // In serverless, you shouldn't use fire-and-forget loops like this because the function might terminate.
    // However, for this demo/local assignment, it's sufficient.
    comms.forEach(c => {
      fetch(channelServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationId: c.id,
          channel: channel,
          message: message
        })
      }).catch(err => console.error("Failed to call channel service:", err));
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("Campaign creation error:", error);
    return NextResponse.json({ error: error.message || 'Failed to create campaign' }, { status: 500 });
  }
}
