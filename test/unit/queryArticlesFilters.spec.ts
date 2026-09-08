import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { searchArticles, iterateArticles } from "../../src/helpers/articles";
import { BaseQuery, ComplexArticleQuery } from "../../src/query";
import { QueryArticles, QueryArticlesIter } from "../../src/queryArticles";

const filterArgs = {
    authorsFilter: "keepOnlyIfHasAuthors",
    videosFilter: "keepOnlyIfHasVideos",
    linksFilter: "keepOnlyIfHasLinks",
} as const;

function expectHasFilters(params: Record<string, unknown>, values = filterArgs) {
    expect(params.hasAuthorsFilter).toBe(values.authorsFilter);
    expect(params.hasVideosFilter).toBe(values.videosFilter);
    expect(params.hasLinksFilter).toBe(values.linksFilter);
    expect(params.authorsFilter).toBeUndefined();
    expect(params.videosFilter).toBeUndefined();
    expect(params.linksFilter).toBeUndefined();
}

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

function jsonBody(fetchMock: ReturnType<typeof vi.fn>, call = 0): Record<string, unknown> {
    const [, init] = fetchMock.mock.calls[call] as [string, RequestInit];
    return JSON.parse(String(init.body));
}

describe("QueryArticles authors/videos/links filters", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("sends hasAuthorsFilter, hasVideosFilter, and hasLinksFilter to the API", () => {
        expectHasFilters(new QueryArticles(filterArgs).getQueryParams());
    });

    it("omits the has* filter params when left at keepAll", () => {
        const params = new QueryArticles().getQueryParams();
        expect(params.hasAuthorsFilter).toBeUndefined();
        expect(params.hasVideosFilter).toBeUndefined();
        expect(params.hasLinksFilter).toBeUndefined();
        expect(params.authorsFilter).toBeUndefined();
        expect(params.videosFilter).toBeUndefined();
        expect(params.linksFilter).toBeUndefined();
    });

    it("maps skipIf* values onto the has* API params", () => {
        expectHasFilters(
            new QueryArticles({
                authorsFilter: "skipIfHasAuthors",
                videosFilter: "skipIfHasVideos",
                linksFilter: "skipIfHasLinks",
            }).getQueryParams(),
            {
                authorsFilter: "skipIfHasAuthors",
                videosFilter: "skipIfHasVideos",
                linksFilter: "skipIfHasLinks",
            }
        );
    });

    it("keeps sibling duplicate/event filters under their constructor names", () => {
        const params = new QueryArticles({
            ...filterArgs,
            isDuplicateFilter: "skipDuplicates",
            hasDuplicateFilter: "skipHasDuplicates",
            eventFilter: "skipArticlesWithoutEvent",
        }).getQueryParams();
        expectHasFilters(params);
        expect(params.isDuplicateFilter).toBe("skipDuplicates");
        expect(params.hasDuplicateFilter).toBe("skipHasDuplicates");
        expect(params.eventFilter).toBe("skipArticlesWithoutEvent");
        expect(params.isDuplicate).toBeUndefined();
        expect(params.hasDuplicate).toBeUndefined();
        expect(params.hasEvent).toBeUndefined();
    });

    it("ignores hasAuthorsFilter as a constructor key (Python-style public name is authorsFilter)", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const params = new QueryArticles({
            hasAuthorsFilter: "keepOnlyIfHasAuthors",
        } as Record<string, unknown>).getQueryParams();
        expect(params.hasAuthorsFilter).toBeUndefined();
        expect(params.authorsFilter).toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("survives on QueryArticlesIter alongside iterator-only args", () => {
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const iter = new QueryArticlesIter(er, { ...filterArgs, keywords: "tesla", maxItems: 3, sortBy: "date" });
        const params = iter.getQueryParams();
        expectHasFilters(params);
        expect(params.keyword).toBe("tesla");
    });

    it("reaches the HTTP body via classic execQuery", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [], totalResults: 0 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        const er = makeEr(fetchMock);
        await er.execQuery(new QueryArticles({ ...filterArgs, keywords: "ivf" }));
        const body = jsonBody(fetchMock);
        expectHasFilters(body);
        expect(body.keyword).toBe("ivf");
        expect(body.action).toBe("getArticles");
    });

    it("reaches the HTTP body via searchArticles and fluent search", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [], totalResults: 0 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        const er = makeEr(fetchMock);
        await searchArticles(er, { ...filterArgs, keywords: "ivf", count: 10 });
        await er.articles.search({ ...filterArgs, keywords: "ivf" }).info({ count: 10 }).exec();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expectHasFilters(jsonBody(fetchMock, 0));
        expectHasFilters(jsonBody(fetchMock, 1));
        expect(jsonBody(fetchMock, 0).articlesCount).toBe(10);
        expect(jsonBody(fetchMock, 1).articlesCount).toBe(10);
    });

    it("reaches the HTTP body via iterateArticles", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [{ uri: "a1" }], pages: 1, totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        const er = makeEr(fetchMock);
        for await (const _ of iterateArticles(er, { ...filterArgs, keywords: "ivf", maxItems: 1 })) {
            /* drain */
        }
        expectHasFilters(jsonBody(fetchMock));
        expect(jsonBody(fetchMock).keyword).toBe("ivf");
    });

    it("does not put authors/videos/links filters on ComplexArticleQuery $filter (Python parity)", () => {
        const cq = new ComplexArticleQuery(new BaseQuery({ keyword: "ivf" }), {
            ...filterArgs,
            isDuplicateFilter: "skipDuplicates",
            hasDuplicateFilter: "skipHasDuplicates",
            eventFilter: "skipArticlesWithoutEvent",
        } as ConstructorParameters<typeof ComplexArticleQuery>[1]);
        const query = cq.getQuery() as { $filter?: Record<string, unknown> };
        expect(query.$filter).toMatchObject({
            isDuplicate: "skipDuplicates",
            hasDuplicate: "skipHasDuplicates",
            hasEvent: "skipArticlesWithoutEvent",
        });
        expect(query.$filter?.hasAuthorsFilter).toBeUndefined();
        expect(query.$filter?.hasVideosFilter).toBeUndefined();
        expect(query.$filter?.hasLinksFilter).toBeUndefined();
        expect(query.$filter?.authorsFilter).toBeUndefined();
    });
});

