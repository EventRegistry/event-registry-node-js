import { pathToFileURL } from "node:url";
import { CategoryInfoFlags, ConceptInfoFlags, EventRegistry, GetTrendingCategories, GetTrendingConceptGroups, GetTrendingConcepts, ReturnInfo } from "eventregistry";

// examples that illustrate how to obtain the currently top trending concepts or categories
// The trends can be computed based on the number of mentions in the news or based on the shares on social media

const er = new EventRegistry();

async function main(): Promise<void> {
    const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({trendingHistory: true})});
    const q1 = new GetTrendingConcepts({source: "news", count: 10, returnInfo: returnInfo1});
    console.info(await er.execQuery(q1));

    const q2 = new GetTrendingConceptGroups({source: "news"});
    q2.getConceptTypeGroups();
    console.info(await er.execQuery(q2));

    const q3 = new GetTrendingConcepts({source: "social", count: 20, returnInfo: returnInfo1});
    console.info(await er.execQuery(q3));

    const returnInfo2 = new ReturnInfo({categoryInfo: new CategoryInfoFlags({parentUri: true, childrenUris: true, trendingHistory: true})});
    const q4 = new GetTrendingCategories({source: "news", count: 10, returnInfo: returnInfo2});
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
