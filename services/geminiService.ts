
import { GoogleGenAI } from "@google/genai";

// Initialize with named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameDescription = async (gameName: string, type: string): Promise<string> => {
  try {
    const prompt = `Agisci come un esperto Game Master e narratore. Crea una descrizione coinvolgente e professionale in italiano (circa 80 parole) per una sessione di gioco di tipo ${type}. 
    Il gioco è "${gameName}". 
    Usa un tono epico e misterioso se è un gioco di ruolo, o un tono strategico, competitivo ed entusiasmante se è un gioco da tavolo. 
    Non includere placeholder o parentesi. Inizia direttamente con la narrazione.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Impossibile generare la descrizione al momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Errore nella generazione della descrizione.";
  }
};

export const suggestGames = async (playerCount: number, type: string): Promise<string[]> => {
  try {
    const prompt = `Suggerisci 5 giochi famosi di tipo ${type} ideali per ${playerCount} giocatori. Restituisci solo i titoli dei giochi come elenco puntato in italiano.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "";
    return text.split('\n').filter(line => line.trim() !== '').map(line => line.replace(/^[0-9.-]+\s*/, '').trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
