
// Nota: Questo file rappresenta il backend che verrebbe eseguito su Render/Railway
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
// In un ambiente reale qui useresti un driver DB come 'pg' o 'prisma'
// Per questo esempio manteniamo una simulazione di persistenza che il backend gestirebbe

const app = express();
app.use(cors());
app.use(express.json());

// Fix: Correct initialization of GoogleGenAI as per @google/genai coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Proxy per BGG Collection (evita CORS)
app.get('/api/bgg/collection/:username', async (req, res) => {
  const { username } = req.params;
  const { page } = req.query;
  try {
    let url = `https://boardgamegeek.com/collection/user/${username}?own=1&subtype=boardgame`;
    if (page) {
      url += `&page=${page}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `BGG returned status ${response.status}` });
    }

    const html = await response.text();
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero della collezione BGG" });
  }
});

// Proxy per Gemini (Sicurezza: la chiave API resta sul server)
app.post('/api/ai/describe', async (req, res) => {
  const { gameName, type } = req.body;
  try {
    const prompt = `Agisci come un esperto Game Master. Crea una descrizione coinvolgente in italiano (80 parole) per ${gameName} di tipo ${type}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: "Errore AI" });
  }
});

// Endpoint CRUD (Esempi)
app.get('/api/tables', async (req, res) => {
  // Qui: query al database PostgreSQL real
  // res.json(await db.tables.findMany());
});

app.post('/api/tables', async (req, res) => {
  // Qui: salvataggio su PostgreSQL
  // const newTable = await db.tables.create({ data: req.body });
  // res.status(201).json(newTable);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend attivo su porta ${PORT}`));
