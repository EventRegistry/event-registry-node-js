import { pathToFileURL } from "node:url";
import { ArticleInfoFlags, BaseQuery, CombinedQuery, ComplexArticleQuery, EventRegistry, ConceptInfoFlags, QueryArticles, QueryArticlesIter, QueryItems, RequestArticlesInfo, RequestArticlesRecentActivity, ReturnInfo, searchArticles } from "eventregistry";

// examples that illustrate how to query articles using different search options

const er = new EventRegistry({allowUseOfArchive: false});
const articleInfo = new ArticleInfoFlags({
    duplicateList: true,
    concepts: true,
    categories: true,
    location: true,
    image: true,
});
const conceptInfo = new ConceptInfoFlags({ trendingScore: true });
const returnInfo = new ReturnInfo({ articleInfo, conceptInfo });
const requestArticlesInfo = new RequestArticlesInfo({count: 30, returnInfo: returnInfo});
type ArticlesPageResponse = {
    articles?: {results?: Array<{uri?: string}>; pages?: number};
    recentActivity?: {newestUpdate?: string};
};

// ---------------------------------------------------------------------------
// RECOMMENDED: fluent + helpers (see MIGRATION.md for the full guide)
// ---------------------------------------------------------------------------

const MAX_RESULTS = 100;

// helper function: build + execute a QueryArticles + RequestArticlesInfo in one call
async function fluentSearchTesla() {
    const response = await searchArticles(er, {keywords: "Tesla Inc", count: 30, returnInfo});
    console.info(response);
}

// fluent, chained: er.articles.search(...).info(...).exec()
async function fluentSearchObama() {
    const response = await er.articles.search({keywords: "Barack Obama"}).info({count: 30, returnInfo}).exec();
    console.info(response);
}

// fluent auto-paging iterator, equivalent to the classic QueryArticlesIter below
async function fluentIterateTesla() {
    for await (const article of er.articles.iterate({keywords: "Tesla Inc", maxItems: MAX_RESULTS})) {
        console.info(article);
    }
}

// fluent single-article fetch — needs a uri from a prior search; not invoked here
async function fluentGetArticle(articleUri: string) {
    const article = await er.articles.get(articleUri, {returnInfo: new ReturnInfo({articleInfo})});
    console.info(article);
}

// query articles using the QueryArticles class
// old way of iterating through the pages of results - requesting results page by page
async function fetchArticlePage(query: QueryArticles, page: number) {
    query.setRequestedResult(new RequestArticlesInfo({page}));
    return er.execQuery<ArticlesPageResponse>(query);
}

async function fetchArticles(conceptLabel: string) {
    const conceptUri = await er.getConceptUri(conceptLabel);
    if (conceptUri === undefined) {
        return;
    }
    const query = new QueryArticles({conceptUri});
    let page = 1;
    while (true) {
        const response = await fetchArticlePage(query, page);
        for (const article of response.articles?.results ?? []) {
            console.info(article.uri);
        }
        if (page >= (response.articles?.pages ?? page)) {
            break;
        }
        page++;
    }
}

// ---------------------------------------------------------------------------
// CLASSIC API (fully supported) — same requests, spelled out with Query*/Request* classes
// ---------------------------------------------------------------------------

async function runClassic(): Promise<void> {
    const query = new QueryArticlesIter(er, {keywords: "Tesla Inc", maxItems: MAX_RESULTS});
    for await (const item of query) {
        console.info(item);
    }

    // search for the phrase "Barack Obama" - both words have to appear together
    const q1 = new QueryArticles({keywords: "Barack Obama"});
    console.info(await er.execQuery(q1));

    // search for articles that mention both of the two words - maybe together, maybe apart
    // this form of specifying multiple keywords, concepts, etc is ambiguous. When you have a list,
    // use it with QueryItems.AND() or QueryItems.OR() to explicitly specify how the query should be processed
    const q2 = new QueryArticles({keywords: ["Barack", "Obama"]});
    // set some custom information that should be returned as a result of the query
    q2.setRequestedResult(requestArticlesInfo);
    console.info(await er.execQuery(q2));

    // search for articles that mention both of the two words - maybe together, maybe apart
    // the correct way of specifying multiple keywords - using QueryItems.AND or .OR classes
    const q3 = new QueryArticles({keywords: QueryItems.AND(["Barack", "Obama"])});
    // set some custom information that should be returned as a result of the query
    q3.setRequestedResult(requestArticlesInfo);
    console.info(await er.execQuery(q3));

    // search for articles that mention the phrase "Barack Obama" or Trump
    const q4 = new QueryArticles({keywords: QueryItems.OR(["Barack Obama", "Trump"])});
    q4.setRequestedResult(requestArticlesInfo);
    console.info(await er.execQuery(q4));

    // if you already have some articles that you have received from Event Registry
    // for which you would like to obtain some potentially updated metadata (shared counts, event uri)
    // you can use the query shown below. When making such a query you can specify up to 100 article uris in a call.
    const q = QueryArticles.initWithArticleUriList(["934903913", "934902493", "934902499", "934902488", "934899375", "934900984", "934890360", "934888250"]);
    console.info(await er.execQuery(q));

    /**
     * Search for articles that:
     * - mentions the concept Samsung
     * - mention the phrase "iphone" in the article title
     * - by BBC or by any news source located in Germany
     * - in English or German language
     * - return results sorted by relevance to the query (instead of "date" which is default)
     */
    const [samsungUri, bbcUri, germanyUri] = await Promise.all([
        er.getConceptUri("Samsung"),
        er.getSourceUri("bbc"),
        er.getLocationUri("Germany"),
    ]);
    const samsungQuery = new QueryArticles({
        conceptUri: samsungUri,
        keywords: "iphone",
        keywordsLoc: "title",
        lang: ["eng", "deu"],
        sourceUri: bbcUri,
        sourceLocationUri: germanyUri,
    });
    samsungQuery.setRequestedResult(new RequestArticlesInfo({sortBy: "rel"}));
    console.info(await er.execQuery(samsungQuery));

    /**
     * Find articles that:
     *  - are related to business (categorized into business category)
     *  - were published between 1st and 20th August 2018
     *  - don't mention Trump in the article title
     *  - are not a duplicate (copy) of another article
     *  - are from a news source that is among top 20 percentile of sources
     *  - return results sorted from most shared on social media to least
     */
    const businessUri = await er.getCategoryUri("business");
    const businessQuery = new QueryArticles({
            categoryUri: businessUri,
            dateStart: "2018-08-01",
            dateEnd: "2018-08-20",
            ignoreKeywords: "Trump",
            ignoreKeywordsLoc: "title",
            isDuplicateFilter: "skipDuplicates",
            startSourceRankPercentile: 0,
            endSourceRankPercentile: 20,
    });
    businessQuery.setRequestedResult(new RequestArticlesInfo({sortBy: "socialScore"}));
    console.info(await er.execQuery(businessQuery));

    //  USE OF ITERATOR
    //  example of using the QueryArticlesIter to easily iterate through all results matching the search

    //  Search for articles mentioning George Clooney that were reported from sources from Spain or sources from Los Angeles
    //  iterator class simplifies retrieving and listing the list of matching articles
    //  by specifying maxItems we say that we want to retrieve maximum 500 articles (without specifying the parameter we would iterate through all results)
    //  the results will be sorted from those that are from highest ranked news sources down

    const [clooneyUri, spainUri, laUri] = await Promise.all([
        er.getConceptUri("George Clooney"),
        er.getLocationUri("Spain"),
        er.getLocationUri("Los Angeles"),
    ]);
    const iterOpts = {
        sortBy: "sourceAlexaGlobalRank",
        maxItems: 500,
        returnInfo: new ReturnInfo({articleInfo: new ArticleInfoFlags({concepts: true, categories: true, location: true, image: true})}),
        conceptUri: clooneyUri,
        sourceLocationUri:  QueryItems.OR([spainUri, laUri]),
    };
    const q5 = new QueryArticlesIter(er, iterOpts);
    for await (const item of q5) {
        console.info(item);
    }

    // articles published between 2016-03-22 and 2016-03-23
    // mentioning Brussels
    // published by New York Times
    const [brusselsUri, nytUri] = await Promise.all([er.getConceptUri("Brussels"), er.getNewsSourceUri("New York Times")]);
    const queryArticlesOpts = {
        dateStart: "2016-03-22",
        dateEnd: "2016-03-23",
        conceptUri: brusselsUri,
        sourceUri: nytUri,
    };
    const q6 = new QueryArticles(queryArticlesOpts);
    // return details about the articles, including the concepts, categories, location and image
    q6.setRequestedResult(requestArticlesInfo);
    console.info(await er.execQuery(q6));

    // RECENT ACTIVITY
    // example of querying most recently added content related to a particular thing
    // get latest articles about Obama

    const obamaUri = await er.getConceptUri("Obama");
    if (obamaUri !== undefined) {
        const q7 = new QueryArticles({conceptUri: obamaUri});
        q7.setRequestedResult(new RequestArticlesRecentActivity());
        const res1 = await er.execQuery<ArticlesPageResponse>(q7);
        console.info(res1);
        q7.setRequestedResult(new RequestArticlesRecentActivity({updatesAfterTm: res1.recentActivity?.newestUpdate}));
        // get only the matching articles that were added since the last call
        console.info(await er.execQuery(q7));
    }

    // COMPLEX QUERIES
    // examples of complex queries that combine various OR and AND operators
    // prepare some variables used in the queries

    const [trumpUri, obamaConceptUri, politicsUri, merkelUri, businessConceptUri] = await Promise.all([
        er.getConceptUri("Trump"),
        er.getConceptUri("Obama"),
        er.getCategoryUri("politics"),
        er.getConceptUri("merkel"),
        er.getCategoryUri("business"),
    ]);

    // find articles that (1) were published on 2017-04-22 and (2) are either about Obama or mention keyword Trump and (3) are related to business
    const cq1 = new ComplexArticleQuery(CombinedQuery.AND([
        new BaseQuery({dateStart: "2017-04-22", dateEnd: "2017-04-22"}),
        CombinedQuery.OR([
            new BaseQuery({conceptUri: QueryItems.OR([obamaConceptUri])}),
            new BaseQuery({keyword: "Trump"}),
        ]),
        new BaseQuery({categoryUri: businessConceptUri}),
    ]));
    const query1 = QueryArticles.initWithComplexQuery(cq1);
    console.info(await er.execQuery(query1));

    // find articles that are both about Obama and Trump and are not in English or German language
    const cq2 = new ComplexArticleQuery(new BaseQuery({
        conceptUri: QueryItems.AND([obamaConceptUri, trumpUri]),
        exclude: new BaseQuery({lang: QueryItems.OR(["eng", "deu"])}),
    }));
    const query2 = QueryArticles.initWithComplexQuery(cq2);
    console.info(await er.execQuery(query2));

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
                        { "categoryUri": "${businessConceptUri}" }
                    ]
                }
            ],
            "$not": {
                "$or": [
                    { "dateStart": "2017-02-04", "dateEnd": "2017-02-04" },
                    { "conceptUri": "${obamaConceptUri}" }
                ]
            }
        }
    }
    `;
    const query3 = QueryArticles.initWithComplexQuery(qStr);
    console.info(await er.execQuery(query3));

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
    console.info(await er.execQuery(query4));

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
    console.info(await er.execQuery(query5));

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
    console.info(await er.execQuery(query6));

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
    console.info(await er.execQuery(query7));

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
    console.info(await er.execQuery(query8));
}

async function main(): Promise<void> {
    await fluentSearchTesla();
    await fluentSearchObama();
    await fluentIterateTesla();
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
