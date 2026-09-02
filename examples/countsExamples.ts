import { pathToFileURL } from "node:url";
import { EventRegistry, GetCounts, GetCountsEx } from "eventregistry";

// examples showing how to obtain information how frequently a particular concept is mentioined in
// the news articles, or an article is about a particular category

const er = new EventRegistry();

async function main(): Promise<void> {
    const conceptUris = (await Promise.all([er.getConceptUri("Trump"), er.getConceptUri("ebola")]))
        .filter((uri): uri is string => uri !== undefined);
    console.info(await er.execQuery(new GetCounts(conceptUris, {dateStart: "2015-05-15", dateEnd: "2015-05-20"})));

    const categoryUri = await er.getCategoryUri("Business");
    if (categoryUri !== undefined) {
        console.info(await er.execQuery(new GetCountsEx([categoryUri], {type: "category"})));
    }

    const obamaUri = await er.getConceptUri("Obama");
    if (obamaUri === undefined) {
        return;
    }
    // get geographic spreadness of the concept Obama
    console.info(await er.execQuery(new GetCounts([obamaUri], {source: "geo"})));
    // get the sentiment expressed about Obama
    console.info(await er.execQuery(new GetCounts([obamaUri], {source: "sentiment"})));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
