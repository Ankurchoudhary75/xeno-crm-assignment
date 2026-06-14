import { GoogleGenAI } from '@google/genai';

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features may fail or return mocked data.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'mock' });
};

export const ai = getGenAIClient();
