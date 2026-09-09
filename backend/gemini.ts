import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        geminiClient = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        console.warn('Failed to initialize Gemini client:', err);
        return null;
      }
    }
  }
  return geminiClient;
}

export async function generateContentWithFallback(prompt: string, fallbackResponse: string): Promise<string> {
  const ai = getGemini();
  if (!ai) {
    return fallbackResponse;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || fallbackResponse;
  } catch (error) {
    console.warn('Gemini generation error, falling back to local engine:', error);
    return fallbackResponse;
  }
}
