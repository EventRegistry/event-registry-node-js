import { describe, expect, it } from "vitest";
import { QueryArticles } from "../../src/queryArticles";

describe("QueryArticles authors/videos/links filters", () => {
    it("sends hasAuthorsFilter, hasVideosFilter, and hasLinksFilter to the API", () => {
        const q = new QueryArticles({
            authorsFilter: "keepOnlyIfHasAuthors",
            videosFilter: "keepOnlyIfHasVideos",
            linksFilter: "keepOnlyIfHasLinks",
        });
        const params = q.getQueryParams();
        expect(params.hasAuthorsFilter).toBe("keepOnlyIfHasAuthors");
        expect(params.hasVideosFilter).toBe("keepOnlyIfHasVideos");
        expect(params.hasLinksFilter).toBe("keepOnlyIfHasLinks");
        expect(params.authorsFilter).toBeUndefined();
        expect(params.videosFilter).toBeUndefined();
        expect(params.linksFilter).toBeUndefined();
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
});
