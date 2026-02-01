
# BBS Testing Strategy & QA

La natura ibrida di BBS (Online/Offline) e l'integrazione con l'IA richiedono una strategia di testing specifica per prevenire la perdita di dati e garantire una UX fluida per l'intera community.

## 1. Testing della Persistenza (Offline-First)

Il sistema di **Automatic Fallback** deve essere testato simulando fallimenti di rete:
- **Procedura**: 
    1. Aprire l'app e loggarsi.
    2. Disattivare la connessione (Network: Offline nei DevTools).
    3. Creare un tavolo o una proposta.
    4. Verificare in `Application -> Local Storage` che l'oggetto sia stato salvato.
    5. Riattivare la rete e verificare (prossima release) che il flag `isSyncing` si attivi correttamente.

## 2. Validazione Flussi di Business

### Conversione Proposta -> Tavolo:
- **Test Case**: Una proposta con 3 interessati deve generare un tavolo pre-compilato.
- **Verifica**: 
    - Il `hostId` deve corrispondere all'utente loggato.
    - I `currentPlayers` del tavolo devono contenere l'array degli utenti che avevano espresso interesse nella proposta.
    - La proposta originale deve essere marcata o eliminata (in base alla configurazione admin).

### Sistema di Votazione (Polls):
- **Test Case**: Un utente non può votare due volte la stessa opzione.
- **Verifica**: L'interfaccia deve riflettere il voto istantaneamente (Optimistic UI) e il server deve ricevere l'array `votes` aggiornato.

## 3. Responsività e Mobile QA

BBS è una PWA, quindi il test sui dispositivi fisici è prioritario:

- **iOS Zoom Prevention**: Verificare che cliccando su qualsiasi campo di testo (titolo, descrizione, filtri), il browser Safari non effettui lo zoom automatico (richiede font-size >= 16px).
- **Header Visibility**: 
    - Scrollare oltre 150px: l'header deve sparire (se scendendo) o apparire (se salendo).
    - Testare la "Spilla" (Focus Mode): se attiva, l'header non deve mai coprire il contenuto durante lo scroll, eccetto nella zona 0-150px.
- **Touch Targets**: Tutti i pulsanti di azione (`Partecipa`, `Interessato`) devono avere un'area di tocco minima di 44x44px.

## 4. Validazione Output AI

Poiché l'IA è probabilistica, dobbiamo testare i "casi limite" del prompter:
- **Nomi Giochi Ambigui**: Testare la ricerca con nomi come "Dune" (che ha decine di versioni) e verificare che l'IA chieda chiarimenti o mostri i risultati più popolari.
- **JSON Integrity**: Verificare che l'importazione di una collezione BGG da 500+ titoli non mandi in crash il browser (gestione del chunking o del limite di memoria del LocalStorage).

## 5. Regressione Admin

- Verificare che un utente non-admin non possa accedere all'URL o al componente `AdminDashboard`.
- Testare l'eliminazione "Hard Delete" di un tavolo da parte di un Admin e assicurarsi che scompaia simultaneamente dalla Home di tutti gli altri client connessi nella community.
