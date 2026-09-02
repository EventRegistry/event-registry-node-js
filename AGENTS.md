# Event Registry Node.js SDK — AGENTS.md

Instructions for AI coding agents working in this repository.

## Project Type

npm library (`eventregistry`) — TypeScript SDK wrapping the Event Registry REST API. Not a web app or server.

## Setup

```bash
npm install
npm run build
```

Node.js 24.11.0 is the supported development target. As of `10.0.0`, Node.js `>=18` is a **hard** runtime requirement (native `fetch`), not just an advisory `engines` floor; avoid introducing runtime APIs unavailable on Node 18. Optional `settings.json` at repo root with `{ "apiKey": "YOUR_KEY" }` for integration tests (file is gitignored).

Two public surfaces ship side by side and both must keep working: the **classic** class-based API (`Query*`/`Request*`/`Get*` + `execQuery()`) and the **ergonomic layer** (`src/helpers/*.ts` + `src/fluent/*.ts`, wired onto `EventRegistry` as `er.articles`, `er.events`, etc.). The classic API remains fully supported indefinitely — see [MIGRATION.md](MIGRATION.md).

## Before You Change Code

1. Read `CLAUDE.md` for architecture and conventions.
2. Match existing style: ES2020 compile target, dual CommonJS/ES module emit, `strict: true`, JSDoc on public APIs.
3. Keep changes minimal — this package is published to npm; avoid breaking the public API.
4. Adding ergonomic coverage? Wrap the existing classic class/method in `src/helpers/<domain>.ts` and `src/fluent/<domain>.ts`; don't build a second request path.

## Verification

```bash
npm run build       # must pass — emits dist/cjs and dist/esm
npm run lint        # ESLint 9
npm run test:unit   # offline Vitest unit suite (test/unit/**/*.spec.ts)
npm test            # offline Jasmine fixture replay (~111 specs)
npm run test:live   # live Jasmine against the Event Registry API
npm run test:record # live Jasmine that rewrites test/fixtures/
```

`npm test` is offline by default (`ER_TEST_MODE=replay`). Do not leave `fdescribe`/`fit` in test files.

## EventRegistry Defaults

| Option | Default |
|---|---|
| `host` | `https://eventregistry.org` |
| `hostAnalytics` | `https://analytics.eventregistry.org` |
| `logging` | `false` |
| `minDelayBetweenRequests` | `0.5` seconds |
| `repeatFailedRequestCount` | `-1` (retry indefinitely) |
| `allowUseOfArchive` | `true` |

## File Layout

| Path | Purpose |
|---|---|
| `src/` | Library source — edit here |
| `src/helpers/*.ts` | Ergonomic wrapper functions (`searchArticles`, `conceptUri`, …) — thin pass-throughs over classic classes |
| `src/fluent/*.ts` | Ergonomic fluent classes wired onto `EventRegistry` (`er.articles`, `er.events`, …) |
| `src/http.ts` | `fetch`-based HTTP transport (`erFetch`) — retry/timeout/mutex, replaces the old Axios client |
| `dist/cjs/`, `dist/esm/` | CommonJS and ES module output — do not edit; regenerate with `npm run build` |
| `test/spec/` | Jasmine live integration tests |
| `test/unit/` | Vitest offline unit tests |
| `examples/` | Usage examples (not published); lead with fluent/helpers, keep classic snippets labeled |
| `MIGRATION.md` | Consumer-facing upgrade guide — update when the public surface changes |
| `CHANGELOG.md` | User-facing changelog — update on every release |
| `package.json` | `"files": ["dist"]` — only dist is published |

## Common Tasks

| Task | Approach |
|---|---|
| Add query parameter | Extend the relevant `Query*` class in `src/query*.ts`, follow existing `setVal`/`addArrayVal` patterns from `QueryParamsBase` |
| Add result type | Add `Request*` class, export from `src/index.ts` |
| Add ergonomic coverage | Add a wrapper in `src/helpers/<domain>.ts` that delegates to the classic class, then a matching method in `src/fluent/<domain>.ts`; wire onto `EventRegistry` in `src/eventRegistry.ts`; export both from `src/index.ts` |
| Fix HTTP behaviour | Edit `src/http.ts` (transport) or `src/eventRegistry.ts` (client wiring) |
| Bump version | Update `package.json` version + `CHANGELOG.md` section (and `MIGRATION.md` if the public surface changed) |

## Do Not

- Commit `settings.json`, `logs/`, or `${workspaceFolder}/`
- Edit `dist/` directly
- Add dependencies without justification (library size matters)
- Imply the classic API is being phased out in docs or code comments — it is fully supported indefinitely
- Duplicate request-building logic between a helper/fluent wrapper and its underlying classic class
- Run `npm publish` unless explicitly asked

## Release Checklist

1. `npm run build && npm run lint && npm run test:unit`
2. `npm test` (fixture replay). Run `npm run test:live` only when credentials and network are available
3. Bump version in `package.json`
4. Add entry to `CHANGELOG.md`
5. Commit (only when user asks)
