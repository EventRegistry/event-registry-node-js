import { pathToFileURL } from "node:url";
import {
    ArticleInfoFlags,
    EventInfoFlags,
    EventRegistry,
    GetTopSharedArticles,
    GetTopSharedEvents,
    QueryArticles,
    QueryEvents,
    RequestArticlesInfo,
    RequestEventsInfo,
    ReturnInfo,
} from "eventregistry";

// examples to obtain information what are the top fb shared articles on a particular day or
// what are the events, for which the articles were shared the most

const er = new EventRegistry();

async function main(): Promise<void> {
    const q1 = new GetTopSharedArticles({date: "2015-03-01", count: 30, returnInfo: new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})})});
    console.info(await er.execQuery(q1));

    const q2 = new GetTopSharedEvents({date: "2015-05-23", count: 30, returnInfo: new ReturnInfo({eventInfo: new EventInfoFlags({socialScore: true})})});
    console.info(await er.execQuery(q2));

    const appleUri = await er.getConceptUri("Apple");
    if (appleUri === undefined) {
        return;
    }

    const q3 = new QueryArticles({ conceptUri: appleUri });
    q3.setRequestedResult(new RequestArticlesInfo({
        count: 5,
        sortBy: "socialScore",
        returnInfo: new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})}),
    }));
    console.info(await er.execQuery(q3));

    const q4 = new QueryEvents({ conceptUri: appleUri });
    q4.setRequestedResult(new RequestEventsInfo({
        count: 5,
        sortBy: "socialScore",
        returnInfo: new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})}),
    }));
    console.info(await er.execQuery(q4));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
