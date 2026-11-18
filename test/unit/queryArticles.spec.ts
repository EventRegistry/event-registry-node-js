import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryItems } from "../../src/base";
import { EventRegistry } from "../../src/eventRegistry";
import { BaseQuery, ComplexArticleQuery } from "../../src/query";
import {
    QueryArticle,
    RequestArticle,
    RequestArticleDuplicatedArticles,
    RequestArticleInfo,
    RequestArticleOriginalArticle,
    RequestArticleSimilarArticles,
} from "../../src/queryArticle";
import {
    QueryArticles,
    QueryArticlesIter,
    RequestArticles,
    RequestArticlesCategoryAggr,
    RequestArticlesConceptAggr,
    RequestArticlesConceptGraph,
    RequestArticlesConceptMatrix,
    RequestArticlesConceptTrends,
    RequestArticlesDateMentionAggr,
    RequestArticlesInfo,
    RequestArticlesKeywordAggr,
    RequestArticlesRecentActivity,
    RequestArticlesSourceAggr,
    RequestArticlesTimeAggr,
    RequestArticlesUriWgtList,
} from "../../src/queryArticles";

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
    const [, init] = fetchMock.mock.calls[n] as [string, RequestInit];
    return JSON.parse(String(init.body));
}

describe("QueryArticles parameters", () => {
    afterEach(() => vi.restoreAllMocks());

    it("maps filters, ignore filters, dates and non-default options", () => {
        const q = new QueryArticles({
            keywords: QueryItems.OR(["a", "b"]),
            conceptUri: ["c1", "c2"],
            categoryUri: "cat",
            sourceUri: "s",
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            locationUri: "loc",
            lang: ["eng", "deu"],
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            dateMentionStart: "2026-01-03",
            dateMentionEnd: "2026-01-04",
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
            keywordSearchMode: "exact",
            ignoreKeywordsLoc: "title",
            ignoreKeywordSearchMode: "simple",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 50,
            minSentiment: -0.5,
            maxSentiment: 0.5,
            dataType: ["news", "blog"],
        });
        expect(q.path).toBe("/api/v1/article");
        expect(q.getQueryParams()).toMatchObject({
            action: "getArticles",
            keyword: ["a", "b"],
            keywordOper: "or",
            conceptUri: ["c1", "c2"],
            conceptOper: "and",
            categoryUri: "cat",
            sourceUri: "s",
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            locationUri: "loc",
            lang: ["eng", "deu"],
            dateStart: "2026-01-01",
            dateEnd: "2026-01-02",
            dateMentionStart: "2026-01-03",
            dateMentionEnd: "2026-01-04",
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
            keywordSearchMode: "exact",
            ignoreKeywordLoc: "title",
            ignoreKeywordSearchMode: "simple",
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 50,
            minSentiment: -0.5,
            maxSentiment: 0.5,
            dataType: ["news", "blog"],
            resultType: "articles",
        });
    });

    it("sends only the action and default result with no arguments", () => {
        expect(new QueryArticles().getQueryParams()).toEqual({
            action: "getArticles",
            resultType: "articles",
            articlesPage: 1,
            articlesCount: 100,
            articlesSortBy: "date",
            articlesSortByAsc: false,
        });
    });

    it("validates percentiles and result requests", () => {
        expect(() => new QueryArticles({ startSourceRankPercentile: 5 })).toThrow(/StartSourceRankPercentile/);
        expect(() => new QueryArticles({ endSourceRankPercentile: 110 })).toThrow(/EndSourceRankPercentile/);
        expect(() => new QueryArticles({ startSourceRankPercentile: 60, endSourceRankPercentile: 40 })).toThrow(/less than/);
        expect(() => new QueryArticles().setRequestedResult({} as RequestArticles)).toThrow(/RequestArticles/);
    });

    it("warns on unknown arguments but not on iterator-only ones", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        new QueryArticles({ sortBy: "rel" } as ConstructorParameters<typeof QueryArticles>[0]);
        expect(warn).not.toHaveBeenCalled();
        new QueryArticles({ bogus: 1 } as ConstructorParameters<typeof QueryArticles>[0]);
        expect(warn).toHaveBeenCalled();
    });

    it("builds from uri lists and complex queries", () => {
        expect(QueryArticles.initWithArticleUriList(["a1", "a2"]).getQueryParams()).toMatchObject({ action: "getArticles", articleUri: ["a1", "a2"] });
        expect(QueryArticles.initWithArticleUriWgtList(["a1:5", "a2:3"]).getQueryParams()).toMatchObject({ articleUriWgtList: "a1:5,a2:3" });
        expect(() => QueryArticles.initWithArticleUriList("a1" as unknown as string[])).toThrow(/uriList/);
        expect(() => QueryArticles.initWithArticleUriWgtList("a1" as unknown as string[])).toThrow(/uriList/);

        const complex = new ComplexArticleQuery(new BaseQuery({ keyword: "k" }));
        expect(QueryArticles.initWithComplexQuery(complex).getQueryParams().query).toBe('{"$query":{"keyword":"k"}}');
        expect(QueryArticles.initWithComplexQuery({ $query: { lang: "eng" } }).getQueryParams().query).toBe('{"$query":{"lang":"eng"}}');
        expect(QueryArticles.initWithComplexQuery('{"$query":{}}').getQueryParams().query).toBe('{"$query":{}}');
        expect(() => QueryArticles.initWithComplexQuery(42)).toThrow(/ComplexArticleQuery/);
    });

    it("logs, but still sends, a complex query string that is not JSON", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
        expect(QueryArticles.initWithComplexQuery("not json").getQueryParams().query).toBe("not json");
        expect(error).toHaveBeenCalled();
    });
});

describe("RequestArticles result types", () => {
    afterEach(() => vi.restoreAllMocks());

    it("validates paging and sample sizes", () => {
        expect(() => new RequestArticlesInfo({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestArticlesInfo({ count: 201 })).toThrow(RangeError);
        expect(() => new RequestArticlesUriWgtList({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestArticlesUriWgtList({ count: 50001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptAggr({ conceptCount: 501 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptAggr({ articlesSampleSize: 20001 })).toThrow(RangeError);
        expect(() => new RequestArticlesCategoryAggr({ articlesSampleSize: 50001 })).toThrow(RangeError);
        expect(() => new RequestArticlesKeywordAggr({ articlesSampleSize: 20001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptGraph({ conceptCount: 1001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptGraph({ linkCount: 2001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptGraph({ articlesSampleSize: 50001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptMatrix({ conceptCount: 201 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptMatrix({ articlesSampleSize: 50001 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptTrends({ conceptCount: 51 })).toThrow(RangeError);
        expect(() => new RequestArticlesConceptTrends({ articlesSampleSize: 50001 })).toThrow(RangeError);
        expect(() => new RequestArticlesRecentActivity({ maxArticleCount: 2001 })).toThrow(RangeError);
    });

    it("sets the documented params for each aggregate", () => {
        const uriWgt = new RequestArticlesUriWgtList({ page: 2, count: 500, sortBy: "date", sortByAsc: true });
        expect(uriWgt.params).toEqual({ uriWgtListPage: 2, uriWgtListCount: 500, uriWgtListSortBy: "date", uriWgtListSortByAsc: true });
        uriWgt.setPage(3);
        expect(uriWgt.params.uriWgtListPage).toBe(3);
        expect(() => uriWgt.setPage(0)).toThrow(RangeError);

        expect(new RequestArticlesConceptAggr({ conceptCountPerType: 5 }).params).toMatchObject({
            conceptAggrConceptCount: 25,
            conceptAggrSampleSize: 10000,
            conceptAggrScoring: "importance",
            conceptAggrConceptCountPerType: 5,
        });
        expect(new RequestArticlesCategoryAggr().params).toMatchObject({ categoryAggrSampleSize: 20000 });
        expect(new RequestArticlesSourceAggr({ normalizeBySourceArts: true }).params).toMatchObject({
            sourceAggrSourceCount: 50,
            sourceAggrNormalizeBySourceArts: true,
        });
        expect(new RequestArticlesSourceAggr().params.sourceAggrNormalizeBySourceArts).toBeUndefined();
        expect(new RequestArticlesKeywordAggr().params).toEqual({ keywordAggrSampleSize: 2000 });
        expect(new RequestArticlesConceptGraph().params).toMatchObject({
            conceptGraphConceptCount: 25,
            conceptGraphLinkCount: 50,
            conceptGraphSampleSize: 10000,
            conceptGraphSkipQueryConcepts: true,
        });
        expect(new RequestArticlesConceptMatrix({ measure: "fShare" }).params).toMatchObject({
            conceptMatrixConceptCount: 25,
            conceptMatrixMeasure: "fShare",
            conceptMatrixSampleSize: 10000,
        });
        expect(new RequestArticlesConceptTrends({ conceptUris: ["c1"] }).params).toMatchObject({
            conceptTrendsConceptUri: ["c1"],
            conceptTrendsConceptCount: 25,
            conceptTrendsSampleSize: 10000,
        });
        expect(new RequestArticlesTimeAggr().resultType).toBe("timeAggr");
        expect(new RequestArticlesDateMentionAggr().resultType).toBe("dateMentionAggr");
    });

    it("RequestArticlesRecentActivity sends each source type under its own key", () => {
        const req = new RequestArticlesRecentActivity({
            maxArticleCount: 50,
            updatesAfterNewsUri: "n1",
            updatesafterBlogUri: "b1",
            updatesAfterPrUri: "p1",
            updatesAfterTm: "2026-01-01T10:00:00Z",
            updatesUntilMinsAgo: 5,
            mandatorySourceLocation: true,
        });
        expect(req.params).toMatchObject({
            recentActivityArticlesMaxArticleCount: 50,
            recentActivityArticlesNewsUpdatesAfterUri: "n1",
            recentActivityArticlesBlogUpdatesAfterUri: "b1",
            recentActivityArticlesPrUpdatesAfterUri: "p1",
            recentActivityArticlesUpdatesAfterTm: "2026-01-01T10:00:00",
            recentActivityArticlesUpdatesUntilMinsAgo: 5,
            recentActivityArticlesMandatorySourceLocation: true,
        });
        expect(new RequestArticlesRecentActivity({ updatesAfterBlogUri: "b2" }).params.recentActivityArticlesBlogUpdatesAfterUri).toBe("b2");
        expect(new RequestArticlesRecentActivity({ updatesafterBlogUri: "old", updatesAfterBlogUri: "new" }).params.recentActivityArticlesBlogUpdatesAfterUri).toBe("new");
        expect(new RequestArticlesRecentActivity({ updatesAfterMinsAgo: 10, updatesUntilTm: "2026-01-02T00:00:00Z" }).params).toMatchObject({
            recentActivityArticlesUpdatesAfterMinsAgo: 10,
            recentActivityArticlesUpdatesUntilTm: "2026-01-02T00:00:00",
        });
        expect(() => new RequestArticlesRecentActivity({ updatesAfterTm: "2026-01-01", updatesAfterMinsAgo: 5 })).toThrow(/not both/);
        expect(() => new RequestArticlesRecentActivity({ updatesUntilTm: "2026-01-01", updatesUntilMinsAgo: 5 })).toThrow(/not both/);
    });

    it("warns on unsupported arguments", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const bogus = { bogus: 1 } as unknown as Record<string, never>;
        new RequestArticlesInfo(bogus);
        new RequestArticlesUriWgtList(bogus);
        new RequestArticlesConceptAggr(bogus);
        new RequestArticlesCategoryAggr(bogus);
        new RequestArticlesSourceAggr(bogus);
        new RequestArticlesKeywordAggr(bogus);
        new RequestArticlesConceptGraph(bogus);
        new RequestArticlesConceptMatrix(bogus);
        new RequestArticlesConceptTrends(bogus);
        new RequestArticlesRecentActivity(bogus);
        expect(warn).toHaveBeenCalledTimes(10);
    });
});

describe("QueryArticlesIter", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("pages with the iterator sort and stops at maxItems", async () => {
        const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
            const page = JSON.parse(String(init.body)).articlesPage as number;
            return jsonResponse({ articles: { results: [{ uri: `a${page}1` }, { uri: `a${page}2` }], pages: 5 } });
        });
        const seen: string[] = [];
        for await (const a of new QueryArticlesIter(makeEr(fetchMock), { keywords: "k", sortBy: "rel", maxItems: 3 })) {
            seen.push(a.uri);
        }
        expect(seen).toEqual(["a11", "a12", "a21"]);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(body(fetchMock)).toMatchObject({ keyword: "k", resultType: "articles", articlesPage: 1, articlesSortBy: "rel" });
    });

    it("count() returns totalResults, or 0 on an error", async () => {
        expect(await new QueryArticlesIter(makeEr(vi.fn(async () => jsonResponse({ articles: { totalResults: 42 } })))).count()).toBe(42);
        const er = makeEr(vi.fn(async () => jsonResponse({ error: "bad" })));
        const logged = vi.spyOn(er.logger, "error").mockImplementation(() => undefined);
        expect(await new QueryArticlesIter(er).count()).toBe(0);
        expect(logged).toHaveBeenCalledWith("bad");
    });

    it("execQuery() streams items and calls done", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ articles: { results: [{ uri: "a1" }], pages: 1 } }));
        const items: string[] = [];
        const done = await new Promise<string | undefined>((resolve) => {
            new QueryArticlesIter(makeEr(fetchMock)).execQuery((a) => items.push(a.uri), resolve);
        });
        expect(items).toEqual(["a1"]);
        expect(done).toBeUndefined();
    });

    it("initWithComplexQuery accepts each query form", () => {
        const er = makeEr();
        const complex = new ComplexArticleQuery(new BaseQuery({ keyword: "k" }));
        expect(QueryArticlesIter.initWithComplexQuery(er, complex).getQueryParams().query).toBe('{"$query":{"keyword":"k"}}');
        expect(QueryArticlesIter.initWithComplexQuery(er, { a: 1 }).getQueryParams().query).toBe('{"a":1}');
        expect(QueryArticlesIter.initWithComplexQuery(er, '{"b":2}').getQueryParams().query).toBe('{"b":2}');
        expect(() => QueryArticlesIter.initWithComplexQuery(er, 1 as unknown as string)).toThrow(/ComplexArticleQuery/);
    });
});

describe("QueryArticle", () => {
    it("defaults to full article info", () => {
        const q = new QueryArticle(["a1", "a2"]);
        expect(q.path).toBe("/api/v1/article");
        expect(q.getQueryParams()).toMatchObject({ action: "getArticle", articleUri: ["a1", "a2"], resultType: "info", infoArticleBodyLen: -1 });
        expect(() => q.setRequestedResult({} as RequestArticle)).toThrow(/RequestArticle/);
    });

    it("builds similar, duplicated and original article requests", () => {
        expect(new RequestArticleSimilarArticles({ page: 2, count: 10, lang: ["deu"], limitPerLang: 3 }).params).toMatchObject({
            similarArticlesPage: 2,
            similarArticlesCount: 10,
            similarArticlesLang: ["deu"],
            similarArticlesLimitPerLang: 3,
        });
        expect(new RequestArticleDuplicatedArticles({ sortBy: "date", sortByAsc: true }).params).toMatchObject({
            duplicatedArticlesPage: 1,
            duplicatedArticlesCount: 20,
            duplicatedArticlesSortBy: "date",
            duplicatedArticlesSortByAsc: true,
        });
        expect(new RequestArticleOriginalArticle().resultType).toBe("originalArticle");
        expect(new RequestArticleInfo().resultType).toBe("info");
        for (const Req of [RequestArticleSimilarArticles, RequestArticleDuplicatedArticles]) {
            expect(() => new Req({ page: 0 })).toThrow(RangeError);
            expect(() => new Req({ count: 201 })).toThrow(RangeError);
        }
    });

    it("warns on unsupported arguments", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        new RequestArticleSimilarArticles({ bogus: 1 } as unknown as Record<string, never>);
        new RequestArticleDuplicatedArticles({ bogus: 1 } as unknown as Record<string, never>);
        expect(warn).toHaveBeenCalledTimes(2);
        warn.mockRestore();
    });
});
