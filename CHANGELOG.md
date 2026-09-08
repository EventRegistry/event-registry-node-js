# NodeJS SDK: Change Log

This log contains changes specific to the NodeJS SDK.

## [v10.0.0](https://www.npmjs.com/package/eventregistry/v/10.0.0) (2026-09-07)

Upgrade guide for the last published line (`9.1.1`): [MIGRATION.md](MIGRATION.md). **The classic class-based API (`QueryArticles`, `QueryEvents`, `execQuery()`, iterators, complex queries, …) remains fully supported** — class names were not removed or renamed.

**Breaking**
 - Node.js **18+ is required**. `9.1.1` declared `engines: >=5` and used Axios, so it still ran on older Node. `10.0.0` uses native `fetch` / `Headers` / `AbortController` with no polyfill; Node 16 and below fail at runtime (`fetch is not defined`). Upgrade Node before upgrading this package. See [MIGRATION.md](MIGRATION.md#4-http-transport-axios-removed-fetch-required).
 - API requests now use HTTPS by default (`https://eventregistry.org` and `https://analytics.eventregistry.org`). `9.1.1` defaulted to `http://`.
 - The default `minDelayBetweenRequests` is now `0.5` seconds (was `1`). Throttling is enforced with `Date.now()` under a per-instance mutex.
 - The default `repeatFailedRequestCount` is now `-1` (retry indefinitely; was `2`). Stop codes `204`, `400`, `401`, `403`, `530` still do not retry. Programmer errors (`JSON.stringify` of a circular body) and JSON parse failures on HTTP 200 are **not** retried.
 - Replaced the Axios HTTP client with a native `fetch`-based transport (`src/http.ts`). Axios-specific error shapes (`error.isAxiosError`, interceptors, `getLastHeaders()` as a plain object) are gone. See [MIGRATION.md](MIGRATION.md#4-http-transport-axios-removed-fetch-required).
 - Removed Winston. `Logger`/`LogLevel` keep the same public API (`er.logger.logLevel`, `LogLevel.{ERROR,WARN,INFO,DEBUG,REQUEST}`, constructor `logging`); custom Winston transports no longer apply. See [MIGRATION.md](MIGRATION.md#5-logging-winston-removed-loggerloglevel-api-unchanged).
 - The TypeScript source now compiles under `strict` mode, producing tighter `.d.ts` typings. See [MIGRATION.md](MIGRATION.md#3-typescript-strict-mode-and-tighter-dts).
 - Dual CommonJS and ES module builds under `dist/cjs` and `dist/esm` (`package.json` `exports`). Importing or requiring `eventregistry` keeps the same API.
 - Transport failures returned from `execQuery` / `jsonRequest` expose `error` as a **string** (matching API error payloads) instead of an `Error` instance that JSON-serialized to `{}`.
 - `GetRecentEvents.getUpdates()` now returns the `activity` **array** (`[]` if missing) and advances the `newestUri` polling cursor, matching `GetRecentArticles`. `9.1.1` returned `activity || {}` and did not persist the cursor.

**Added**
 - Full-surface ergonomic layer: helper functions (`searchArticles`, `iterateArticles`, `getArticle`, `searchEvents`, `iterateEvents`, `getEvent`, `searchMentions`, `iterateMentions`, `getStory`, `getTrending*`, `getCounts`/`getCountsEx`, `getTopShared*`, `getRecent*`, `getSourceInfo`/`getConceptInfo`/`getCategoryInfo`/`getSourceStats`, `getMyTopicPages`/`loadTopicPage`/`createTopicPage`, `annotateText`/`categorizeText`/`analyzeSentiment`/`semanticSimilarity`/`detectLanguage`/`extractArticleInfo`/`ner`/`trainTopic*`, `getEventForText`) and URI-resolution helpers (`conceptUri`, `categoryUri`, `sourceUri`, `sourceGroupUri`, `locationUri`, `eventTypeUri`, `conceptClassUri`, `authorUri`) that throw on no-match instead of resolving to `undefined`.
 - Matching fluent namespaces on `EventRegistry`: `er.articles`, `er.events`, `er.mentions`, `er.stories`, `er.trends`, `er.counts`, `er.shares`, `er.recent`, `er.info`, `er.topicPages`, `er.analytics`, `er.eventForText(...)`, and `er.concepts`/`er.categories`/`er.sources`/`er.locations`/`er.eventTypes`/`er.conceptClasses`/`er.authors` for URI resolution. Search-style namespaces expose `.search(args).info(opts).exec()`, `.iterate(args)`, and `.get(uri)` where applicable.
 - `RequestEventsBreakingEvents` for querying currently breaking events.
 - `TopicPages` class with `getMyTopicPages()` to list user-owned topic pages.
 - `EventRegistry.getEventTypeUri()` helper for resolving event type labels to URIs.
 - Optional `concepts` parameter on `Analytics.categorize()`.
 - `EventRegistry.setExtraParams()` for adding parameters to every request.
 - `EventRegistry.checkVersion()` for checking the latest SDK version. Reads `/static/nodejsSDKVersion.txt` on the API host, then falls back to the npm registry `latest` document if that file is missing.
 - Configuration getters: `getHost()`, `getHostAnalytics()`, `getApiKey()`, `getMinDelayBetweenRequests()`, and `getRepeatFailedRequestCount()`.

**Updated**
 - Node.js 24.11.0 is the supported development target; `engines` is `>=18.0.0`.
 - Zero runtime dependencies (Axios, Winston, moment, and `semaphore-async-await` removed). Dates use native `Date`; request locking uses an in-house `Mutex`.
 - TypeScript compile target raised to ES2020.
 - Upgraded linting to ESLint 9 (TSLint removed).
 - Offline unit tests migrated to Vitest (`npm run test:unit`). Jasmine integration tests replay committed fixtures by default (`npm test`).
 - GitHub Actions CI runs build, lint, unit tests, fixture replay, example typecheck, and `publint` on Node 18 and Node 24.
 - `package.json` declares `"type": "commonjs"` and a `git+https` repository URL (publint).
 - The published tarball now ships `src/` alongside `dist/`, so the emitted `.js.map` source maps resolve to the real TypeScript sources instead of dangling.
 - Hardened integration tests against live API volatility (awaited iterators, range assertions, dynamic fixtures, paging safety caps).

**Fixed**
 - Removed accidental `fdescribe` focus in integration tests so the full suite runs.
 - `checkVersion()` no longer silently no-ops when `/static/nodejsSDKVersion.txt` is missing (the live URL currently 404s); it falls back to the npm registry.
 - `getLastHeaders()` declares an explicit `Headers` return type, so the published `.d.ts` no longer references `undici-types` (an internal `@types/node` package consumers do not install).
 - `QueryArticles` now sends `authorsFilter` / `videosFilter` / `linksFilter` as the API params `hasAuthorsFilter` / `hasVideosFilter` / `hasLinksFilter` (matching the Python SDK). The constructor argument names are unchanged.

## [v9.1.1](https://www.npmjs.com/package/eventregistry/v/9.1.1) (2024-11-14)
**Fixed**
 - fixed the issue when passing `logging` as `false` to the `EventRegistry` constructor the logs folder was still created. Now the logs are created only when `logging` is set to `true`.

## [v9.1]() (2024-06-27)
**Updated**
 - Updated several external packages used internally by the SDK.
 - Removed `lodash` as a dependency.
**Added**
- added `keywordSearchMode` parameter that can be used in `QueryArticles`, `QueryArticlesIter`, `QueryEvents`, `QueryEventsIter` and `QueryEvent` constructors.
**Updated**
- `QueryArticles` class. Added filters `authorsFilter`, `videosFilter`, `linksFilter`
- `QueryMentions` class. Added several filters: `industryUri`, `sdgUri`, `sasbUri`, `esgUri`, `minSentenceIndex`, `maxSentenceIndex`, `showDuplicates`
- Changed how logging works. If you would like to see host information or manually adjust logging level then you can do the following
    ``` javascript
        const er = new EventRegistry();
        er.logger.logLevel = LogLevel.DEBUG; // or LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR
    ```

## [v8.11.1]() (2023-05-11)
**Fixed**
 - fixed the `RequestEventsRecentActivity` response type to the correct value.
```
## [v8.11.1]() (2023-03-24)
**Updated**
 - the `QueryEventArticlesIter` class will be significantly faster in returning the articles when you specify the language filter
 **Added**
 - New option for usage for the following classes: `QueryEventsIter`, `QueryEventArticlesIter`, `QueryArticlesIter` and `QueryMentionsIter`. Example below shows how to use it with `QueryEventsIter` class.
```javascript
(async () => {
    const er = new EventRegistry();
    const events = new QueryEventsIter(er, { keywords: "Obama", maxItems: 30 });
    for await (const event of events) {
        console.info(event);
    }
})();
```
## [v8.10.4]() (2022-12-08)
 - Apply correct default value for article count when querying for articles when using RequestArticlesInfo (was 200 instead of 100).

## [v8.10.3]() (2022-12-08)
 - Correctly apply allowUseOfArchive parameter when querying for articles and events with iterator classes.

## [v8.10.2]() (2022-05-09)
- Correctly exposed internal types and move other types to development dependencies. Thanks to the [PR #17](https://github.com/EventRegistry/event-registry-node-js/pull/17).

## [v8.10.1]() (2022-03-23)

**Breaking**

- `TopicPage.getArticles` and `TopicPage.getEvents` return full response with additional page/pages information (instead of simple array of articles/events).

## [v8.10.0]() (2021-10-19)

**Added**

- added file `QueryMentions` that can be used to query mentions of specific event types. The class is currently in beta and not available to users unless they have permissions to use this endpoint. The classes `QueryMentions` and `QueryMentionsIter` can be used in the same way as classes for querying articles and events, except that some query parameters are added and some removed. Examples for the classes were also added.

**Updated**
- When using method `initWithComplexQuery` we now check if the provided json is valid json object and report error in case it is not

## [v8.9.2]() (2021-05-12)

**Updated**

- Updated dependencies of the SDK library

## [v8.9]() (2020-11-24)

**Added**

- added `required` and `excluded` optional parameters to the TopicPage class to methods `addConcept`, `addKeyword`, `addCategory`, `addSource`, `addSourceLocation` and `addSourceGroup`.
- exceptions are now raised by the SDK library in case of status codes 204, 400, 401, 403 and 530. The meaning of the above status codes is described on the [documentation page](https://eventregistry.org/documentation?tab=introduction).

## [v8.8.0]() (2020-10-07)

**Added**

- added filters `reportingDateStart` and `reportingDateEnd` to `QueryEvents`. You can use these dates to find the events where the average date of reporting matches this date range. Note that `dateStart` and `dateEnd` will return events based on when they (supposedly) happened and it can be quite different than the reporting dates.
- added parameters `updatesAfterNewsUri`, `updatesafterBlogUri`, `updatesAfterPrUri` to the `RequestArticlesRecentActivity`. Can be used to make sure that absolutely no article is missed when using the `QueryArticles` with `RequestArticlesRecentActivity` requested result. See [this file](https://github.com/EventRegistry/event-registry-node-js/blob/master/examples/feedOfNewArticlesExamples.ts) for an example of use.


## [v8.7.0]() (2020-01-31)

**Added**
- added `EventRegistry.getServiceStatus()` method that reports status of the services
- We added sentiment, which can now be used in querying of articles and events. The `QueryArticles`, `QueryArticlesIter`, `QueryEvents`, `QueryEventsIter` now all have additional parameters `minSentiment` and `maxSentiment` that can be used to filter the articles and events. The valid values are between -1 (very negative sentiment) and 1 (very positive sentiment). Value 0 represents neutral sentiment.
- Sentiment was also added as a property in the returned articles and events.
- `ComplexQueryArticles` and `ComplexQueryEvents` classes now support in the constructor additional filters like `minSentiment`, `maxSentiment`, `minFacebookShares`, `endSourceRankPercentile`, etc.

**Updated**
- `ReturnInfo` classes (`ArticleInfoFlags`, `ConceptInfoFlags`, ...) were updated. Some obsolete parameters were removed and we've also added support to directly pass any rarely used parameters, that are not a part of the typings.
- `TopicPage.getArticles` and `TopicPage.getEvents` methods now also support passing any rarely used parameters directly, that are not a part of the typings.
- Analytics: We updated `trainTopicOnTweets()`, `trainTopicClearTopic()` and `trainTopicGetTrainedTopic()` methods in the `Analytics` class.
- `Analytics.annotate()` method now supports passing custom parameters that should be used when annotating the text.
- Changed some defaults in the returned data. When searching articles, we now by default return article image and sentiment.
- Analytics. updated `trainTopicOnTweets()`, `trainTopicClearTopic()` and `trainTopicGetTrainedTopic()` methods in the `Analytics` class.
- `QueryArticles.initWithComplexQuery()` was updated - the parameter `dataType` was removed (since the `dataType` value should be provided in the `$filter` section of the query)
- `TopicPage` now supports setting also the source rank percentile
- `Analytics.extractArticleInfo` now also supports setting the headers and cookies to be used when making the requests

**Removed**

- removed `EventRegistry.suggestCustomConcepts()` and `EventRegistry.getCustomConceptUri()` methods. Not used anymore since we are not supporting anymore the correlation feature.

## [v8.5.13]() (2018-10-10)

**Changed**
- Better exposure of Typescript type definitions (affects Typescript users)

## [v8.5.1]() (2018-09-17)

**Changed**
- A couple of minor fixes and improvements for examples and other minor things

## [v8.5.0]() (2018-09-14)

**Added**
- Added `Analytics.trainTopicOnTweets()` method that can be used to train a topic by analyzing a group of tweets. See example of usage on the [wiki page](https://github.com/EventRegistry/event-registry-python/wiki/Text-analytics#train-a-topic-based-on-the-tweets).
- Added a group of `Analytics.trainTopic*()` methods that can be used to analyze your own documents and build a topic from them. See example of usage on the [wiki page](https://github.com/EventRegistry/event-registry-python/wiki/Text-analytics#train-a-custom-topic).

## [v8.4.0]() (2018-09-13)

**Added**
- added searching of articles and events based on article authors. You can now provide `authorUri` parameter when creating the `QueryArticles` and `QueryEvents` instances.
- added author related methods to `EventRegistry` class: `EventRegistry.suggestAuthors()` to obtain uris of authors for given (partial) name and `EventRegistry.getAuthorUri()` to obtain a single author uri for the given (partial) name.
- added ability to search articles and events by authors. `QueryArticles` and `QueryEvents` constructors now also accept `authorUri` parameter that can be used to limit the results to articles/events by those authors. Use `QueryOper.AND()` or `QueryOper.OR()` to specify multiple authors in the same query.
- BETA: added a filter for returning only articles that are written by sources that have a certain ranking. The filter can be specified by setting the parameters `startSourceRankPercentile` and `endSourceRankPercentile` when creating the `QueryArticles` instance. The default value for `startSourceRankPercentile` is 0 and for `endSourceRankPercentile` is 100. The values that can be set are not any value between 0 and 100 but has to be a number divisible by 10. By setting `startSourceRankPercentile` to 0 and `endSourceRankPercentile` to 20 you would get only articles from top ranked news sources (according to [Alexa site ranking](https://www.alexa.com/siteinfo)) that would amount to about *approximately 20%* of all matching content. Note: 20 percentiles do not represent 20% of all top sources. The value is used to identify the subset of news sources that generate approximately 20% of our collected news content. The reason for this choice is that top ranked 10% of news sources writes about 30% of all news content and our choice normalizes this effect. This feature could potentially change in the future.
- `QueryEventArticlesIter` is now able to return only a subset of articles assigned to an event. You can use the same filters as with the `QueryArticles` constructor and you can specify them when constructing the instance of `QueryEventArticlesIter`. The same kind of filtering is also possible if you want to use the `RequestEventArticles()` class instead.
- added some parameters and changed default values in some of the result types to reflect the backend changes.
- added optional parameter `proxyUrl` to `Analytics.extractArticleInfo()`. It can be used to download article info through a proxy that you provide (to avoid potential GDPR issues). The `proxyUrl` should be in format `{schema}://{username}:{pass}@{proxy url/ip}`.

## [v8.3.12]() (2018-08-16)

**Added**
- Added `getUsageInfo` method which returns usage information. It returns an object with two properties: availableTokens and usedTokens

## [v8.3.11]() (2018-08-13)

**Added**
- Missing utility methods`getRemainingAvailableRequests`, `getDailyAvailableRequests`, `getLastHeaders` and `getLastHeader`.

## [v8.3.1]() (2018-08-06)

**Changed**
- Switched to POST requests instead of GET

## [v8.3.0]() (2018-08-06)

**Added**
 - Implemented all the latest changes as seen in the Python SDK 8.3.0.

**Breaking**
- `QueryArticlesIter`, `QueryEventArticlesIter` and `QueryEventsIter` now return one item at a time instead of the whole page (array) of items.

**Changed**
- Updated to Typescript 3.0.
- Version bump to be more inline with the Python SDK versioning
- It's no longer possible to specify batch sizes for `QueryArticlesIter`, `QueryEventArticlesIter` and `QueryEventsIter`.
