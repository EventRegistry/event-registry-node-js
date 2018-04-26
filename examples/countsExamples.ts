import { EventRegistry, GetCounts, GetCountsEx } from "eventregistry";

// examples showing how to obtain information how frequently a particular concept is mentioined in
// the news articles, or an article is about a particular category

const er = new EventRegistry();

Promise.all([er.getConceptUri("Trump"), er.getConceptUri("ebola")]).then((conceptUris) => {
    const q = new GetCounts(conceptUris, {startDate: "2015-05-15", endDate: "2015-05-20"});
    er.execQuery(q).then((response) => {
        console.info(response);
    });
});

er.getCategoryUri("Business").then((categoryUri) => {
    const q = new GetCountsEx([categoryUri], {type: "category"});
    er.execQuery(q).then((response) => {
        console.info(response);
    });
});
// get geographic spreadness of the concept Obama
er.getCategoryUri("Obama").then((conceptUri) => {
    const q = new GetCounts([conceptUri], {source: "geo"});
    er.execQuery(q).then((response) => {
        console.info(response);
    });
});
// get the sentiment expressed about Obama
er.getCategoryUri("Obama").then((conceptUri) => {
    const q = new GetCounts([conceptUri], {source: "sentiment"});
    er.execQuery(q).then((response) => {
        console.info(response);
    });
});
// get the stock prices for Apple
er.getCustomConceptUri("apple").then((customConceptUri) => {
    const q = new GetCounts(customConceptUri, {source: "custom"});
    er.execQuery(q).then((response) => {
        console.info(response);
    });
});
