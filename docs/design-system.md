# BBS Design System: Glass-Fantasy

Il linguaggio visivo di **Bologna Boardgame Society (BBS)** è denominato **Glass-Fantasy**. L'obiettivo è coniugare la modernità delle interfacce SaaS (Software as a Service) con l'immaginario evocativo dei giochi di ruolo e da tavolo.

## 1. Fondamenta Visive (The Glass Layer)

Tutti i contenitori principali utilizzano la classe `.glass`, definita per creare profondità senza appesantire il layout.

### Specifiche Tecniche:
- **Sfondo**: `rgba(30, 41, 59, 0.7)` (Slate-800 con opacità 70%).
- **Sfocatura (Blur)**: `backdrop-filter: blur(12px)`.
- **Bordi**: `1px solid rgba(255, 255, 255, 0.1)`. Sui componenti attivi o hover, l'opacità del bordo sale a `0.3` o `0.5` con il colore semantico di riferimento.
- **Shadows**: Utilizzo di ombre colorate soffuse (`shadow-indigo-500/20`) per simulare l'emissione di luce magica/neon.

## 2. Semantica dei Colori

I colori non sono solo estetici ma fungono da guida per l'utente (Affordance):

| Categoria | Colore Tailwind | Codice HEX (approx) | Utilizzo |
| :--- | :--- | :--- | :--- |
| **GdR (RPG)** | `indigo-500` | `#6366f1` | Sessioni di ruolo, manuali, sistemi narrativi. |
| **GdT (Boardgame)** | `emerald-500` | `#10b981` | Giochi da tavolo, espansioni, piazzamento lavoratori. |
| **Proposte** | `amber-500` | `#f59e0b` | Idee in fase embrionale, sondaggi, interessi. |
| **Sistema/Alert** | `rose-500` | `#f43f5e` | Eliminazioni, errori, sessioni concluse. |
| **Background** | `slate-950` | `#020617` | Sfondo profondo per massimizzare il contrasto del vetro. |

## 3. Tipografia

- **UI & Dati**: `Inter` (Sans-serif). Massima leggibilità per orari, date e nomi giocatori.
- **Immersione**: `Metamorphous` (Fantasy). Utilizzato esclusivamente per titoli di primo livello, logo e intestazioni di moduli importanti.
- **Constraint**: Gli input su mobile devono avere `font-size: 16px` per prevenire lo zoom automatico di iOS.

## 4. Animazioni & Micro-interazioni

Le animazioni sono gestite tramite utility Tailwind e Keyframes personalizzati in `index.html`:

- **`animate-participant`**: Un effetto "pop-up" con rimbalzo (back-out) per l'ingresso dei nuovi giocatori in un tavolo.
- **`animate-count`**: Un leggero incremento di scala (bump) quando i contatori numerici cambiano.
- **`highlight-glow`**: Un respiro luminoso (pulsing shadow) applicato ai tavoli "NEW" o alle proposte che hanno raggiunto l'obiettivo di giocatori.
- **`hover:scale-110`**: Utilizzato sulle copertine dei giochi per dare un senso di interattività "fisica".

## 5. Stato dell'Header (Logic Overrides)

L'header segue regole di visibilità dinamica:
- **Top Zone (0-150px)**: Sempre visibile (`translateY(0)`).
- **Scrolling Down**: Nasconde (`translateY(-115%)`).
- **Scrolling Up**: Mostra con anticipo.
- **Focus Mode**: Se la "spilla" è attiva, l'header resta nascosto oltre i 150px di scroll.