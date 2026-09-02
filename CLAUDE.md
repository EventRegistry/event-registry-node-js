# Event Registry Node.js SDK — CLAUDE.md

## Overview

TypeScript SDK for the [Event Registry / NewsAPI.ai](https://eventregistry.org) REST API. Published on npm as `eventregistry`. Mirrors the [Python SDK](https://github.com/EventRegistry/event-registry-python) API surface.

This is a **library**, not a server. All HTTP calls go to Event Registry hosts (`eventregistry.org`, `analytics.eventregistry.org`).

Node.js **24.11.0** is the supported development target (see `.nvmrc`). As of `10.0.0`, the package's `engines` declaration is a **hard floor of Node.js >=18** (the HTTP layer requires native `fetch`); do not introduce runtime APIs unavailable on Node 18.

Two public API surfaces coexist and must both keep working: the **classic** class-based API (`Query*`/`Request*`/`Get*` + `execQuery()`) and the **ergonomic layer** (`src/helpers/*.ts` functions + `src/fluent/*.ts` classes wired onto `EventRegistry` as `er.articles`, `er.events`, etc.). The ergonomic layer is a thin wrapper — every helper/fluent method delegates to a classic class internally; never duplicate request-building logic between the two.

## Commands

```bash
npm install          # install dependencies
npm run build        # compile src/ → dist/cjs and dist/esm
npm run build:watch  # incremental compile
npm run lint         # ESLint 9 on src/
npm run test:unit    # run the offline Vitest unit suite (test/unit/**/*.spec.ts)
npm test             # compile tests, then run offline Jasmine fixture replay
npm run test:live    # Jasmine against the live Event Registry API
npm run test:record  # live Jasmine that rewrites test/fixtures/
```

`npm test` is offline by default (`ER_TEST_MODE=replay`). A `settings.json` in the project root (gitignored) can supply `apiKey` for `test:live` / `test:record`.

## Architecture

```
src/index.ts          # public exports (everything consumers import)
src/eventRegistry.ts  # EventRegistry client — HTTP, retries, rate limiting, URI helpers, wires up fluent namespaces
src/http.ts           # fetch-based HTTP transport (erFetch) — retry/timeout/mutex parity with the old Axios client
src/base.ts           # QueryParamsBase, QueryItems ($and/$or), date encoding, sleep()
src/query.ts          # BaseQuery, CombinedQuery, complex query JSON wrappers
src/queryArticles.ts  # QueryArticles, QueryArticlesIter, RequestArticles* result types
src/queryEvents.ts    # QueryEvents, QueryEventsIter, RequestEvents* result types
src/queryEvent.ts     # single-event queries and iterators
src/queryArticle.ts   # single-article queries
src/queryMentions.ts  # mentions queries (beta endpoint)
src/queryStory.ts     # story queries
src/returnInfo.ts     # ReturnInfo + *InfoFlags (controls response field selection)
src/analytics.ts      # analytics host queries
src/trends.ts         # trending concepts/categories
src/counts.ts         # mention counts
src/dailyShares.ts    # top shared articles/events
src/info.ts           # GetSourceInfo, GetConceptInfo, etc.
src/recent.ts         # GetRecentArticles, GetRecentEvents
src/topicPage.ts      # TopicPage builder
src/topicPages.ts     # TopicPages listing (getMyTopicPages)
src/eventForText.ts   # GetEventForText
src/logger.ts         # lightweight dependency-free Logger, LogLevel enum (Winston removed in 10.0.0)
src/types.ts          # ER namespace (Config, Article, Event, …)
src/helpers/*.ts       # ergonomic wrapper functions (searchArticles, conceptUri, …) — one file per domain, each a thin pass-through over the classic classes above
src/fluent/*.ts        # ergonomic fluent classes (ArticlesFluent, EventsFluent, …) wired onto EventRegistry as er.articles, er.events, etc.
```

Compiled output: `dist/cjs/` (CommonJS + declarations) and `dist/esm/` (ES modules). Both are published through package exports; consumers use the same `eventregistry` package name with `require` or `import`.

## Core Usage Pattern

Two supported styles — see [MIGRATION.md](MIGRATION.md) for the consumer-facing version of this section.

**Classic (fully supported, same Query*/execQuery pattern as `9.1.1`):**
1. Create `EventRegistry` with optional `{ apiKey, host, logging, … }`.
2. Build a query class (`QueryArticles`, `QueryEvents`, …) with filter params.
3. Attach a result request (`RequestArticlesInfo`, `RequestEventsUriWgtList`, …) via `setRequestedResult()`.
4. Call `er.execQuery(q)` — returns a Promise with the API response.

**Iterators** (`QueryArticlesIter`, `QueryEventsIter`, …) paginate automatically. They support `for await` and a callback-based `execQuery()`.

**URI helpers** on `EventRegistry`: `getConceptUri()`, `getCategoryUri()`, `getSourceUri()`, etc. — resolve labels to ER URIs before querying (`undefined` on no match).

**Ergonomic layer (`10.0.0`+, additive):**
1. Use a domain namespace on `er` (`er.articles`, `er.events`, `er.mentions`, `er.stories`, `er.trends`, `er.counts`, `er.shares`, `er.recent`, `er.info`, `er.topicPages`, `er.analytics`, `er.eventForText`) or import the matching helper function (`searchArticles`, `getEvent`, `annotateText`, …) directly from `src/index.ts`.
2. Search-style namespaces follow `.search(args).info(opts).exec()`; single-item and iterator methods are `.get(uri)` / `.iterate(args)`.
3. URI resolution (`er.concepts.uri`, `conceptUri()`, and the `category`/`source`/`sourceGroup`/`location`/`eventType`/`conceptClass`/`author` equivalents) **throws** on no match instead of resolving to `undefined` — different from the classic `EventRegistry.get*Uri()` behavior above, by design.
4. Every helper/fluent method is a pass-through: no new HTTP paths, same `Query*`/`Get*`/`Request*` class underneath. When adding new ergonomic coverage, wrap the existing classic path — don't reimplement request construction.

## Configuration

`EventRegistry` constructor merges three layers (later wins):

1. Built-in defaults (`host`, `minDelayBetweenRequests`, `repeatFailedRequestCount`, …)
2. `settings.json` in cwd (if present) — typically `{ "apiKey": "…" }`
3. Constructor argument

Key options (`ER.Config` in `src/types.ts`):

| Option | Default | Purpose |
|---|---|---|
| `apiKey` | — | API key (free key from eventregistry.org) |
| `host` | `https://eventregistry.org` | Main API host; constructor value can override |
| `hostAnalytics` | `https://analytics.eventregistry.org` | Analytics host; constructor value can override |
| `logging` | `false` | Write logs to `logs/` directory |
| `minDelayBetweenRequests` | `0.5` (seconds) | Throttle between requests |
| `repeatFailedRequestCount` | `-1` | Retry transient failures indefinitely |
| `allowUseOfArchive` | `true` | Allow archive queries on iterators |

Logging level: `er.logger.logLevel = LogLevel.DEBUG` after construction.

## TypeScript Configuration

- Target: **ES2020**, with dual **CommonJS** and **ES module** builds driven by `tsconfig.cjs.json` and `tsconfig.esm.json`
- As of `10.0.0`, the project compiles under **`strict: true`**. This tightens emitted `.d.ts` typings for consumers (see [MIGRATION.md](MIGRATION.md#3-typescript-strict-mode-and-tighter-dts)) but does not change runtime behavior. Keep new code strict-clean; don't reach for `any`/non-null assertions to silence errors — narrow or type properly instead.
- `tsconfig.json` provides shared options and includes `src/index.ts` plus entry modules such as `src/version.ts` and `src/mutex.ts`; the compiler follows imports to compile the rest of `src/`
- Test tsconfig compiles `test/spec/**/*.ts` → `test/dist/`, which Jasmine runs

## HTTP Layer (`src/http.ts`, consumed by `eventRegistry.ts`)

- Uses native **`fetch`** (via the `erFetch()` wrapper in `src/http.ts`), not Axios — Axios was removed in `10.0.0`. Node.js 18+ is required for global `fetch`/`Headers`/`AbortController`.
- An in-house **`Mutex`** (`src/mutex.ts`) serialises requests (respects `minDelayBetweenRequests`).
- Stops retrying on status codes 204, 400, 401, 403, 530 (raises to caller).
- Remaining/daily request counts updated from response headers.

## Testing

- **Live integration**: Jasmine 5 (`test/jasmine.json`), spec files in `test/spec/*.spec.ts`. `test/spec/utils.ts` has custom matchers (`toBeValidArticle`, `toBeValidEvent`, …), shared `ReturnInfo` flags, 120s timeout. Never commit `fdescribe` / `fit` — Jasmine exits with code 2 on incomplete runs.
  - **Offline by default**: `test/spec/fixtureTransport.ts` (loaded as a Jasmine helper, before `utils.ts`) intercepts `fetch` and replays recorded HTTP fixtures from `test/fixtures/` (committed — apiKey and the configured `host` are redacted before a fixture is written, so they're safe to commit and replay needs no `settings.json`/apiKey at all). Controlled by `ER_TEST_MODE`, default `replay`:
    - `npm test` — offline, replays `test/fixtures/`, fails loudly (not silently) if a fixture is missing.
    - `npm run test:live` — hits the real API, no interception, unchanged pre-fixture behavior. Needs network + a valid `apiKey` in `settings.json`.
    - `npm run test:record` — hits the real API and (re-)writes `test/fixtures/` from the responses. Run this after an API-surface change to refresh fixtures; needs a valid `apiKey`.
  - `test:live`/`test:record` exist because npm scripts can't set env vars in a way that's both bash- and PowerShell-safe without an extra dependency — they shell out via `scripts/run-tests-with-mode.js` instead.
- **Offline unit**: Vitest, spec files in `test/unit/*.spec.ts`, run via `npm run test:unit` (or `npm run test:unit:watch`). These stub `fetch` and assert request-body shape/response mapping for both classic and ergonomic-layer code paths — use this suite for routine verification while iterating.

## Linting

ESLint 9 with `typescript-eslint` flat configuration in `eslint.config.mjs`. Plugins include import, jsdoc, and prefer-arrow.

## Examples

Runnable examples in `examples/` (not published to npm). Typecheck with `npm run example:check`. Run one (needs `settings.json` + network) with `npm run example -- examples/queryArticlesExamples.ts`. Each file demonstrates a feature area (articles, events, trends, mentions, …).

## Related Repositories

| Repo | Role |
|---|---|
| `er-api` | Express backend that serves Event Registry data |
| `er-web` | Angular frontend |
| [event-registry-python](https://github.com/EventRegistry/event-registry-python) | Python SDK (API reference) |

## Key Patterns

- **Query/Request split**: filter params live on `Query*`, response shape on `Request*`. Always call `setRequestedResult()` before `execQuery()`.
- **Complex queries**: `QueryArticles.initWithComplexQuery(json)` / `QueryEvents.initWithComplexQuery(json)` for raw ER query JSON.
- **ReturnInfo flags**: use `ArticleInfoFlags`, `EventInfoFlags`, etc. to control which fields the API returns — keeps payloads small.
- **Helpers/fluent are wrappers, not a parallel implementation**: a `src/helpers/*.ts` function or `src/fluent/*.ts` method must delegate to the corresponding classic `Query*`/`Get*`/`Request*` class + `er.execQuery()` (or the class's own execute method, e.g. `GetRecentEvents.getUpdates()`). Never hand-roll a second request-building path.
- **Do not bump major versions casually** — this is a public npm package; follow semver and update `CHANGELOG.md`. Wording matters: the classic API is fully supported indefinitely; the ergonomic layer is additive sugar, not a replacement.

## graphify

If `graphify-out/GRAPH_REPORT.md` exists, read it before answering architecture questions. After modifying source files, run `graphify update .` to refresh the knowledge graph.
