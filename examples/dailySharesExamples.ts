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

// get top shared articles for a date
const q1 = new GetTopSharedArticles({date: "2015-03-01", count: 30});
q1.setRequestedResult(new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})}));
er.execQuery(q1).then((response) => {
    console.info(response);
});

// get top shared events for a date
const q2 = new GetTopSharedEvents({date: "2015-05-23", count: 30});
q1.setRequestedResult(new ReturnInfo({eventInfo: new EventInfoFlags({socialScore: true})}));
er.execQuery(q2).then((response) => {
    console.info(response);
});

// get social shared information for resulting articles
er.getConceptUri("Apple").then((conceptUri) => {
    const q3 = new QueryArticles({ conceptUri });
    const returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})});
    const requestArticlesInfo = new RequestArticlesInfo({
        count: 5,
        sortBy: "socialScore",
        returnInfo: returnInfo,
    });
    q3.setRequestedResult(requestArticlesInfo);
    return er.execQuery(q3);
}).then((response) => {
    console.info(response);
});

// get social shared information for resulting events
er.getConceptUri("Apple").then((conceptUri) => {
    const q4 = new QueryEvents({ conceptUri });
    const returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({socialScore: true})});
    const requestEventsInfo = new RequestEventsInfo({count: 5, sortBy: "socialScore", returnInfo: returnInfo});
    q4.setRequestedResult(requestEventsInfo);
    return er.execQuery(q4);
}).then((response) => {
    console.info(response);
});
