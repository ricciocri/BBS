# BBS Roadmap - Bologna Boardgame Society

Benvenuti nel piano di sviluppo di **BBS**, la piattaforma definitiva per la gestione delle community di gioco a Bologna.

## 🎯 Visione
Creare un ecosistema digitale elegante e funzionale che faciliti l'incontro tra giocatori, la scoperta di nuovi titoli e la crescita della community locale attraverso un sistema di reputazione (Karma).

## 🚀 Stato Attuale (v0.8.2 - Beta Refined)
Cosa è già implementato e funzionante:
- **Gestione Tavoli**: Creazione, modifica e partecipazione a sessioni di GdR e GdT.
- **Marketplace delle Bozze**: Workflow avanzato per negoziare logistica (date/luoghi) all'interno delle proposte.
- **Persistenza Sessione**: Salvataggio automatico dell'utente e confine temporale "Last Visit" per il badge NEW.
- **Filtri Avanzati Unificati**: Motore di ricerca potente disponibile sia per i Tavoli che per le Proposte.
- **Integrazione Geek (BGG/RPGGeek)**: Ricerca automatizzata di titoli e recupero metadati (difficoltà, durata, anno).
- **AI-Powered**: Generazione di descrizioni e "pitch" di gioco tramite Gemini Flash.
- **Ranking & Karma**: Sistema di punteggio dinamico che premia host e giocatori attivi.
- **Clean UI**: Design minimale con rimozione dell'enumerazione progressiva per dare respiro ai contenuti.

## 🛠 Prossimi Passi (Roadmap)

### Q1 2026: Consolidamento & Real-time
- [ ] **Backend Real-time**: Transizione completa da LocalStorage a PostgreSQL/Node.js per sincronizzazione multi-utente.
- [ ] **Sistema di Chat**: Canale dedicato per ogni tavolo aperto per coordinare la logistica dell'ultimo minuto.
- [ ] **Cleanup Sessioni**: Sistema di gestione automatica per la pulizia delle sessioni scadute nel database locale.

### Q2 2026: Espansione Sociale
- [ ] **Notifiche Push**: Avvisi su smartphone quando qualcuno si unisce a un tuo tavolo o una bozza viene approvata.
- [ ] **Badge & Achievement**: Sblocco di icone speciali nel profilo per traguardi specifici (es. "Master Leggendario").
- [ ] **Export Calendario**: Sincronizzazione automatica dei tavoli con Google Calendar/iCal.

### Q3 2026: Community & Marketplace
- [ ] **Mercatino dell'Usato**: Sezione per lo scambio/vendita di giochi tra membri della community.
- [ ] **Tornei**: Modulo avanzato per la gestione di bracket e classifiche per tornei competitivi.