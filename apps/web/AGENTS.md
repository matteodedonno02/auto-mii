# AGENTS.md — Frontend (`apps/web`)

Regole per agenti AI che lavorano sul frontend. Il formato Mii e il rendering vivono in
`packages/mii-core`: da qui si usano, mai si reimplementano.

## Stack

- Vite + React 19 + TypeScript strict. SPA statica, nessun backend a runtime.
- Stato: Zustand. Styling: Tailwind + helper `cn()`. Test: Vitest + Testing Library.
- Anteprima: Canvas 2D tramite `renderMii` di `mii-core`, nient'altro.

## Struttura

```
src/
  app/         layout e composizione delle pagine
  components/  ui/ (primitivi) · editor/ · preview/
  editor/      config delle sezioni, validazione UI
  lib/         store, persistenza, file I/O, i18n
  ai/          (Step 2) predictor, worker
```

## Ordine delle dipendenze (obbligatorio)

1. `mii-core` — codec, tabelle, renderer
2. `lib` — store, I/O, persistenza
3. `components/ui` — primitivi presentazionali
4. `components/editor`, `components/preview` — componenti composti
5. `app` — pagine

Le dipendenze puntano solo verso il basso, mai all'indietro.
`components/ui` non importa `mii-core`, `lib` né store.

## Ordine dei file

Contenuto del file, in quest'ordine: import → tipi → costanti → componente → helper → export.
Import a gruppi separati da riga vuota:

1. react e librerie esterne
2. `mii-core`
3. alias interni `@/...`
4. tipi (`import type`)

Niente percorsi relativi `../../`: si usa sempre l'alias `@/`.

## Componenti: riusabilità massima

- Un componente per file, PascalCase, named export, mai default export.
- Oltre ~150 righe si scompone; niente componenti monolite.
- Prima di scrivere UI: cerca in `components/ui`. Se esiste qualcosa di simile lo si estende, non si duplica.
- I primitivi (`FieldRow`, `OptionGrid`, `SliderControl`, `ColorGrid`, `Toggle`, `CanvasStage`, `Panel`) si scrivono una volta e si compongono ovunque.
- `components/ui` è presentazionale: solo props, zero store, zero logica Mii.
- Editor data-driven: ogni sezione e selettore è descritto in `editor/sections.ts` (config tipizzata) e reso da componenti generici. Aggiungere un campo = aggiungere config, mai JSX nuovo.
- Una sola `MiiPreview` che chiama `renderMii`; il rendering non si duplica mai.
- Props >2 livelli = si passa allo store, non si fora la gerarchia.

## Stato e dati

- Un solo store Zustand in `lib/store.ts`: i componenti leggono con selettori, scrivono con azioni. Lo stato duplicato si deriva, non si copia.
- Undo/redo centralizzato nello store (snapshot); mai nei componenti.
- Import/export file, autosave e `localStorage` restano in `lib/`.
- Nessuna `fetch`: l'app funziona offline.

## TypeScript

- `strict: true`, niente `any`. I tipi del Mii vengono da `mii-core`, mai ridefiniti qui.
- Props sempre con `interface ...Props`; `children` solo dove serve davvero.
- Range, opzioni e lookup vivono in `mii-core`/`editor/sections.ts`: niente numeri magici nel JSX.

## Test

- Ogni primitivo `ui/` ha un test di comportamento; l'editor un test integrazione modifica→export.
- Si testano comportamenti e golden file, non snapshot del DOM.

## Comandi

- `pnpm dev`, `build`, `lint`, `typecheck`, `test` da `apps/web` (o `pnpm --filter web ...` dalla root).
- Prima di considerare finito: `pnpm lint && pnpm typecheck && pnpm test`.

## Divieti

- Reimplementare bitfield, CRC, tabelle o compositing dentro `apps/web`.
- Duplicare liste di opzioni già presenti in `mii-core`.
- Leggere lo store dentro i primitivi `ui/`.
- Stili inline arbitrari quando esiste una classe/variante Tailwind.
