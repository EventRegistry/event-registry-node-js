import { pathToFileURL } from "node:url";
import {
    ConceptInfoFlags,
    EventRegistry,
    QueryEvent,
    QueryEventArticlesIter,
    RequestEventArticles,
    RequestEventArticleTrend,
    RequestEventInfo,
    RequestEventKeywordAggr,
    RequestEventSimilarEvents,
    RequestEventSourceAggr,
    ReturnInfo,
} from "eventregistry";

//
// NOTE: if you don't have access to historical data, you have to change the event URI
// to some recent event that you can access in order to run the example
//

const eventUri = "eng-2940883";
const er = new EventRegistry();

async function main(): Promise<void> {
    const iter1 = new QueryEventArticlesIter(er, eventUri);
    for await (const article of iter1) {
        console.info(article);
    }

    const iter2 = new QueryEventArticlesIter(er, eventUri, {keywords: "Obama", keywordsLoc: "title"});
    for await (const article of iter2) {
        console.info(article);
    }

    const iter3 = new QueryEventArticlesIter(er, eventUri, { lang: ["eng", "deu"] });
    for await (const article of iter3) {
        console.info(article);
    }

    const unitedStatesUri = await er.getLocationUri("United States");
    const iter4 = new QueryEventArticlesIter(er, eventUri, {sourceLocationUri: unitedStatesUri});
    for await (const article of iter4) {
        console.info(article);
    }

    const q1 = new QueryEvent(eventUri);
    q1.setRequestedResult(new RequestEventInfo(new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: ["eng", "spa", "slv"]})})));
    console.info(await er.execQuery(q1));

    q1.setRequestedResult(new RequestEventArticles({page: 1, count: 10}));
    console.info(await er.execQuery(q1));

    q1.setRequestedResult(new RequestEventArticleTrend());
    console.info(await er.execQuery(q1));

    q1.setRequestedResult(new RequestEventKeywordAggr());
    console.info(await er.execQuery(q1));

    q1.setRequestedResult(new RequestEventSourceAggr());
    console.info(await er.execQuery(q1));

    const [trumpUri, obamaUri, nixonUri, republicanUri, democratUri] = await Promise.all([
        er.getConceptUri("Trump"),
        er.getConceptUri("Obama"),
        er.getConceptUri("Richard Nixon"),
        er.getConceptUri("republican party"),
        er.getConceptUri("democrat party"),
    ]);
    if (trumpUri !== undefined && obamaUri !== undefined && nixonUri !== undefined && republicanUri !== undefined && democratUri !== undefined) {
        q1.setRequestedResult(new RequestEventSimilarEvents({conceptInfoList: [
            {uri: trumpUri, wgt: 100},
            {uri: obamaUri, wgt: 100},
            {uri: nixonUri, wgt: 30},
            {uri: republicanUri, wgt: 30},
            {uri: democratUri, wgt: 30}
        ]}));
        console.info(await er.execQuery(q1));
    }

    const q2 = new QueryEvent(["spa-32", "spa-45"]);
    q2.setRequestedResult(new RequestEventArticles({page: 1, count: 100}));
    console.info(await er.execQuery(q2));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
