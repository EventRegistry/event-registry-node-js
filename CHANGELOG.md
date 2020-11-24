# NodeJS SDK: Change Log

This log contains changes specific to the NodeJS SDK.

## [v8.9]() (2020-11-24)

**Added**

- added `required` and `excluded` optional parameters to the TopicPage class to methods `addConcept`, `addKeyword`, `addCategory`, `addSource`, `addSourceLocation` and `addSourceGroup`.
- exceptions are now raised by the SDK library in case of status codes 204, 400, 401, 403 and 530. The meaning of the above status codes is described on the [documentation page](https://eventregistry.org/documentation?tab=introduction).
-
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
