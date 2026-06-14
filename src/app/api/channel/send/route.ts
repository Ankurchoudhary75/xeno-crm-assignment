import { NextResponse } from "next/server";

const CRM_RECEIPT_URL =
  process.env.CRM_RECEIPT_URL || "http://localhost:3000/api/crm/receipt";

export async function POST(req: Request) {
  try {
    const { communicationId, channel, message } = await req.json();

    // The channel service accepts the request immediately
    const response = NextResponse.json(
      { status: "Accepted", communicationId },
      { status: 202 },
    );

    // Simulate async delivery lifecycle in the background
    // Since this is a demo, we'll run it without awaiting.
    // In serverless, this might get killed, but works locally on Node.
    simulateLifecycle(communicationId);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to accept message" },
      { status: 500 },
    );
  }
}

async function simulateLifecycle(communicationId: string) {
  const statuses = ["SENT", "DELIVERED", "OPENED", "CLICKED"];
  // Introduce a random failure rate of 10% at the start
  if (Math.random() < 0.1) {
    await sendReceipt(communicationId, "FAILED");
    return;
  }

  // Simulate progression through statuses
  for (const status of statuses) {
    // Wait between 2 to 5 seconds per stage
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    await sendReceipt(communicationId, status);

    // Some communications stop progressing (e.g. they get delivered but not opened)
    if (status === "DELIVERED" && Math.random() < 0.4) break;
    if (status === "OPENED" && Math.random() < 0.7) break;
  }
}

async function sendReceipt(communicationId: string, status: string) {
  try {
    await fetch(CRM_RECEIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communicationId, status }),
    });
  } catch (error) {
    console.error(`Failed to send receipt for ${communicationId}:`, error);
  }
}
