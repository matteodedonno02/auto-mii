# apps/web — Mii Builder

Editor di Mii Wii: anteprima 2D dal vivo, tutti i campi del formato RCD/RSD,
import/export `.mii` e `.rsd`, autosalvataggio locale. UI in italiano,
predisposta per i18n (`src/lib/i18n.ts`).

## Avvio

```bash
pnpm install
pnpm sync-assets   # dalla radice: copia gli sprite in public/sprites (asset Nintendo, non tracciati)
pnpm dev
```

L'app è statica e funziona offline: nessuna `fetch`, nessun backend.

## Comandi

| Comando | Effetto |
|---|---|
| `pnpm dev` | server di sviluppo |
| `pnpm build` | `tsc -b` + build statica in `dist/` |
| `pnpm lint` | oxlint |
| `pnpm typecheck` | TypeScript strict |
| `pnpm test` | Vitest (jsdom) |

## Architettura

```
src/
  app/         guscio dell'app (header, layout)
  components/
    ui/        primitivi presentazionali: FieldRow, OptionGrid, SliderControl,
               ColorGrid, Toggle, CanvasStage, Panel, SpriteThumb, ...
    editor/    pannello controlli, rail delle sezioni, azioni header
    preview/   anteprima canvas + selettore sfondo
  editor/      config data-driven delle sezioni (sections.ts, types.ts)
  lib/         store Zustand, persistenza, file I/O, i18n, temi, sprite atlas
  test/        setup Vitest
```

Regole: le dipendenze puntano solo verso il basso (vedi `AGENTS.md`), il formato
Mii e il rendering vivono in `mii-core` e non si reimplementano qui. Aggiungere
un campo all'editor = aggiungere config in `src/editor/sections.ts`, non JSX.

## Rendering

`MiiPreview` è l'unico componente che chiama `renderMii` di `mii-core`; i
thumbnails delle opzioni usano `featureLayers` (stessa logica di tile/tint del
compositor) e la cache tint condivisa. Le 14 sheet vengono caricate una volta
sola in `lib/sprites.ts`.

## Privacy e licenze

Le foto (Step 2) non lasciano il dispositivo, ma qui non c'è ancora AI: solo
editing locale. Gli sprite dei Mii sono IP Nintendo e non sono inclusi nel
repository: `pnpm sync-assets` li copia da `assets/` in `public/sprites/`
(entrambe le cartelle sono ignorate da git).
