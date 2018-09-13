import * as _ from "lodash";
import {
    ConceptInfoFlags,
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

    beforeAll(async (done) => {
        query = new QueryArticles({conceptUri: await er.getConceptUri("Obama")});
        requestArticlesInfo = new RequestArticlesInfo({count: 30, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
        done();
    });

    it("should return list of articles", async (done) => {
        try {
            query.setRequestedResult(requestArticlesInfo);
            const response = await er.execQuery(query);
            expect(response).toBeValidGeneralArticleList();
        } catch (error) {
            console.log(error);
        } finally {
            done();
        }
    });

    it("should return list of article uris and weights", async (done) => {
        try {
            const conceptUri = await er.getConceptUri("germany");
            const iter = new QueryArticlesIter(er, {conceptUri});
            const expectedCount = await iter.count();
            const q = new QueryArticles({conceptUri});
            let items = [];
            const count = 20000;
            const pages = _.ceil(expectedCount / count) + 1;
            for (let page = 1; page <= pages; page++) {
                q.setRequestedResult(new RequestArticlesUriWgtList({page, count}));
                const response = await er.execQuery(q);
                items = [...items, ..._.get(response, "uriWgtList.results", [])];
            }
            expect(expectedCount).toBe(_.size(items), `We did not retrieve all item uris. We were expecting ${expectedCount}, but got ${_.size(items)} uris`);
            let lastWgt;
            for ( const item of items) {
                const wgt = _.parseInt(_.last(_.split(item, ":")));
                if (_.isNil(lastWgt)) {
                    lastWgt = wgt;
                } else {
                    expect(lastWgt).toBeGreaterThanOrEqual(wgt, "Previous weight is not greater or equal to current");
                    lastWgt = wgt;
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            done();
        }
    });

    it("should return list of articles with keyword search", async (done) => {
        try {
            const q1 = new QueryArticles({keywords: "iphone"});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();

            const q2 = new QueryArticles({keywords: "iphone"});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = _.sortBy(res1["articles"]["results"], "id");
            const results2 = _.sortBy(res2["articles"]["results"], "id");
            expect(_.size(results1)).toEqual(_.size(results2), "Keyword search should return responses of the same size");
        } catch (error) {
            console.log(error);
        } finally {
            done();
        }
    });

    it("should return list of articles with keyword title search ('iphone')", (done) => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "iphone", keywordsLoc: "title", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("iphone");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    it("should return list of articles with keyword title search ('home')", (done) => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "home", keywordsLoc: "title", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("home");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    it("should return list of articles with keyword body search ('home')", (done) => {
        try {
            const returnInfo = new ReturnInfo({articleInfo: utils.articleInfo});
            const q = new QueryArticlesIter(er, {keywords: "home", keywordsLoc: "body", returnInfo: returnInfo, maxItems: 50});
            q.execQuery((item) => {
                expect(item).toContainBodyText("home");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    it("should return list of articles with keyword body search ('jack')", (done) => {
        try {
            const q = new QueryArticlesIter(er, {keywords: "jack", keywordsLoc: "body", returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50});
            q.execQuery((item) => {
                expect(item).toContainBodyText("jack");
            }, (errorMessage) => {
                if (errorMessage) {
                    console.error(errorMessage);
                }
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    it("should return list with publisher search", async (done) => {
        try {
            const sourceUri = await er.getNewsSourceUri("bbc");
            const q1 = new QueryArticles({sourceUri});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();
            _.each(_.get(res1, "articles.results"), (article) => {
                expect(_.get(article, "source.uri")).toBe(sourceUri, "Article is not from the specified source");
            });

            const q2 = new QueryArticles({sourceUri});
            q2.setRequestedResult(requestArticlesInfo);
            const res2 = await er.execQuery(q2);
            expect(res2).toBeValidGeneralArticleList();

            const results1 = _.sortBy(res1["articles"]["results"], "id");
            const results2 = _.sortBy(res2["articles"]["results"], "id");
            expect(_.size(results1)).toEqual(_.size(results2), "Publisher search should return responses of the same size");
            expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Publisher search should return equal responses");
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list with author search", async (done) => {
        try {
            const authorUri = await er.getAuthorUri("associated");
            const q1 = new QueryArticles({authorUri});
            q1.setRequestedResult(requestArticlesInfo);
            const response = await er.execQuery(q1);
            expect(response).toBeValidGeneralArticleList();
            for (const article of _.get(response, "articles.results", [])) {
                let foundAuthor = false;
                for (const author of _.get(article, "authors")) {
                    if (author.uri === authorUri) {
                        foundAuthor = true;
                    }
                }
                expect(foundAuthor).toBeTruthy();
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list with category search", async (done) => {
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

            const results1 = _.sortBy(res1["articles"]["results"], "id");
            const results2 = _.sortBy(res2["articles"]["results"], "id");
            expect(_.size(results1)).toEqual(_.size(results2), "Category search should return responses of the same size");
            expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Category search should return equal responses");
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list with lang search", async (done) => {
        try {
            const q1 = new QueryArticles({lang: "deu"});
            q1.setRequestedResult(requestArticlesInfo);
            const res1 = await er.execQuery(q1);
            expect(res1).toBeValidGeneralArticleList();
            for (const article of _.get(res1, "articles.results")) {
                expect(_.get(article, "lang")).toBe("deu", "Article is not in the specified language");
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list with location search", async (done) => {
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

            const results1 = _.sortBy(res1["articles"]["results"], "id");
            const results2 = _.sortBy(res2["articles"]["results"], "id");
            expect(_.size(results1)).toEqual(_.size(results2), "Location search should return responses of the same size");
            expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Location search should return equal responses");
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list with combined search", async (done) => {
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

            const results1 = _.sortBy(res1["articles"]["results"], "id");
            const results2 = _.sortBy(res2["articles"]["results"], "id");
            expect(_.size(results1)).toEqual(_.size(results2), "Combined search should return responses of the same size");
            expect(_.map(results1, "id")).toEqual(_.map(results2, "id"), "Combined search should return equal responses");
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return list of concept trends", async (done) => {
        try {
            const conceptInfo = new ConceptInfoFlags({
                synonyms: true,
                image: true,
                description: true,
                conceptClassMembership: true,
                trendingScore: true,
                trendingHistory: true,
            });
            const returnInfo = new ReturnInfo({conceptInfo});
            const requestArticlesConceptTrends = new RequestArticlesConceptTrends({conceptUris: [await er.getConceptUri("Obama"), await er.getConceptUri("Trump")], returnInfo});
            query.setRequestedResult(requestArticlesConceptTrends);
            const response = await er.execQuery(query);
            // Check that we get the expected properties
            expect(_.has(response, "conceptTrends")).toBeTruthy("Expected to get 'conceptTrends'");
            expect(_.has(response, "conceptTrends.trends")).toBeTruthy("Expected to get 'trends' property in conceptTrends");
            expect(_.has(response, "conceptTrends.conceptInfo")).toBeTruthy("Expected to get 'conceptInfo' property in conceptTrends");
            expect(_.size(_.get(response, "conceptTrends.conceptInfo"))).toBe(2, "Expected to get 2 concepts in concept trends");

            const trends = _.get(response, "conceptTrends.trends");
            expect(!_.isEmpty(trends)).toBeTruthy();
            for (const trend of trends) {
                expect(_.has(trend, "date")).toBeTruthy("A trend should have a date");
                expect(_.has(trend, "conceptFreq")).toBeTruthy("A trend should have a conceptFreq");
                expect(_.has(trend, "totArts")).toBeTruthy("A trend should have a totArts property");
                expect(_.size(_.get(trend, "conceptFreq"))).toBeLessThanOrEqual(2, "Concept frequencies should contain 2 elements - one for each concept");
            }
            const concepts = _.get(response, "conceptTrends.conceptInfo");
            for (const concept of concepts) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return aggregate of concepts of resulting articles", async (done) => {
        try {
            const requestArticlesConceptAggr = new RequestArticlesConceptAggr({conceptCount: 50, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
            query.setRequestedResult(requestArticlesConceptAggr);
            const response = await er.execQuery(query);

            expect(_.has(response, "conceptAggr")).toBeTruthy("Expected to get 'conceptAggr'");
            const concepts = _.get(response, "conceptAggr.results");
            expect(_.size(concepts)).toEqual(50, "Expected a different number of concepts in 'conceptAggr'");
            for (const concept of concepts) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return aggregate of keywords of resulting articles", async (done) => {
        try {
            const requestArticlesKeywordAggr = new RequestArticlesKeywordAggr({articlesSampleSize: 100});
            query.setRequestedResult(requestArticlesKeywordAggr);
            const response = await er.execQuery(query);

            expect(_.has(response, "keywordAggr")).toBeTruthy("Expected to get 'keywordAggr'");
            const keywords = _.get(response, "keywordAggr.results", []);
            expect(_.size(keywords)).toBeGreaterThan(0, "Expected to get some keywords");
            for (const keyword of keywords) {
                expect(_.has(keyword, "keyword")).toBeTruthy("Expected a keyword property");
                expect(_.has(keyword, "weight")).toBeTruthy("Expected a weight property");
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return aggregate of categories of resulting articles", async (done) => {
        try {
            const requestArticlesCategoryAggr = new RequestArticlesCategoryAggr({returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, categoryInfo: utils.categoryInfo})});
            query.setRequestedResult(requestArticlesCategoryAggr);
            const response = await er.execQuery(query);

            expect(_.has(response, "categoryAggr")).toBeTruthy("Expected to get 'categoryAggr'");
            const categories = _.get(response, "categoryAggr.results", []);
            expect(_.size(categories)).toBeGreaterThan(0, "Expected to get a non empty category aggregates");
            for (const category of categories) {
                expect(category).toBeValidCategory();
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should return concept matrix of resulting articles", async (done) => {
        try {
            const requestArticlesConceptMatrix = new RequestArticlesConceptMatrix({conceptCount: 20, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, conceptInfo: utils.conceptInfo, locationInfo: utils.locationInfo})});
            query.setRequestedResult(requestArticlesConceptMatrix);
            const response = await er.execQuery(query);

            expect(_.has(response, "conceptMatrix")).toBeTruthy("Expected to get 'conceptMatrix'");
            const matrix = _.get(response, "conceptMatrix");
            expect(_.has(matrix, "sampleSize")).toBeTruthy("Expecting 'sampleSize' property in conceptMatrix");
            expect(_.has(matrix, "freqMatrix")).toBeTruthy("Expecting 'freqMatrix' property in conceptMatrix");
            expect(_.has(matrix, "concepts")).toBeTruthy("Expecting 'concepts' property in conceptMatrix");
            expect(_.size(_.get(matrix, "concepts"))).toEqual(20, "Expected 20 concepts");
            for (const concept of _.get(matrix, "concepts")) {
                expect(concept).toBeValidConcept();
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should aggregate of sources of resulting articles", async (done) => {
        try {
            const requestArticlesSourceAggr = new RequestArticlesSourceAggr({returnInfo: new ReturnInfo({articleInfo: utils.articleInfo, sourceInfo: utils.sourceInfo})});
            query.setRequestedResult(requestArticlesSourceAggr);
            const response = await er.execQuery(query);

            expect(_.has(response, "sourceAggr")).toBeTruthy("Expected to get 'sourceAggr'");
            for (const sourceInfo of _.get(response, "sourceAggr.countsPerSource")) {
                expect(_.get(sourceInfo, "source")).toBeValidSource();
                expect(_.has(sourceInfo, "counts")).toBeTruthy("Source info should contain counts object");
                expect(_.has(sourceInfo, "counts.frequency")).toBeTruthy("Counts should contain a frequency");
                expect(_.has(sourceInfo, "counts.total")).toBeTruthy("Counts should contain a total");
            }
            for (const country of _.get(response, "sourceAggr.countsPerCountry")) {
                expect(_.get(country, "type")).toEqual("loc", "Country should be a location");
                expect(_.get(country, "frequency")).toBeGreaterThan(0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should test query articles iterator (1)", async (done) => {
        try {
            const keywords = "trump";
            const conceptUri = await er.getConceptUri("Obama");
            const sourceUri = await er.getNewsSourceUri("bbc");
            const q = new QueryArticlesIter(er, { keywords, conceptUri, sourceUri});
            let articlesSize = 0;
            const itemCount = await q.count();
            q.execQuery((item) => articlesSize += 1, () => {
                expect(itemCount).toEqual(articlesSize);
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    it("should test query articles iterator (2)", async (done) => {
        try {
            const q = new QueryArticles({keywords: "trump"});
            q.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 100}));
            const response = await er.execQuery(q);
            expect(_.size(_.get(response, "uriWgtList.results", []))).not.toBe(0, "No results were obtained for second page of uris");
        } catch (error) {
            console.error(error);
        } finally {
            done();
        }
    });

    it("should test query articles iterator (3)", async (done) => {
        try {
            const conceptUri = await er.getConceptUri("Obama");
            const sourceUri = await er.getNewsSourceUri("bbc");
            const categoryUri = await er.getCategoryUri("business");
            const q = new QueryArticlesIter(er, { conceptUri, sourceUri, categoryUri, returnInfo: new ReturnInfo({articleInfo: utils.articleInfo}), maxItems: 50 });
            q.execQuery((item) => {
                expect(item).toContainConcept(conceptUri);
                expect(item).toContainSource(sourceUri);
                expect(item).toContainCategory(categoryUri);
            }, () => {
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

    xit("should test query articles iterator (4)", async (done) => {
        try {
            const conceptUri = await er.getConceptUri("Obama");
            const ignoreConceptUri = [await er.getConceptUri("politics"), await er.getConceptUri("china"), await er.getConceptUri("united states")];
            const ignoreKeywords = ["trump", "politics", "michelle"];
            const ignoreSourceUri = [await er.getNewsSourceUri("daily caller"), await er.getNewsSourceUri("aawsat"), await er.getNewsSourceUri("svodka")];
            const ignoreCategoryUri = [await er.getCategoryUri("business"), await er.getCategoryUri("politics")];
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
                _.each(ignoreConceptUri, (uri) => {
                    expect(item).not.toContainConcept(uri);
                });
                _.each(ignoreKeywords, (text) => {
                    expect(item).not.toContainBodyText(text);
                });
                _.each(ignoreSourceUri, (uri) => {
                    expect(item).not.toContainSource(uri);
                });
                _.each(ignoreCategoryUri, (uri) => {
                    expect(item).not.toContainCategory(uri);
                });
            }, () => {
                done();
            });
        } catch (error) {
            console.error(error);
            done();
        }
    });

});
