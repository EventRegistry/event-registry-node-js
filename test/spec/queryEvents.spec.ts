import * as _ from "lodash";
import {
    allLangs,
    ArticleInfoFlags,
    ConceptInfoFlags,
    EventInfoFlags,
    EventRegistry,
    QueryArticles,
    QueryEvent,
    QueryEventArticlesIter,
    QueryEvents,
    QueryEventsIter,
    RequestEventsCategoryAggr,
    RequestEventsConceptAggr,
    RequestEventsConceptMatrix,
    RequestEventsConceptTrends,
    RequestEventsInfo,
    RequestEventsKeywordAggr,
    RequestEventsSourceAggr,
    RequestEventsUriWgtList,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Events", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryEvents;
    let requestEventsInfo: RequestEventsInfo;

    beforeAll(async (done) => {
        requestEventsInfo = new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo});
        query = new QueryEvents({conceptUri: await er.getConceptUri("Obama")});
        done();
    });

    it("should test event list", async (done) => {
        query.setRequestedResult(requestEventsInfo);
        const response = await er.execQuery(query);
        expect(response).toBeValidGeneralEventList();
        done();
    });

    it("should test event list with keyword search", async (done) => {
        const q1 = new QueryEvents({keywords: "germany"});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({keywords: "germany"});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = _.sortBy(response1["events"]["results"], "id");
        const results2 = _.sortBy(response2["events"]["results"], "id");
        expect(_.size(results1)).toEqual(_.size(results2), "Keyword search should return responses of the same size");
        done();
    });

    it("should test event list with source search", async (done) => {
        const q1 = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = _.sortBy(response1["events"]["results"], "id");
        const results2 = _.sortBy(response2["events"]["results"], "id");
        expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
        done();
    });

    it("should test event list with category search", async (done) => {
        const q1 = new QueryEvents({categoryUri: await er.getCategoryUri("disa")});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({categoryUri: await er.getCategoryUri("disa")});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = _.sortBy(response1["events"]["results"], "id");
        const results2 = _.sortBy(response2["events"]["results"], "id");
        expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
        done();
    });

    it("should test event list with language search", async (done) => {
        const q1 = new QueryEvents({lang: "spa"});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();
        done();
    });

    it("should test event list with minimal articles search", async (done) => {
        const q1 = new QueryEvents({minArticlesInEvent: 100});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();
        done();
    });

    it("should test search by keyword", async (done) => {
        const q1 = new QueryEvents({keywords: "car"});
        const evInfo = new EventInfoFlags({ concepts: false,
                                            articleCounts: false,
                                            title: false,
                                            summary: false,
                                            categories: false,
                                            location: false,
                                            stories: false,
                                            imageCount: 0,
                                        });
        const retInfo1 = new ReturnInfo({ conceptInfo: new ConceptInfoFlags({type: "org"}), eventInfo: evInfo});
        const reqEvInfo = new RequestEventsInfo({ page: 1,
                                                  count: 10,
                                                  sortBy: "date",
                                                  sortByAsc: true,
                                                  returnInfo: retInfo1,
                                                });
        q1.setRequestedResult(reqEvInfo);
        const response = await er.execQuery(q1);
        expect(_.has(response, "events")).toBeTruthy("Results should contain events");
        const events = _.get(response, "events.results", []);
        let lastEventDate = _.isEmpty(events) ? "" : _.get(_.first(events), "eventDate");
        _.each(events, (event) => {
            expect(event.eventDate >= lastEventDate).toBeTruthy("Events are not sorted by date");
            lastEventDate = event.eventDate;
            expect(_.has(event, "articleCounts")).toBeFalsy("Event should not contain articleCounts");
            expect(_.has(event, "categories")).toBeFalsy("Event should not contain categories");
            expect(_.has(event, "concepts")).toBeFalsy("Event should not contain concepts");
            expect(_.has(event, "location")).toBeFalsy("Event should not contain location");
            expect(_.has(event, "stories")).toBeFalsy("Event should not contain stories");
            expect(_.has(event, "images")).toBeFalsy("Event should not contain images");
            expect(_.has(event, "title")).toBeFalsy("Event should not contain title");
            expect(_.has(event, "summary")).toBeFalsy("Event should not contain summary");
        });
        done();
    });

    it("should test search by keyword rev", async (done) => {
        const q1 = new QueryEvents({keywords: "car"});
        const evInfo = new EventInfoFlags({ concepts: false,
                                            articleCounts: false,
                                            title: false,
                                            summary: false,
                                            categories: false,
                                            location: false,
                                            stories: false,
                                            imageCount: 0,
                                        });
        const retInfo1 = new ReturnInfo({ conceptInfo: new ConceptInfoFlags({type: "org"}), eventInfo: evInfo});
        const reqEvInfo = new RequestEventsInfo({ page: 1,
                                                  count: 10,
                                                  sortBy: "date",
                                                  sortByAsc: false,
                                                  returnInfo: retInfo1,
                                                });
        q1.setRequestedResult(reqEvInfo);
        const response = await er.execQuery(q1);
        expect(_.has(response, "events")).toBeTruthy("Results should contain events");
        const events = _.get(response, "events.results", []);
        let lastEventDate = _.isEmpty(events) ? "" : _.get(_.first(events), "eventDate");
        _.each(events, (event) => {
            expect(event.eventDate <= lastEventDate).toBeTruthy("Events are not sorted by date");
            lastEventDate = event.eventDate;
            expect(_.has(event, "articleCounts")).toBeFalsy("Event should not contain articleCounts");
            expect(_.has(event, "categories")).toBeFalsy("Event should not contain categories");
            expect(_.has(event, "concepts")).toBeFalsy("Event should not contain concepts");
            expect(_.has(event, "location")).toBeFalsy("Event should not contain location");
            expect(_.has(event, "stories")).toBeFalsy("Event should not contain stories");
            expect(_.has(event, "images")).toBeFalsy("Event should not contain images");
            expect(_.has(event, "title")).toBeFalsy("Event should not contain title");
            expect(_.has(event, "summary")).toBeFalsy("Event should not contain summary");
        });
        done();
    });

    it("should test search by keyword (2)", async (done) => {
        const q1 = new QueryEvents({keywords: "car"});
        const returnInfo = new ReturnInfo({ conceptInfo: new ConceptInfoFlags({type: ["org", "loc"], lang: "spa"})});
        const reqEvConceptsTrends = new RequestEventsConceptTrends({conceptCount: 5, returnInfo});
        q1.setRequestedResult(reqEvConceptsTrends);
        const response = await er.execQuery(q1);
        expect(_.has(response, "conceptTrends")).toBeTruthy("Results should contain conceptAggr");
        _.each(_.get(response, "conceptTrends.conceptInfo", []), (concept) => {
            expect(concept.type === "loc" || concept.type === "org").toBeTruthy("Got concept of invalid type");
            expect(_.has(concept, "label.spa")).toBeTruthy("Concept did not contain label in expected language");
        });
        done();
    });

    it("should test search by location", async (done) => {
        const q = new QueryEvents({locationUri: await er.getLocationUri("Germany")});
        q.setRequestedResult(new RequestEventsInfo({sortBy: "size", sortByAsc: false}));
        const response = await er.execQuery(q);
        const results = _.get(response, "events.results", []);
        let lastSize = !_.isEmpty(results) ? results[0].totalArticleCount : 0;
        _.each(results, (event) => {
            expect(event.totalArticleCount <= lastSize).toBeTruthy("Events are not sorted by size");
            lastSize = event.totalArticleCount;
        });
        done();
    });

    it("should test event list with combined search", async (done) => {
        const conceptUri = await er.getConceptUri("Merkel");
        const categoryUri = await er.getCategoryUri("Business");
        const q1 = new QueryEvents({keywords: "germany", lang: ["eng", "deu"], conceptUri: [conceptUri], categoryUri: [categoryUri]});
        q1.setRequestedResult(new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo}));
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({keywords: "germany", lang: ["eng", "deu"], conceptUri, categoryUri});
        q2.setRequestedResult(new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo}));
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = _.sortBy(response1["events"]["results"], "id");
        const results2 = _.sortBy(response2["events"]["results"], "id");
        expect(_.size(results1)).toEqual(_.size(results2), "Source search should return responses of the same size");
        done();
    });

    it("should test concept trends", async (done) => {
        const requestEventsConceptTrends = new RequestEventsConceptTrends({conceptCount: 5, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptTrends);
        const response = await er.execQuery(query);
        expect(_.has(response, "conceptTrends")).toBeTruthy("Expected to get 'conceptTrends'");
        expect(_.has(response, "conceptTrends.trends")).toBeTruthy("Expected to get 'trends' property in conceptTrends");
        expect(_.has(response, "conceptTrends.conceptInfo")).toBeTruthy("Expected to get 'conceptInfo' property in conceptTrends");
        expect(_.size(_.get(response, "conceptTrends.conceptInfo", []))).toEqual(5, "Expected to get 5 concepts in concept trends");
        const trends = _.get(response, "conceptTrends.trends");
        expect(_.isEmpty(trends)).toBeFalsy("Expected to get trends for some days");
        _.each(trends, (trend) => {
            expect(_.has(trend, "date")).toBeTruthy("A trend should have a date");
            expect(_.has(trend, "conceptFreq")).toBeTruthy("A trend should have a conceptFreq");
            expect(_.has(trend, "totArts")).toBeTruthy("A trend should have a totArts property");
            expect(_.size(_.get(trend, "conceptFreq", []))).toBeLessThanOrEqual(5, "Concept frequencies should contain 5 elements - one for each concept");
        });

        _.each(_.get(response, "conceptTrends.conceptInfo", []), (concept) => {
            expect(concept).toBeValidConcept();
        });
        done();
    });

    it("should test concept aggregates", async (done) => {
        const requestEventsConceptAggr = new RequestEventsConceptAggr({conceptCount: 100, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptAggr);
        const response = await er.execQuery(query);
        expect(_.has(response, "conceptAggr")).toBeTruthy("Expected to get 'conceptAggr'");
        const concepts = _.get(response, "conceptAggr.results", []);
        // TODO: If the ConceptCount is included then we return 150 aggregates
        // expect(_.size(concepts)).toEqual(100, "Expected a different number of concept in conceptAggr");
        _.each(concepts, (concept) => {
            expect(concept).toBeValidConcept();
        });
        done();
    });

    it("should test keyword aggregates", async (done) => {
        const requestEventsKeywordAggr = new RequestEventsKeywordAggr();
        query.setRequestedResult(requestEventsKeywordAggr);
        const response = await er.execQuery(query);
        expect(_.has(response, "keywordAggr")).toBeTruthy("Expected to get 'keywordAggr'");
        const keywords = _.get(response, "keywordAggr.results", []);
        expect(_.size(keywords)).toBeGreaterThan(0, "Expected to get some keywords");
        _.each(keywords, (kw) => {
            expect(_.has(kw, "keyword")).toBeTruthy("Expected a keyword property");
            expect(_.has(kw, "weight")).toBeTruthy("Expected a weight property");
        });
        done();
    });

    it("should test category aggregates", async (done) => {
        const requestEventsCategoryAggr = new RequestEventsCategoryAggr(utils.returnInfo);
        query.setRequestedResult(requestEventsCategoryAggr);
        const response = await er.execQuery(query);
        expect(_.has(response, "categoryAggr")).toBeTruthy("Expected to get 'categoryAggr'");
        const categories = _.get(response, "categoryAggr.results", []);
        expect(_.size(categories)).toBeGreaterThan(0, "Expected to get some categories");
        _.each(categories, (category) => {
            expect(category).toBeValidCategory();
        });
        done();
    });

    it("should test concept matrix", async (done) => {
        const requestEventsConceptMatrix = new RequestEventsConceptMatrix({conceptCount: 20, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptMatrix);
        const response = await er.execQuery(query);
        expect(_.has(response, "conceptMatrix")).toBeTruthy("Expected to get 'conceptMatrix'");
        const matrix = _.get(response, "conceptMatrix");
        expect(_.has(matrix, "scoreMatrix")).toBeTruthy("Expecting 'scoreMatrix' property in conceptMatrix");
        expect(_.has(matrix, "freqMatrix")).toBeTruthy("Expecting 'freqMatrix' property in conceptMatrix");
        expect(_.has(matrix, "concepts")).toBeTruthy("Expecting 'concepts' property in conceptMatrix");
        expect(_.size(_.get(matrix, "concepts", []))).toEqual(20, "Expected 20 concepts");
        _.each(_.get(matrix, "concepts", []), (concept) => {
            expect(concept).toBeValidConcept();
        });
        done();
    });

    it("should test source aggregates", async (done) => {
        const requestEventsSourceAggr = new RequestEventsSourceAggr({sourceCount: 15, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsSourceAggr);
        const response = await er.execQuery(query);
        expect(_.has(response, "sourceAggr")).toBeTruthy("Expected to get 'sourceAggr'");
        const sources = _.get(response, "sourceAggr.results", []);
        expect(_.size(sources)).toEqual(15, "Expected 15 sources");
        _.each(sources, (sourceInfo) => {
            expect(_.get(sourceInfo, "source")).toBeValidSource();
            expect(_.has(sourceInfo, "counts")).toBeTruthy("Source info should contain counts object");
            expect(_.has(sourceInfo, "counts.frequency")).toBeTruthy("Counts should contain a frequency");
            expect(_.has(sourceInfo, "counts.ratio")).toBeTruthy("Counts should contain ratio");
        });
        done();
    });

    it("should test search by source", async (done) => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q.setRequestedResult(new RequestEventsUriWgtList());
        const response = await er.execQuery(q);
        expect(_.has(response, "uriWgtList")).toBeTruthy("Results should contain uriWgtList");
        done();
    });

    it("should test search by source (2)", async (done) => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        const eventInfo = new EventInfoFlags({concepts: true, articleCounts: true, title: true, summary: true, categories: true, location: true, stories: true, imageCount: 1});
        const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: "deu", type: "wiki"}), eventInfo});
        q.setRequestedResult(new RequestEventsInfo({page: 1, count: 100, sortBy: "size", sortByAsc: true, returnInfo: returnInfo1}));
        const response = await er.execQuery(q);

        expect(_.has(response, "events")).toBeTruthy("Results should contain events");

        const events = _.get(response, "events.results", []);
        expect(_.size(events)).toBeLessThanOrEqual(100, "Returned list of events was too long");

        let lastArtCount = 0;

        _.each(events, (event) => {
            expect(_.has(event, "articleCounts")).toBeTruthy("Event should contain articleCounts");
            expect(_.has(event, "categories")).toBeTruthy("Event should contain categories");
            expect(_.has(event, "concepts")).toBeTruthy("Event should contain concepts");
            expect(_.has(event, "stories")).toBeTruthy("Event should contain stories");
            expect(_.has(event, "title")).toBeTruthy("Event should contain title");
            expect(_.has(event, "summary")).toBeTruthy("Event should contain summary");
            expect(_.has(event, "images")).toBeTruthy("Event should contain images");
            expect(_.has(event, "location")).toBeTruthy("Event should contain location");

            lastArtCount = event.totalArticleCount;
            _.each(_.get(event, "concepts", []), (concept) => {
                expect(_.has(concept, "label.deu")).toBeTruthy("Concept should contain label in german language");
                expect(concept.type === "wiki").toBeTruthy("Got concept of invalid type");
            });
        });
        done();
    });

    it("should test search by source (3)", async (done) => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q.setRequestedResult(new RequestEventsConceptAggr({conceptCount: 5, returnInfo: new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["org", "loc"]})})}));
        const response = await er.execQuery(q);
        expect(_.has(response, "conceptAggr")).toBeTruthy("Results should contain conceptAggr");
        const concepts = _.get(response, "conceptAggr.results", []);
        expect(_.size(concepts)).toBeLessThanOrEqual(10, "Received a list of concepts that is too long");
        _.each(concepts, (concept) => {
            expect(concept.type === "loc" || concept.type === "org").toBeTruthy("Got concept of invalid type");
        });
        done();
    });

    it("should query events iterator (1)", async (done) => {
        const conceptUri = await er.getConceptUri("Obama");
        const q = new QueryEventsIter(er, {keywords: "germany", conceptUri});
        let eventsSize = 0;
        q.execQuery((items) => {
            eventsSize += _.size(items);
        }, async () => {
            const q2 = new QueryEvents({keywords: "germany", conceptUri});
            const response = await er.execQuery(q2);
            expect(_.get(response, "events.totalResults")).toEqual(eventsSize);
            done();
        });
    });

    it("should query events iterator (2)", async (done) => {
        const conceptUri = await er.getConceptUri("Obama");
        const q = new QueryEventsIter(er, {lang: allLangs, keywords: "germany", conceptUri: conceptUri, returnInfo: utils.returnInfo, maxItems: 10});
        q.execQuery((items) => {
            _.each(items, (item) => {
                expect(item).toContainConcept(conceptUri);
                new QueryEventArticlesIter(er, item["uri"], {lang: allLangs, returnInfo: utils.returnInfo}).execQuery((articles, error) => {
                    let hasKeyword = false;
                    _.each(articles, (article) => {
                        const text = _.deburr(_.toLower(_.get(article, "body")));
                        hasKeyword = _.includes(text, "german");
                    });
                    expect(hasKeyword).toBeTruthy("At least one of the articles was expected to contain 'germany'");
                });
            });
        }, () => {
            done();
        });
    });

    it("should query events iterator (3)", async (done) => {
        const sourceUri = await er.getNewsSourceUri("los angeles");
        const categoryUri = await er.getCategoryUri("business");
        const q = new QueryEventsIter(er, {lang: allLangs, keywords: "obama trump", sourceUri, categoryUri, returnInfo: utils.returnInfo});
        q.execQuery((items) => {
            _.each(items, (item) => {
                expect(item).toContainCategory(categoryUri);
                new QueryEventArticlesIter(er, item["uri"], {lang: allLangs, returnInfo: utils.returnInfo}).execQuery((articles, error) => {
                    if (error) {
                        console.info(error);
                    }
                    let hasKeyword1 = false;
                    let hasKeyword2 = false;

                    _.each(articles, (article) => {
                        const text = _.deburr(_.toLower(_.get(article, "body")));
                        hasKeyword1 = _.includes(text, "obama");
                        hasKeyword2 = _.includes(text, "trump");
                    });
                    expect(hasKeyword1).toBeTruthy("At least one of the articles was expected to contain 'obama'");
                    expect(hasKeyword2).toBeTruthy("At least one of the articles was expected to contain 'trump'");
                    const hasArticleFromSource = _.every(articles, (article) => article["source"]["uri"] === sourceUri);
                    expect(hasArticleFromSource).toBeTruthy();
                });
            });
        }, () => {
            done();
        });
    });

    it("should query events iterator (4)", async (done) => {
        const obamaUri = await er.getConceptUri("Obama");
        const politicsUri = await er.getConceptUri("politics");
        const chinaUri = await er.getConceptUri("china");
        const unitedStatesUri = await er.getConceptUri("united states");

        const srcDailyCallerUri = await er.getNewsSourceUri("daily caller");
        const srcAawsatUri = await er.getNewsSourceUri("aawsat");
        const srcSvodkaUri = await er.getNewsSourceUri("svodka");

        const catBusinessUri = await er.getCategoryUri("business");
        const catPoliticsUri = await er.getCategoryUri("politics");
        const queryConfig = {
            conceptUri: obamaUri,
            maxItems: 10,
            ignoreConceptUri: [politicsUri, chinaUri, unitedStatesUri],
            ignoreKeywords: ["trump", "politics", "michelle"],
            ignoreSourceUri: [srcDailyCallerUri, srcAawsatUri, srcSvodkaUri],
            ignoreCategoryUri: [catBusinessUri, catPoliticsUri],
        };
        const q = new QueryEventsIter(er, queryConfig);
        q.execQuery((items, error) => {
            if (!_.isEmpty(error)) {
                console.error(error);
            }
            _.each(items, (item) => {
                expect(item).toContainConcept(obamaUri);
                expect(item).not.toContainConcept(politicsUri);
                expect(item).not.toContainConcept(chinaUri);
                expect(item).not.toContainConcept(unitedStatesUri);
                expect(item).not.toContainCategory(catBusinessUri);
                expect(item).not.toContainCategory(catPoliticsUri);
                new QueryEventArticlesIter(er, item["uri"], {returnInfo: utils.returnInfo, lang: allLangs}).execQuery((articles, err) => {
                    if (!_.isEmpty(err)) {
                        console.error(err);
                    }
                    _.each(articles, (article) => {
                        const text = _.deburr(_.toLower(_.get(article, "body")));
                        expect(text).not.toContain("trump");
                        expect(text).not.toContain("politics");
                        expect(text).not.toContain("michelle");
                    });
                    const hasArticleFromSource1 = _.every(articles, (article) => article["source"]["uri"] === srcDailyCallerUri);
                    const hasArticleFromSource2 = _.every(articles, (article) => article["source"]["uri"] === srcAawsatUri);
                    const hasArticleFromSource3 = _.every(articles, (article) => article["source"]["uri"] === srcSvodkaUri);
                    expect(hasArticleFromSource1).toBeFalsy();
                    expect(hasArticleFromSource2).toBeFalsy();
                    expect(hasArticleFromSource3).toBeFalsy();
                });
            });
        }, () => {
            done();
        });
    });
});
