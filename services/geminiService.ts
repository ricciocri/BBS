
// Ora il frontend non interroga più direttamente Google, ma il nostro backend sicuro
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : '/api';

export const generateGameDescription = async (gameName: string, type: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/describe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName, type }),
    });
    
    const data = await response.json();
    return data.text || "Impossibile generare la descrizione.";
  } catch (error) {
    console.error("Errore Proxy AI:", error);
    return "Errore nella comunicazione con il server AI.";
  }
};

export const suggestGames = async (playerCount: number, type: string): Promise<string[]> => {
  // Simile implementazione via backend...
  return ["Dungeons & Dragons", "Pathfinder", "Cyberpunk Red"]; 
};
