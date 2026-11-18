# Recipes for agents and automated pipelines

Programs that read news on their own, such as agents, monitors and enrichment jobs, share a few needs: spend tokens on purpose, stop when told to, and survive a flaky network. This page shows the pattern we recommend and the SDK options that support it. Everything here uses plain SDK calls; a runnable version is in [`examples/agentRecipesExamples.ts`](examples/agentRecipesExamples.ts).

## Suggest, scan, triage, retrieve

Most questions can be answered by reading a handful of articles out of hundreds. Reading all of them is slow and costs tokens, so work in four steps, each cheaper than the next.

1. **Suggest.** Turn names into Event Registry URIs. A concept URI is far more precise than a keyword, because it already separates "Apple" the company from the fruit.

   ```ts
   const conceptUri = await er.concepts.uri("Tesla"); // throws if nothing matches
   ```

2. **Scan.** Fetch many articles but only their titles. Set `bodyLen: 0` in `ArticleInfoFlags` so no body text is returned, and set `isDuplicateFilter: "skipDuplicates"` so a wire story that 40 outlets copied appears once.

   ```ts
   const titlesOnly = new ReturnInfo({ articleInfo: new ArticleInfoFlags({ bodyLen: 0 }) });
   const response = await er.articles
       .search({ conceptUri, lang: "eng", isDuplicateFilter: "skipDuplicates" })
       .info({ count: 100, returnInfo: titlesOnly })
       .exec();
   ```

   If the scan returns fewer than about 20 rows, widen or tighten the filter once (for example `keywordLoc: "title"`, or a different `sortBy`) instead of repeating the search with reworded keywords. Each search costs tokens.

3. **Triage.** Read the titles and choose the articles worth a full read. This is the step where your agent or your own code decides; the SDK is not involved. Keep the article URIs, discard the rest.

4. **Retrieve.** Ask for full details of the chosen URIs only. `QueryArticle` accepts a list of up to 100 URIs, so one call is enough.

   ```ts
   const details = await er.execQuery(new QueryArticle(uris, new RequestArticleInfo()));
   ```

The same pattern works for events: scan with `er.events.search(...)`, triage on titles, and retrieve the chosen events. Event queries cost more tokens per call than article queries, so prefer a concept URI to keywords and avoid repeating them.

## Set a token budget

Give an unattended job a ceiling so a bug cannot drain the account.

```ts
const er = new EventRegistry({ apiKey, maxTokens: 500 });
```

Once the tokens reported by the API since the client was created (plus the last reported cost of the endpoint about to be called) would pass `maxTokens`, the next call throws `ErBudgetExceededError` without sending a request. The API reports a call's cost only after it has run, so the guard can overshoot by one call; treat it as a safety net, not an exact meter. Read the totals with `er.usage.session`, the last call with `er.usage.last`, and the account balance with `await er.getRemainingTokens()`.

## Stop on demand and bound the time

Pass an `AbortSignal` and an overall deadline in the constructor or per call.

```ts
const controller = new AbortController();
const scoped = er.withOptions({ signal: controller.signal, timeoutMs: 30_000 });
const response = await scoped.articles.search({ conceptUri }).exec();
```

`withOptions` returns a view of the same client, so rate limits, usage totals and the request queue stay shared. The deadline covers queueing, retries and backoff waits together. Aborting rejects with the abort reason, and an expired deadline rejects with `ErTimeoutError`; no request is left running.

## Retry behaviour

Failed requests are retried with exponential backoff, capped at 30 seconds, and `Retry-After` is honoured on 429 and 503. By default a request is retried up to 5 times; set `repeatFailedRequestCount` to change that (`-1` retries until the request succeeds, `0` fails fast). When the API answers with an error that is not retried, the response carries an `ErApiError` with the status, the API's error code and, when present, the request id and token cost, so an agent can decide what to do next.

## Watch for new content

`er.recent.articles()` and `er.recent.events()` poll the minute stream. Awaiting them does one poll; iterating them keeps polling.

```ts
for await (const article of er.recent.articles({
    pollMs: 60_000,
    signal: controller.signal,
    cursor: await loadCursor(),              // resume where the last run stopped
    onCursor: (cursor) => saveCursor(cursor) // called whenever the position moves
})) {
    handle(article);
}
```

Store the cursor wherever your job keeps state. Without one, the feed starts at the stream's current position and skips what was published while the job was down.

## Refuse malformed data

A pipeline that acts on responses should not continue on a payload that lost its results array. Set `validate: true` and every `execQuery` response is checked against the documented top-level shapes; a mismatch throws `ErValidationError` listing each problem by JSON path. Unknown extra fields never fail the check, so API additions do not break you. The option is off by default.

```ts
const er = new EventRegistry({ apiKey, validate: true });
```
