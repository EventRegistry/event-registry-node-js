import { ArticleInfoFlags, EventRegistry, GetRecentArticles, QueryArticles, RequestArticlesRecentActivity, ReturnInfo, sleep } from "eventregistry";
import * as _ from "lodash";

// this is a simple script that makes a query to ER to get the feed of articles that were added
// in the last minute (from the first to the last second of the minute).
// Note: In order to get all the data you have to make the query each minute

const er = new EventRegistry();
const articleInfo = new ArticleInfoFlags({bodyLen: -1, concepts: true, categories: true});
const returnInfo = new ReturnInfo({ articleInfo });
const recentQ = new GetRecentArticles(er, { returnInfo });

// Simple use case of the ES6 async/await
async function fetchUpdates() {
    const articleList = await recentQ.getUpdates();
    // TODO: do here whatever you need to with the articleList
    _.each(articleList, (article) => {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    });
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    fetchUpdates();
}

/**
 * if you would like to obtain the list of articles recently added, but not necessarily the full feed of articles
 * then use the call as below. In this case you can filter the articles to a subset based on
 * keywords, concepts, categories, language, source, etc.
 * You can also request more than 100 articles per call.
 */
async function fetchfilteredUpdates() {
    const query = new QueryArticles({keywords: "Trump", sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestArticlesRecentActivity({
            // download at most 2000 articles. if less of matching articles were added in last 10 minutes, less will be returned
            maxArticleCount: 2000,
            // consider articles that were published at most 10 minutes ago
            updatesAfterMinsAgo: 10,
        })
    );
    const articleList = await er.execQuery(query);
    // TODO: do here whatever you need to with the articleList
    for (const article of _.get(articleList, "recentActivityArticles.activity", [])) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    fetchfilteredUpdates();
}
