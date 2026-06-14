import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { segmentName, segmentCriteria, channel, brandContext } =
      await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        message: `Hey! Check out our new collection. Shop now! [Mocked message for ${channel}]`,
      });
    }

    const systemPrompt = `You are an expert copywriter for a retail/DTC brand.
Write a highly engaging, personalized marketing message for the following audience segment.
Keep it short and appropriate for the requested channel. Do not include subject lines or quotes around the message.

Brand Context: ${brandContext || "A premium coffee chain."}
Channel: ${channel}
Audience Name: ${segmentName}
Audience Criteria: ${segmentCriteria}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    return NextResponse.json({ message: response.text?.trim() });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate message" },
      { status: 500 },
    );
  }
}
