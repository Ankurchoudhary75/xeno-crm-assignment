import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      segment: true,
      _count: {
        select: { communications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  try {
    const { name, segmentId, message, channel } = await req.json();

    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
    });
    if (!segment) throw new Error("Segment not found");

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: { name, segmentId, message, channel },
    });

    // Get the customers in this segment
    const criteria = JSON.parse(segment.criteria);
    const sql = criteria.sql;
    const customers = await prisma.$queryRawUnsafe<any[]>(sql);

    // Create communication records
    const commsData = customers.map((c) => ({
      campaignId: campaign.id,
      customerId: c.id,
      status: "PENDING",
    }));

    await prisma.communication.createMany({ data: commsData });
    const comms = await prisma.communication.findMany({
      where: { campaignId: campaign.id },
    });

    // Resolve the absolute URL dynamically for Vercel or localhost
    const getBaseUrl = () => {
      if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return "http://localhost:3000";
    };
    const channelServiceUrl = `${getBaseUrl()}/api/channel/send`;

    // In serverless, we must use after() to ensure background tasks aren't killed
    const { after } = require("next/server");
    after(() => {
      comms.forEach((c) => {
        fetch(channelServiceUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communicationId: c.id,
            channel: channel,
            message: message,
          }),
        }).catch((err) => console.error("Failed to call channel service:", err));
      });
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("Campaign creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create campaign" },
      { status: 500 },
    );
  }
}
