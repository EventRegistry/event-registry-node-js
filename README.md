## Accessing Event Registry data through JS

This library contains classes that allow one to easily access the event and article information from Event Registry (https://eventregistry.org).

Most of the package is quite similar to [Event Registry Python](https://github.com/EventRegistry/event-registry-python) so for all who are already acquainted with the Python version, there shouldn't be any problems with using this package.

Node.js 24.11.0 is the supported development target. Starting with `10.0.0`, Node.js **18+ is a hard runtime requirement** (the HTTP layer uses native `fetch`); see [MIGRATION.md](MIGRATION.md) for details.

### Installation

Event Registry package can be installed using the NodeJS Package Manager. Type the following in the command line:

`npm install eventregistry`

and the package should be installed. Alternatively, you can also clone the package from the GitHub repository. After cloning it, open the command line and run:

`npm run build`

### Quick start: fluent + helpers (recommended for new code)

`10.0.0` adds a small ergonomic layer on top of the classic classes below. It's the recommended starting point for new code — less boilerplate, same requests, same responses.

```typescript
import { EventRegistry, searchArticles } from "eventregistry";

const er = new EventRegistry({ apiKey: "YOUR_API_KEY" });

// helper function
const conceptUri = await er.concepts.uri("Barack Obama"); // throws if no match is found
const response = await searchArticles(er, { conceptUri, count: 30, sortBy: "date" });

// fluent, chained
const response2 = await er.articles
    .search({ conceptUri })
    .info({ count: 30, sortBy: "date" })
    .exec();

// auto-paging iterator
for await (const article of er.articles.iterate({ conceptUri, maxItems: 500 })) {
    console.info(article);
}
```

The same style is available for `er.events`, `er.mentions`, `er.stories`, `er.trends`, `er.counts`, `er.shares`, `er.recent`, `er.info`, `er.topicPages`, `er.analytics`, `er.eventForText(...)`, and URI resolution (`er.concepts.uri`, `er.categories.uri`, `er.sources.uri`, `er.locations.uri`, `er.eventTypes.uri`, `er.conceptClasses.uri`, `er.authors.uri`). See [MIGRATION.md](MIGRATION.md#2-recommended-fluent--helpers) for the full coverage table and more examples.

### Classic API (fully supported)

The classic class-based API — `QueryArticles`, `QueryEvents`, `Request*Info`, iterators, complex queries, `er.execQuery()` — is **fully supported** in `10.0.0` and is not going anywhere. Class names from `9.1.1` were not removed; some defaults and return shapes did change (HTTPS hosts, delay, retries, `GetRecentEvents`). See [MIGRATION.md](MIGRATION.md). The fluent/helpers layer is additive sugar over the same classes.

```typescript
import { EventRegistry, QueryArticles, RequestArticlesInfo, QueryArticlesIter } from "eventregistry";

const er = new EventRegistry({ apiKey: "YOUR_API_KEY" });

er.getConceptUri("George Clooney").then((conceptUri) => {
    const q = new QueryArticlesIter(er, { conceptUri, sortBy: "date" });
    q.execQuery((item) => {
        console.info(item);
    });
});
```

Use whichever style fits a given file or team; the two can be mixed freely within the same project, even the same function.

### Usage: dual import/require

The package provides the same API to ES module/TypeScript imports and CommonJS `require` calls:

```typescript
import { EventRegistry } from "eventregistry";
const er = new EventRegistry();
```

```javascript
const { EventRegistry } = require("eventregistry");
const er = new EventRegistry();
```

Requests use `https://eventregistry.org` and `https://analytics.eventregistry.org` by default. Override `host` and, when needed, `hostAnalytics` in the constructor:

```javascript
const er = new EventRegistry({
    host: "https://your-event-registry-host.example",
    hostAnalytics: "https://your-analytics-host.example"
});
```

### Upgrading from 9.1.1?

See [MIGRATION.md](MIGRATION.md) for the full guide — classic class names remain, but Node 18+, HTTPS defaults, and a few return shapes changed. The fluent layer is optional.

TypeScript samples live in `examples/` (not published). After `npm run build` and a root `settings.json` with your `apiKey`, run one with:

`npm run example -- examples/queryArticlesExamples.ts`

Typecheck them with `npm run example:check`.

### Updating the package

As features are added to the package you will need at some point to update it. In case you have downloaded the package from GitHub simply do a `git pull`. If you have installed it using the `npm` command, then simply run:

`npm update eventregistry`

### Authentication and API key

When making queries to Event Registry you will have to use an API key that you can obtain for free.

### A couple of examples to make you interested

**Print a list of recently added articles mentioning George Clooney**

``` javascript
var erBase = require("eventregistry");

var er = new erBase.EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("George Clooney").then((conceptUri) => {
    var q = new erBase.QueryArticlesIter(er, {conceptUri: conceptUri, sortBy: "date"});
    q.execQuery((item) => {
        console.info(item);
    })
});
```

Or in **Typescript**.

``` typescript
import {EventRegistry, QueryArticlesIter} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("George Clooney").then((conceptUri) => {
    const q = new QueryArticlesIter(er, {conceptUri: conceptUri, sortBy: "date"});
    q.execQuery((item) => {
        console.info(item);
    })
});
```

Alternative approach in Typescript using the new ES6 `async/await` pattern.

``` typescript
import {EventRegistry, QueryArticlesIter} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

async function iterateOverArticles() {
    const q = new QueryArticlesIter(er, {conceptUri: await er.getConceptUri("George Clooney"), sortBy: "date"});
    q.execQuery((item) => {
        console.info(item);
    })
}

iterateOverArticles();
```


**Search for latest events related to Star Wars**

``` javascript
var erBase = require("eventregistry");

var er = new erBase.EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("Star Wars").then((conceptUri) => {
    var q = new erBase.QueryEvents({conceptUri: conceptUri});
    var requestEventsInfo = new erBase.RequestEventsInfo({sortBy: "date", count: 10});
    q.setRequestedResult(requestEventsInfo);
    return er.execQuery(q);
}).then((response) => {
    console.info(response);
});
```

Or in **Typescript**.

``` typescript
import {EventRegistry, QueryEvents, RequestEventsInfo} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("Star Wars").then((conceptUri) => {
    const q = new QueryEvents({conceptUri: conceptUri});
    const requestEventsInfo = new RequestEventsInfo({sortBy: "date", count: 10});
    q.setRequestedResult(requestEventsInfo);
    return er.execQuery(q);
}).then((response) => {
    console.info(response);
});

```

Alternative approach using the new ES6 `async/await` pattern.

``` typescript
import {EventRegistry, QueryEvents, RequestEventsInfo} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

async function iterateOverEvents() {
    const q = new QueryEvents({conceptUri: await er.getConceptUri("Star Wars")});
    const requestEventsInfo = new RequestEventsInfo({sortBy: "date", count: 10});
    q.setRequestedResult(requestEventsInfo);
    return er.execQuery(q);
}

iterateOverEvents();
```

**What are the currently trending topics**

``` javascript
var erBase = require("eventregistry");

var er = new erBase.EventRegistry({apiKey: "YOUR_API_KEY"});

var q = new erBase.GetTrendingConcepts({source: "news", count: 10});
er.execQuery(q).then((response) => {
    console.info(response);
});
```

Or in **Typescript**.

``` typescript
import {EventRegistry, GetTrendingConcepts} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

const q = new GetTrendingConcepts({source: "news", count: 10});
er.execQuery(q).then((response) => {
    console.info(response);
});
```
**Search for duplicated articles in Business**
``` javascript
var erBase = require("eventregistry");

var er = new erBase.EventRegistry({apiKey: "YOUR_API_KEY"});
er.getCategoryUri("business").then((categoryUri) => {
    var q = new erBase.QueryArticles({
            categoryUri: categoryUri,
            isDuplicateFilter: "keepOnlyDuplicates", // possible values are "skipDuplicates" or "keepOnlyDuplicates" or "keepAll";
    });
    return er.execQuery(q);
}).then((response) => {
    console.log(response);
});
```

Or in **Typescript**.

``` typescript
import {EventRegistry, QueryArticles} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

er.getCategoryUri("business").then((businessUri) => {
    const q = new QueryArticles({
            categoryUri: businessUri,
            isDuplicateFilter: "keepOnlyDuplicates", // possible values are "skipDuplicates" or "keepOnlyDuplicates" or "keepAll";
    });
    return er.execQuery(q);
}).then((response) => {
    console.log(response);
});

```
## Where to next?

Depending on your interest and existing knowledge of the `eventregistry` package you can check different things:

**[Terminology](https://github.com/EventRegistry/event-registry-node-js/wiki/Terminology)**. There are numerous terms in the Event Registry that you will constantly see. If you don't know what we mean by an *event*, *story*, *concept* or *category*, you should definitely check this page first.

**[Learn about `EventRegistry` class](https://github.com/EventRegistry/event-registry-node-js/wiki/Eventregistry-class)**. You will need to use the `EventRegistry` class whenever you will want to interact with Event Registry so you should learn about it.

**[Details about articles/events/concepts/categories/... that we can provide](https://github.com/EventRegistry/event-registry-node-js/wiki/ReturnInfo-class)**. When you will be requesting information about events, articles, concepts, and other things, what details can you ask for each of these?

**[Querying events](https://github.com/EventRegistry/event-registry-node-js/wiki/Searching-for-events)**. Check this page if you are interested in searching for events that match various search criteria, such as relevant concepts, keywords, date, location or others.

**[Querying articles](https://github.com/EventRegistry/event-registry-node-js/wiki/Searching-for-articles)**. Read if you want to search for articles based on the publisher's URL, article date, mentioned concepts or others.

**[Trends](https://github.com/EventRegistry/event-registry-node-js/wiki/Trends)**. Are you interested in finding which concepts are currently trending the most in the news? Maybe which movie actor is most popular in social media? How about trending of various news categories?

**[Articles and events shared the most on social media](https://github.com/EventRegistry/event-registry-node-js/wiki/Social-shares)**. Do you want to get the list of articles that have been shared the most on Facebook and Twitter on a particular date? What about the most relevant event based on shares on social media?

**[Daily mentions and sentiment of concepts and categories](https://github.com/EventRegistry/event-registry-node-js/wiki/Number-of-mentions-in-news-or-social-media)**. Are you interested in knowing how often was a particular concept or category mentioned in the news in the previous two years? How about the sentiment expressed on social media about your favorite politician?

**[Correlations of concepts](https://github.com/EventRegistry/event-registry-node-js/wiki/Correlations)**. Do you have some time series of daily measurements? Why not find the concepts that correlate the most with it based on the number of mentions in the news.

## Data access and usage restrictions

Event Registry is a commercial service but it allows also unsubscribed users to perform a certain number of operations. Free users are not allowed to use the obtained data for any commercial purposes (see the details on our [Terms of Service page](https://newsapi.ai/terms)). In order to avoid these restrictions please contact us about the [available plans](https://newsapi.ai/plans).