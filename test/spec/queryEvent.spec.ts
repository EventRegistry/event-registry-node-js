import {
    ER,
    EventRegistry,
    QueryEvent,
    QueryEventArticlesIter,
    QueryEvents,
    RequestEventArticles,
    RequestEventArticleTrend,
    RequestEventArticleUriWgts,
    RequestEventKeywordAggr,
    RequestEventSimilarEvents,
    RequestEventSourceAggr,
    RequestEventsInfo,
    RequestEventsUriWgtList,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Event", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    const conceptInfoList = [
        { uri: "http://en.wikipedia.org/wiki/Barack_Obama", wgt: 100 },
        { uri: "http://en.wikipedia.org/wiki/Donald_Trump", wgt: 80 }
    ];
    let query: QueryEvent;
    let eventUri: string;

    async function fetchRecentEventUri(): Promise<string | undefined> {
        const q = new QueryEvents({lang: "eng"});
        q.setRequestedResult(new RequestEventsInfo({count: 10, sortBy: "date", sortByAsc: false}));
        const response = await er.execQuery(q);
        const events = (response?.events?.results ?? []) as ER.Event[];
        return events.find((event) => !!event?.uri)?.uri;
    }

    async function createQuery(count = 50): Promise<QueryEvent> {
        const q = new QueryEvents({lang: "eng", conceptUri: await er.getConceptUri("United Kingdom")});
        const requestEventsUriList = new RequestEventsUriWgtList({count});
        q.setRequestedResult(requestEventsUriList);
        const response = await er.execQuery(q);
        const uriWgtList = (response?.uriWgtList.results ?? []) as string[];
        return new QueryEvent(EventRegistry.getUriFromUriWgt(uriWgtList)[0]);
    }

    beforeAll(async () => {
        eventUri = await fetchRecentEventUri() as string;
        if (!eventUri) {
            pending("no recent event URI available");
            return;
        }
        query = await createQuery();
    });

    it("should test event articles filtering", async () => {
        if (!eventUri) {
            pending("no recent event URI available");
            return;
        }
        const q1 = new QueryEventArticlesIter(er, eventUri);
        const counts1 = await q1.count();
        const counts2 = await (new QueryEventArticlesIter(er, eventUri, {lang: "deu"})).count();
        expect(counts1).not.toEqual(counts2);
        const counts3 = await (new QueryEventArticlesIter(er, eventUri, {conceptUri: await er.getConceptUri("United Kingdom")})).count();
        expect(counts1).not.toEqual(counts3);
        const counts4 = await (new QueryEventArticlesIter(er, eventUri, {keywords: "United Kingdom"})).count();
        expect(counts1).not.toEqual(counts4);
        const counts5 = await (new QueryEventArticlesIter(er, eventUri, {sourceUri: await er.getNewsSourceUri("Washington Post")})).count();
        expect(counts1).not.toEqual(counts5);
        const counts6 = await (new QueryEventArticlesIter(er, eventUri, {lang: "deu", conceptUri: await er.getConceptUri("United Kingdom")})).count();
        expect(counts1).not.toEqual(counts6);
        let count = 0;
        await new Promise<void>((resolve, reject) => {
            q1.execQuery(() => {
                count++;
            }, async (err) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                try {
                    expect(counts1).toEqual(count);
                    const q = new QueryEvent(eventUri);
                    q.setRequestedResult(new RequestEventArticles({lang: "deu", conceptUri: await er.getConceptUri("United Kingdom")}));
                    const response = await er.execQuery(q);
                    const totalResults = ((response[eventUri]) as Record<string, ER.Results<ER.Article>>)?.articles?.totalResults ?? 0;
                    expect(counts6).toEqual(totalResults);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });

    it("should test article sorting", async () => {
        const q = await createQuery(1);
        const response = await er.execQuery(q);
        const sortEventUri = (response?.params as unknown as Record<string, string>)?.eventUri as string;
        const q1 = new QueryEventArticlesIter(er, sortEventUri, {sortBy: "date", sortByAsc: true});
        let wgt: number | undefined = undefined;
        await new Promise<void>((resolve, reject) => {
            q1.execQuery((article) => {
                if (!wgt) {
                    wgt = article?.wgt;
                }
                expect(article?.wgt).toBeGreaterThanOrEqual(wgt);
                wgt = article?.wgt;
            }, async (err) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                try {
                    wgt = undefined;
                    const q2 = new QueryEventArticlesIter(er, sortEventUri, {sortBy: "date", sortByAsc: false});
                    await new Promise<void>((resolveNested, rejectNested) => {
                        q2.execQuery((article) => {
                            if (!wgt) {
                                wgt = article?.wgt;
                            }
                            expect(article?.wgt).toBeLessThanOrEqual(wgt);
                            wgt = article?.wgt;
                        }, (nestedErr) => {
                            nestedErr ? rejectNested(new Error(nestedErr)) : resolveNested();
                        });
                    });
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });

    it("should test article count", async () => {
        const q = await createQuery(10);
        q.setRequestedResult(new RequestEventArticleUriWgts());
        const response = await er.execQuery(q);
        for (const [uri, event] of Object.entries(response)) {
            if (!(event as Record<string, unknown>)?.newEventUri) {
                break;
            }
            const iter = new QueryEventArticlesIter(er, uri);
            const count = await iter.count();
            const uriListSize = (event as Record<string, ER.Results>).urIWgtList?.results?.length || 0;
            expect(count).toBe(uriListSize);
        }
    });

    it("should test article list", async () => {
        const requestEventArticles  = new RequestEventArticles({returnInfo: utils.returnInfo});
        query.setRequestedResult(requestEventArticles);
        const response = (await er.execQuery(query)) as Record<string, ER.Results<ER.Article>>[];
        for (const event of Object.values(response)) {
            const articles = event?.articles?.results ?? [];
            for (const article of articles) {
                expect(article).toBeValidArticle();
            }
        }
    });

    it("should test article uris", async () => {
        const requestEventArticleUriWgts  = new RequestEventArticleUriWgts();
        query.setRequestedResult(requestEventArticleUriWgts);
        const response = await er.execQuery(query) as Record<string, unknown>[];
        for (const event of Object.values(response)) {
            expect(event?.uriWgtList).toBeTruthy();
        }
    });

    it("should test keywords", async () => {
        const requestEventKeywordAggr  = new RequestEventKeywordAggr();
        query.setRequestedResult(requestEventKeywordAggr);
        const response = await er.execQuery(query) as Record<string, unknown>[];
        for (const event of Object.values(response)) {
            expect(event?.keywordAggr).toBeTruthy();
            if (!!(event?.keywordAggr as Record<string, string>)?.error) {
                fail((event?.keywordAggr as Record<string, string>)?.error);
            }
            const keywords = (event?.keywordAggr as Record<string, ER.Keyword[]>)?.results || [];
            for (const kw of keywords) {
                expect(!!kw?.keyword).toBeTruthy();
                expect(!!kw?.weight).toBeTruthy();
            }
        }
    });

    it("should test source aggregates", async () => {
        const requestEventSourceAggr  = new RequestEventSourceAggr();
        query.setRequestedResult(requestEventSourceAggr);
        const response = await er.execQuery(query) as Record<string, unknown>[];
        for (const event of Object.values(response)) {
            expect(event?.sourceExAggr).toBeTruthy();
        }
    });

    it("should test article trends", async () => {
        const requestEventArticleTrend  = new RequestEventArticleTrend();
        query.setRequestedResult(requestEventArticleTrend);
        const response = await er.execQuery(query) as Record<string, unknown>[];
        for (const event of Object.values(response)) {
            expect(event?.articleTrend).toBeTruthy();
        }
    });

    it("should test similar events", async () => {
        const q = await createQuery(1);
        const requestEventSimilarEvents  = new RequestEventSimilarEvents({
            conceptInfoList,
            addArticleTrendInfo: true,
            returnInfo: utils.returnInfo,
        });
        q.setRequestedResult(requestEventSimilarEvents);
        const response = await er.execQuery(q);
        expect(response).toBeValidGeneralEventList();
        expect(response).toHaveProperty("articleTrendInfo");
    });

    it("should test query event articles iterator", async () => {
        if (!eventUri) {
            pending("no recent event URI available");
            return;
        }
        const q = new QueryEventArticlesIter(er, eventUri, { maxItems: 10, articleBatchSize: 5 });
        let size = 0;
        await new Promise<void>((resolve, reject) => {
            q.execQuery((item) => {
                size += 1;
            }, async (err) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                try {
                    const q2 = new QueryEvent(eventUri);
                    const requestEventArticles = new RequestEventArticles({count: 10});
                    q2.setRequestedResult(requestEventArticles);
                    const response = await er.execQuery(q2);
                    const articles = (response[eventUri] as Record<string, ER.Results<ER.Article>>)?.articles?.results || [];
                    expect(articles.length).toEqual(size);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
});
