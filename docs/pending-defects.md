# BBS Pending Defects & Proposed Solutions

Criticità tecniche e lacune rilevate nella versione v0.8.2.

---

## 1. Persistenza delle Notifiche
### Difetto
Il sistema di notifiche è puramente volatile (stato locale React).
*   **Impatto**: L'utente perde gli avvisi al refresh della pagina.
*   **Soluzione**: Integrare la tabella `notifications` nel `ApiService` e sincronizzarla con il backend.

## 2. Fragilità del Parsing AI (BGG Importer)
### Difetto
La funzione `fetchBggUserCollection` può fallire se Gemini aggiunge testo extra al JSON.
*   **Impatto**: Crash intermittenti durante l'importazione collezione.
*   **Soluzione**: Implementare `extractJson()` con Regex per isolare il blocco dati.

## 3. Gestione Scadenza Sessioni LocalStorage
### Difetto
I dati dei tavoli conclusi rimangono nel LocalStorage potenzialmente all'infinito.
*   **Impatto**: Rallentamento progressivo del caricamento app (Memory leak).
*   **Soluzione**: Implementare un worker di cleanup che elimini i tavoli più vecchi di 30 giorni dal database locale.

## 4. Admin Dashboard - Sezioni Incomplete
### Difetto
Le tab "Users" e "Tables" nella dashboard admin mostrano solo placeholder.
*   **Impatto**: L'amministratore non ha strumenti visuali per la moderazione di massa.
*   **Soluzione**: Implementare le tabelle dati con azioni di eliminazione rapida.

---
**Nota**: Il difetto "Incoerenza Filtri Proposte" è stato risolto nella v0.8.2 tramite l'unificazione dei componenti di filtraggio.