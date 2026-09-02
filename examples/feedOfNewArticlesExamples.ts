import { pathToFileURL } from "node:url";
import { ArticleInfoFlags, EventRegistry, GetRecentArticles, QueryArticles, RequestArticlesRecentActivity, ReturnInfo } from "eventregistry";

// this is a simple script that makes a query to ER to get the feed of articles that were added
// in the last minute (from the first to the last second of the minute).
// Note: In order to get all the data you have to make the query each minute

type RecentArticle = {uri?: string; title?: string};
type RecentArticlesResponse = {
    recentActivityArticles?: {
        activity?: RecentArticle[];
        newestUri?: {news?: string; blog?: string; pr?: string};
        currTime?: string;
    };
};

const er = new EventRegistry();
const articleInfo = new ArticleInfoFlags({bodyLen: -1, concepts: true, categories: true});
const returnInfo = new ReturnInfo({ articleInfo });
const recentQ = new GetRecentArticles(er, { returnInfo });

async function fetchUpdates() {
    const articleList = await recentQ.getUpdates();
    for (const article of articleList as RecentArticle[]) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
    // To poll every minute, wrap this call in a loop with `await sleep(60 * 1000)`.
}

async function fetchfilteredUpdates() {
    const query = new QueryArticles({keywords: "Trump", sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestArticlesRecentActivity({
            maxArticleCount: 2000,
        })
    );
    const articleList = await er.execQuery<RecentArticlesResponse>(query);
    const articles = articleList?.recentActivityArticles?.activity ?? [];
    for (const article of articles) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
}

async function fetchfilteredUpdatesWithParam() {
    const query = new QueryArticles({keywords: "Trump", sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestArticlesRecentActivity({
            maxArticleCount: 100,
            updatesAfterMinsAgo: 10,
        })
    );
    const articleList = await er.execQuery<RecentArticlesResponse>(query);
    const articles = articleList?.recentActivityArticles?.activity ?? [];
    for (const article of articles) {
        console.info(`Added article ${article["uri"]}: ${article["title"]}`);
    }
}

async function main(): Promise<void> {
    await fetchUpdates();
    await fetchfilteredUpdates();
    await fetchfilteredUpdatesWithParam();
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
