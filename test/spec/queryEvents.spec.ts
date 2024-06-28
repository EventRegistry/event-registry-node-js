import {
    BaseQuery,
    ComplexEventQuery,
    ConceptInfoFlags,
    ER,
    EventInfoFlags,
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

fdescribe("Query Events", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryEvents;
    let requestEventsInfo: RequestEventsInfo;

    beforeAll(async () => {
        requestEventsInfo = new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo});
        query = new QueryEvents({conceptUri: await er.getConceptUri("United Kingdom")});
    });

    it("should test event list", async () => {
        query.setRequestedResult(requestEventsInfo);
        const response = await er.execQuery(query);
        expect(response).toBeValidGeneralEventList();
    });

    it("should test event list with keyword search", async () => {
        const q1 = new QueryEvents({keywords: "germany"});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({keywords: "germany"});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = (response1["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        const results2 = (response2["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        expect(results1.length).toEqual(results2.length);
    });

    it("should test event list with source search", async () => {
        const q1 = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = (response1["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        const results2 = (response2["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        expect(results1.length).toEqual(results2.length);
    });

    it("should test event list with category search", async () => {
        const q1 = new QueryEvents({categoryUri: await er.getCategoryUri("disa")});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({categoryUri: await er.getCategoryUri("disa")});
        q2.setRequestedResult(requestEventsInfo);
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = (response1["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        const results2 = (response2["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        expect(results1.length).toEqual(results2.length);
    });

    it("should test event list with author search", async () => {
        const authorUri = await er.getAuthorUri("associated");
        const q1 = new QueryEvents({authorUri});
        const response1 = await er.execQuery(q1);
        const q2 = QueryEvents.initWithComplexQuery(new ComplexEventQuery(new BaseQuery({authorUri})));
        const response2 = await er.execQuery(q2);
        const results1 = (response1["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        const results2 = (response2["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        expect(results1.length).toEqual(results2.length);
    });

    it("should test event list with language search", async () => {
        const q1 = new QueryEvents({lang: "spa"});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();
    });

    it("should test event list with minimal articles search", async () => {
        const q1 = new QueryEvents({minArticlesInEvent: 100});
        q1.setRequestedResult(requestEventsInfo);
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();
    });

    it("should test search by keyword", async () => {
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
        expect(response.hasOwnProperty("events")).toBeTruthy();
        const events = (response?.events?.results ?? []) as ER.Event[];
        let lastEventDate = events.length === 0 ? "" : events[0]?.eventDate;
        for (const event of events) {
            expect(event.eventDate >= lastEventDate).toBeTruthy();
            lastEventDate = event.eventDate;
            expect(event.hasOwnProperty("articleCounts")).toBeFalsy();
            expect(event.hasOwnProperty("categories")).toBeFalsy();
            expect(event.hasOwnProperty("concepts")).toBeFalsy();
            expect(event.hasOwnProperty("location")).toBeFalsy();
            expect(event.hasOwnProperty("stories")).toBeFalsy();
            expect(event.hasOwnProperty("images")).toBeFalsy();
            expect(event.hasOwnProperty("title")).toBeFalsy();
            expect(event.hasOwnProperty("summary")).toBeFalsy();
        }
    });

    it("should test search by keyword rev", async () => {
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
        expect(response.hasOwnProperty("events")).toBeTruthy();
        const events = (response?.events?.results ?? []) as ER.Event[];
        let lastEventDate = events.length === 0 ? "" : events[0]?.eventDate;
        for (const event of events) {
            expect(event.eventDate <= lastEventDate).toBeTruthy();
            lastEventDate = event.eventDate;
            expect(event.hasOwnProperty("articleCounts")).toBeFalsy();
            expect(event.hasOwnProperty("categories")).toBeFalsy();
            expect(event.hasOwnProperty("concepts")).toBeFalsy();
            expect(event.hasOwnProperty("location")).toBeFalsy();
            expect(event.hasOwnProperty("stories")).toBeFalsy();
            expect(event.hasOwnProperty("images")).toBeFalsy();
            expect(event.hasOwnProperty("title")).toBeFalsy();
            expect(event.hasOwnProperty("summary")).toBeFalsy();
        }
    });

    it("should test search by keyword (2)", async () => {
        const q1 = new QueryEvents({keywords: "car"});
        const returnInfo = new ReturnInfo({ conceptInfo: new ConceptInfoFlags({type: ["org", "loc"], lang: "spa"})});
        const reqEvConceptsTrends = new RequestEventsConceptTrends({conceptCount: 5, returnInfo});
        q1.setRequestedResult(reqEvConceptsTrends);
        const response = await er.execQuery(q1);
        expect(!!response?.conceptTrends).toBeTruthy();
        const concepts = ((response?.conceptTrends as unknown as Record<string, ER.Concept[]>)?.conceptInfo ?? []);
        for (const concept of concepts) {
            expect(concept.type === "loc" || concept.type === "org").toBeTruthy();
            expect((concept?.label as Record<string, string>)?.spa).toBeTruthy();
        }
    });

    it("should test search by location", async () => {
        const q = new QueryEvents({locationUri: await er.getLocationUri("Germany")});
        q.setRequestedResult(new RequestEventsInfo({sortBy: "size", sortByAsc: false}));
        const response = await er.execQuery(q);
        const results = (response?.events?.results ?? []) as ER.Event[];
        let lastSize = results.length > 0 ? results[0].totalArticleCount : 0;
        for (const event of results) {
            expect(event.totalArticleCount <= lastSize).toBeTruthy();
            lastSize = event.totalArticleCount;
        }
    });

    it("should test event list with combined search", async () => {
        const conceptUri = await er.getConceptUri("Merkel");
        const categoryUri = await er.getCategoryUri("Business");
        const q1 = new QueryEvents({keywords: "germany", conceptUri: [conceptUri], categoryUri: [categoryUri]});
        q1.setRequestedResult(new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo}));
        const response1 = await er.execQuery(q1);
        expect(response1).toBeValidGeneralEventList();

        const q2 = new QueryEvents({keywords: "germany", conceptUri, categoryUri});
        q2.setRequestedResult(new RequestEventsInfo({count: 10, returnInfo: utils.returnInfo}));
        const response2 = await er.execQuery(q2);
        expect(response2).toBeValidGeneralEventList();

        const results1 = (response1["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        const results2 = (response2["events"]["results"] as ER.Event[]).sort((a, b) => (a.id ?? "").localeCompare((b.id ?? "")));
        expect(results1.length).toEqual(results2.length);
    });

    it("should test concept trends", async () => {
        const requestEventsConceptTrends = new RequestEventsConceptTrends({conceptCount: 5, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptTrends);
        const response = await er.execQuery(query);
        expect(!!response?.conceptTrends).toBeTruthy();
        expect(!!(response?.conceptTrends as Record<string, unknown>)?.trends).toBeTruthy();
        expect(!!(response?.conceptTrends as Record<string, unknown>)?.conceptInfo).toBeTruthy();
        const concepts = ((response?.conceptTrends as unknown as Record<string, ER.Concept[]>)?.conceptInfo ?? []);
        expect(concepts.length).toBeLessThanOrEqual(5);
        const trends = (response?.conceptTrends as unknown as Record<string, Record<string, unknown>[]>)?.trends ?? [];
        expect(trends.length === 0).toBeFalsy();
        for (const trend of trends) {
            expect(trend?.date).toBeTruthy();
            expect(trend?.conceptFreq).toBeTruthy();
            expect(trend?.totArts).toBeTruthy();
            expect(((trend?.conceptFreq as unknown[]) ?? []).length).toBeLessThanOrEqual(5);
        }

        for (const concept of concepts) {
            expect(concept).toBeValidConcept();
        }
    });

    it("should test concept aggregates", async () => {
        const requestEventsConceptAggr = new RequestEventsConceptAggr({conceptCount: 100, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptAggr);
        const response = await er.execQuery(query);
        expect(!!response?.conceptAggr).toBeTruthy();
        const concepts = (response?.conceptAggr?.results ?? []) as ER.Concept[];
        for (const concept of concepts) {
            expect(concept).toBeValidConcept();
        }
    });

    it("should test keyword aggregates", async () => {
        const requestEventsKeywordAggr = new RequestEventsKeywordAggr();
        query.setRequestedResult(requestEventsKeywordAggr);
        const response = await er.execQuery(query);
        expect(!!response?.keywordAggr).toBeTruthy();
        const keywords = (response?.keywordAggr?.results ?? []) as Record<string, unknown>[];
        expect(keywords.length).toBeGreaterThan(0);
        for (const kw of keywords) {
            expect(!!kw?.keyword).toBeTruthy();
            expect(!!kw?.weight).toBeTruthy();
        }
    });

    it("should test category aggregates", async () => {
        const requestEventsCategoryAggr = new RequestEventsCategoryAggr(utils.returnInfo);
        query.setRequestedResult(requestEventsCategoryAggr);
        const response = await er.execQuery(query);
        expect(!!response?.categoryAggr).toBeTruthy();
        const categories = (response?.categoryAggr?.results ?? []) as ER.Category[];
        expect(categories.length).toBeGreaterThan(0);
        for (const category of categories) {
            expect(category).toBeValidCategory();
        }
    });

    it("should test concept matrix", async () => {
        const requestEventsConceptMatrix = new RequestEventsConceptMatrix({conceptCount: 20, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsConceptMatrix);
        const response = await er.execQuery(query);
        expect(response.hasOwnProperty("conceptMatrix")).toBeTruthy();
        const matrix = response?.conceptMatrix;
        expect(matrix.hasOwnProperty("scoreMatrix")).toBeTruthy();
        expect(matrix.hasOwnProperty("freqMatrix")).toBeTruthy();
        expect(matrix.hasOwnProperty("concepts")).toBeTruthy();
        const concepts = (matrix as unknown as Record<string, ER.Concept[]>)?.concepts ?? [];
        expect(concepts.length).toEqual(20);
        for (const concept of concepts) {
            expect(concept).toBeValidConcept();
        }
    });

    it("should test source aggregates", async () => {
        const requestEventsSourceAggr = new RequestEventsSourceAggr({sourceCount: 15, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventsSourceAggr);
        const response = await er.execQuery(query);
        expect(!!response?.sourceAggr).toBeTruthy();
        const sources = (response?.sourceAggr as unknown as Record<string, Record<string, ER.Source>[]>)?.countsPerSource ?? [];
        expect(sources.length).toEqual(15);
        for (const source of sources) {
            expect(source?.source).toBeValidSource();
            expect(!!source?.counts).toBeTruthy();
            expect(!!(source?.counts as unknown as Record<string, unknown>)?.frequency).toBeTruthy();
            expect(!!(source?.counts as unknown as Record<string, unknown>)?.total).toBeTruthy();
        }
        const countries = (response?.sourceAggr as unknown as Record<string, Record<string, unknown>[]>)?.countsPerCountry ?? [];
        for (const country of countries) {
            if (country?.uri === "http://en.wikipedia.org/wiki/Australia_(continent)") break;
            expect(country?.type).toEqual("loc");
            expect(country?.frequency).toBeGreaterThan(0);
        }
    });

    it("should test search by source", async () => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q.setRequestedResult(new RequestEventsUriWgtList());
        const response = await er.execQuery(q);
        expect(!!response?.uriWgtList).toBeTruthy();
    });

    it("should test search by source (2)", async () => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        const eventInfo = new EventInfoFlags({concepts: true, articleCounts: true, title: true, summary: true, categories: true, stories: true, imageCount: 1});
        const returnInfo1 = new ReturnInfo({conceptInfo: new ConceptInfoFlags({lang: "deu", type: "wiki"}), eventInfo});
        q.setRequestedResult(new RequestEventsInfo({page: 1, count: 50, sortBy: "size", sortByAsc: true, returnInfo: returnInfo1}));
        const response = await er.execQuery(q);

        expect(response?.events).toBeTruthy();

        const events = (response?.events?.results ?? []) as ER.Event[];
        expect(events.length).toBeLessThanOrEqual(50);

        let lastArtCount = 0;

        for (const event of events) {
            expect(!!event?.articleCounts).toBeTruthy();
            expect(!!event?.categories).toBeTruthy();
            expect(!!event?.concepts).toBeTruthy();
            expect(!!event?.stories).toBeTruthy();
            expect(!!event?.title).toBeTruthy();
            expect(!!event?.summary).toBeTruthy();
            expect(!!event?.images).toBeTruthy();
            expect(!!event?.location).toBeTruthy();
            lastArtCount = event.totalArticleCount;
            for (const concept of event.concepts) {
                expect((concept?.label as Record<string, unknown>)?.deu).toBeTruthy();
                expect(((concept?.type + "") ?? "") === "wiki").toBeTruthy();
            }
        }
    });

    it("should test search by source (3)", async () => {
        const q = new QueryEvents({sourceUri: await er.getNewsSourceUri("bbc")});
        q.setRequestedResult(new RequestEventsConceptAggr({conceptCount: 5, returnInfo: new ReturnInfo({conceptInfo: new ConceptInfoFlags({type: ["org", "loc"]})})}));
        const response = await er.execQuery(q);
        expect(!!response?.conceptAggr).toBeTruthy();
        const concepts = (response?.conceptAggr?.results ?? []) as ER.Concept[];
        expect(concepts.length).toBeLessThanOrEqual(10);
        for (const concept of concepts) {
            expect(concept.type === "loc" || concept.type === "org").toBeTruthy();
        }
    });

    it("should query events iterator (1)", async () => {
        const conceptUri = await er.getConceptUri("Obama");
        const q = new QueryEventsIter(er, {keywords: "germany", conceptUri});
        let eventsSize = 0;
        q.execQuery((item) => {
            eventsSize += 1;
        }, async () => {
            const q2 = new QueryEvents({keywords: "germany", conceptUri});
            const response = await er.execQuery(q2);
            expect(response?.events?.totalResults).toEqual(eventsSize);
        });
    });

    it("should query events iterator (2)", async () => {
        const conceptUri = await er.getConceptUri("Obama");
        const q = new QueryEventsIter(er, { lang: ["eng"], keywords: "trump", conceptUri: conceptUri, returnInfo: utils.returnInfo, maxItems: 5 });
        q.execQuery((item) => {
            expect(item).toContainConcept(conceptUri);
            let someArticlesHasText = false;
            new QueryEventArticlesIter(er, item["uri"], { lang: ["eng"], returnInfo: utils.returnInfo, maxItems: 5 }).execQuery((article) => {
                someArticlesHasText = someArticlesHasText || utils.normalize(article?.body ?? "").includes("trump");
            }, () => {
                expect(someArticlesHasText).toBeTruthy();
            });
        });
    });

    it("should query events iterator (3)", async () => {
        const categoryUri = await er.getCategoryUri("business");
        const q = new QueryEventsIter(er, { keywords: "obama trump", categoryUri, returnInfo: utils.returnInfo });
        q.execQuery((item) => {
            expect(item).toContainCategory(categoryUri);
            let includesKeywordObama = false;
            let includesKeywordTrump = false;

            new QueryEventArticlesIter(er, item["uri"], { returnInfo: utils.returnInfo }).execQuery((article) => {
                const text = utils.normalize(article?.body ?? "");
                includesKeywordObama = includesKeywordObama || text.includes("obama");
                includesKeywordTrump = includesKeywordTrump || text.includes("trump");
            }, () => {
                expect(includesKeywordObama).toBeTruthy();
                expect(includesKeywordTrump).toBeTruthy();
            });
        });
    });

    it("should query events iterator (4)", async () => {
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
            returnInfo: new ReturnInfo({ conceptInfo: new ConceptInfoFlags({ maxConceptsPerType: 350 })}),
        };
        const q = new QueryEventsIter(er, queryConfig);
        q.execQuery((item) => {
            expect(item).toContainConcept(obamaUri);
            expect(item).not.toContainConcept(politicsUri);
            expect(item).not.toContainConcept(chinaUri);
            expect(item).not.toContainConcept(unitedStatesUri);
            expect(item).not.toContainCategory(catBusinessUri);
            expect(item).not.toContainCategory(catPoliticsUri);
            new QueryEventArticlesIter(er, item["uri"], {returnInfo: utils.returnInfo, lang: ["eng"]}).execQuery((article) => {
                const text = utils.normalize(article?.body ?? "");
                expect(text).not.toContain("trump");
                expect(text).not.toContain("politics");
                expect(text).not.toContain("michelle");
                const hasArticleFromSource1 = article["source"]["uri"] === srcDailyCallerUri;
                const hasArticleFromSource2 = article["source"]["uri"] === srcAawsatUri;
                const hasArticleFromSource3 = article["source"]["uri"] === srcSvodkaUri;
                expect(hasArticleFromSource1).toBeFalsy();
                expect(hasArticleFromSource2).toBeFalsy();
                expect(hasArticleFromSource3).toBeFalsy();
            });
        });
    });
});
