# NodeJS SDK: Change Log

This log contains changes specific to the NodeJS SDK.

## [v8.3.0]() (2018-08-06)

**Added**
 - Implemented all the latest changes as seen in the Python SDK.

**Breaking**
- `QueryArticlesIter`, `QueryEventArticlesIter` and `QueryEventsIter` now return one item at a time instead of the whole page (array) of items.

**Changed**
- Updated to Typescript 3.0.
- Version bump to be more inline with the Python SDK versioning
- It's no longer possible to specify batch sizes for `QueryArticlesIter`, `QueryEventArticlesIter` and `QueryEventsIter`.