import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import {
    QueryEvent,
    QueryEventArticlesIter,
    RequestEvent,
    RequestEventArticles,
    RequestEventArticleTrend,
    RequestEventArticleUriWgts,
    RequestEventDateMentionAggr,
    RequestEventInfo,
    RequestEventKeywordAggr,
    RequestEventSimilarEvents,
    RequestEventSourceAggr,
} from "../../src/queryEvent";
import { ReturnInfo } from "../../src/returnInfo";

function makeEr(fetchMock: ReturnType<typeof vi.fn> = vi.fn()) {
    vi.stubGlobal("fetch", fetchMock);
    return new EventRegistry({
        logging: false,
        minDelayBetweenRequests: 0,
        repeatFailedRequestCount: 0,
        apiKey: "k",
        settingsFName: "no-settings.json",
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function call(fetchMock: ReturnType<typeof vi.fn>, n = 0): { url: string; body: Record<string, unknown> } {
    const [url, init] = fetchMock.mock.calls[n] as [string, RequestInit];
    return { url, body: JSON.parse(String(init.body)) };
}

describe("QueryEvent", () => {
    afterEach(() => vi.restoreAllMocks());

    it("defaults to event info on the getEvent path", () => {
        const q = new QueryEvent(["e1", "e2"]);
        expect(q.path).toBe("/api/v1/event/getEvent");
        expect(q.getQueryParams()).toMatchObject({ eventUri: ["e1", "e2"], resultType: "info" });
    });

    it("switches path for similar events and refuses foreign result requests", () => {
        const q = new QueryEvent("e1");
        q.setRequestedResult(new RequestEventSimilarEvents({ conceptInfoList: [{ uri: "c", wgt: 1 }] }));
        expect(q.path).toBe("/api/v1/event/getSimilarEvents");
        expect(() => q.setRequestedResult({} as RequestEvent)).toThrow(/RequestEvent/);
    });
});

describe("RequestEvent result types", () => {
    afterEach(() => vi.restoreAllMocks());

    it("RequestEventArticles maps filters and validates paging and percentiles", () => {
        const req = new RequestEventArticles({
            page: 2,
            count: 50,
            lang: ["eng", "deu"],
            keywords: "k",
            conceptUri: ["c1", "c2"],
            sourceUri: "s",
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            dateMentionStart: "2026-01-03",
            dateMentionEnd: "2026-01-04",
            keywordsLoc: "title",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 90,
            sortBy: "date",
            sortByAsc: true,
            returnInfo: new ReturnInfo(),
        });
        expect(req.params).toMatchObject({
            articlesPage: 2,
            articlesCount: 50,
            articlesSortBy: "date",
            articlesSortByAsc: true,
            articlesLang: ["eng", "deu"],
            keyword: "k",
            conceptUri: ["c1", "c2"],
            conceptOper: "and",
            sourceUri: "s",
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            dateMentionStart: "2026-01-03",
            dateMentionEnd: "2026-01-04",
            keywordLoc: "title",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 90,
        });
        expect(() => new RequestEventArticles({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestEventArticles({ count: 101 })).toThrow(RangeError);
        expect(() => new RequestEventArticles({ startSourceRankPercentile: 5 })).toThrow(/StartSourceRankPercentile/);
        expect(() => new RequestEventArticles({ endSourceRankPercentile: 105 })).toThrow(/EndSourceRankPercentile/);
        expect(() => new RequestEventArticles({ startSourceRankPercentile: 60, endSourceRankPercentile: 30 })).toThrow(/less than/);
    });

    it("RequestEventArticleUriWgts sets language and sort, warns on unsupported args", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(new RequestEventArticleUriWgts({ lang: "eng", sortBy: "date" }).params).toEqual({
            articlesLang: "eng",
            uriWgtListSortBy: "date",
            uriWgtListSortByAsc: false,
        });
        expect(new RequestEventArticleUriWgts().params.articlesLang).toBeUndefined();
        new RequestEventArticleUriWgts({ bogus: 1 } as Record<string, unknown>);
        expect(warn).toHaveBeenCalled();
    });

    it("simple aggregate requests carry their result types", () => {
        expect(new RequestEventInfo().resultType).toBe("info");
        expect(new RequestEventKeywordAggr("deu").params).toEqual({ articlesLang: "deu" });
        expect(new RequestEventSourceAggr().resultType).toBe("sourceExAggr");
        expect(new RequestEventDateMentionAggr().resultType).toBe("dateMentionAggr");
    });

    it("RequestEventArticleTrend validates paging", () => {
        expect(new RequestEventArticleTrend({ lang: "eng", page: 2, count: 10, minArticleCosSim: 0.5 }).params).toMatchObject({
            articlesLang: "eng",
            articleTrendPage: 2,
            articleTrendCount: 10,
            articleTrendMinArticleCosSim: 0.5,
        });
        expect(() => new RequestEventArticleTrend({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestEventArticleTrend({ count: 101 })).toThrow(RangeError);
    });

    it("RequestEventSimilarEvents encodes concepts and dates and validates input", () => {
        const concepts = [{ uri: "c", wgt: 10 }];
        const req = new RequestEventSimilarEvents({
            conceptInfoList: concepts,
            count: 20,
            dateStart: "2026-02-01",
            dateEnd: "2026-02-03T12:00:00Z",
            addArticleTrendInfo: true,
            aggrHours: 12,
        });
        expect(req.params).toMatchObject({
            action: "getSimilarEvents",
            concepts: JSON.stringify(concepts),
            eventsCount: 20,
            dateStart: "2026-02-01",
            dateEnd: "2026-02-03",
            addArticleTrendInfo: true,
            aggrHours: 12,
            resultType: "similarEvents",
        });
        expect(() => new RequestEventSimilarEvents({ conceptInfoList: concepts, count: 51 })).toThrow(RangeError);
        expect(() => new RequestEventSimilarEvents({})).toThrow(/not an array/);
    });
});

describe("QueryEventArticlesIter", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("maps iterator filters and validates percentiles", () => {
        const er = makeEr();
        const it = new QueryEventArticlesIter(er, "e1", {
            keywords: "k",
            lang: "eng",
            dateMentionStart: "2026-01-01",
            dateMentionEnd: "2026-01-02",
            keywordsLoc: "title",
            keywordSearchMode: "exact",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 80,
            minSentiment: -0.2,
            maxSentiment: 0.4,
        });
        expect(it.getQueryParams()).toMatchObject({
            eventUri: "e1",
            keyword: "k",
            lang: "eng",
            dateMentionStart: "2026-01-01",
            dateMentionEnd: "2026-01-02",
            keywordLoc: "title",
            keywordSearchMode: "exact",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 80,
            minSentiment: -0.2,
            maxSentiment: 0.4,
        });
        expect(() => new QueryEventArticlesIter(er, "e1", { startSourceRankPercentile: 5 })).toThrow(/StartSourceRankPercentile/);
        expect(() => new QueryEventArticlesIter(er, "e1", { endSourceRankPercentile: 5 })).toThrow(/EndSourceRankPercentile/);
        expect(() => new QueryEventArticlesIter(er, "e1", { startSourceRankPercentile: 50, endSourceRankPercentile: 40 })).toThrow(/less than/);
    });

    it("pages through the event's articles and stops at maxItems", async () => {
        const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
            const page = JSON.parse(String(init.body)).articlesPage as number;
            return jsonResponse({ e1: { articles: { results: [{ uri: `a${page}1` }, { uri: `a${page}2` }], pages: 3 } } });
        });
        const er = makeEr(fetchMock);
        const seen: string[] = [];
        for await (const a of new QueryEventArticlesIter(er, "e1", { maxItems: 3, sortBy: "date", dateStart: "2026-01-01" })) {
            seen.push(a.uri);
        }
        expect(seen).toEqual(["a11", "a12", "a21"]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(call(fetchMock, 0).body).toMatchObject({
            eventUri: "e1",
            resultType: "articles",
            articlesPage: 1,
            articlesSortBy: "date",
            dateStart: "2026-01-01",
        });
        expect(call(fetchMock, 1).body.articlesPage).toBe(2);
    });

    it("count() reads totalResults under the event uri", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ e1: { articles: { results: [], totalResults: 17 } } }));
        expect(await new QueryEventArticlesIter(makeEr(fetchMock), "e1").count()).toBe(17);
    });

    it("execQuery() streams items, then reports a per-event error", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({ e1: { articles: { results: [{ uri: "a1" }], pages: 2 } } }))
            .mockResolvedValueOnce(jsonResponse({ e1: { error: "gone" } }));
        const items: string[] = [];
        const done = await new Promise<string | undefined>((resolve) => {
            new QueryEventArticlesIter(makeEr(fetchMock), "e1").execQuery((a) => items.push(a.uri), resolve);
        });
        expect(items).toEqual(["a1"]);
        expect(done).toMatch(/gone/);
    });
});
