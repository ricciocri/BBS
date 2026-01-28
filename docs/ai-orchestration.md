# BBS AI Orchestration: Gemini as Data Proxy

In BBS, l'intelligenza artificiale non è un semplice chatbot, ma un **Data Proxy** che media tra le richieste dell'utente e i database ludici esterni (BoardGameGeek e RPGGeek).

## 1. Ruoli e Modelli

Utilizziamo la suite **Gemini 3** per diverse finalità:
- **`gemini-3-flash-preview`**: Task veloci come la generazione di descrizioni (Pitch) o suggerimenti di gioco basati sul numero di partecipanti.
- **`gemini-3-pro-preview`**: Task complessi che richiedono il tool `googleSearch` per navigare e recuperare collezioni utenti o metadati tecnici precisi.

## 2. Strategia di Recupero Dati (Grounding)

Per superare i limiti delle API XML di BGG (lente e non CORS-friendly), istruiamo Gemini a:
1. Navigare all'URL specifico (es: `boardgamegeek.com/collection/user/username`).
2. Estrarre i dati visualizzati nella pagina.
3. Formattarli in JSON pronto per il frontend.

### Prompt di Sistema (Esempio per BGG Import):
> "Naviga ESCLUSIVAMENTE all'indirizzo 'https://boardgamegeek.com/collection/user/${username}'. Verifica l'identità dell'utente. Estrai i giochi 'Owned'. Restituisci ESCLUSIVAMENTE un array JSON. Non aggiungere commenti o Markdown."

## 3. Vincoli di Output JSON

Per garantire che il parsing in `geekService.ts` e `geminiService.ts` non fallisca, ogni prompt deve includere specifiche di schema:

- **MimeType**: Deve essere impostato `application/json` nel `generationConfig`.
- **Schema Obbligatorio**:
```json
{
  "id": "string (bgg-id)",
  "name": "string",
  "type": "BOARD_GAME | RPG",
  "difficulty": "number (float 1-5)",
  "duration": "number (minutes)"
}
```

## 4. AI Content Generation (Pitching)

Il servizio `describe` trasforma dati grezzi in contenuti marketing per la community:
- **Obiettivo**: Generare testi in italiano, tono amichevole ma epico.
- **Prompt**: "Crea un pitch di 80 parole per una sessione di [Gioco]. Evidenzia i punti di forza per un giocatore di Bologna."

## 5. Error Handling e Fallback

Se l'IA restituisce un formato non valido o non trova risultati:
1. **Sanitizzazione**: Il frontend tenta di estrarre il blocco JSON tramite Regex se il parser diretto fallisce.
2. **Mock Fallback**: Se l'IA è offline o la chiave è scaduta, il sistema utilizza i dati di `SAMPLE_GAMES` in `constants.tsx` per non interrompere l'esperienza utente.