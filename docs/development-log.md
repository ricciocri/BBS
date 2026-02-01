# BBS Development Log - Bologna Boardgame Society

Questo diario documenta l'evoluzione tecnica e funzionale del progetto BBS.

---

## [v0.8.2] - 2026-01-23 (Ultimo Aggiornamento)
### 🚀 Nuove Funzionalità & Unificazione
- **Unified Advanced Filters**: I filtri avanzati sono stati estesi alla sezione Proposte, permettendo di filtrare per proponente, interessi personali e stato "nuovo" con la stessa UI dei tavoli.
- **Focus Mode**: Implementato il sistema di Pin/Unpin dell'header tramite icona a spilla flottante.
- **Marketplace delle Bozze**: Attivata la logica di negoziazione logistica asincrona (Drafts) all'interno del dettaglio proposte.

### 💅 UI & UX Refinement
- **Design Cleanup**: Rimossa l'enumerazione progressiva (`#1`, `#2`, ecc.) dalle card dei tavoli e delle proposte per un'estetica più pulita e professionale.
- **Session Persistence**: Implementato il recupero dello stato utente dal LocalStorage e la gestione del "Visit Boundary" per il calcolo dinamico del badge NEW.
- **Admin Dashboard**: Restyling del pulsante di accesso amministratore con label "ADMIN" e colore ambra.

---

## [v0.8.0] - 2026-01-20
### 🧠 Integrazione AI Avanzata (Gemini)
- **AI-First Data Proxy**: Utilizzo di Gemini come proxy verso BoardGameGeek e RPGGeek.
- **Pitch Generator**: Aggiunto il tool "IA Scrivi" nei form di creazione.
- **BGG Importer**: Funzione di importazione automatica della collezione tramite Google Search Tool.

---

## [v0.7.0] - 2026-01-15
### 🎭 Design System "Glass-Fantasy"
- **Visual Overhaul**: Transizione verso l'estetica Glassmorphism e font *Metamorphous*.
- **Karma System**: Algoritmo di calcolo del punteggio attività.

---

## [v0.5.0] - 2026-01-05
### 🎲 Core Logic & Proposals
- **Sistema di Proposte**: Introdotto il concetto di "Proposta" come stadio embrionale.
- **Persistence Layer**: Implementazione di `ApiService` con fallback su LocalStorage.