import { pathToFileURL } from "node:url";
import {
    BaseQuery,
    CombinedQuery,
    ComplexEventQuery,
    ConceptInfoFlags,
    EventInfoFlags,
    EventRegistry,
    QueryEvents,
    QueryEventsIter,
    QueryItems,
    RequestEventsCategoryAggr,
    RequestEventsConceptAggr,
    RequestEventsConceptGraph,
    RequestEventsConceptTrends,
    RequestEventsInfo,
    RequestEventsLocAggr,
    RequestEventsTimeAggr,
    ReturnInfo,
    searchEvents,
} from "eventregistry";

// examples of how to search for events using different search criteria

const er = new EventRegistry();

// ---------------------------------------------------------------------------
// RECOMMENDED: fluent + helpers (see MIGRATION.md for the full guide)
// ---------------------------------------------------------------------------

// resolve a concept label into its uri (throws if there's no match)
async function fluentConceptLookup() {
    const conceptUri = await er.concepts.uri("Barack Obama");
    console.info(`Concept uri for 'Obama' ${conceptUri}`);
}

// helper function: build + execute a QueryEvents + RequestEventsInfo in one call
async function fluentSearchObamaEvents() {
    const conceptUri = await er.concepts.uri("Obama");
    const response = await searchEvents(er, {conceptUri, sortBy: "socialScore"});
    console.info(response);
}

// fluent, chained: er.events.search(...).info(...).exec()
async function fluentSearchObamaEventsChained() {
    const conceptUri = await er.concepts.uri("Obama");
    const response = await er.events.search({conceptUri}).info({sortBy: "date", count: 10}).exec();
    console.info(response);
}

// fluent auto-paging iterator, equivalent to the classic QueryEventsIter below
async function fluentIterateObamaEvents() {
    const conceptUri = await er.concepts.uri("Obama");
    for await (const event of er.events.iterate({conceptUri, sortBy: "date", maxItems: 300})) {
        console.info(event);
    }
}

// fluent single-event fetch — needs a uri from a prior search; not invoked here
async function fluentGetEvent(eventUri: string) {
    const event = await er.events.get(eventUri);
    console.info(event);
}

// ---------------------------------------------------------------------------
// CLASSIC API (fully supported) — same requests, spelled out with Query*/Request* classes
// ---------------------------------------------------------------------------

async function runClassic(): Promise<void> {
    // get the concept URI that matches label "Barack Obama"
    const obamaLabelUri = await er.getConceptUri("Obama");
    console.info(`Concept uri for 'Obama' ${obamaLabelUri}`);

    // USE OF ITERATOR
    // example of using the QueryEventsIter to easily iterate through all results matching the search

    // query for events related to Barack Obama. return the matching events sorted from the latest to oldest event
    // use the iterator class and easily iterate over all matching events
    // we specify maxItems to limit the results to maximum 300 results
    const obamaIterUri = await er.getConceptUri("Obama");
    const iter = new QueryEventsIter(er, {conceptUri: obamaIterUri, sortBy: "date", maxItems: 300});
    for await (const event of iter) {
        console.info(event);
    }

    /**
     * find events that:
     * - are about Barack Obama
     * - that were covered also by New York Times
     * - that occurred in 2015
     * - return events sorted by how much were articles in the event shared on social media (instead of relevance, which is default)
     */
    const [obamaUri, nytimesUri] = await Promise.all([er.getConceptUri("Obama"), er.getSourceUri("new york times")]);
    const socialQuery = new QueryEvents({conceptUri: obamaUri, dateStart: "2015-01-01", dateEnd: "2015-12-31", sourceUri: nytimesUri});
    // return a list of event URIs (i.e. ["eng-234", "deu-234", ...])
    socialQuery.setRequestedResult(new RequestEventsInfo({sortBy: "socialScore"}));
    console.info(await er.execQuery(socialQuery));

    /**
     * find events that:
     * - contain articles that mention words Apple, Google and Samsung
     * - contain at least one article from a news source that is located in Italy
     */
    const italyUri = await er.getLocationUri("Italy");
    const query = new QueryEvents({keywords: QueryItems.AND(["Apple", "Google", "Samsung"]), sourceLocationUri: italyUri});
    console.info(await er.execQuery(query));

    /**
     * use the previous query, but change the return details to return information about 30 events sorted from latest to oldest
     * when providing the concept information include the labels of the concept in German language
     */
    const returnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: "deu", type: ["person", "wiki"]})});
    const requestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "date", sortByAsc: false, returnInfo: returnInfo});
    query.setRequestedResult(requestEventsInfo);
    console.info(await er.execQuery(query));

    // use the previous query, but this time compute most relevant concepts of type organization or location extracted from events about Obama
    const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["org", "loc"]})});
    const requestEventsConceptAggr = new RequestEventsConceptAggr({conceptCount: 20, returnInfo: returnInfo1});
    query.setRequestedResult(requestEventsConceptAggr);
    console.info(await er.execQuery(query));

    // get the URI for the BBC news source
    const bbcSourceUri = await er.getNewsSourceUri("BBC");
    console.info(`Source uri for 'BBC' is ${bbcSourceUri}`);
    // query for events that were reported by BBC News
    const bbcQuery = new QueryEvents({sourceUri: bbcSourceUri});
    // return details about 30 events that have been most recently reported by BBC
    const bbcRequestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "date", sortByAsc: false});
    bbcQuery.setRequestedResult(bbcRequestEventsInfo);
    console.info(await er.execQuery(bbcQuery));

    // get the category URI that matches label "society issues"
    const categoryUri = await er.getCategoryUri("society issues");
    console.info(`Category uri for 'society issues' is ${categoryUri}`);
    // query for events related to issues in society
    const societyQuery = new QueryEvents({categoryUri});
    // return 30 events that were reported in the highest number of articles
    const societyRequestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "size", sortByAsc: false});
    societyQuery.setRequestedResult(societyRequestEventsInfo);
    console.info(await er.execQuery(societyQuery));

    //
    // OTHER AGGREGATES (INSTEAD OF OBTAINING EVENTS)
    //
    // find events that occurred in Germany between 2014-04-16 and 2014-04-28
    // from the resulting events produce:

    const germanyUri = await er.getLocationUri("Germany");
    const q = new QueryEvents({locationUri: germanyUri, dateStart: "2017-12-16", dateEnd: "2018-01-28"});
    // get the list of top concepts about the events that match criteria
    q.setRequestedResult(new RequestEventsConceptAggr());
    console.info(await er.execQuery(q));
    // find where the events occurred geographically
    q.setRequestedResult(new RequestEventsLocAggr());
    console.info(await er.execQuery(q));
    // find when the events matching the criteria occurred
    q.setRequestedResult(new RequestEventsTimeAggr());
    console.info(await er.execQuery(q));
    // the trending information about the top people involved in these events
    q.setRequestedResult(new RequestEventsConceptTrends({conceptCount: 40, returnInfo: new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["person"]})})}));
    console.info(await er.execQuery(q));
    // get the top categories about the same events
    q.setRequestedResult(new RequestEventsCategoryAggr());
    console.info(await er.execQuery(q));

    // find events that occurred in Berlin between 2014-04-16 and 2014-04-28
    // from the resulting events produce
    // - the trending information about the top people involved in these events
    // - info about the categories of these events
    // - general information about the 20 most recent events in that time span

    const locationUri = await er.getLocationUri("Berlin");
    const berlinQuery = new QueryEvents({locationUri: locationUri, dateStart: "2015-04-16", dateEnd: "2015-04-28"});
    const berlinReturnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["person"]})});
    const requestEventsConceptTrends = new RequestEventsConceptTrends({conceptCount: 40, returnInfo: berlinReturnInfo});
    berlinQuery.setRequestedResult(requestEventsConceptTrends);
    console.info(await er.execQuery(berlinQuery));

    berlinQuery.setRequestedResult(new RequestEventsCategoryAggr());
    console.info(await er.execQuery(berlinQuery));

    berlinQuery.setRequestedResult(new RequestEventsInfo());
    console.info(await er.execQuery(berlinQuery));

    // query for events about Obama and produce the concept co-occurrence graph - which concepts appear frequently together in the matching events
    const graphConceptUri = await er.getConceptUri("Obama");
    if (graphConceptUri !== undefined) {
        const graphQuery = new QueryEvents({ conceptUri: graphConceptUri });
        const requestEventsConceptGraph = new RequestEventsConceptGraph({conceptCount: 200, linkCount: 500, eventsSampleSize: 2000});
        graphQuery.setRequestedResult(requestEventsConceptGraph);
        console.info(await er.execQuery(graphQuery));
    }

    // COMPLEX QUERIES
    // examples of complex queries that combine various OR and AND operators

    // events that are occurred between 2017-02-05 and 2017-02-05 and are not about business
    const businessCategoryUri = await er.getCategoryUri("Business");
    const businessExcludeQuery = QueryEvents.initWithComplexQuery(`
    {
        "$query": {
            "dateStart": "2017-02-05", "dateEnd": "2017-02-06",
            "$not": {
                "categoryUri": "${businessCategoryUri}"
            }
        }
    }
    `);
    console.info(await er.execQuery(businessExcludeQuery));

    /**
     * get events that:
     * - happened on 2017-02-05
     * - are about trump, or
     * - are about politics, or
     * - are about Merkel and business
     * and did not happen on 2017-02-04 or are about Obama
     */
    const [trumpUri, complexObamaUri, politicsUri, merkelUri, businessUri] = await Promise.all([
        er.getConceptUri("Trump"),
        er.getConceptUri("Obama"),
        er.getCategoryUri("politics"),
        er.getConceptUri("merkel"),
        er.getCategoryUri("business"),
    ]);
    const qStr = `
    {
        "$query": {
            "$or": [
                { "dateStart": "2017-02-05", "dateEnd": "2017-02-05" },
                { "conceptUri": "${trumpUri}" },
                { "categoryUri": "${politicsUri}" },
                {
                    "$and": [
                        { "conceptUri": "${merkelUri}" },
                        { "categoryUri": "${businessUri}" }
                    ]
                }
            ],
            "$not": {
                "$or": [
                    { "dateStart": "2017-02-04", "dateEnd": "2017-02-04" },
                    { "conceptUri": "${complexObamaUri}" }
                ]
            }
        }
    }
    `;
    const q1 = QueryEvents.initWithComplexQuery(qStr);
    console.info(await er.execQuery(q1));

    const cq = new ComplexEventQuery(CombinedQuery.OR([
        new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-05"}),
        new BaseQuery({conceptUri: trumpUri}),
        new BaseQuery({categoryUri: politicsUri}),
    ], CombinedQuery.OR([
        new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-04"}),
        new BaseQuery({conceptUri: complexObamaUri}),
    ])));

    const complexReturnInfo = new ReturnInfo({eventInfo: new EventInfoFlags({concepts: true, categories: true, stories: true})});

    const complexIter = QueryEventsIter.initWithComplexQuery(er, cq, {returnInfo: complexReturnInfo, maxItems: 10});
    // example of an ITERATOR with a COMPLEX QUERY
    for await (const event of complexIter) {
        console.info(event);
    }
}

async function main(): Promise<void> {
    await fluentConceptLookup();
    await fluentSearchObamaEvents();
    await fluentSearchObamaEventsChained();
    await fluentIterateObamaEvents();
    await runClassic();
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
