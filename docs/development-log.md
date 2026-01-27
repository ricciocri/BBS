# BBS Development Log - Bologna Boardgame Society

Questo diario documenta l'evoluzione tecnica e funzionale del progetto BBS, tracciando le sfide risolte e le decisioni di design prese durante il percorso verso la v1.0.

---

## [v0.8.2] - 2026-01-23 (Ultimo Aggiornamento)
### 💅 UI & UX Refinement
- **Profilo Utente**: Spostato il blocco profilo (Avatar, Rank, Score) sulla destra della barra inferiore dell'header per una gerarchia visiva più standardizzata e accessibile.
- **Admin Dashboard**: Restyling del pulsante di accesso amministratore. Ora è di colore giallo (amber), include l'icona a scudo (`fa-shield-halved`) e la label "ADMIN" per una distinzione immediata dai comandi utente.
- **Header Dynamics**: Ottimizzato il comportamento di "Pin/Unpin" dell'header per migliorare la navigazione su dispositivi mobile durante lo scroll lungo dei tavoli.

---

## [v0.8.0] - 2026-01-20
### 🧠 Integrazione AI Avanzata (Gemini)
- **AI-First Data Proxy**: Implementata la logica per utilizzare Gemini come proxy verso BoardGameGeek e RPGGeek. Risolti i problemi di CORS e timeout tipici delle API XML legacy.
- **Pitch Generator**: Aggiunto il tool "IA Scrivi" nei form di creazione. L'IA analizza il titolo del gioco e genera una descrizione coinvolgente adattata al pubblico di Bologna.
- **BGG Importer**: Creata la funzione di importazione automatica della collezione tramite Google Search Tool di Gemini, permettendo agli utenti di popolare il profilo in pochi secondi.

---

## [v0.7.0] - 2026-01-15
### 🎭 Design System "Glass-Fantasy"
- **Visual Overhaul**: Transizione verso un'estetica Glassmorphism combinata con il font *Metamorphous* per richiamare il mondo del gioco di ruolo.
- **Karma System**: Implementazione del primo algoritmo di calcolo del punteggio attività (Host, Play, Idea, Star).
- **Responsive Tables**: Ottimizzazione delle TableCard per visualizzazione a griglia variabile (da 1 a 4 colonne in base alla risoluzione).

---

## [v0.5.0] - 2026-01-05
### 🎲 Core Logic & Proposals
- **Sistema di Proposte**: Introdotto il concetto di "Proposta" come stadio embrionale di un tavolo.
- **Conversione Proposta -> Tavolo**: Workflow automatico che trasferisce i partecipanti interessati direttamente nel nuovo tavolo aperto.
- **Persistence Layer**: Implementazione di `ApiService` con logica di fallback su LocalStorage per garantire il funzionamento offline/demo senza backend attivo.

---

## [v0.1.0] - 2025-12-20
### 🏗 Foundation
- Setup dell'ambiente React 19 ed ES6 modules.
- Definizione dei tipi TypeScript fondamentali (`GameTable`, `Player`, `View`).
- Creazione della struttura mock iniziale e navigazione SPA basata su stati.
