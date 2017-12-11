import { ArticleInfoFlags, EventRegistry, GetRecentArticles, ReturnInfo, sleep } from "eventregistry";
import * as _ from "lodash";

// this is a simple script that makes a query to ER to get the feed of articles that were added
// in the last minute (from the first to the last second of the minute).
// Note: In order to get all the data you have to make the query each minute

const er = new EventRegistry();
const articleInfo = new ArticleInfoFlags({bodyLen: -1, concepts: true, categories: true});
const returnInfo = new ReturnInfo({ articleInfo });
const recentQ = new GetRecentArticles(er, { returnInfo });

// Simple use case of the ES& async/await
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
