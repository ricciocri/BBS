# Architettura Tecnica BBS

Il progetto BBS è costruito seguendo principi di modularità, performance e "AI-first" design.

## 📚 Stack Tecnologico
- **Frontend**: React 19 (ES6 Modules).
- **Styling**: Tailwind CSS 3.4 per un design responsivo e performante.
- **AI Engine**: Google Gemini API (Modelli Flash e Pro) per l'elaborazione del linguaggio naturale e il recupero dati.
- **Persistence Layer**: Sistema ibrido con `ApiService` che utilizza LocalStorage come fallback atomico.

## 🧠 Decisioni Architetturali Chiave

### 1. Il Marketplace delle Bozze (`DraftTable`)
A differenza dei tavoli statici, le Proposte implementano un **Marketplace delle Bozze**. 
- **Logica**: Una `DraftTable` agisce come un 'estrattore di consenso'. Gli utenti non votano solo opzioni singole, ma propongono "pacchetti logistici" completi (Data + Ora + Luogo).
- **Conversione**: L'autore della proposta può "congelare" la bozza più promettente, trasformandola istantaneamente in un `GameTable` con i partecipanti già confermati.

### 2. Gestione dello Stato e Sessione
L'app utilizza un sistema di **Visit Boundary** salvato nel LocalStorage (`bbs_last_visit`).
- **Badge NEW**: Viene calcolato comparando la data di creazione dell'item con l'ultimo confine temporale memorizzato, garantendo che l'utente veda come "nuovo" solo ciò che è apparso dopo la sua ultima attività significativa.
- **Persistenza**: L'oggetto `currentUser` viene serializzato per mantenere l'accesso tra i refresh della pagina (SPA state recovery).

### 3. Focus Mode (Dynamic Header)
Implementata una logica di "Pinning" dell'header. Attraverso lo stato `isPinned`, l'utente può decidere se mantenere l'interfaccia di navigazione sempre accessibile o permettere all'app di nasconderla automaticamente durante lo scroll per massimizzare il focus sui contenuti di gioco.

### 4. Design System "Glass-Fantasy"
Estetica che fonde il moderno **Glassmorphism** (trasparenze, blur) con elementi **Fantasy** (font Metamorphous). La v0.8.2 ha introdotto un design più pulito eliminando gli indici cardinali dalle card per ridurre il rumore visivo.

## 🔒 Sicurezza
Le chiamate AI sono intermediate da un proxy (concettualmente `server.ts`) per proteggere le chiavi API e prevenire abusi tramite rate-limiting.