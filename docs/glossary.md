# Glossario Tecnico e Funzionale BBS

Benvenuti nel documento di riferimento terminologico della **Bologna Boardgame Society (BBS)**.

---

## 🏗️ Core Domain

| Parola Chiave | Descrizione Funzionale | Riferimento Tipo (TS) |
| :--- | :--- | :--- |
| **Tavolo** | Una sessione di gioco confermata con logistica definita. | `GameTable` |
| **Proposta** | Un'idea di gioco lanciata per testare l'interesse. | `GameProposal` |
| **Bozza (Draft)** | Una specifica configurazione di data/luogo proposta all'interno di una Proposta. | `DraftTable` |
| **Marketplace** | L'area all'interno di una proposta dove gli utenti negoziano le diverse Bozze. | `ProposalPlanner` |
| **Sandbox** | Workspace collaborativo dove gli interessati raffinano i dettagli del gioco. | - |

---

## 🏆 Gamification

| Parola Chiave | Descrizione Funzionale | Riferimento Tipo (TS) |
| :--- | :--- | :--- |
| **Karma / XP** | Punteggio cumulativo ottenuto tramite azioni positive. | `userScore` |
| **Rank** | Posizione competitiva basata sull'attività del periodo. | `userRank` |
| **Visit Boundary** | Il timestamp dell'ultima visita usato per determinare cosa è "NEW". | `lastVisitBoundary` |

---

## 💻 Interfaccia & UX

| Parola Chiave | Descrizione Funzionale |
| :--- | :--- |
| **Focus Mode** | Modalità di visualizzazione che nasconde l'header durante lo scroll (Pin/Unpin). |
| **Glass-Fantasy** | Il design system ufficiale (Trasparenze + Estetica Fantasy). |
| **Compact View** | Modalità di visualizzazione a lista densa per utenti esperti. |
| **Sincronizzazione** | Stato della connessione tra il database locale e il server remoto. |

---
*Ultimo aggiornamento: 2026-01-23*