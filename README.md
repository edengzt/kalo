# Kalo

An offline-first, mobile nutrition journal. It stores foods, log entries (with immutable nutrition snapshots), templates, goals, and measurements in the browser's IndexedDB.

## Run

```sh
npm install
npm run dev
```

The local Python `.venv` is included as an isolated environment placeholder; the app itself is TypeScript/React and uses Node tooling.

## Verify

```sh
npm test
npm run build
```

## Deploy

Build with `npm run build` and deploy the `dist/` directory to any static HTTPS host. HTTPS is required for service worker/offline behavior. On iPhone Safari, use Share → Add to Home Screen after first load.

## Product notes

- Starter reference nutrition values are approximate and intentionally marked as reference data. Enter a branded food label as its own item rather than overwriting a reference food.
- Raw/cooked and dry/cooked foods are distinct catalog entries. Kalo never assumes a conversion ratio.
- Catalog editing or deletion does not rewrite logged meal history; entries save a nutrition snapshot.
- The import accepts Kalo v1 JSON exports and validates the backup shape before importing. Export a backup before importing another one.
- Measurements are indirect progress indicators; Kalo does not infer or claim visceral-fat changes.
