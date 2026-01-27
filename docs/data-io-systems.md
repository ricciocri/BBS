# BBS Data I/O Architecture - Deep Dive

In BBS, la gestione del flusso di dati (Input ed Output) segue una filosofia di **Resilienza e Strutturazione Intelligente**. Data la complessità delle fonti esterne (BGG/RPGGeek) e la necessità di operare in condizioni di rete instabili, abbiamo implementato sistemi specifici per l'ingresso e l'uscita delle informazioni.

## 📥 Sistemi di Ingresso (Data Inbound)

Il sistema di input non si limita alla semplice ricezione di form, ma agisce come un catalizzatore di dati strutturati attraverso tre canali:

### 1. AI-Enhanced Manual Entry (Smart Forms)
Quando un utente inserisce un tavolo o una proposta, l'app non accetta solo testo passivo. Il sistema interroga **Gemini (Flash)** per trasformare un semplice titolo in un "Pitch" di gioco accattivante.
- **Flusso**: Utente -> Titolo Gioco -> Prompt Contestuale -> Gemini -> Descrizione Formattata.
- **Considerazione**: Questo riduce l'attrito per l'utente, migliorando la qualità media dei contenuti testuali sulla piattaforma.

### 2. The Gemini Proxy (External Data Import)
Invece di utilizzare chiamate API dirette (spesso bloccate da CORS o limitate nel parsing), BBS usa Gemini come un **estrattore semantico**.
- **Funzionamento**: L'app chiede a Gemini di navigare su BGG e restituire esclusivamente JSON. 
- **Perché**: Questo approccio ci permette di "ripulire" i dati grezzi dei database ludici mondiali, ottenendo metadati puliti (rank, weight, durata) pronti per il filtraggio avanzato senza dover scrivere complessi parser XML.

### 3. BGG Collection Importer
L'acquisizione massiva dei dati della collezione utente avviene tramite lo strumento `googleSearch` integrato nei modelli Gemini Pro. 
- **Validazione**: Il sistema verifica l'esatta corrispondenza dello username per evitare omonimie, garantendo che l'input della collezione sia accurato e non inquinato da risultati di ricerca generici.

## 📤 Sistemi di Uscita e Persistenza (Data Outbound)

La gestione dell'output dei dati (salvataggio e sincronizzazione) è affidata a un sistema ibrido coordinato dall'`ApiService`.

### 1. Strategia di Persistenza Ibrida (Automatic Fallback)
Il sistema di salvataggio opera su due livelli paralleli:
- **Primary (Remote)**: Tentativo di salvataggio su database PostgreSQL tramite API Express. Garantisce la coerenza globale tra tutti i membri della Society.
- **Secondary (Local)**: In caso di errore 5xx o assenza di rete, il sistema commuta istantaneamente su `LocalStorage`. 
- **Mirroring**: Ogni azione di output riuscita verso il server aggiorna anche la copia locale, assicurando che l'utente abbia sempre l'ultima versione dei propri dati "in tasca".

### 2. Sincronizzazione Silenziosa
L'interfaccia utente (Header) mostra lo stato di sincronizzazione in tempo reale. Le azioni di output vengono messe in coda o eseguite istantaneamente a seconda dello stato di `isSyncing`. 
- **Integrità**: Questo previene la perdita di dati durante la creazione di tavoli complessi se la connessione cade proprio al momento del "Submit".

## 🛡️ Considerazioni sulla Qualità del Dato
Ogni dato in ingresso viene tipizzato rigorosamente tramite TypeScript (`types.ts`). Questo garantisce che, indipendentemente dalla fonte (IA, Utente o DB Locale), l'applicazione riceva sempre oggetti conformi (es: `GameTable`), evitando crash dell'interfaccia dovuti a campi mancanti o formattati in modo errato.
