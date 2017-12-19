## Accessing Event Registry data through JS

This library contains classes that allow one to easily access the event and article information from Event Registry (http://eventregistry.org).

Most of the package is quite similar to https://github.com/EventRegistry/event-registry-python[Event Registry Python] so for all who are already acquainted with the Python version, there shouldn't be any problems with using this package. Though we strongly suggest using a JS transpiler or Typescript to employ the latest in ECMAScript standards.

### Installation

Event Registry package can be installed using the NodeJS Package Manager. Type the following in the command line:

`npm install eventregistry`

and the package should be installed. Alternatively, you can also clone the package from the GitHub repository. After cloning it, open the command line and run:

`npm build`

### Validating installation 

To ensure that the package has been properly installed type the following in your Typescript file:

`import { EventRegistry } from "eventregistry";`

And if you are using plain Javascript.

`var er = require("eventregistry");`

If this doesn't produce any kind of error messages then your installation has been successful.

### Updating the package

As features are added to the package you will need at some point to update it. In case you have downloaded the package from GitHub simply do a `git pull`. If you have installed it using the `npm` command, then simply run:

`npm update eventregistry`

### Authentication and API key

When making queries to Event Registry you will have to use an API key that you can obtain for free. 

### Three simple examples to make you interested

**Print a list of recently added articles mentioning George Clooney**

``` typescript
import {EventRegistry, QueryArticlesIter} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("George Clooney").then((conceptUri) => {
    const q = new QueryArticlesIter(er, {conceptUri: conceptUri, sortBy: "date"});
    q.execQuery((items) => {
        for(const item of items) {
            console.info(item);
        }
    })
});
```

Alternative approach using the new ES6 `async/await` pattern.

``` typescript
import {EventRegistry, QueryArticlesIter} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

async function iterateOverArticles() {
    const q = new QueryArticlesIter(er, {conceptUri: await er.getConceptUri("George Clooney"), sortBy: "date"});
    q.execQuery((items) => {
        for(const item of items) {
            console.info(item);
        }
    })
}

iterateOverArticles();
```

**Search for latest events related to Star Wars**

``` typescript
import {EventRegistry, QueryEvents, RequestEventsInfo} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

er.getConceptUri("Star Wars").then((conceptUri) => {
    const q = new QueryEvents({conceptUri: conceptUri});
    const requestEventsInfo = new RequestEventsInfo({sortBy: "date", count: 10});
    q.addRequestedResult(requestEventsInfo);
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
    q.addRequestedResult(requestEventsInfo);
    return er.execQuery(q);
}

iterateOverEvents();
```

**What are the currently trending topics**

``` typescript
import {EventRegistry, GetTrendingConcepts} from "eventregistry";

const er = new EventRegistry({apiKey: "YOUR_API_KEY"});

const q = new GetTrendingConcepts({source: "news", count: 10});
er.execQuery(q).then((response) => {
    console.info(response);
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

Event Registry is a commercial service but it allows also unsubscribed users to perform a certain number of operations. Free users are not allowed to use the obtained data for any commercial purposes (see the details on our [Terms of Service page](http://eventregistry.org/terms)). In order to avoid these restrictions please contact us about the [available plans](http://eventregistry.org/pricing).