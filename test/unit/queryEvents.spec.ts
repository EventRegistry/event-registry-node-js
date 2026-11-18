import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryItems } from "../../src/base";
import { EventRegistry } from "../../src/eventRegistry";
import { BaseQuery, ComplexEventQuery } from "../../src/query";
import {
    QueryEvents,
    QueryEventsIter,
    RequestEvents,
    RequestEventsBreakingEvents,
    RequestEventsCategoryAggr,
    RequestEventsConceptAggr,
    RequestEventsConceptGraph,
    RequestEventsConceptMatrix,
    RequestEventsConceptTrends,
    RequestEventsDateMentionAggr,
    RequestEventsEventClusters,
    RequestEventsInfo,
    RequestEventsKeywordAggr,
    RequestEventsLocAggr,
    RequestEventsLocTimeAggr,
    RequestEventsRecentActivity,
    RequestEventsSourceAggr,
    RequestEventsTimeAggr,
    RequestEventsUriWgtList,
} from "../../src/queryEvents";
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

function body(fetchMock: ReturnType<typeof vi.fn>, n = 0): Record<string, unknown> {
    const [, init] = fetchMock.mock.calls[n] as unknown as [string, RequestInit];
    return JSON.parse(String(init.body));
}

describe("QueryEvents parameters", () => {
    afterEach(() => vi.restoreAllMocks());

    it("maps filters, ignore filters, dates and non-default options", () => {
        const q = new QueryEvents({
            keywords: QueryItems.OR(["a", "b"]),
            conceptUri: ["c1"],
            categoryUri: "cat",
            sourceUri: "s",
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            locationUri: "loc",
            lang: "eng",
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            reportingDateStart: "2026-01-03",
            reportingDateEnd: "2026-01-04",
            dateMentionStart: "2026-01-05",
            dateMentionEnd: "2026-01-06",
            minSentiment: -0.5,
            maxSentiment: 0.5,
            minArticlesInEvent: 5,
            maxArticlesInEvent: 50,
            ignoreKeywords: "ik",
            ignoreConceptUri: "ic",
            ignoreCategoryUri: "icat",
            ignoreSourceUri: "is",
            ignoreSourceLocationUri: "isl",
            ignoreSourceGroupUri: "isg",
            ignoreAuthorUri: "ia",
            ignoreLocationUri: "il",
            ignoreLang: "slv",
            keywordsLoc: "title",
            ignoreKeywordsLoc: "title",
            keywordSearchMode: "exact",
            ignoreKeywordSearchMode: "simple",
            categoryIncludeSub: false,
            ignoreCategoryIncludeSub: false,
        });
        expect(q.path).toBe("/api/v1/event");
        expect(q.getQueryParams()).toMatchObject({
            action: "getEvents",
            keyword: ["a", "b"],
            keywordOper: "or",
            conceptUri: ["c1"],
            conceptOper: "and",
            categoryUri: "cat",
            sourceUri: "s",
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            locationUri: "loc",
            lang: "eng",
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            reportingDateStart: "2026-01-03",
            reportingDateEnd: "2026-01-04",
            dateMentionStart: "2026-01-05",
            dateMentionEnd: "2026-01-06",
            minSentiment: -0.5,
            maxSentiment: 0.5,
            minArticlesInEvent: 5,
            maxArticlesInEvent: 50,
            ignoreKeyword: "ik",
            ignoreConceptUri: "ic",
            ignoreCategoryUri: "icat",
            ignoreSourceUri: "is",
            ignoreSourceLocationUri: "isl",
            ignoreSourceGroupUri: "isg",
            ignoreAuthorUri: "ia",
            ignoreLocationUri: "il",
            ignoreLang: "slv",
            keywordLoc: "title",
            ignoreKeywordLoc: "title",
            keywordSearchMode: "exact",
            ignoreKeywordSearchMode: "simple",
            categoryIncludeSub: false,
            ignoreCategoryIncludeSub: false,
            resultType: "events",
        });
        expect(q.getQueryParams()).not.toHaveProperty("ignoreKeywords");
    });

    it("sends the source operators, so AND on sources works", () => {
        const params = new QueryEvents({
            sourceUri: QueryItems.AND(["s1", "s2"]),
            sourceGroupUri: QueryItems.AND(["g1", "g2"]),
        }).getQueryParams();
        expect(params).toMatchObject({ sourceUri: ["s1", "s2"], sourceOper: "and", sourceGroupUri: ["g1", "g2"], sourceGroupOper: "and" });
        expect(() => new QueryEvents({ ignoreSourceUri: QueryItems.AND(["s1", "s2"]) })).toThrow(/invalid operator/);
    });

    it("sends only the action and default result with no arguments", () => {
        expect(new QueryEvents().getQueryParams()).toEqual({
            action: "getEvents",
            resultType: "events",
            eventsPage: 1,
            eventsCount: 50,
            eventsSortBy: "rel",
            eventsSortByAsc: false,
        });
    });

    it("rejects a foreign result request", () => {
        expect(() => new QueryEvents().setRequestedResult({} as RequestEvents)).toThrow(/RequestEvents/);
    });

    it("builds from uri lists and complex queries", () => {
        expect(QueryEvents.initWithEventUriList(["e1", "e2"]).getQueryParams()).toMatchObject({ action: "getEvents", eventUriList: "e1,e2" });
        expect(QueryEvents.initWithEventUriWgtList(["e1:5", "e2:3"]).getQueryParams()).toMatchObject({ eventUriWgtList: "e1:5,e2:3" });
        expect(() => QueryEvents.initWithEventUriList("e1" as unknown as string[])).toThrow(/uriList/);
        expect(() => QueryEvents.initWithEventUriWgtList("e1" as unknown as string[])).toThrow(/uriWgtList/);

        const complex = new ComplexEventQuery(new BaseQuery({ keyword: "k" }));
        expect(QueryEvents.initWithComplexQuery(complex).getQueryParams().query).toBe('{"$query":{"keyword":"k"}}');
        expect(QueryEvents.initWithComplexQuery({ $query: { lang: "eng" } }).getQueryParams().query).toBe('{"$query":{"lang":"eng"}}');
        expect(QueryEvents.initWithComplexQuery('{"$query":{}}').getQueryParams().query).toBe('{"$query":{}}');
        expect(() => QueryEvents.initWithComplexQuery(42)).toThrow(/ComplexEventQuery/);
    });

    it("logs, but still sends, a complex query string that is not JSON", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        expect(QueryEvents.initWithComplexQuery("not json").getQueryParams().query).toBe("not json");
        expect(error).toHaveBeenCalled();
    });
});

describe("RequestEvents result types", () => {
    afterEach(() => vi.restoreAllMocks());

    it("validates paging and sample sizes", () => {
        expect(() => new RequestEventsInfo({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestEventsInfo({ count: 51 })).toThrow(RangeError);
        expect(() => new RequestEventsUriWgtList({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestEventsUriWgtList({ count: 100001 })).toThrow(RangeError);
        expect(() => new RequestEventsLocAggr({ eventsSampleSize: 100001 })).toThrow(RangeError);
        expect(() => new RequestEventsLocTimeAggr({ eventsSampleSize: 100001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptAggr({ conceptCount: 201 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptAggr({ eventsSampleSize: 300001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptGraph({ conceptCount: 1001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptGraph({ linkCount: 2001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptGraph({ eventsSampleSize: 300001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptMatrix({ conceptCount: 201 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptMatrix({ eventsSampleSize: 300001 })).toThrow(RangeError);
        expect(() => new RequestEventsConceptTrends({ conceptCount: 51 })).toThrow(RangeError);
        expect(() => new RequestEventsSourceAggr({ sourceCount: 201 })).toThrow(RangeError);
        expect(() => new RequestEventsSourceAggr({ eventsSampleSize: 100001 })).toThrow(RangeError);
        expect(() => new RequestEventsDateMentionAggr({ eventsSampleSize: 300001 })).toThrow(RangeError);
        expect(() => new RequestEventsEventClusters({ keywordCount: 101 })).toThrow(RangeError);
        expect(() => new RequestEventsEventClusters({ maxEventsToCluster: 10001 })).toThrow(RangeError);
        expect(() => new RequestEventsRecentActivity({ maxEventCount: 2001 })).toThrow(RangeError);
        expect(() => new RequestEventsRecentActivity({ updatesAfterTm: "2026-01-01T00:00:00Z", updatesAfterMinsAgo: 5 })).toThrow(/not both/);
        expect(() => new RequestEventsBreakingEvents({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestEventsBreakingEvents({ count: 51 })).toThrow(RangeError);
    });

    it("sets the documented params for each request", () => {
        expect(new RequestEventsInfo({ page: 2, count: 10, sortBy: "date", sortByAsc: true }).params).toEqual({
            eventsPage: 2,
            eventsCount: 10,
            eventsSortBy: "date",
            eventsSortByAsc: true,
        });
        const uriWgt = new RequestEventsUriWgtList({ page: 2, count: 500, sortBy: "date", sortByAsc: true });
        expect(uriWgt.params).toEqual({ uriWgtListPage: 2, uriWgtListCount: 500, uriWgtListSortBy: "date", uriWgtListSortByAsc: true });
        uriWgt.page = 3;
        expect(uriWgt.params.uriWgtListPage).toBe(3);
        expect(() => { uriWgt.page = 0; }).toThrow(RangeError);

        expect(new RequestEventsTimeAggr().resultType).toBe("timeAggr");
        expect(new RequestEventsKeywordAggr().params).toEqual({});
        expect(new RequestEventsKeywordAggr("eng").params).toEqual({ keywordAggrLang: "eng" });
        expect(new RequestEventsLocAggr({ eventsSampleSize: 10 }).params).toMatchObject({ locAggrSampleSize: 10 });
        expect(new RequestEventsLocTimeAggr({ eventsSampleSize: 10 }).params).toMatchObject({ locTimeAggrSampleSize: 10 });
        expect(new RequestEventsConceptAggr({ conceptCount: 5, eventsSampleSize: 10 }).params).toMatchObject({
            conceptAggrConceptCount: 5,
            conceptAggrSampleSize: 10,
        });
        expect(new RequestEventsConceptGraph({ conceptCount: 5, linkCount: 6, eventsSampleSize: 10 }).params).toMatchObject({
            conceptGraphConceptCount: 5,
            conceptGraphLinkCount: 6,
            conceptGraphSampleSize: 10,
        });
        expect(new RequestEventsConceptMatrix({ conceptCount: 5, measure: "chiSquare", eventsSampleSize: 10 }).params).toMatchObject({
            conceptMatrixConceptCount: 5,
            conceptMatrixMeasure: "chiSquare",
            conceptMatrixSampleSize: 10,
        });
        expect(new RequestEventsConceptTrends().params).not.toHaveProperty("conceptTrendsConceptUri");
        expect(new RequestEventsConceptTrends({ conceptCount: 5, conceptUris: ["c1"] }).params).toMatchObject({
            conceptTrendsConceptCount: 5,
            conceptTrendsConceptUri: ["c1"],
        });
        expect(new RequestEventsSourceAggr({ sourceCount: 5, eventsSampleSize: 10 }).params).toMatchObject({
            sourceAggrSourceCount: 5,
            sourceAggrSampleSize: 10,
        });
        expect(new RequestEventsDateMentionAggr({ minDaysApart: 1, minDateMentionCount: 2, eventsSampleSize: 10 }).params).toMatchObject({
            dateMentionAggrMinDaysApart: 1,
            dateMentionAggrMinDateMentionCount: 2,
            dateMentionAggrSampleSize: 10,
        });
        expect(new RequestEventsEventClusters({ keywordCount: 5, maxEventsToCluster: 10 }).params).toMatchObject({
            eventClustersKeywordCount: 5,
            eventClustersMaxEventsToCluster: 10,
        });
        expect(new RequestEventsCategoryAggr(new ReturnInfo()).resultType).toBe("categoryAggr");
        expect(new RequestEventsBreakingEvents({ page: 2, count: 10, minBreakingScore: 0.5, returnInfo: new ReturnInfo() }).params).toMatchObject({
            breakingEventsPage: 2,
            breakingEventsCount: 10,
            breakingEventsMinBreakingScore: 0.5,
        });
    });

    it("sets recent activity params for each time option", () => {
        expect(new RequestEventsRecentActivity().params).toEqual({
            recentActivityEventsMaxEventCount: 50,
            recentActivityEventsMandatoryLocation: true,
            recentActivityEventsMinAvgCosSim: 0,
        });
        expect(new RequestEventsRecentActivity({ updatesAfterTm: "2026-01-01T10:00:00Z", returnInfo: new ReturnInfo() }).params).toMatchObject({
            recentActivityEventsUpdatesAfterTm: "2026-01-01T10:00:00",
        });
        expect(new RequestEventsRecentActivity({ updatesAfterMinsAgo: 5, mandatoryLocation: false, minAvgCosSim: 0.3 }).params).toMatchObject({
            recentActivityEventsUpdatesAfterMinsAgo: 5,
            recentActivityEventsMandatoryLocation: false,
            recentActivityEventsMinAvgCosSim: 0.3,
        });
    });

    it("warns on unknown arguments", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const bogus = { bogus: 1 } as unknown as Record<string, never>;
        new RequestEventsUriWgtList(bogus);
        new RequestEventsLocAggr(bogus);
        new RequestEventsLocTimeAggr(bogus);
        expect(warn).toHaveBeenCalledTimes(3);
    });
});

describe("QueryEventsIter", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("pages with the iterator sort and stops at maxItems", async () => {
        const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
            const page = JSON.parse(String(init.body)).eventsPage as number;
            return jsonResponse({ events: { results: [{ uri: `e${page}1` }, { uri: `e${page}2` }], pages: 5 } });
        });
        const seen: string[] = [];
        for await (const e of new QueryEventsIter(makeEr(fetchMock), { keywords: "k", sortBy: "date", maxItems: 3 })) {
            seen.push(e.uri);
        }
        expect(seen).toEqual(["e11", "e12", "e21"]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(body(fetchMock)).toMatchObject({ keyword: "k", resultType: "events", eventsPage: 1, eventsSortBy: "date" });
    });

    it("count() returns totalResults, or 0 on an error", async () => {
        expect(await new QueryEventsIter(makeEr(vi.fn(async () => jsonResponse({ events: { totalResults: 42 } })))).count()).toBe(42);
        const er = makeEr(vi.fn(async () => jsonResponse({ error: "bad" })));
        const logged = vi.spyOn(er.logger, "error").mockImplementation(() => undefined);
        expect(await new QueryEventsIter(er).count()).toBe(0);
        expect(logged).toHaveBeenCalledWith("bad");
    });

    it("execQuery() streams items and calls done", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ events: { results: [{ uri: "e1" }], pages: 1 } }));
        const items: string[] = [];
        const done = await new Promise<string | undefined>((resolve) => {
            new QueryEventsIter(makeEr(fetchMock)).execQuery((e) => items.push(e.uri), resolve);
        });
        expect(items).toEqual(["e1"]);
        expect(done).toBeUndefined();
    });

    it("initWithComplexQuery accepts each query form", () => {
        const er = makeEr();
        const complex = new ComplexEventQuery(new BaseQuery({ keyword: "k" }));
        expect(QueryEventsIter.initWithComplexQuery(er, complex).getQueryParams().query).toBe('{"$query":{"keyword":"k"}}');
        expect(QueryEventsIter.initWithComplexQuery(er, { a: 1 }).getQueryParams().query).toBe('{"a":1}');
        expect(QueryEventsIter.initWithComplexQuery(er, '{"b":2}').getQueryParams().query).toBe('{"b":2}');
        expect(() => QueryEventsIter.initWithComplexQuery(er, 1 as unknown as string)).toThrow(/ComplexEventQuery/);
    });
});
