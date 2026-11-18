import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryItems } from "../../src/base";
import { EventRegistry } from "../../src/eventRegistry";
import {
    QueryMentions,
    QueryMentionsIter,
    RequestMentions,
    RequestMentionsCategoryAggr,
    RequestMentionsConceptAggr,
    RequestMentionsConceptGraph,
    RequestMentionsInfo,
    RequestMentionsKeywordAggr,
    RequestMentionsRecentActivity,
    RequestMentionsSourceAggr,
    RequestMentionsTimeAggr,
    RequestMentionsUriWgtList,
} from "../../src/queryMentions";
import { ReturnInfo } from "../../src/returnInfo";

function makeEr(fetchMock: ReturnType<typeof vi.fn>) {
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

function jsonBody(fetchMock: ReturnType<typeof vi.fn>, call = 0): Record<string, unknown> {
    const [, init] = fetchMock.mock.calls[call] as [string, RequestInit];
    return JSON.parse(String(init.body));
}

describe("QueryMentions parameters", () => {
    afterEach(() => vi.restoreAllMocks());

    it("sends only the action and the default mention list when no filters or result type are given", () => {
        const params = new QueryMentions().getQueryParams();
        expect(params).toEqual({
            action: "getMentions",
            resultType: "mentions",
            mentionsPage: 1,
            mentionsCount: 100,
            mentionsSortBy: "date",
            mentionsSortByAsc: false,
        });
        expect(params.startSourceRankPercentile).toBeUndefined();
        expect(params.endSourceRankPercentile).toBeUndefined();
        expect(params.minSentiment).toBeUndefined();
        expect(params.maxSentiment).toBeUndefined();
        expect(params.showDuplicates).toBeUndefined();
    });

    it("maps filters, ignore filters, dates and ranges onto API names", () => {
        const params = new QueryMentions({
            eventTypeUri: "et/layoffs",
            keywords: QueryItems.OR(["a", "b"]),
            conceptUri: ["c1", "c2"],
            categoryUri: "cat",
            industryUri: QueryItems.AND(["i1", "i2"]),
            lang: "eng",
            dateStart: "2026-01-02",
            dateEnd: new Date("2026-01-05T10:00:00Z"),
            ignoreKeywords: "spam",
            ignoreLang: "deu",
            showDuplicates: true,
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 90,
            minSentiment: -0.5,
            maxSentiment: 0.5,
            minSentenceIndex: 1,
            maxSentenceIndex: 4,
        }).getQueryParams();
        expect(params).toMatchObject({
            eventTypeUri: "et/layoffs",
            keyword: ["a", "b"],
            keywordOper: "or",
            conceptUri: ["c1", "c2"],
            conceptOper: "and",
            categoryUri: "cat",
            industryUri: ["i1", "i2"],
            industryOper: "and",
            lang: "eng",
            dateStart: "2026-01-02",
            dateEnd: "2026-01-05",
            ignoreKeyword: "spam",
            ignoreLang: "deu",
            showDuplicates: true,
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 90,
            minSentiment: -0.5,
            maxSentiment: 0.5,
            minSentenceIndex: 1,
            maxSentenceIndex: 4,
        });
        expect(params).not.toHaveProperty("ignoreKeywords");
    });

    it("sends the source operators, so AND on sources works", () => {
        expect(new QueryMentions({
            sourceUri: QueryItems.AND(["s1", "s2"]),
            sourceGroupUri: QueryItems.AND(["g1", "g2"]),
        }).getQueryParams()).toMatchObject({ sourceOper: "and", sourceGroupOper: "and" });
    });

    it("rejects an AND operator on a field that only supports OR", () => {
        expect(() => new QueryMentions({ sourceLocationUri: QueryItems.AND(["s1", "s2"]) })).toThrow(/invalid operator/);
    });

    it("validates source rank percentiles", () => {
        expect(() => new QueryMentions({ startSourceRankPercentile: 15 })).toThrow(/StartSourceRankPercentile/);
        expect(() => new QueryMentions({ endSourceRankPercentile: 110 })).toThrow(/EndSourceRankPercentile/);
        expect(() => new QueryMentions({ startSourceRankPercentile: 50, endSourceRankPercentile: 20 })).toThrow(/should be less than/);
    });

    it("refuses a result request of the wrong type", () => {
        expect(() => new QueryMentions().setRequestedResult({} as RequestMentions)).toThrow(/RequestMentions/);
    });

    it("uses the mentions endpoint", () => {
        expect(new QueryMentions().path).toBe("/api/v1/eventType/mention");
    });

    it("builds queries from mention uri lists and complex queries", () => {
        expect(QueryMentions.initWithMentionUriList(["m1", "m2"]).getQueryParams()).toMatchObject({
            action: "getMentions",
            mentionUri: ["m1", "m2"],
        });
        expect(QueryMentions.initWithMentionUriWgtList(["m1:3", "m2:1"]).getQueryParams().mentionUriWgtList).toBe("m1:3,m2:1");
        expect(() => QueryMentions.initWithMentionUriList("m1" as unknown as string[])).toThrow(/uriList/);
        expect(() => QueryMentions.initWithMentionUriWgtList("m1" as unknown as string[])).toThrow(/uriList/);

        const complex = { $query: { keyword: "x" } };
        expect(QueryMentions.initWithComplexQuery(complex).getQueryParams().query).toBe(JSON.stringify(complex));
        expect(QueryMentions.initWithComplexQuery('{"$query":{}}').getQueryParams().query).toBe('{"$query":{}}');
        expect(() => QueryMentions.initWithComplexQuery(42)).toThrow(/not a string or an object/);
    });
});

describe("RequestMentions result types", () => {
    afterEach(() => vi.restoreAllMocks());

    it("RequestMentionsInfo validates paging and merges return info", () => {
        expect(() => new RequestMentionsInfo({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestMentionsInfo({ count: 101 })).toThrow(RangeError);
        const info = new RequestMentionsInfo({ page: 2, count: 10, sortBy: "rel", sortByAsc: true, returnInfo: new ReturnInfo() });
        expect(info.params).toMatchObject({ mentionsPage: 2, mentionsCount: 10, mentionsSortBy: "rel", mentionsSortByAsc: true });
        info.page = 3;
        expect(info.params.mentionsPage).toBe(3);
        expect(() => { info.page = 0; }).toThrow(RangeError);
    });

    it("RequestMentionsUriWgtList validates and warns on unsupported args", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        expect(() => new RequestMentionsUriWgtList({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestMentionsUriWgtList({ count: 50001 })).toThrow(RangeError);
        const req = new RequestMentionsUriWgtList({ bogus: 1 } as Record<string, unknown>);
        expect(warn).toHaveBeenCalled();
        expect(req.params).toEqual({ uriWgtListPage: 1, uriWgtListCount: 10000, uriWgtListSortBy: "fq", uriWgtListSortByAsc: false });
        req.page = 4;
        expect(req.params.uriWgtListPage).toBe(4);
        expect(() => { req.page = 0; }).toThrow(RangeError);
    });

    it("RequestMentionsConceptAggr works with its defaults", () => {
        const req = new RequestMentionsConceptAggr();
        expect(req.params).toMatchObject({
            conceptAggrConceptCount: 25,
            conceptAggrSampleSize: 20000,
            conceptAggrScoring: "importance",
        });
        expect(req.params.conceptAggrConceptCountPerType).toBeUndefined();
        expect(new RequestMentionsConceptAggr({ conceptCountPerType: 5 }).params.conceptAggrConceptCountPerType).toBe(5);
        expect(() => new RequestMentionsConceptAggr({ conceptCount: 501 })).toThrow(RangeError);
        expect(() => new RequestMentionsConceptAggr({ mentionsSampleSize: 20001 })).toThrow(RangeError);
    });

    it("aggregate requests set their sample sizes and limits", () => {
        expect(new RequestMentionsTimeAggr().resultType).toBe("timeAggr");
        expect(new RequestMentionsCategoryAggr().params.categoryAggrSampleSize).toBe(20000);
        expect(() => new RequestMentionsCategoryAggr({ mentionsSampleSize: 50001 })).toThrow(RangeError);
        expect(new RequestMentionsSourceAggr({ sourceCount: 5, normalizeBySourceArts: true }).params).toMatchObject({
            sourceAggrSourceCount: 5,
            sourceAggrNormalizeBySourceArts: true,
        });
        expect(new RequestMentionsKeywordAggr().params.keywordAggrSampleSize).toBe(2000);
        expect(() => new RequestMentionsKeywordAggr({ mentionsSampleSize: 20001 })).toThrow(RangeError);
    });

    it("RequestMentionsConceptGraph validates its limits", () => {
        expect(new RequestMentionsConceptGraph().params).toMatchObject({
            conceptGraphConceptCount: 25,
            conceptGraphLinkCount: 50,
            conceptGraphSampleSize: 10000,
            conceptGraphSkipQueryConcepts: true,
        });
        expect(() => new RequestMentionsConceptGraph({ conceptCount: 1001 })).toThrow(RangeError);
        expect(() => new RequestMentionsConceptGraph({ linkCount: 2001 })).toThrow(RangeError);
        expect(() => new RequestMentionsConceptGraph({ mentionsSampleSize: 50001 })).toThrow(RangeError);
    });

    it("RequestMentionsRecentActivity encodes times and rejects conflicting windows", () => {
        expect(() => new RequestMentionsRecentActivity({ maxMentionCount: 2001 })).toThrow(RangeError);
        expect(() => new RequestMentionsRecentActivity({ updatesAfterTm: "2026-01-01", updatesAfterMinsAgo: 5 })).toThrow(/updatesAfterTm/);
        expect(() => new RequestMentionsRecentActivity({ updatesUntilTm: "2026-01-01", updatesUntilMinsAgo: 5 })).toThrow(/updatesUntilTm/);
        const req = new RequestMentionsRecentActivity({
            updatesAfterTm: "2026-01-01T00:00:00Z",
            updatesUntilMinsAgo: 3,
            updatesAfterUri: "m9",
            mandatorySourceLocation: true,
            returnInfo: new ReturnInfo(),
        });
        expect(req.params).toMatchObject({
            recentActivityMentionsMaxMentionCount: 100,
            recentActivityMentionsUpdatesAfterTm: "2026-01-01T00:00:00",
            recentActivityMentionsUpdatesUntilMinsAgo: 3,
            recentActivityMentionsUpdatesAfterUri: "m9",
            recentActivityMentionsMandatorySourceLocation: true,
        });
        const other = new RequestMentionsRecentActivity({ updatesAfterMinsAgo: 7, updatesUntilTm: "2026-01-02T00:00:00Z" });
        expect(other.params.recentActivityMentionsUpdatesAfterMinsAgo).toBe(7);
        expect(other.params.recentActivityMentionsUpdatesUntilTm).toBe("2026-01-02T00:00:00");
    });
});

describe("QueryMentionsIter", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("pages through results and stops at maxItems", async () => {
        const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
            const page = JSON.parse(String(init.body)).mentionsPage as number;
            return jsonResponse({ mentions: { results: [{ uri: `m${page}a` }, { uri: `m${page}b` }], pages: 3, totalResults: 6 } });
        });
        const er = makeEr(fetchMock);
        const seen: unknown[] = [];
        for await (const m of new QueryMentionsIter(er, { keywords: "x", maxItems: 3, sortBy: "date" })) {
            seen.push(m.uri);
        }
        expect(seen).toEqual(["m1a", "m1b", "m2a"]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(jsonBody(fetchMock, 0)).toMatchObject({ keyword: "x", mentionsPage: 1, mentionsCount: 50, mentionsSortBy: "date" });
        expect(jsonBody(fetchMock, 1).mentionsPage).toBe(2);
    });

    it("count() returns totalResults", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ mentions: { results: [], totalResults: 42 } }));
        expect(await new QueryMentionsIter(makeEr(fetchMock)).count()).toBe(42);
    });

    it("execQuery() streams items to the callback and reports errors to doneCallback", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ error: "boom" }));
        const items: unknown[] = [];
        const done = await new Promise<string | undefined>((resolve) => {
            new QueryMentionsIter(makeEr(fetchMock)).execQuery((item) => items.push(item), resolve);
        });
        expect(items).toEqual([]);
        expect(done).toMatch(/boom/);
    });

    it("initWithComplexQuery sets the query and validates its input", () => {
        const er = makeEr(vi.fn());
        const q = QueryMentionsIter.initWithComplexQuery(er, { $query: { keyword: "x" } });
        q.setRequestedResult(new RequestMentionsInfo());
        expect(q.getQueryParams().query).toBe('{"$query":{"keyword":"x"}}');
        expect(QueryMentionsIter.initWithComplexQuery(er, "{}").getQueryParams().query).toBe("{}");
        expect(() => QueryMentionsIter.initWithComplexQuery(er, 1 as unknown as string)).toThrow(/not a string/);
    });
});
