
# Glossario Tecnico e Funzionale BBS

Benvenuti nel documento di riferimento terminologico della **Bologna Boardgame Society (BBS)**. Questo glossario garantisce la coerenza tra il linguaggio parlato dai membri della community, le interfacce utente (UI) e il codice sorgente (TypeScript).

---

## 🏗️ Core Domain
*Logica centrale della gestione delle sessioni di gioco.*

| Parola Chiave | Descrizione Funzionale | Riferimento Tipo (TS) |
| :--- | :--- | :--- |
| **Tavolo** | Una sessione di gioco confermata con data, ora e luogo definiti. | `GameTable` |
| **Proposta** | Un'idea di gioco lanciata da un membro per testare l'interesse prima della conferma. | `GameProposal` |
| **Sandbox** | Workspace collaborativo (Proposal Planner) dove gli interessati negoziano dettagli logistici. | `ProposalPlanner` (Component) |
| **Partecipante** | Utente che ha confermato la presenza a un Tavolo o espresso interesse per una Proposta. | `Player` / `currentPlayers` |
| **Host** | Il proprietario e organizzatore responsabile della gestione di un Tavolo o di una Proposta. | `hostId` (in `GameTable`) |

---

## 🏆 Gamification
*Sistemi di incentivazione, reputazione e progressione utenti.*

| Parola Chiave | Descrizione Funzionale | Riferimento Tipo (TS) |
| :--- | :--- | :--- |
| **Karma / XP** | Punteggio cumulativo ottenuto tramite azioni positive (hosting, partecipazione). | `userScore` |
| **Rank** | Posizione competitiva globale dell'utente basata sul punteggio Karma nel periodo. | `userRank` |
| **Grado** | Etichetta narrativa associata alla progressione (es. Novizio, Leggenda). | `levelInfo.label` |
| **Livello** | Valore numerico (1-5) che rappresenta lo scaglione di esperienza raggiunto. | `levelInfo.level` |

---

## 📦 Logistica
*Integrazione con fonti dati esterne e specifiche tecniche dei titoli.*

| Parola Chiave | Descrizione Funzionale | Riferimento Tipo (TS) |
| :--- | :--- | :--- |
| **GeekId** | ID univoco che collega il gioco ai database globali BGG o RPGGeek. | `geekId` |
| **BGG / RPGGeek** | Database esterni utilizzati come fonte di verità per i metadati dei giochi. | `geekService` |
| **Sistema** | Il regolamento specifico utilizzato per una sessione di Gioco di Ruolo (es. D&D 5e). | `system` (in `GameTable`) |
| **Location** | Il luogo fisico (ludoteca, bar) o la piattaforma digitale per la sessione. | `location` |

---

## 🔎 Analisi delle Incoerenze (Parole Orfane)

Alcuni termini utilizzati nell'applicazione non appartengono chiaramente ai gruppi sopra indicati. Di seguito l'analisi e la proposta di ricollocamento.

### Parole Chiave Isolate

| Termine | Significato Attuale | Gruppo Suggerito | Perché? |
| :--- | :--- | :--- | :--- |
| **Pitch IA** | Tool di generazione automatica delle descrizioni tramite Gemini. | **AI Orchestration** | Rappresenta un servizio esterno di supporto alla creazione di contenuti. |
| **Focus Mode** | Funzionalità di UI (Pin Header) per nascondere l'interfaccia durante lo scroll. | **UI/UX Framework** | È una preferenza di visualizzazione pura, slegata dal dominio ludico. |
| **Sincronizzazione** | Indicatore di stato del collegamento tra client (LocalStorage) e server (API). | **Infrastruttura** | Gestisce la persistenza del dato e la resilienza offline-first. |
| **Community BBS** | Riferimento alla pianificazione e attività collettive della Society. | **Core Domain** | Sostituisce il termine legacy 'Gilda'. |

### Raccomandazioni
Per mantenere l'architettura pulita e scalabile, si suggerisce di:
1. Creare un nuovo gruppo **"Servizi di Supporto"** che includa *Pitch IA* e *Sincronizzazione*.
2. Formalizzare il gruppo **"Interfaccia"** per termini tecnici come *Focus Mode* o *View*.
3. Evitare l'uso del termine "Sessione" come sinonimo di "Tavolo" nei tipi TypeScript, mantenendo la distinzione chiara come definito nel Core Domain.

---
*Ultimo aggiornamento: 2026-01-23*
