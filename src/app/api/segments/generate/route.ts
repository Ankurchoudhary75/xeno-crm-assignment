import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // Mock mode
      const mockCustomers = await prisma.customer.findMany({ take: 3 });
      return NextResponse.json({
        sql: "SELECT * FROM Customer LIMIT 3",
        customers: mockCustomers,
        criteria: prompt,
      });
    }

    const systemPrompt = `You are an AI assistant for a CRM database. 
Your task is to convert a user's natural language request into a valid PostgreSQL query to fetch matching customers.
The database has these tables (NOTE: You MUST wrap all table names AND camelCase column names in double quotes because PostgreSQL is case-sensitive):
"Customer"(id, name, email, phone, city, "createdAt")
"Order"(id, "customerId", amount, "createdAt")

Return ONLY a valid SQL query starting with SELECT. Do not wrap in markdown code blocks. 
Example Request: Users who spent over $50
Example Output: SELECT DISTINCT c.* FROM "Customer" c JOIN "Order" o ON c.id = o."customerId" GROUP BY c.id HAVING SUM(o.amount) > 50`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
      config: {
        temperature: 0.1,
      },
    });

    let sql = response.text?.trim() || "";
    // Remove markdown code blocks if AI still included them
    if (sql.startsWith("```sql")) {
      sql = sql
        .replace(/```sql\n?/, "")
        .replace(/```$/, "")
        .trim();
    } else if (sql.startsWith("```")) {
      sql = sql
        .replace(/```\n?/, "")
        .replace(/```$/, "")
        .trim();
    }

    // Execute raw query
    // Note: In a real production app, executing raw SQL from an LLM is a major security risk (SQL Injection).
    // Here we are using it for the assignment's AI-native demonstration purposes.
    const customers = await prisma.$queryRawUnsafe(sql);

    return NextResponse.json({ sql, customers, criteria: prompt });
  } catch (error: any) {
    console.error("Generate segment error:", error);

    // If Gemini throws a Free Tier Rate Limit error during the interview demo,
    // gracefully fall back to a mock query so the presentation doesn't crash!
    if (
      error.message?.toLowerCase().includes("rate limit") ||
      error.message?.includes("429") ||
      error.message?.toLowerCase().includes("quota")
    ) {
      const mockCustomers = await prisma.customer.findMany({ take: 3 });
      return NextResponse.json({
        sql: "-- [FALLBACK DUE TO GEMINI RATE LIMIT]\nSELECT * FROM \"Customer\" LIMIT 3",
        customers: mockCustomers,
        criteria: prompt,
      });
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate segment" },
      { status: 500 },
    );
  }
}
