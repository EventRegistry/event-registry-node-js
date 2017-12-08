import { CategoryInfoFlags, ConceptInfoFlags, EventRegistry, GetTrendingCategories, GetTrendingConceptGroups, GetTrendingConcepts, ReturnInfo } from "eventregistry";

// examples that illustrate how to obtain the currently top trending concepts or categories
// The trends can be computed based on the number of mentions in the news or based on the shares on social media

const er = new EventRegistry();

const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({trendingHistory: true})});
// top 10 top trending concepts in the news
const q1 = new GetTrendingConcepts({source: "news", count: 10, returnInfo: returnInfo1});
er.execQuery(q1).then((response) => {
    console.info(response);
});

// get 20 most trending concept for each entity type
const q2 = new GetTrendingConceptGroups({source: "news"});
// get top trends for individual concept groups - people, locations and organisations
q2.getConceptTypeGroups();
er.execQuery(q2).then((response) => {
    console.info(response);
});

// top 20 trending concepts in the social media
const q3 = new GetTrendingConcepts({source: "social", count: 20, returnInfo: returnInfo1});
er.execQuery(q3).then((response) => {
    console.info(response);
});

// top 10 trending categories in the news
const returnInfo2 = new ReturnInfo({categoryInfo: new CategoryInfoFlags({parentUri: true, childrenUris: true, trendingHistory: true})});
const q4 = new GetTrendingCategories({source: "news", count: 10, returnInfo: returnInfo2});
er.execQuery(q4).then((response) => {
    console.info(response);
});
