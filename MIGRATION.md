# Migrating to eventregistry 10.0.0

This guide covers moving from **`9.1.1`** (the last version on npm) to **`10.0.0`**. Read the [CHANGELOG](CHANGELOG.md) for the itemized list; this document explains the *why* and shows copy-paste examples.

There was no published `9.1.2` or `11.0.0`. Everything that landed on `development` after `9.1.1` ships as this major.

## TL;DR

- **Classic class names still work.** `EventRegistry`, `QueryArticles`, `QueryEvents`, `RequestArticlesInfo`, iterators, complex queries, `execQuery()` were not removed or renamed. See [Classic API (fully supported)](README.md#classic-api-fully-supported) in the README.
- **Upgrade Node first.** `9.1.1` ran on Node 5+ via Axios. `10.0.0` needs **Node.js 18+** (`fetch`). Then bump the package, run your tests, ship.
- Several **defaults and return shapes changed** (HTTPS hosts, delay `0.5s`, retry `-1`, `GetRecentEvents` array + cursor, `error` as a string). Those are in [section 1](#1-classic-api--still-supported-runtime-defaults-changed).
- New in 10.0.0: an optional ergonomic surface (`er.articles`, `searchArticles()`, `conceptUri()`, …) that wraps the same classic classes.
- Under the hood: Axios → native `fetch`, Winston → a lightweight built-in `Logger`, moment → `Date`, dual CJS/ESM, TypeScript `strict`.

## 1. Classic API — still supported; runtime defaults changed

This `9.1.1` pattern is still valid:

```typescript
import { EventRegistry, QueryArticles, RequestArticlesInfo, QueryArticlesIter } from "eventregistry";

const er = new EventRegistry({ apiKey: "YOUR_API_KEY" });

const conceptUri = await er.getConceptUri("Barack Obama");
const q = new QueryArticles({ conceptUri });
q.setRequestedResult(new RequestArticlesInfo({ count: 30, sortBy: "date" }));
const response = await er.execQuery(q);

const iter = new QueryArticlesIter(er, { conceptUri, maxItems: 500 });
iter.execQuery((article) => console.info(article));
```

`Query*` / `Request*` / `execQuery()` / `get*Uri()` (still `undefined` on no match) keep their names. What **does** change vs `9.1.1` if you relied on defaults or internals:

| `9.1.1` | `10.0.0` |
|---|---|
| Node `engines: >=5`, Axios | Node **18+**, native `fetch` |
| Default host `http://eventregistry.org` | `https://eventregistry.org` |
| `minDelayBetweenRequests: 1` (often ineffective) | `0.5` seconds, actually throttled |
| `repeatFailedRequestCount: 2` | `-1` (retry indefinitely, except stop codes and non-HTTP errors) |
| `getLastHeaders()` Axios dict | Fetch `Headers` — use `.get("x-ratelimit-remaining")` |
| `response.error` sometimes an `Error` (`JSON.stringify` → `{}`) | `error` is a **string** |
| `GetRecentEvents.getUpdates()` → `activity \|\| {}`, no cursor | **array** (`[]` if missing), advances `newestUri` like `GetRecentArticles` |
| `er.logger` was Winston | same `logLevel` API; no Winston transports |

`GetRecentArticles` already used `lang` (not `articleLang`) in `9.1.1`. If you still pass `articleLang`, it is **not** mapped to `recentActivityArticlesLang`.

## 2. Recommended: fluent + helpers

`10.0.0` adds a thin ergonomic layer on top of the same classes above. It's optional, additive, and every call still goes through the same classic classes and the same HTTP path.

### Articles

```typescript
import { EventRegistry, searchArticles, conceptUri } from "eventregistry";

const er = new EventRegistry({ apiKey: "YOUR_API_KEY" });

// one-shot search + fetch (helper function)
const uri = await conceptUri(er, "Barack Obama"); // throws if no match is found
const response = await searchArticles(er, { conceptUri: uri, count: 30, sortBy: "date" });

// same thing, fluent style
const response2 = await er.articles
    .search({ conceptUri: await er.concepts.uri("Barack Obama") })
    .info({ count: 30, sortBy: "date" })
    .exec();

// single article
const article = await er.articles.get("some-article-uri");

// auto-paging iterator (returns an AsyncIterable, same paging as QueryArticlesIter)
for await (const item of er.articles.iterate({ conceptUri: uri, maxItems: 500 })) {
    console.info(item);
}
```

`conceptUri()` / `er.concepts.uri()` **throw** (instead of resolving to `undefined`) when no concept matches the label — this makes the non-optional `Promise<string>` return type honest and lets you `try`/`catch` a "not found" case explicitly instead of getting an `undefined` uri deep in a query. The same throw-on-miss behavior applies to `categoryUri`, `sourceUri`, `sourceGroupUri`, `locationUri`, `eventTypeUri`, `conceptClassUri`, and `authorUri` (and their `er.categories.uri`, `er.sources.uri`/`.groupUri`, `er.locations.uri`, `er.eventTypes.uri`, `er.conceptClasses.uri`, `er.authors.uri` fluent equivalents).

**Do not mix** classic `await er.getConceptUri("nope")` (`undefined`) into `er.articles.search({ conceptUri })`. Falsy URIs are dropped from the query, so you can run an unscoped search. Use `er.concepts.uri()` (throws) or guard the classic result before searching.

### Events and mentions

```typescript
import { EventRegistry, searchEvents } from "eventregistry";

const er = new EventRegistry({ apiKey: "YOUR_API_KEY" });
const conceptUri = await er.concepts.uri("Star Wars");

// helper
const events = await searchEvents(er, { conceptUri, count: 10, sortBy: "date" });

// fluent
const events2 = await er.events.search({ conceptUri }).info({ count: 10, sortBy: "date" }).exec();
const event = await er.events.get("eng-1234567");
for await (const event of er.events.iterate({ conceptUri, maxItems: 300 })) {
    console.info(event);
}

// mentions (beta endpoint) follow the same shape, minus a single-item `.get()`
const mentions = await er.mentions.search({ keywords: "inflation" }).info({ count: 20 }).exec();
for await (const mention of er.mentions.iterate({ keywords: "inflation", maxItems: 200 })) {
    console.info(mention);
}
```

The mentions filter field is **`keywords`**, not `keyword`.

### Everything else

The ergonomic layer wraps the common-case path: `*Info` search, iterate, single-item get, and the `Get*` / `Analytics` one-shot classes. Aggregations (`RequestArticlesConceptAggr`, …), complex queries, `QueryEventArticlesIter`, suggest/URI extras, and `ArticleMapper` stay on the classic classes.

| Domain | Fluent | Helper functions |
|---|---|---|
| Stories | `er.stories.get(uri)` | `getStory` |
| Trends | `er.trends.concepts()`, `.categories()`, `.customItems()`, `.conceptGroups()` | `getTrendingConcepts`, `getTrendingCategories`, `getTrendingCustomItems`, `getTrendingConceptGroups` |
| Counts | `er.counts.get()`, `.ex()` | `getCounts`, `getCountsEx` |
| Social shares | `er.shares.articles()`, `.events()` | `getTopSharedArticles`, `getTopSharedEvents` |
| Recent activity | `er.recent.events()`, `.articles()` | `getRecentEvents`, `getRecentArticles` |
| Info lookups | `er.info.source()`, `.concept()`, `.category()`, `.sourceStats()` | `getSourceInfo`, `getConceptInfo`, `getCategoryInfo`, `getSourceStats` |
| Topic pages | `er.topicPages.mine()`, `.load()`, `.create()` | `getMyTopicPages`, `loadTopicPage`, `createTopicPage` |
| Analytics | `er.analytics.annotate()`, `.categorize()`, `.sentiment()`, `.semanticSimilarity()`, `.detectLanguage()`, `.extractArticleInfo()`, `.ner()`, `.trainTopic*()` | `annotateText`, `categorizeText`, `analyzeSentiment`, `semanticSimilarity`, `detectLanguage`, `extractArticleInfo`, `ner`, `trainTopicOnTweets`, `trainTopicCreateTopic`, `trainTopicClearTopic`, `trainTopicAddDocument`, `trainTopicGetTrainedTopic` |
| Event-for-text | `er.eventForText(text, lang?, nrOfEventsToReturn?)` (directly callable) | `getEventForText` |

`er.info.concept()` / helper `getConceptInfo(er, { uriOrUriList })` wrap the `GetConceptInfo` class (`/api/v1/concept`). That is **not** the same call as the classic instance method `er.getConceptInfo(uri)` (`/api/v1/concept/getInfo`, richer default flags).

Every fluent method and helper function is a thin wrapper — same request shape, same response shape, same underlying `Query*`/`Get*`/`Request*` class as the classic API. Mix classic and fluent freely **except** URI resolution (throw vs `undefined`, above).

## 3. TypeScript: `strict` mode and tighter `.d.ts`

The library's own source now compiles under TypeScript `strict` mode. Consequences for consumers:

- Emitted `.d.ts` files are more precise — fewer `any`s, more accurate optional/`undefined` handling on response and argument shapes. If your project also runs under `strict`, you may see new (usually correct) type errors surface at your call sites — most are `possibly undefined` warnings on fields that were always optional at runtime but weren't typed as such before.
- If your project is **not** under `strict`, nothing changes for you at compile time; the emitted `.d.ts` is a superset-compatible refinement, not a breaking shape change.
- The library's own `strict` mode is internal — it doesn't force your project to enable `strict`. Enable it on your own timeline.
- Spot check any code that relied on a field always being present that's now typed as optional (e.g. narrow with `if (x)` or `??` where TypeScript now asks you to).

## 4. HTTP transport: Axios removed, `fetch` required

`9.1.1` used a per-instance Axios client. `10.0.0` replaces it with the platform `fetch` API (retry/timeout/mutex — see `src/http.ts`).

- **Node.js 18+ is a hard requirement** — `fetch`/`Headers`/`AbortController` are global built-ins starting with Node 18. There is no polyfill bundled.
- Axios is no longer a dependency — smaller install, no transitive Axios CVEs to track.
- Stop-status-code list (`204`, `400`, `401`, `403`, `530`) does not retry. Transient HTTP/network failures still retry (`repeatFailedRequestCount: -1` by default). Invalid JSON bodies and JSON parse failures on HTTP 200 fail immediately instead of looping.
- If you were reaching into Axios-specific error shapes (`error.response`, `error.isAxiosError`, interceptors, etc.) anywhere in your own error handling, update those call sites — `jsonRequest` still swallows transport failures into `{ error: string, … }` rather than throwing an Axios error. `getLastHeaders()` is a Fetch `Headers` object.

## 5. Logging: Winston removed, `Logger`/`LogLevel` API unchanged

Winston is gone; `Logger` is now a small dependency-free class (`src/logger.ts`) writing to `logs/` or the console. The public surface you use is **identical**:

```typescript
import { LogLevel } from "eventregistry";

er.logger.logLevel = LogLevel.DEBUG;
```

`new EventRegistry({ logging: true })`, `er.logger`, `LogLevel.{ERROR,WARN,INFO,DEBUG,REQUEST}` all behave the same as `9.1.1` for this API. If you never configured a custom Winston transport against this package's logger, there is nothing to change. If you did attach custom Winston transports/formats directly to this library's logger instance, that integration point no longer exists — the replacement `Logger` only supports `logging` toggles and `logLevel`. Two `EventRegistry` instances no longer share one process-wide Winston singleton.

## 6. Package/build changes

- `package.json` now declares dual `exports` (`import`/`require`, each with `types`) — no change needed on your end; `import { EventRegistry } from "eventregistry"` and `const { EventRegistry } = require("eventregistry")` both keep working.
- Runtime dependencies are gone (Axios, Winston, moment, `semaphore-async-await`).
- Offline unit tests moved from ad-hoc scripts to Vitest (`npm run test:unit`); irrelevant to consumers, only affects contributors.

## Checklist

- [ ] Confirm your runtime is Node.js 18+.
- [ ] Upgrade `eventregistry` to `10.0.0`.
- [ ] `npm install` (removes Axios/Winston/moment transitive deps automatically).
- [ ] Re-check constructors that relied on `http://` hosts, delay `1`, or retry `2`.
- [ ] If you poll `GetRecentEvents.getUpdates()`, treat the result as an array and expect the cursor to advance.
- [ ] If you read `getLastHeaders()` as a dict or `response.error instanceof Error`, update those call sites (section 4).
- [ ] If you attached custom Winston transports to this package's logger, update those call sites (section 5).
- [ ] Run your test suite.
- [ ] Optionally, start using `er.articles`/`er.events`/`searchArticles()`/`conceptUri()` etc. in new code — no rush; classic and fluent can live side by side. Use `keywords` (not `keyword`) for mentions.

See also: [README — Classic API (fully supported)](README.md#classic-api-fully-supported), [CHANGELOG](CHANGELOG.md).
