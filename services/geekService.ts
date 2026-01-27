
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
    "duration": numero,
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

/**
 * Recupera la collezione pubblica di un utente specifico da BGG.
 * Forza la navigazione sull'URL esatto dell'utente per evitare omonimie o suggerimenti errati di Google.
 */
export const fetchBggUserCollection = async (username: string): Promise<CollectedGame[]> => {
  try {
    // Il prompt è ora molto più direttivo sulla navigazione URL
    const prompt = `Naviga ESCLUSIVAMENTE all'indirizzo 'https://boardgamegeek.com/collection/user/${username}' utilizzando il tool googleSearch.
    Verifica che il profilo appartenga esattamente all'utente "${username}". 
    Recupera l'elenco dei giochi che l'utente ha segnato come 'Owned'.
    
    ATTENZIONE: Se l'utente "${username}" non esiste o la pagina non è accessibile, restituisci un array vuoto []. NON cercare utenti simili o con nomi famosi.
    
    Per ogni gioco, estrai: 
    - geekId (l'ID numerico di BGG)
    - name
    - type (BOARD_GAME)
    - yearpublished
    - minPlayers, maxPlayers
    - difficulty (il valore 'Weight' medio)
    - duration
    - rank
    
    Restituisci ESCLUSIVAMENTE un array JSON di oggetti.
    Struttura: {"id": "bgg_[id]", "name": "str", "type": "BOARD_GAME", "geekId": "str", "yearpublished": "str", "minPlayers": int, "maxPlayers": int, "difficulty": float, "duration": int, "rank": int}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }] 
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const games = JSON.parse(text);
    if (!Array.isArray(games)) return [];

    return games.map((g: any) => ({
      ...g,
      id: g.geekId ? `bgg-${g.geekId}` : (g.id || `bgg-${Math.random().toString(36).substr(2, 9)}`),
      type: GameType.BOARD_GAME,
      geekId: g.geekId || g.id
    }));
  } catch (error) {
    console.error("Errore nel recupero della collezione BGG:", error);
    throw new Error("Impossibile recuperare la collezione. Verifica che lo username BGG sia corretto e che il profilo sia pubblico.");
  }
};
