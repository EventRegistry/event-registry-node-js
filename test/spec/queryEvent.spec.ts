import * as _ from "lodash";
import {
    ConceptInfoFlags,
    EventRegistry,
    QueryEvent,
    QueryEventArticlesIter,
    QueryEvents,
    RequestArticlesInfo,
    RequestEventArticles,
    RequestEventArticleTrend,
    RequestEventArticleUris,
    RequestEventInfo,
    RequestEventKeywordAggr,
    RequestEventSimilarEvents,
    RequestEventSimilarStories,
    RequestEventSourceAggr,
    RequestEventsUriList,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Event", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryEvent;

    beforeAll(async (done) => {
        const q = new QueryEvents({lang: "eng", conceptUri: await er.getConceptUri("Obama")});
        const requestEventsUriList = new RequestEventsUriList({count: 10});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        query = new QueryEvent(_.get(response, "uriList.results"));
        done();
    });

    it("should test article list", async (done) => {
        const requestEventArticles  = new RequestEventArticles({returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventArticles);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            _.each(_.get(event, "articles.results", []), (article) => {
                expect(article).toBeValidArticle();
            });
        });
        done();
    });

    it("should test article uris", async (done) => {
        const requestEventArticleUris  = new RequestEventArticleUris();
        query.setRequestedResult(requestEventArticleUris);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "articleUris")).toBeTruthy("Expected to see 'articleUris'");
        });
        done();
    });

    it("should test keywords", async (done) => {
        const requestEventKeywordAggr  = new RequestEventKeywordAggr();
        query.setRequestedResult(requestEventKeywordAggr);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "keywordAggr")).toBeTruthy("Expected to see 'keywordAggr'");
            if (_.has(event, "keywordAggr.error")) {
                console.error(_.get(event, "keywordAggr.error"));
            }
            _.each(_.get(event, "keywordAggr.results"), (kw) => {
                expect(_.has(kw, "keyword")).toBeTruthy("Keyword expected");
                expect(_.has(kw, "weight")).toBeTruthy("Weight expected");
            });
        });
        done();
    });

    it("should test source aggregates", async (done) => {
        const requestEventSourceAggr  = new RequestEventSourceAggr();
        query.setRequestedResult(requestEventSourceAggr);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "sourceExAggr")).toBeTruthy("Expected to see 'sourceExAggr'");
        });
        done();
    });

    it("should test article trends", async (done) => {
        const requestEventArticleTrend  = new RequestEventArticleTrend();
        query.setRequestedResult(requestEventArticleTrend);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "articleTrend")).toBeTruthy("Expected to see 'articleTrend'");
        });
        done();
    });

    it("should test similar events", async (done) => {
        const requestEventSimilarEvents  = new RequestEventSimilarEvents({addArticleTrendInfo: true, returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventSimilarEvents);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "similarEvents")).toBeTruthy("Expected to see 'similarEvents'");
            _.each(_.get(event, "similarEvents.results"), (simEvent) => {
                expect(simEvent).toBeValidEvent();
            });
            expect(_.has(event, "similarEvents.trends")).toBeTruthy("Expected to see 'trends'");
        });
        done();
    });

    it("should test similar stories", async (done) => {
        const requestEventSimilarStories  = new RequestEventSimilarStories({returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventSimilarStories);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "similarStories")).toBeTruthy("Expected to see 'similarStories'");
            _.each(_.get(event, "similarStories.results"), (simStory) => {
                expect(simStory).toBeValidStory();
            });
        });
        done();
    });

    it("should test query event articles iterator", async (done) => {
        const q = new QueryEventArticlesIter(er, "eng-2863607", { maxItems: 150, articleBatchSize: 50 });
        let size = 0;
        q.execQuery((items) => {
            size += _.size(items);
        }, async () => {
            const q2 = new QueryEvent("eng-2863607");
            const requestEventArticles = new RequestEventArticles({count: 150});
            q2.setRequestedResult(requestEventArticles);
            const response = await er.execQuery(q2);
            expect(_.size(_.get(response["eng-2863607"], "articles.results"))).toEqual(size);
            done();
        });
    });
});
