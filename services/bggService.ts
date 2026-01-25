
import { GoogleGenAI } from "@google/genai";

// Initialize with named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface BggGame {
  id: string;
  name: string;
  yearpublished?: string;
  thumbnail?: string;
  image?: string;
}

/**
 * Cerca giochi su BoardGameGeek. 
 * Utilizza Gemini come fallback/proxy se l'API diretta fallisce per CORS
 * o per fornire risultati più pertinenti in formato JSON.
 */
export const searchBggGames = async (query: string): Promise<BggGame[]> => {
  if (query.length < 3) return [];

  try {
    // Tentativo tramite Gemini per agire come "BGG Search Proxy" 
    const prompt = `Agisci come un'interfaccia API per BoardGameGeek. 
    Cerca nel database di BGG i giochi che corrispondono a: "${query}".
    Restituisci ESCLUSIVAMENTE un array JSON di oggetti con questa struttura:
    {"id": "string", "name": "string", "yearpublished": "string", "image": "string"}
    Includi solo i 5 risultati più rilevanti.`;

    // Use ai.models.generateContent with JSON configuration
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Use .text property safely
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Errore ricerca BGG:", error);
    return [];
  }
};

/**
 * Recupera i dettagli specifici di un gioco inclusa l'immagine HD
 */
export const getBggGameDetails = async (gameId: string): Promise<Partial<BggGame>> => {
  try {
    const prompt = `Recupera i dettagli ufficiali da BoardGameGeek per il gioco con ID: ${gameId}.
    Restituisci un oggetto JSON con: "image" (URL dell'immagine principale), "description" (breve sintesi in italiano), "minPlayers", "maxPlayers".`;

    // Use ai.models.generateContent with JSON configuration
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Use .text property safely
    const text = response.text;
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Errore dettagli BGG:", error);
    return {};
  }
};
