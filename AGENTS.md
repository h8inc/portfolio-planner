# Engineering Rules — Stack Compare

Rules for any AI agent (or human) contributing to this project.

## 1. Scope discipline

- This project is **Stack Compare** only. Do **not** touch `../btc-planner` — it is the legacy predecessor and must remain unchanged.
- Do not add backend code. This is a client-only app. If persistence is needed beyond `localStorage`, discuss first.

## 2. TypeScript

- **Strict mode is on.** No `any` without a comment explaining why.
- Shared types live in `src/types/index.ts`. Import from there; do not redeclare inline.
- Prefer discriminated unions over boolean flags for asset-class variants.
- Use `readonly` for config and MC result shapes.

## 3. File structure

- `src/config/` — pure data (asset classes, correlations, rules). No React, no side effects.
- `src/engines/` — pure TypeScript simulation math. No React, no DOM.
- `src/hooks/` — React hooks. May use storage / workers.
- `src/components/` — React UI only. No simulation math.
- `src/utils/` — small, pure helpers.
- Keep the simulation math **fully decoupled from React**. It should be possible to import any engine function into a Node script and run it.

## 4. Monte Carlo engine rules

- All RNG must be seeded. No `Math.random()` directly — use the seeded PRNG in `src/engines/rng.ts`.
- Engines take plain options objects in, return plain result objects out. No side effects, no I/O.
- A simulation must be deterministic given the same seed + inputs.
- Default path count is **10,000**. Reduce only for fast preview runs, never silently.
- Correlated paths must go through the Cholesky path in `src/engines/gbm.ts` — do not multi-sample independent normals and pretend they're correlated.

## 5. Web Worker rules

- All MC runs must go through `src/engines/mc.worker.ts`. Never block the main thread with a long simulation.
- Messages are typed end-to-end (request + response). See `src/types/index.ts`.
- The worker must never import React or DOM APIs.

## 6. Persistence

- All writes to `localStorage` go through `src/utils/storage.ts`. No direct `window.localStorage` calls elsewhere.
- The schema has a `version` field. When it changes, write a migration in `storage.ts`.
- Exported JSON must be human-readable (pretty-printed, stable key order).

## 7. UI conventions

- **D3 for charts** — no chart libraries. Keep charts in `src/components/charts/`.
- **Design tokens** — colors, spacing, type sizes live in `src/utils/tokens.ts`. Reference tokens; don't hardcode hex values in components.
- **Inline styles or CSS modules** — either is fine, but stay consistent within a component tree. No CSS-in-JS libraries.
- **Responsive by default** — layouts must work at ≥ 375px width. Mobile polish is later; no horizontal scroll is required.
- **Emoji-free UI** unless the user explicitly asks for them.

## 8. Code style

- No code comments that narrate what the code does. Comments explain **why**, not what.
- No files longer than ~400 lines. Split components/engines before that.
- Use named exports. Avoid default exports except for React component files.
- Prefer `const` arrow functions for React components.

## 9. Testing

- No test framework in v1. When added (Vitest recommended), engines must have deterministic tests (seeded RNG).
- Before merging anything: `npm run build` must succeed, `npm run lint` must be clean.

## 10. Git hygiene

- Never commit without user request.
- Never push to remote without user request.
- `.gitignore` already excludes `node_modules`, `dist`, `.env*`.

## 11. Data integrity

- Historical CAGR and volatility values in `src/config/assetClasses.ts` must cite a source in a comment.
- Correlation values in `src/config/correlations.ts` must cite a source.
- Do not invent numbers silently.

## 12. Performance

- Fan-chart rendering must stay smooth up to 10 assets × 120 monthly periods × 5 percentile lines.
- Worker simulation for a single asset over 10 years at 10k paths should complete in < 2s on a modern laptop.
- Do not eagerly re-run MC on every slider change. The user clicks "Run" to trigger simulation.

## 13. Error handling

- All worker errors must be surfaced to the UI, not swallowed.
- `localStorage` reads must tolerate missing / corrupt data and fall back to defaults.
