import { GoogleGenAI, Type } from "@google/genai";
import { CulturalEvent } from "../types";

export const discoverEventsWithAI = async (prompt: string): Promise<{
  events: Partial<CulturalEvent>[],
  sources: { title: string, uri: string }[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Finn dagsaktuelle kulturarrangementer i Norge basert på forespørselen: "${prompt}". 
      Bruk Google Search for å finne ekte datoer og steder for 2024/2025. 
      Returner en JSON-liste med arrangementer.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  city: { type: Type.STRING },
                  category: { type: Type.STRING },
                  venue: { type: Type.STRING },
                  link: { type: Type.STRING }
                },
                required: ["title", "city", "date"]
              }
            }
          }
        }
      },
    });

    const json = JSON.parse(response.text || "{\"events\":[]}");
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        title: chunk.web?.title || 'Kilde',
        uri: chunk.web?.uri || '#'
      })) || [];

    return {
      events: json.events || [],
      sources: sources
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { events: [], sources: [] };
  }
};