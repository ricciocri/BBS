
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
}

/**
 * Cerca giochi su BoardGameGeek o RPGGeek.
 * Se il tipo non è specificato, cerca in entrambi i database.
 */
export const searchGeekGames = async (query: string, type?: GameType): Promise<GeekGame[]> => {
  if (query.length < 2) return [];

  const source = type 
    ? (type === GameType.RPG ? "RPGGeek (rpggeek.com)" : "BoardGameGeek (boardgamegeek.com)")
    : "BoardGameGeek e RPGGeek";
  
  const categoryDesc = type
    ? (type === GameType.RPG ? "giochi di ruolo, manuali o sistemi" : "giochi da tavolo o espansioni")
    : "giochi da tavolo, espansioni, manuali o sistemi di gioco di ruolo";

  try {
    const prompt = `Agisci come un'interfaccia API per i database di BoardGameGeek e RPGGeek. 
    Cerca i ${categoryDesc} che corrispondono a: "${query}".
    Restituisci ESCLUSIVAMENTE un array JSON di oggetti con questa struttura:
    {"id": "string", "name": "string", "yearpublished": "string", "image": "string", "type": "BOARD_GAME" | "RPG"}
    Includi i 5 risultati più rilevanti. Se è un manuale o sistema di ruolo usa "RPG", altrimenti "BOARD_GAME".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Errore ricerca Geek:", error);
    return [];
  }
};

/**
 * Recupera i dettagli specifici di un gioco/manuale
 */
export const getGeekGameDetails = async (gameId: string, type: GameType): Promise<Partial<GeekGame>> => {
  const source = type === GameType.RPG ? "RPGGeek" : "BoardGameGeek";
  
  try {
    const prompt = `Recupera i dettagli ufficiali da ${source} per l'elemento con ID: ${gameId}.
    Restituisci un oggetto JSON con: "image" (URL dell'immagine principale HD), "description" (breve sintesi in italiano di max 30 parole), "minPlayers", "maxPlayers".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Errore dettagli Geek:", error);
    return {};
  }
};

/**
 * Recupera la collezione pubblica di un utente da BGG
 */
export const fetchBggUserCollection = async (username: string): Promise<CollectedGame[]> => {
  try {
    const prompt = `Agisci come un estrattore di dati per BoardGameGeek. 
    Trova la collezione di giochi (boardgames e RPG) dell'utente con username: "${username}".
    Restituisci un array JSON di oggetti che seguono ESCLUSIVAMENTE questa struttura:
    {"id": "id_univoco_string", "name": "nome_gioco", "type": "BOARD_GAME" o "RPG", "geekId": "id_bgg_o_rpggeek"}
    Includi i titoli più famosi o recenti della sua collezione (massimo 15 titoli per non sovraccaricare).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const games = JSON.parse(text);
    return games.map((g: any) => ({
      id: g.id || 'bgg-' + Math.random().toString(36).substr(2, 9),
      name: g.name,
      type: g.type === 'RPG' ? GameType.RPG : GameType.BOARD_GAME,
      geekId: g.geekId
    }));
  } catch (error) {
    console.error("Errore nel recupero della collezione BGG:", error);
    throw new Error("Impossibile recuperare la collezione. Verifica lo username.");
  }
};
