import { ArticleInfoFlags, EventRegistry, GetRecentArticles, QueryArticles, RequestArticlesRecentActivity, ReturnInfo, sleep } from "eventregistry";

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
    for (const article of articleList) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
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

let updatesAfterNewsUri;
let updatesafterBlogUri;
let updatesAfterPrUri;
async function fetchfilteredUpdates() {
    const query = new QueryArticles({keywords: "Trump", sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestArticlesRecentActivity({
            // download at most 2000 articles. if less of matching articles were added in last 10 minutes, less will be returned
            maxArticleCount: 2000,
            updatesAfterNewsUri: updatesAfterNewsUri,
            updatesafterBlogUri: updatesafterBlogUri,
            updatesAfterPrUri: updatesAfterPrUri,
        })
    );
    const articleList = await er.execQuery(query);
    const articles = articleList?.recentActivityArticles?.activity ?? [];
    // TODO: do here whatever you need to with the articleList
    for (const article of articles) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }

    // remember what are the latest uris of the individual data items returned
    updatesAfterNewsUri = articleList?.recentActivityArticles?.newestUri?.news;
    updatesafterBlogUri = articleList?.recentActivityArticles?.newestUri?.blog;
    updatesAfterPrUri = articleList?.recentActivityArticles?.newestUri?.pr;

    // wait for 10 minutes until next batch of new content is ready
    await sleep(600 * 1000);
    fetchfilteredUpdates();
}

let updatesAfterTm;

async function fetchfilteredUpdatesWithParam() {
    const query = new QueryArticles({keywords: "Trump", sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestArticlesRecentActivity({
            maxArticleCount: 100,
            // consider articles that were published at most 10 minutes ago
            updatesAfterTm,
        })
    );
    const articleList = await er.execQuery(query);
    // TODO: do here whatever you need to with the articleList
    const articles = articleList?.recentActivityArticles?.activity ?? [];

    for (const article of articles) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    updatesAfterTm = articleList.recentActivityArticles.currTime;
    fetchfilteredUpdatesWithParam();
}