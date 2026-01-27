# BBS PWA Architecture - Offline-First Strategy

BBS (Bologna Boardgame Society) è progettata come una **Progressive Web App (PWA)** ad alte prestazioni per garantire che i giocatori possano consultare i tavoli e le proprie collezioni anche all'interno dei locali storici di Bologna (ludoteche, bar, centri sociali) dove la copertura di rete è spesso instabile.

## 📱 Caratteristiche PWA
- **Installabilità**: Grazie al `manifest.json`, l'app può essere aggiunta alla home screen su iOS e Android, offrendo un'esperienza "full-screen" senza le barre del browser.
- **App Shell Architecture**: L'interfaccia (Header, Navigation, UI base) viene caricata istantaneamente, separando il caricamento dei componenti strutturali dai dati dinamici.
- **Responsive Design**: Ottimizzazione specifica per prevenire lo zoom accidentale su iOS (input a 16px) e gestione dinamica dell'header (Pin/Unpin).

## 💾 Strategia di Persistenza: Local-First
Il cuore della resilienza di BBS risiede nel suo `ApiService`, che implementa un pattern di **Automatic Fallback**:

1. **Tentativo Online**: L'app cerca di contattare il backend PostgreSQL per sincronizzare i dati in tempo reale.
2. **Fallback LocalStorage**: In caso di timeout o errore di rete (5xx/4xx), l'app commuta istantaneamente sul database locale del browser.
3. **Backup Silenzioso**: Ogni volta che l'utente è online, una copia speculare del database remoto viene salvata localmente per consultazioni future offline.

## 🔋 Ottimizzazione Batteria e Risorse
- **Lazy Loading Immagini**: Le copertine dei giochi (spesso pesanti, provenienti da BGG) vengono caricate solo quando entrano nel viewport.
- **Cache dei Metadati**: I dati tecnici dei giochi recuperati tramite Gemini vengono memorizzati per 24 ore per ridurre il numero di chiamate API e il consumo di traffico dati.

## 🛠️ Tecnologie Utilizzate
- **Service Workers**: (Pianificati per Q1 2026) Per il caching degli asset statici.
- **Web Manifest**: Configurazione icone e colori del brand (#0f172a).
- **LocalStorage API**: Utilizzata per la persistenza "demo-friendly" e offline.
