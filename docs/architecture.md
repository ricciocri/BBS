# Architettura Tecnica BBS

Il progetto BBS è costruito seguendo principi di modularità, performance e "AI-first" design.

## 📚 Stack Tecnologico
- **Frontend**: React 19 (ES6 Modules).
- **Styling**: Tailwind CSS 3.4 per un design responsivo e performante.
- **AI Engine**: Google Gemini API (Modelli 1.5/2.0 Flash e Pro) per l'elaborazione del linguaggio naturale e il recupero dati.
- **Persistence Layer**: Sistema ibrido con `ApiService` che utilizza LocalStorage come fallback in assenza di un backend raggiungibile.

## 🧠 Decisioni Architetturali Chiave

### 1. Integrazione AI come "Data Proxy"
Invece di combattere con le API XML legacy di BoardGameGeek (spesso soggette a timeout e problemi di CORS), utilizziamo **Gemini con Google Search Tool** come proxy. L'AI naviga le pagine web, estrae i dati strutturati (JSON) e li restituisce al frontend.
*Vantaggio*: Dati sempre aggiornati e formattati correttamente senza complicazioni lato server.

### 2. Design System "Glass-Fantasy"
Abbiamo scelto un'estetica che fonde il moderno **Glassmorphism** (trasparenze, blur) con elementi **Fantasy** (font Metamorphous).
*Vantaggio*: Crea un'atmosfera immersiva che risuona con il target di giocatori di ruolo e da tavolo.

### 3. Sistema di Karma Dinamico
Il calcolo del punteggio avviene lato client (ma progettato per essere validato dal server) aggregando:
- Hosting di tavoli (premio maggiore).
- Partecipazione attiva.
- Conversione di proposte in tavoli reali.
*Vantaggio*: Incentiva la creazione di contenuti invece del semplice consumo.

### 4. Gestione dello Stato e Navigazione
Utilizziamo un approccio **Single Page Application (SPA)** basato su un tipo `View`. Questo permette transizioni fluide e mantiene lo stato dell'utente senza ricaricamenti pesanti, essenziale per un'esperienza "app-like" su mobile.

## 🔒 Sicurezza
Le chiamate AI sono intermediate da un proxy (concettualmente `server.ts`) per proteggere le chiavi API e prevenire abusi tramite rate-limiting.
