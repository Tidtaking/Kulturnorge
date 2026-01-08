
import { GoogleGenAI, Type } from "@google/genai";
import { CulturalEvent, EventCategory } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const discoverEventsWithAI = async (prompt: string): Promise<{
  events: Partial<CulturalEvent>[],
  sources: { title: string, uri: string }[]
}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Finn aktuelle kulturarrangementer i Norge basert på denne forespørselen: "${prompt}". 
      Returner en liste over spesifikke arrangementer som skjer i nær fremtid. 
      Vennligst inkluder navn, by, kategori, kort beskrivelse og dato hvis mulig.`,
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
                  venue: { type: Type.STRING }
                },
                required: ["title", "city"]
              }
            }
          }
        }
      },
    });

    // Access text as a property, not a method
    const text = response.text || "{}";
    const json = JSON.parse(text);
    
    // Extract grounding sources when using googleSearch tool
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
    console.error("Gemini Error:", error);
    return { events: [], sources: [] };
  }
};

export const getMoodRecommendations = async (mood: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gi meg 5 sjangre eller typer kulturarrangementer som passer til humøret: "${mood}". Returner kun en JSON array av strenger.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  
  try {
    // Access text as a property
    return JSON.parse(response.text || "[]");
  } catch {
    return [];
  }
};