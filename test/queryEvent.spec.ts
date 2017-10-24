import * as _ from "lodash";
import {
    ConceptInfoFlags,
    EventRegistry,
    QueryEvent,
    QueryEventArticlesIter,
    QueryEvents,
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
} from "../src/index";
import { Utils } from "./utils";

describe("Query Event", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryEvent;

    beforeAll(async () => {
        const q = new QueryEvents({lang: "eng", conceptUri: await er.getConceptUri("Obama")});
        const requestEventsUriList = new RequestEventsUriList({count: 10});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        query = new QueryEvent(_.get(response, "uriList.results"));
    });

    it("should test article list", async () => {
        const requestEventArticles  = new RequestEventArticles({returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventArticles);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            _.each(_.get(event, "articles.results", []), (article) => {
                expect(article).toBeValidArticle();
            });
        });
    });

    it("should test article uris", async () => {
        const requestEventArticleUris  = new RequestEventArticleUris();
        query.setRequestedResult(requestEventArticleUris);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "articleUris")).toBeTruthy("Expected to see 'articleUris'");
        });
    });

    it("should test keywords", async () => {
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
    });

    it("should test source aggregates", async () => {
        const requestEventSourceAggr  = new RequestEventSourceAggr();
        query.setRequestedResult(requestEventSourceAggr);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "sourceExAggr")).toBeTruthy("Expected to see 'sourceExAggr'");
        });
    });

    it("should test article trends", async () => {
        const requestEventArticleTrend  = new RequestEventArticleTrend();
        query.setRequestedResult(requestEventArticleTrend);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "articleTrend")).toBeTruthy("Expected to see 'articleTrend'");
        });
    });

    it("should test similar events", async () => {
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
    });

    it("should test similar stories", async () => {
        const requestEventSimilarStories  = new RequestEventSimilarStories({returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventSimilarStories);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "similarStories")).toBeTruthy("Expected to see 'similarStories'");
            _.each(_.get(event, "similarStories.results"), (simStory) => {
                expect(simStory).toBeValidStory();
            });
        });
    });

    // TODO: use a an event uri that actually exists in the database
    it("should test query event articles iterator", async (done) => {
        const q = new QueryEventArticlesIter(er, "eng-2863607");
        let size = 0;
        q.execQuery((items) => {
            size += _.size(items);
        }, async () => {
            const q2 = new QueryEvent("eng-2863607");
            const response = await er.execQuery(q2);
            expect(_.get(response["eng-2863607"], "info.totalArticleCount")).toEqual(size);
            done();
        });
    });
});
