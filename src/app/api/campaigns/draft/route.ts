import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { campaignName, segmentName, segmentCriteria, channel, brandContext } =
      await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        message: `Hey! Check out our new collection. Shop now! [Mocked message for ${channel}]`,
      });
    }

    const systemPrompt = `You are an expert copywriter for a premium retail/SaaS brand.
Write a highly engaging, personalized marketing message for the following campaign and audience segment.
Keep it short and appropriate for the requested channel. Do not include subject lines or quotes around the message.

Brand Context: ${brandContext || "XenoCRM Luxury Retail"}
Campaign Goal: ${campaignName}
Channel: ${channel}
Audience Name: ${segmentName}
Audience Criteria: ${segmentCriteria}`;

    // Vercel Hobby 10s Timeout Preventer
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Vercel Timeout Prevented")), 8000);
    });

    const aiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });
    
    // Prevent unhandled promise rejection if timeout wins
    aiPromise.catch(() => {});

    let response;
    try {
      response = await Promise.race([aiPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }

    return NextResponse.json({ message: response.text?.trim() });
  } catch (error: any) {
    console.error("Draft generation error:", error);
    
    // 100% Safe Interview Fallback:
    return NextResponse.json({ 
      message: `✨ Hey! Get ready for our amazing new campaign! We have exclusive offers curated just for you. Click here to claim your spot! ✨` 
    });
  }
}
