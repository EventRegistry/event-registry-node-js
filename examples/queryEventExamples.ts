import { ConceptInfoFlags, EventRegistry, QueryEvent, QueryEventArticlesIter, RequestEventArticles, RequestEventArticleTrend, RequestEventInfo, RequestEventKeywordAggr, ReturnInfo } from "eventregistry";
import * as _ from "lodash";

// examples that show how to obtain information about an individual event

const er = new EventRegistry();

// iterate over all articles that belong to a particular event with a given URI
// limit to only articles in English language
const iter = new QueryEventArticlesIter(er, "eng-2940883");
iter.execQuery((articles) => {
    console.info(articles);
});

// get event info about event with a particular uri
const q1 = new QueryEvent("eng-88");
const returnInfo = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: ["eng", "spa", "slv"]})});
const requestEventInfo = new RequestEventInfo(returnInfo);
q1.setRequestedResult(requestEventInfo);
const res1 = er.execQuery(q1);

// get list of 10 articles about the event
const requestEventArticles = new RequestEventArticles({page: 1, count: 10});
// get 10 articles about the event (any language is ok) that are closest to the center of the event
q1.setRequestedResult(requestEventArticles);
const res2 = er.execQuery(q1);

// get information about how reporting about the event was trending over time
q1.setRequestedResult(new RequestEventArticleTrend());
const res3 = er.execQuery(q1);

// get the tag cloud of top words for the event
q1.setRequestedResult(new RequestEventKeywordAggr());
const res4 = er.execQuery(q1);

// obtain in one call information about two events with given uris
const q2 = new QueryEvent(["spa-32", "spa-45"]);
q2.setRequestedResult(new RequestEventArticles({page: 1, count: 200}));
const res5 = er.execQuery(q2);
