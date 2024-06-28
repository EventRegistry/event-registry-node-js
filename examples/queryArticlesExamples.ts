import { ArticleInfoFlags, BaseQuery, CombinedQuery, ComplexArticleQuery, EventRegistry, ConceptInfoFlags, QueryArticle, QueryArticles, QueryArticlesIter, QueryItems, RequestArticlesInfo, RequestArticlesRecentActivity, ReturnInfo } from "eventregistry";

// examples that illustrate how to query articles using different search options

const er = new EventRegistry({allowUseOfArchive: false});
const articleInfo = new ArticleInfoFlags({ duplicateList: true, concepts: true, categories: true, location: true, image: true, conceptInfo: new ConceptInfoFlags({trendingScore: true}) });
const returnInfo = new ReturnInfo({articleInfo});
const requestArticlesInfo = new RequestArticlesInfo({count: 30, returnInfo: returnInfo});

const MAX_RESULTS = 100;
const query = new QueryArticlesIter(er, {keywords: "Tesla Inc", maxItems: MAX_RESULTS});
query.execQuery((item) => {
    console.info(item);
});

// search for the phrase "Barack Obama" - both words have to appear together
const q1 = new QueryArticles({keywords: "Barack Obama"});
er.execQuery(q1).then((response) => {
    console.info(response);
});

// search for articles that mention both of the two words - maybe together, maybe apart
// this form of specifying multiple keywords, concepts, etc is now deprecated. When you have a list,
// use it with QueryItems.AND() or QueryItems.OR() to explicitly specify how the query should be processed
const q2 = new QueryArticles({keywords: ["Barack", "Obama"]});
// set some custom information that should be returned as a result of the query
q2.setRequestedResult(requestArticlesInfo);
er.execQuery(q2).then((response) => {
    console.info(response);
});

// search for articles that mention both of the two words - maybe together, maybe apart
// the correct way of specifying multiple keywords - using QueryItems.AND or .OR classes
const q3 = new QueryArticles({keywords: QueryItems.AND(["Barack", "Obama"])});
// set some custom information that should be returned as a result of the query
q3.setRequestedResult(requestArticlesInfo);
er.execQuery(q3).then((response) => {
    console.info(response);
});

// search for articles that mention the phrase "Barack Obama" or Trump
const q4 = new QueryArticles({keywords: QueryItems.AND(["Barack Obama", "Trump"])});
q4.setRequestedResult(requestArticlesInfo);
er.execQuery(q4).then((response) => {
    console.info(response);
});

// if you already have some articles that you have received from Event Registry
// for which you would like to obtain some potentially updated metadata (shared counts, event uri)
// you can use the query shown below. When making such a query you can specify up to 100 article uris in a call.
const q = QueryArticles.initWithArticleUriList(["934903913", "934902493", "934902499", "934902488", "934899375", "934900984", "934890360", "934888250"]);
const res = er.execQuery(q);

/**
 * Search for articles that:
 * - mentions the concept Samsung
 * - mention the phrase "iphone" in the article title
 * - by BBC or by any news source located in Germany
 * - in English or German language
 * - return results sorted by relevance to the query (instead of "date" which is default)
 */
Promise.all([
    er.getConceptUri("Samsung"),
    er.getSourceUri("bbc"),
    er.getLocationUri("Germany"),
]).then(([samsungUri, bbcUri, germanyUri]) => {
    const query1 = new QueryArticles({
        conceptUri: samsungUri,
        keywords: "iphone",
        keywordsLoc: "title",
        lang: ["eng", "deu"],
        sourceUri: bbcUri,
        sourceLocationUri: germanyUri,
    });
    query1.setRequestedResult(new RequestArticlesInfo({sortBy: "rel"}));
    return er.execQuery(query1);
}).then((response) => {
    console.log(response);
});

/**
 * Find articles that:
 *  - are related to business (categorized into business category)
 *  - were published between 1st and 20th August 2018
 *  - don't mention Trump in the article title
 *  - are not a duplicate (copy) of another article
 *  - are from a news source that is among top 20 percentile of sources
 *  - return results sorted from most shared on social media to least
 */
er.getCategoryUri("business").then((businessUri) => {
    const query1 = new QueryArticles({
            categoryUri: businessUri,
            dateStart: "2018-08-01",
            dateEnd: "2018-08-20",
            ignoreKeywords: "Trump",
            ignoreKeywordsLoc: "title",
            isDuplicateFilter: "skipDuplicates",
            startSourceRankPercentile: 0,
            endSourceRankPercentile: 20,
    });
    query1.setRequestedResult(new RequestArticlesInfo({sortBy: "socialScore"}));
    return er.execQuery(query1);
}).then((response) => {
    console.log(response);
});

//  USE OF ITERATOR
//  example of using the QueryArticlesIter to easily iterate through all results matching the search

//  Search for articles mentioning George Clooney that were reported from sources from Spain or sources from Los Angeles
//  iterator class simplifies retrieving and listing the list of matching articles
//  by specifying maxItems we say that we want to retrieve maximum 500 articles (without specifying the parameter we would iterate through all results)
//  the results will be sorted from those that are from highest ranked news sources down

Promise.all([
    er.getConceptUri("George Clooney"),
    er.getLocationUri("Spain"),
    er.getLocationUri("Los Angeles"),
]).then(([clooneyUri, spainUri, laUri]) => {
    const iterOpts = {
        sortBy: "sourceAlexaGlobalRank",
        maxItems: 500,
        returnInfo: new ReturnInfo({articleInfo: new ArticleInfoFlags({concepts: true, categories: true, location: true, image: true})}),
        conceptUri: clooneyUri,
        sourceLocationUri:  QueryItems.OR([spainUri, laUri]),
    };
    const q5 = new QueryArticlesIter(er, iterOpts);
    q5.execQuery((item) => {
        console.info(item);
    });
});

// query articles using the QueryArticles class
// old way of iterating through the pages of results - requesting results page by page
async function fetchArticlePage(query: QueryArticles, page: number) {
    query.setRequestedResult(new RequestArticlesInfo({page}));
    return await er.execQuery(query);
}

async function fetchArticles(conceptUri) {
    await er.getConceptUri(conceptUri);
    const query = new QueryArticles({conceptUri});
    let page = 1;
    while (true) {
        const response = await fetchArticlePage(query, page);
        for (const article of _.get(response, "articles.results", [])) {
            console.info(article.uri);
        }
        if (page >= _.get(response, "articles.pages")) {
            break;
        }
        page++;
    }
}

// articles published between 2016-03-22 and 2016-03-23
// mentioning Brussels
// published by New York Times
const uriPromises1 = [er.getConceptUri("Brussels"), er.getNewsSourceUri("New York Times")];
Promise.all(uriPromises1).then(([brusselsUri, nytUri]) => {
    const queryArticlesOpts = {
        dateStart: "2016-03-22",
        dateEnd: "2016-03-23",
        conceptUri: brusselsUri,
        sourceUri: nytUri,
    };
    const q6 = new QueryArticles(queryArticlesOpts);
    // return details about the articles, including the concepts, categories, location and image
    q6.setRequestedResult(requestArticlesInfo);
    return er.execQuery(q6);
});

// RECENT ACTIVITY
// example of querying most recently added content related to a particular thing
// get latest articles about Obama

er.getConceptUri("Obama").then((conceptUri) => {
    const q7 = new QueryArticles({conceptUri});
    q7.setRequestedResult(new RequestArticlesRecentActivity());
    const res1 = er.execQuery(q7);
    q7.setRequestedResult(new RequestArticlesRecentActivity({updatesAfterTm: _.get(res1, "recentActivity.newestUpdate")}));
    // get only the matching articles that were added since the last call
    const res2 = er.execQuery(q7);
});

// COMPLEX QUERIES
// examples of complex queries that combine various OR and AND operators
// prepare some variables used in the queries

const uriPromises2 = [
    er.getConceptUri("Trump"),
    er.getConceptUri("Obama"),
    er.getCategoryUri("politics"),
    er.getConceptUri("merkel"),
    er.getCategoryUri("business"),
];

Promise.all(uriPromises2).then(([trumpUri, obamaUri, politicsUri, merkelUri, businessUri]) => {
    // find articles that (1) were published on 2017-04-22 and (2) are either about Obama or mention keyword Trump and (3) are related to business
    const cq1 = new ComplexArticleQuery(CombinedQuery.AND([
        new BaseQuery({dateStart: "2017-04-22", dateEnd: "2017-04-22"}),
        CombinedQuery.OR([
            new BaseQuery({conceptUri: QueryItems.OR([obamaUri])}),
            new BaseQuery({keyword: "Trump"}),
        ]),
        new BaseQuery({categoryUri: businessUri}),
    ]));
    const query1 = QueryArticles.initWithComplexQuery(cq1);
    const res1 = er.execQuery(query1);

    // find articles that are both about Obama and Trump and are not in English or German language
    const cq2 = new ComplexArticleQuery(new BaseQuery({
        conceptUri: QueryItems.AND([obamaUri, trumpUri]),
        exclude: new BaseQuery({lang: QueryItems.OR(["eng", "deu"])}),
    }));
    const query2 = QueryArticles.initWithComplexQuery(cq2);
    const res2 = er.execQuery(query2);

    // get articles that were published on 2017-02-05 or are about trump
    // or are about politics or are about Merkel and business
    // and are not published on 2017-02-05 or are about Obama
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
    const query3 = QueryArticles.initWithComplexQuery(qStr);
    const res3 = er.execQuery(query3);

    const qStr4 = `
    {
        "$query": {
            "keyword": "Samsung AND TV AND (LED OR LCD OR Plasma) NOT (smartphone OR phone)",
            "keywordSearchMode": "exact",
            "dateStart": "2023-01-01",
            "dateEnd": "2023-01-31"
        }
    }
    `;

    const query4 = QueryArticles.initWithComplexQuery(qStr4);
    const res4 = er.execQuery(query4);

    const qStr5 = `
    {
        "$query": {
            "keyword": "Siemens NEAR/15 (sustainability or ecology or renewable energy)",
            "keywordSearchMode": "exact",
            "lang": "eng"
        }
    }
    `;

    const query5 = QueryArticles.initWithComplexQuery(qStr5);
    const res5 = er.execQuery(query5);

    const qStr6 = `
    {
        "$query": {
            "keyword": "Siemens NEXT/15 (sustainability or ecology or renewable energy)",
            "keywordSearchMode": "exact",
            "lang": "eng"
        }
    }
    `;

    const query6 = QueryArticles.initWithComplexQuery(qStr6);
    const res6 = er.execQuery(query6);

    const qStr7 = `
    {
        "$query": {
            "keyword": "AI \"deep learning\" \"machine learning\" latest developments",
            "keywordSearchMode": "simple",
            "categoryUri": "dmoz/Computers/Artificial_Intelligence"
        }
    }
    `;

    const query7 = QueryArticles.initWithComplexQuery(qStr7);
    const res7 = er.execQuery(query7);

    // Phrase search is used by default, so you don't need to specify the "keywordSearchMode"
    const qStr8 = `
    {
        "$query": {
            "$or": [
                { "keyword": "Apple iPhone" },
                { "keyword": "Microsoft Store" }
            ]
        }
    }
    `;

    const query8 = QueryArticles.initWithComplexQuery(qStr8);
    const res8 = er.execQuery(query8);
});
