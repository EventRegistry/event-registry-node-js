// examples that show how to obtain information about an individual event
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
import * as _ from "lodash";

//
// NOTE: if you don't have access to historical data, you have to change the event URI
// to some recent event that you can access in order to run the example
//

const eventUri = "eng-2940883";

const er = new EventRegistry();

// iterate over all articles that belong to a particular event with a given URI
// limit to only articles in English language
const iter1 = new QueryEventArticlesIter(er, eventUri);
iter1.execQuery((article) => {
    console.info(article);
});

const iter2 = new QueryEventArticlesIter(er, eventUri, {keywords: "Obama", keywordsLoc: "title"});
iter2.execQuery((article) => {
    console.info(article);
});

const iter3 = new QueryEventArticlesIter(er, eventUri, { lang: ["eng", "deu"] });
iter3.execQuery((article) => {
    console.info(article);
});

er.getLocationUri("United States").then((unitedStatesUri) => {
    const iter4 = new QueryEventArticlesIter(er, eventUri, {sourceLocationUri: unitedStatesUri});
    iter4.execQuery((article) => {
        console.info(article);
    });
});

// get event info about event with a particular uri
const q1 = new QueryEvent(eventUri);
const returnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: ["eng", "spa", "slv"]})});
const requestEventInfo = new RequestEventInfo(returnInfo);
q1.setRequestedResult(requestEventInfo);
const res1 = er.execQuery(q1);

// get list of 10 articles about the event
const requestEventArticles = new RequestEventArticles({page: 1, count: 10});
// get 10 articles about the event (any language is ok) that are closest to the center of the event
q1.setRequestedResult(requestEventArticles);
const res2 = er.execQuery(q1);

//
// OTHER AGGREGATES ABOUT THE EVENT
//

// get information about how reporting about the event was trending over time
q1.setRequestedResult(new RequestEventArticleTrend());
const res3 = er.execQuery(q1);

// get the tag cloud of top words for the event
q1.setRequestedResult(new RequestEventKeywordAggr());
const res4 = er.execQuery(q1);

// get the tag cloud of top words for the event
q1.setRequestedResult(new RequestEventSourceAggr());
const res5 = er.execQuery(q1);

Promise.all([
    er.getConceptUri("Trump"),
    er.getConceptUri("Obama"),
    er.getConceptUri("Richard Nixon"),
    er.getConceptUri("republican party"),
    er.getConceptUri("democrat party"),
]).then(([trumpUri, obamaUri, nixonUri, republicanUri, democratUri]) => {
    q1.setRequestedResult(new RequestEventSimilarEvents({conceptInfoList: [
        {uri: trumpUri, wgt: 100},
        {uri: obamaUri, wgt: 100},
        {uri: nixonUri, wgt: 30},
        {uri: republicanUri, wgt: 30},
        {uri: democratUri, wgt: 30}
    ]}));
    const res6 = er.execQuery(q1);
});

// obtain in one call information about two events with given uris
const q2 = new QueryEvent(["spa-32", "spa-45"]);
q2.setRequestedResult(new RequestEventArticles({page: 1, count: 100}));
const res7 = er.execQuery(q2);
