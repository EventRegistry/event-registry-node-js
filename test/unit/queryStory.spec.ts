import { afterEach, describe, expect, it, vi } from "vitest";
import { mainLangs } from "../../src/base";
import {
    QueryStory,
    RequestStory,
    RequestStoryArticles,
    RequestStoryArticleTrend,
    RequestStoryArticleUris,
    RequestStoryInfo,
    RequestStorySimilarStories,
} from "../../src/queryStory";

describe("QueryStory", () => {
    afterEach(() => vi.restoreAllMocks());

    it("targets the story endpoint with the given uris", () => {
        const q = new QueryStory(["s1", "s2"]);
        q.setRequestedResult(new RequestStoryInfo());
        expect(q.path).toBe("/api/v1/story");
        expect(q.getQueryParams()).toMatchObject({ action: "getStory", storyUri: ["s1", "s2"], resultType: "info" });
        q.queryByUri("s3");
        expect(q.getQueryParams().storyUri).toBe("s3");
    });

    it("refuses foreign result requests", () => {
        expect(() => new QueryStory("s1").setRequestedResult({} as RequestStory)).toThrow(/RequestStory/);
    });

    it("RequestStoryArticles sets paging and validates it", () => {
        expect(new RequestStoryArticles({ page: 2, count: 10, sortBy: "date", sortByAsc: true }).params).toMatchObject({
            articlesPage: 2,
            articlesCount: 10,
            articlesSortBy: "date",
            articlesSortByAsc: true,
            articlesArticleBodyLen: 200,
        });
        expect(() => new RequestStoryArticles({ page: 0 })).toThrow(RangeError);
        expect(() => new RequestStoryArticles({ count: 101 })).toThrow(RangeError);
    });

    it("warns on unsupported arguments", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        new RequestStoryArticles({ bogus: 1 } as Record<string, unknown>);
        new RequestStoryArticleUris({ bogus: 1 } as Record<string, unknown>);
        new RequestStoryArticleTrend({ bogus: 1 } as Record<string, unknown>);
        new RequestStorySimilarStories({ conceptInfoList: [], bogus: 1 } as Record<string, unknown>);
        expect(warn).toHaveBeenCalledTimes(4);
    });

    it("RequestStoryArticleUris and RequestStoryArticleTrend set their params", () => {
        expect(new RequestStoryArticleUris({ sortBy: "date" }).params).toEqual({ articleUrisSortBy: "date", articleUrisSortByAsc: false });
        expect(new RequestStoryArticleTrend().params).toMatchObject({
            articleTrendLang: mainLangs,
            articleTrendMinArticleCosSim: -1,
            articlesArticleBodyLen: 0,
        });
    });

    it("RequestStorySimilarStories encodes concepts, dates and languages", () => {
        const concepts = [{ uri: "c", wgt: 5 }];
        const req = new RequestStorySimilarStories({
            conceptInfoList: concepts,
            count: 10,
            dateStart: "2026-03-01",
            dateEnd: new Date("2026-03-02T05:00:00Z"),
            lang: ["eng"],
        });
        expect(req.params).toMatchObject({
            action: "getSimilarStories",
            concepts: JSON.stringify(concepts),
            storiesCount: 10,
            dateStart: "2026-03-01",
            dateEnd: "2026-03-02",
            lang: ["eng"],
        });
        const bare = new RequestStorySimilarStories({ conceptInfoList: [] });
        expect(bare.params.lang).toBeUndefined();
        expect(bare.params.dateStart).toBeUndefined();
        expect(() => new RequestStorySimilarStories({ conceptInfoList: [], count: 51 })).toThrow(RangeError);
        expect(() => new RequestStorySimilarStories()).toThrow(/not an array/);
    });
});
