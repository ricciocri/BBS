import { GoogleGenAI } from "@google/genai";
import { GameType, CollectedGame } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeekGame {
  id: string;
  name: string;
  yearpublished?: string;
  thumbnail?: string;
  image?: string;
  type: GameType;
  minPlayers?: number;
  maxPlayers?: number;
  bestPlayers?: number;
  difficulty?: number;
  duration?: number;
  minDuration?: number;
  maxDuration?: number;
  isExpansion?: boolean;
  rank?: number;
}

/**
 * Cerca giochi su BoardGameGeek o RPGGeek.
 */
export const searchGeekGames = async (query: string, type?: GameType): Promise<GeekGame[]> => {
  if (query.length < 2) return [];

  const categoryDesc = type
    ? (type === GameType.RPG ? "giochi di ruolo, manuali o sistemi" : "giochi da tavolo o espansioni")
    : "giochi da tavolo, espansioni, manuali o sistemi di gioco di ruolo";

  try {
    const prompt = `Agisci come un'interfaccia API per i database di BoardGameGeek e RPGGeek. 
    Cerca i ${categoryDesc} che corrispondono a: "${query}".
    Restituisci ESCLUSIVAMENTE un array JSON di oggetti con questa struttura:
    {"id": "string", "name": "string", "yearpublished": "string", "image": "string", "type": "BOARD_GAME" | "RPG", "rank": number | null}
    Includi i 5 risultati più rilevanti.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Errore ricerca Geek:", error);
    return [];
  }
};

/**
 * Recupera i dettagli tecnici specifici di un gioco.
 */
export const getGeekGameDetails = async (gameId: string, type: GameType): Promise<Partial<GeekGame>> => {
  const source = type === GameType.RPG ? "RPGGeek" : "BoardGameGeek";
  
  try {
    const prompt = `Accedi ai dati tecnici UFFICIALI di ${source} per l'elemento con ID: ${gameId}.
    Restituisci un oggetto JSON con questi campi: 
    "image": "URL immagine HD", 
    "yearpublished": "string",
    "minPlayers": numero, 
    "maxPlayers": numero, 
    "difficulty": numero_float (Weight BGG),
    "minDuration": numero (min playing time),
    "maxDuration": numero (max playing time),
    "isExpansion": boolean,
    "rank": numero.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return response.text ? JSON.parse(response.text) : {};
  } catch (error) {
    console.error("Errore dettagli Geek:", error);
    return {};
  }
};