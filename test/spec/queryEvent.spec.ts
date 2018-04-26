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
    RequestEventArticleUriWgts,
    RequestEventInfo,
    RequestEventKeywordAggr,
    RequestEventSimilarEvents,
    RequestEventSimilarStories,
    RequestEventSourceAggr,
    RequestEventsUriWgtList,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Event", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    const conceptInfoList = [{ uri: "http://en.wikipedia.org/wiki/Barack_Obama", wgt: 100 }, { uri: "http://en.wikipedia.org/wiki/Donald_Trump", wgt: 80 }];
    let query: QueryEvent;

    async function createQuery(count = 50): Promise<QueryEvent> {
        const q = new QueryEvents({lang: "eng", conceptUri: await er.getConceptUri("Obama")});
        const requestEventsUriList = new RequestEventsUriWgtList({count});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        return new QueryEvent(EventRegistry.getUriFromUriWgt(_.get(response, "uriWgtList.results")));
    }

    beforeAll(async (done) => {
        query = await createQuery();
        done();
    });

    it("should test article count", async (done) => {
        const q = await createQuery(10);
        q.setRequestedResult(new RequestEventArticleUriWgts());
        const response = await er.execQuery(q);
        _.each(response, async (event, uri) => {
            if (!_.has(event, "newEventUri")) {
                return;
            }
            const iter = new QueryEventArticlesIter(er, uri);
            const count = await iter.count();
            const uriListSize = _.size(_.get(event, "urIWgtList.results", []));
            expect(count).toBe(uriListSize, `Event did not have expected uri wgt list: expected ${count}, got ${uriListSize}`);
        });
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
        const requestEventArticleUriWgts  = new RequestEventArticleUriWgts();
        query.setRequestedResult(requestEventArticleUriWgts);
        const response = await er.execQuery(query);
        _.each(response, (event) => {
            expect(_.has(event, "uriWgtList")).toBeTruthy("Expected to see 'uriWgtList'");
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
        const q = await createQuery(1);
        const requestEventSimilarEvents  = new RequestEventSimilarEvents({
            conceptInfoList,
            addArticleTrendInfo: true,
            returnInfo: utils.returnInfo,
        });
        q.setRequestedResult(requestEventSimilarEvents);
        const response = await er.execQuery(q);
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
        const q = await createQuery(1);
        const requestEventSimilarStories  = new RequestEventSimilarStories({
            conceptInfoList,
            returnInfo: utils.returnInfo,
        });
        q.setRequestedResult(requestEventSimilarStories);
        const response = await er.execQuery(q);
        _.each(response, (event) => {
            expect(_.has(event, "similarStories")).toBeTruthy("Expected to see 'similarStories'");
            _.each(_.get(event, "similarStories.results"), (simStory) => {
                expect(simStory).toBeValidStory();
            });
        });
        done();
    });

    it("should test query event articles iterator", async (done) => {
        const q = new QueryEventArticlesIter(er, "eng-3075290", { maxItems: 10, articleBatchSize: 5 });
        let size = 0;
        q.execQuery((items) => {
            size += _.size(items);
        }, async () => {
            const q2 = new QueryEvent("eng-3075290");
            const requestEventArticles = new RequestEventArticles({count: 10});
            q2.setRequestedResult(requestEventArticles);
            const response = await er.execQuery(q2);
            expect(_.size(_.get(response["eng-3075290"], "articles.results"))).toEqual(size);
            done();
        });
    });
});
