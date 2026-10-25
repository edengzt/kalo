# Kalo implementation plan

## Milestone 1 — foundation
- [x] Create React/TypeScript/Vite application baseline and isolated `.venv`.
- [x] Add responsive shell, five destinations, native IndexedDB schema, PWA assets.

## Milestone 2 — foods
- [x] Seed practical reference food catalog with distinct raw/cooked entries.
- [x] Search/filter; create, edit, duplicate, archive, delete; input validation.

## Milestone 3 — tracker
- [x] Daily dashboard, date navigation, meal logging/edit/removal, nutrient snapshots.
- [x] Calculation tests and persistence verification.

## Milestone 4 — quick logging and templates
- [x] Saved templates, copy day, and starter templates. (Recent/favourites remain a follow-up.)

## Milestone 5 — history and portability
- [x] Trends, editable goals, body measurements, JSON/CSV export/import.

## Milestone 6 — polish
- [x] Offline shell caching, responsive mobile shell, and setup/docs.
- [ ] Production build and browser test run (blocked: the environment cannot resolve `registry.npmjs.org`, so dependencies cannot be installed).

## Decisions / progress log
- Uses browser-native IndexedDB to avoid a persistence dependency and keep the app fully offline.
- Nutrition values in starter data are approximate reference estimates; user-label entries remain editable.
- Git initialization is blocked by this environment's `.git` filesystem permission, so commits require a writable Git metadata directory.
- `npm test` was attempted on 2026-10-23; it cannot start because `vitest` is not installed and npm's registry lookup returns `ENOTFOUND`.
