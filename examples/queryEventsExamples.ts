import {
    BaseQuery,
    CombinedQuery,
    ComplexEventQuery,
    ConceptInfoFlags,
    EventInfoFlags,
    EventRegistry,
    QueryEvents,
    QueryEventsIter,
    RequestEventsCategoryAggr,
    RequestEventsConceptAggr,
    RequestEventsConceptGraph,
    RequestEventsConceptTrends,
    RequestEventsInfo,
    RequestEventsUriList,
    ReturnInfo,
} from "eventregistry";

// examples of how to search for events using different search criteria

const er = new EventRegistry();

// get the concept URI that matches label "Barack Obama"
er.getConceptUri("Obama").then((conceptUri) => {
    console.info(`Concept uri for 'Obama' ${conceptUri}`);
});

// USE OF ITERATOR
// example of using the QueryEventsIter to easily iterate through all results matching the search

// query for events related to Barack Obama. return the matching events sorted from the latest to oldest event
// use the iterator class and easily iterate over all matching events
// we specify maxItems to limit the results to maximum 300 results
er.getConceptUri("Obama").then((conceptUri) => {
    const iter = new QueryEventsIter(er, {conceptUri: conceptUri, sortBy: "date", maxItems: 300});
    iter.execQuery((events) => {
        console.info(events);
    });
});
// make a query for events - specify each condition independently
// get events related to obama
er.getConceptUri("Obama").then((conceptUri) => {
    const query = new QueryEvents({conceptUri});
    // return a list of event URIs (i.e. ["eng-234", "deu-234", ...])
    query.setRequestedResult(new RequestEventsUriList());
    const res1 = er.execQuery(query);
    // use the previous query, but change the return details to return information about 30 events that are most related to Obama
    const returnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: "deu", type: ["person", "wiki"]})});
    const requestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "rel", sortByAsc: false, returnInfo: returnInfo});
    query.setRequestedResult(requestEventsInfo);
    const res2 = er.execQuery(query);

    // use the previous query, but this time compute most relevant concepts of type organization or location extracted from events about Obama
    const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["org", "loc"]})});
    const requestEventsConceptAggr = new RequestEventsConceptAggr({conceptCount: 20, returnInfo: returnInfo1});
    query.setRequestedResult(requestEventsConceptAggr);
    const res3 = er.execQuery(query);
});

// get the URI for the BBC news source
er.getNewsSourceUri("BBC").then((sourceUri) => {
    console.info(`Source uri for 'BBC' is ${sourceUri}`);
    // query for events reported by BBC News
    const query = new QueryEvents({sourceUri});
    // return details about 30 events that have been most recently reported by BBC
    const requestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "date", sortByAsc: false});
    query.setRequestedResult(requestEventsInfo);
    const res = er.execQuery(query);
});

// get the category URI that matches label "society issues"
er.getCategoryUri("society issues").then((categoryUri) => {
    console.info(`Category uri for 'society issues' is ${categoryUri}`);
    // query for events related to issues in society
    const query = new QueryEvents({categoryUri});
    // return 30 events that were reported in the highest number of articles
    const requestEventsInfo = new RequestEventsInfo({count: 30, sortBy: "size", sortByAsc: false});
    query.setRequestedResult(requestEventsInfo);
    const res = er.execQuery(query);
});

// find events that occurred in Berlin between 2014-04-16 and 2014-04-28
// from the resulting events produce
// - the trending information about the top people involved in these events
// - info about the categories of these events
// - general information about the 20 most recent events in that time span

er.getLocationUri("Berlin").then((locationUri) => {
    const query = new QueryEvents({locationUri: locationUri, dateStart: "2015-04-16", dateEnd: "2015-04-28"});
    const returnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["person"]})});
    const requestEventsConceptTrends = new RequestEventsConceptTrends({conceptCount: 40, returnInfo});
    query.setRequestedResult(requestEventsConceptTrends);
    const res1 = er.execQuery(query);

    query.setRequestedResult(new RequestEventsCategoryAggr());
    const res2 = er.execQuery(query);

    query.setRequestedResult(new RequestEventsInfo());
    const res3 = er.execQuery(query);
});

// query for events about Obama and produce the concept co-occurrence graph - which concepts appear frequently together in the matching events
er.getConceptUri("Obama").then((conceptUri) => {
    const query = new QueryEvents();
    const requestEventsConceptGraph = new RequestEventsConceptGraph({conceptCount: 200, linkCount: 500, eventsSampleSize: 2000});
    query.setRequestedResult(requestEventsConceptGraph);
    const res = er.execQuery(query);
});

// COMPLEX QUERIES
// examples of complex queries that combine various OR and AND operators

// events that are occurred between 2017-02-05 and 2017-02-05 and are not about business
er.getCategoryUri("Business").then((categoryUri) => {
    const query = QueryEvents.initWithComplexQuery(`
    {
        "$query": {
            "dateStart": "2017-02-05", "dateEnd": "2017-02-06",
            "$not": {
                "categoryUri": "${categoryUri}"
            }
        }
    }
    `);
    const res = er.execQuery(query);
});

// example of a complex query containing a combination of OR and AND parameters
// get events that happened on 2017-02-05 or are about trump or are about politics or are about Merkel and business
// and did not happen on 2017-02-05 or are about Obama
Promise.all([
    er.getConceptUri("Trump"),
    er.getConceptUri("Obama"),
    er.getCategoryUri("politics"),
    er.getConceptUri("merkel"),
    er.getCategoryUri("business"),
]).then(([trumpUri, obamaUri, politicsUri, merkelUri, businessUri]) => {
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
                    { "conceptUri": "${obamaUri}" }
                ]
            }
        }
    }
    `;
    const q1 = QueryEvents.initWithComplexQuery(qStr);
    const res = er.execQuery(q1);

    const cq = new ComplexEventQuery(CombinedQuery.OR([
        new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-05"}),
        new BaseQuery({conceptUri: trumpUri}),
        new BaseQuery({categoryUri: politicsUri}),
    ], CombinedQuery.OR([
        new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-04"}),
        new BaseQuery({conceptUri: obamaUri}),
    ])));

    const returnInfo = new ReturnInfo({eventInfo: new EventInfoFlags({concepts: true, categories: true, stories: true})});

    const iter = QueryEventsIter.initWithComplexQuery(er, cq, {returnInfo, maxItems: 10});
    // example of an ITERATOR with a COMPLEX QUERY
    iter.execQuery((events) => {
        console.info(events);
    });

});
