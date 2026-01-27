# BBS Pending Defects & Proposed Solutions

Questo documento elenca le criticità tecniche e le lacune funzionali rilevate nella versione attuale (v0.8.2) della Bologna Boardgame Society, con le relative strategie di risoluzione previste per i prossimi sprint.

---

## 1. Componenti Isolati (Orphan Components)
### Difetto
I componenti `CalendarView` e `PollModule` sono presenti nel codice sorgente ma non sono importati né renderizzati in `App.tsx`.
*   **Impatto**: Funzionalità core (pianificazione mensile e votazione logistica) inaccessibili all'utente.
*   **Soluzione Proposta**: 
    1. Integrare `CalendarView` come modalità di visualizzazione alternativa in `App.tsx` (toggle Griglia/Calendario).
    2. Implementare il workflow dei sondaggi all'interno di `GameDetailView` per i tavoli in fase di organizzazione.

## 2. Persistenza delle Notifiche
### Difetto
Il sistema di notifiche è puramente volatile (gestito nello stato locale di React) e l'interfaccia `ApiService` non include metodi per il recupero o il salvataggio delle stesse.
*   **Impatto**: L'utente perde tutte le notifiche al refresh della pagina.
*   **Soluzione Proposta**: 
    1. Estendere `db/init.sql` con la tabella `notifications` (già predisposta ma non popolata).
    2. Aggiungere i metodi `getNotifications()` e `markAsRead()` in `api.ts`.
    3. Implementare un trigger nel backend che generi una notifica quando un utente si unisce a un tavolo.

## 3. Fragilità del Parsing AI (BGG Importer)
### Difetto
La funzione `fetchBggUserCollection` in `geekService.ts` si affida a `JSON.parse` diretto sull'output di Gemini. Le risposte AI possono contenere testo introduttivo o Markdown che causano il crash del parser.
*   **Impatto**: Fallimento intermittente dell'importazione della collezione BGG.
*   **Soluzione Proposta**: 
    1. Implementare una funzione di utility `extractJson(text: string)` che utilizzi Regex per isolare il blocco `[` o `{`.
    2. Aggiungere un meccanismo di retry con un prompt più restrittivo in caso di errore di parsing.

## 4. Incoerenza del Proxy AI
### Difetto
`geminiService.ts` tenta di contattare un endpoint locale `/api/ai/describe`, mentre `geekService.ts` utilizza direttamente il client SDK `@google/genai` lato frontend.
*   **Impatto**: In modalità demo/offline, il tasto "IA Scrivi" fallisce sistematicamente, mentre la ricerca BGG funziona.
*   **Soluzione Proposta**: 
    1. Standardizzare l'uso dell'SDK `@google/genai` direttamente nel frontend per la versione PWA (migliorando l'indipendenza dal server).
    2. Mantenere il proxy server-side solo per operazioni pesanti o che richiedono segreti non esponibili.

## 5. Admin Dashboard Incompleta
### Difetto
Le tab di gestione utenti, tavoli e proposte mostrano solo placeholder "In arrivo".
*   **Impatto**: L'amministratore non ha strumenti reali per moderare i contenuti se non tramite codice.
*   **Soluzione Proposta**: 
    1. Implementare tabelle dati semplificate in `AdminDashboard.tsx` che sfruttino le funzioni `onDeleteTable` e `onDeleteProposal` già passate come props.
    2. Aggiungere filtri per identificare tavoli "orfani" o obsoleti.

---

**Nota**: La risoluzione di questi difetti è prioritaria per il rilascio della versione 0.9.0 (Release Candidate).