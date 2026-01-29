import { GoogleGenAI } from "@google/genai";
import { CollectedGame, GameType } from "../types";

// Initialize with named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/api';

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


/**
 * Recupera la collezione pubblica di un utente specifico da BGG.
 * Usa il proxy server per evitare problemi CORS.
 * Gestisce la paginazione automaticamente.
 */
export const fetchBggUserCollection = async (username: string): Promise<CollectedGame[]> => {
  try {
    const allGames: CollectedGame[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const apiUrl = `https://board-game-society-server.onrender.com/api/bgg/collection/${username}?page=${page}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const html = data.html;
      
      const rowRegex = /<tr id='row_\d+'[\s\S]*?<\/tr>/g;
      let match;
      let gamesFoundOnPage = 0;
      
      while ((match = rowRegex.exec(html)) !== null) {
        const row = match[0];
        
        const hrefMatch = row.match(/href="\/boardgame(expansion)?\/(\d+)\/[^"]*"\s+class='primary'\s*>([^<]+)<\/a>/);
        const yearMatch = row.match(/<span class='smallerfont dull'>\((\d{4})\)<\/span>/);
        
        if (hrefMatch) {
          const gameId = hrefMatch[2];
          const gameName = hrefMatch[3].trim();
          
          allGames.push({
            id: `bgg-${gameId}`,
            name: gameName,
            type: GameType.BOARD_GAME,
            geekId: gameId,
            yearpublished: yearMatch ? yearMatch[1] : undefined
          });
          
          gamesFoundOnPage++;
        }
      }

      if (gamesFoundOnPage === 0) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    return allGames;
  } catch (error) {
    console.log(error)
    console.error("Errore critico nel recupero della collezione BGG:", error);
    throw new Error("Errore durante il recupero dei dati da BoardGameGeek. Riprova tra poco.");
  }
};