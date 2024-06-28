import {
    ConceptInfoFlags,
    ER,
    QueryArticles,
    QueryArticlesIter,
    RequestArticlesCategoryAggr,
    RequestArticlesConceptAggr,
    RequestArticlesConceptMatrix,
    RequestArticlesConceptTrends,
    RequestArticlesInfo,
    RequestArticlesKeywordAggr,
    RequestArticlesSourceAggr,
    RequestArticlesUriWgtList,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Articles", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryArticles;
    let requestArticlesInfo: RequestArticlesInfo;

    beforeAll(async () => {
        query = new QueryArticles({conceptUri: await er.getConceptUri("Obama")});
        requestArticlesInfo = new RequestArticlesInfo({count: 30, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
    });

    it("should return list of articles", async () => {
        try {
            query.setRequestedResult(requestArticlesInfo);
            const response = await er.execQuery(query);
            expect(response).toBeValidGeneralArticleList();
        } catch (error) {
            console.log(error);
        }
    });

    it("should return list of article uris and weights", async () => {
        try {
            const conceptUri = await er.getConceptUri("germany");
            const iter = new QueryArticlesIter(er, {conceptUri});
            const expectedCount = await iter.count();
            const q = new QueryArticles({conceptUri});
            let items: string[] = [];
            const count = 20000;
            const pages = Math.ceil(expectedCount / count) + 1;
            for (let page = 1; page <= pages; page++) {
                q.setRequestedResult(new RequestArticlesUriWgtList({page, count}));
                const response = await er.execQuery(q);
                items = [...items, ...(response?.uriWgtList?.results ?? []) as string[]];
            }
            expect(expectedCount).toBe(items.length);
            let lastWgt;
            for ( const item of items) {
                const wgt = Number(item.split(":").pop());
                if (lastWgt === null || lastWgt === undefined) {
                    lastWgt = wgt;
                } else {
                    expect(lastWgt).toBeGreaterThanOrEqual(wgt);
                    lastWgt = wgt;
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    it("should return list of articles with keyword search", async () => {
        try {
            const q1 = new QueryArticles({keywords: "iphone"});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();

            const q2 = new QueryArticles({keywords: "iphone"});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = (res1["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            const results2 = (res2["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            expect(results1.length).toEqual(results2.length);
        } catch (error) {
            console.log(error);
        }
    });

    it("should return list of articles with keyword title search ('iphone')", () => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "iphone", keywordsLoc: "title", lang: "eng", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(utils.normalize((item?.title ?? ""))).toContain("iphone");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list of articles with keyword title search ('home')", () => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "home", keywordsLoc: "title", lang: "eng", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(utils.normalize((item?.title ?? ""))).toContain("home");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list of articles with keyword body search ('home')", () => {
        try {
            const returnInfo = new ReturnInfo({articleInfo: utils.articleInfo});
            const q = new QueryArticlesIter(er, {keywords: "home", keywordsLoc: "body", lang: "eng", returnInfo: returnInfo, maxItems: 50});
            q.execQuery((item) => {
                expect(utils.normalize((item?.body ?? ""))).toContain("home");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list of articles with keyword body search ('Jack')", () => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "Jack", keywordsLoc: "body", lang: "eng", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(item).toContainBodyText("Jack");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with publisher search", async () => {
        try {
            const sourceUri = await er.getNewsSourceUri("bbc");
            const q1 = new QueryArticles({sourceUri});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();
            const articles = res1?.articles?.results as ER.Article[];
            for (const article of articles) {
                expect(article.source?.uri).toBe(sourceUri);
            }

            const q2 = new QueryArticles({sourceUri});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = (res1["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            const results2 = (res2["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            expect(results1.length).toEqual(results2.length);
            expect(results1.map((item) => item.id)).toEqual(results2.map((item) => item.id));
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with author search", async () => {
        try {
            const authorUri = await er.getAuthorUri("associated");
            const q1 = new QueryArticles({authorUri});
            q1.setRequestedResult(requestArticlesInfo);
            const response = await er.execQuery(q1);
            expect(response).toBeValidGeneralArticleList();
            for (const article of ((response?.articles?.results ?? []) as ER.Article[])) {
                let foundAuthor = false;
                for (const author of (article?.authors ?? [])) {
                    if (author.uri === authorUri) {
                        foundAuthor = true;
                    }
                }
                expect(foundAuthor).toBeTruthy();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with category search", async () => {
        try {
            const categoryUri = await er.getCategoryUri("disa");
            const q1 = new QueryArticles({categoryUri});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();

            const q2 = new QueryArticles({categoryUri});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = (res1["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            const results2 = (res2["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            expect(results1.length).toEqual(results2.length);
            expect(results1.map((result) => result.id)).toEqual(results2.map((result) => result.id));
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with lang search", async () => {
        try {
            const q1 = new QueryArticles({lang: "deu"});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();
            for (const article of ((res1?.articles?.results ?? []) as ER.Article[])) {
                expect(article?.lang ?? "").toBe("deu");
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with location search", async () => {
        try {
            const locationUri = await er.getLocationUri("united");
            const q1 = new QueryArticles({locationUri});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();

            const q2 = new QueryArticles({locationUri});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = (res1["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            const results2 = (res2["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            expect(results1.length).toEqual(results2.length);
            expect(results1.map((result) => result.id)).toEqual(results2.map((result) => result.id));
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list with combined search", async () => {
        try {
            const keywords = "germany";
            const lang = ["eng", "deu"];
            const conceptUri = await er.getConceptUri("Merkel");
            const categoryUri = await er.getCategoryUri("Business");

            const q1 = new QueryArticles({keywords, lang, conceptUri, categoryUri});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();

            const q2 = new QueryArticles({keywords, lang, conceptUri, categoryUri});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = (res1["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            const results2 = (res2["articles"]["results"] as ER.Article[]).sort((a, b) => (a.id ?? "").localeCompare((b?.id ?? "")));
            expect(results1.length).toEqual(results2.length);
            expect(results1.map((result) => result.id)).toEqual(results2.map((result) => result.id));
        } catch (error) {
            console.error(error);
        }
    });

    it("should return list of concept trends", async () => {
        try {
            const conceptInfo = new ConceptInfoFlags({
                synonyms: true,
                image: true,
                description: true,
                trendingScore: true,
            });
            const returnInfo = new ReturnInfo({conceptInfo});
            const requestArticlesConceptTrends = new RequestArticlesConceptTrends({conceptUris: [await er.getConceptUri("Obama"), await er.getConceptUri("Trump")] as string[], returnInfo});
            query.setRequestedResult(requestArticlesConceptTrends);
            const response = await er.execQuery(query);
            // Check that we get the expected properties
            expect(response?.conceptTrends).toBeTruthy();
            expect((response?.conceptTrends as unknown as Record<string, unknown[]>)?.trends).toBeTruthy();
            expect((response?.conceptTrends as unknown as Record<string, unknown[]>)?.conceptInfo).toBeTruthy();
            expect((response?.conceptTrends as unknown as Record<string, unknown[]>)?.conceptInfo.length).toBe(2);

            const trends = (response?.conceptTrends as unknown as Record<string, Record<string, unknown>[]>)?.trends;
            expect(trends.length > 0).toBeTruthy();
            for (const trend of trends) {
                expect(trend?.date).toBeTruthy();
                expect(trend?.conceptFreq).toBeTruthy();
                expect(trend?.totArts).toBeTruthy();
                expect((trend?.conceptFreq as unknown[]).length).toBeLessThanOrEqual(2);
            }
            const concepts = (response?.conceptTrends as unknown as Record<string, ER.Concept[]>)?.conceptInfo;
            for (const concept of concepts) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return aggregate of concepts of resulting articles", async () => {
        try {
            const requestArticlesConceptAggr = new RequestArticlesConceptAggr({conceptCount: 50, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
            query.setRequestedResult(requestArticlesConceptAggr);
            const response = await er.execQuery(query);

            expect(response?.conceptAggr).toBeTruthy();
            const concepts = response?.conceptAggr?.results as ER.Concept[];
            expect(concepts.length).toEqual(50);
            for (const concept of concepts) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return aggregate of keywords of resulting articles", async () => {
        try {
            const requestArticlesKeywordAggr = new RequestArticlesKeywordAggr({articlesSampleSize: 100});
            query.setRequestedResult(requestArticlesKeywordAggr);
            const response = await er.execQuery(query);

            expect(response?.keywordAggr).toBeTruthy();
            const keywords = response?.keywordAggr?.results as ER.Keyword[];
            expect(keywords.length).toBeGreaterThan(0);
            for (const keyword of keywords) {
                expect(keyword?.keyword).toBeTruthy();
                expect(keyword?.weight).toBeTruthy();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return aggregate of categories of resulting articles", async () => {
        try {
            const requestArticlesCategoryAggr = new RequestArticlesCategoryAggr({returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, categoryInfo: utils.categoryInfo})});
            query.setRequestedResult(requestArticlesCategoryAggr);
            const response = await er.execQuery(query);

            expect(response?.categoryAggr).toBeTruthy();
            const categories = response?.categoryAggr?.results as ER.Category[];
            expect(categories.length).toBeGreaterThan(0);
            for (const category of categories) {
                expect(category).toBeValidCategory();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should return concept matrix of resulting articles", async () => {
        try {
            const requestArticlesConceptMatrix = new RequestArticlesConceptMatrix({conceptCount: 20, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
            query.setRequestedResult(requestArticlesConceptMatrix);
            const response = await er.execQuery(query);

            expect(response?.conceptMatrix).toBeTruthy();
            const matrix = response?.conceptMatrix as Record<string, unknown>;
            expect(matrix?.sampleSize).toBeTruthy();
            expect(matrix?.freqMatrix).toBeTruthy();
            expect(matrix?.concepts).toBeTruthy();
            expect((matrix?.concepts as ER.Concept[]).length).toEqual(20);
            for (const concept of (matrix?.concepts as ER.Concept[])) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should aggregate of sources of resulting articles", async () => {
        try {
            const requestArticlesSourceAggr = new RequestArticlesSourceAggr({returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, sourceInfo: utils.sourceInfo})});
            query.setRequestedResult(requestArticlesSourceAggr);
            const response = await er.execQuery(query) as Record<string, unknown>;

            expect(response?.sourceAggr).toBeTruthy();
            for (const sourceInfo of ((response?.sourceAggr as Record<string, ER.Aggr.Source.CountsPerSource[]>)?.countsPerSource)) {
                expect(sourceInfo?.source).toBeValidSource();
                expect(sourceInfo?.counts).toBeTruthy();
                expect(sourceInfo?.counts?.frequency).toBeTruthy();
                expect(sourceInfo?.counts?.total).toBeTruthy();
            }
            for (const country of ((response?.sourceAggr as Record<string, ER.Aggr.Source.CountsPerCountry[]>)?.countsPerCountry)) {
                if (country?.uri === "http://en.wikipedia.org/wiki/Australia_(continent)") return;
                expect(country?.type).toEqual("loc");
                expect(country?.frequency).toBeGreaterThan(0);
            }
        } catch (error) {
            console.error(error);
        }
    });

    it("should test query articles iterator (1)", async () => {
        try {
            const keywords = "trump";
            const conceptUri = await er.getConceptUri("Obama");
            const sourceUri = await er.getNewsSourceUri("bbc");
            const q = new QueryArticlesIter(er, { keywords, conceptUri, sourceUri});
            let articlesSize = 0;
            const itemCount = await q.count();
            q.execQuery((item) => articlesSize += 1, () => {
                expect(itemCount).toEqual(articlesSize);
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should test query articles iterator (2)", async () => {
        try {
            const q = new QueryArticles({keywords: "trump"});
            q.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 100}));
            const response = await er.execQuery(q);
            const uriWgtList = (response?.uriWgtList?.results ?? []) as unknown[];
            expect(uriWgtList.length).not.toBe(0);
        } catch (error) {
            console.error(error);
        }
    });

    it("should test query articles iterator (3)", async () => {
        try {
            const conceptUri = await er.getConceptUri("Obama");
            const sourceUri = await er.getNewsSourceUri("bbc");
            const categoryUri = await er.getCategoryUri("business");
            const q = new QueryArticlesIter(er, { conceptUri, sourceUri, categoryUri, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50 });
            q.execQuery((item) => {
                expect(item).toContainConcept(conceptUri);
                expect(item).toContainSource(sourceUri);
                expect(item).toContainCategory(categoryUri);
            });
        } catch (error) {
            console.error(error);
        }
    });

    it("should test query articles iterator (4)", async () => {
        try {
            const conceptUri = await er.getConceptUri("Obama");
            const ignoreConceptUri = [await er.getConceptUri("politics"), await er.getConceptUri("china"), await er.getConceptUri("united states")] as string[];
            const ignoreKeywords = ["trump", "politics", "michelle"] as string[];
            const ignoreSourceUri = [await er.getNewsSourceUri("daily caller"), await er.getNewsSourceUri("aawsat"), await er.getNewsSourceUri("svodka")] as string[];
            const ignoreCategoryUri = [await er.getCategoryUri("business"), await er.getCategoryUri("politics")] as string[];
            // const ignoreLang = "zho";
            const queryConfig = {
                conceptUri,
                ignoreConceptUri,
                ignoreKeywords,
                ignoreSourceUri,
                ignoreCategoryUri,
                returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}),
                maxItems: 10,
                articleBatchSize: 5,
            };
            const q = new QueryArticlesIter(er, queryConfig);
            q.execQuery((item) => {
                expect(item).toContainConcept(conceptUri);
                for (const uri of ignoreConceptUri) {
                    expect(item).not.toContainConcept(uri);
                }
                for (const text of ignoreKeywords) {
                    expect(item).not.toContainBodyText(text);
                }
                for (const uri of ignoreSourceUri) {
                    expect(item).not.toContainSource(uri);
                }
                for (const uri of ignoreCategoryUri) {
                    expect(item).not.toContainCategory(uri);
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

});
