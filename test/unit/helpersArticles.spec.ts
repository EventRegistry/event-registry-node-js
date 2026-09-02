import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { iterateArticles, searchArticles } from "../../src/helpers/articles";

describe("helpers articles", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("searchArticles builds QueryArticles + RequestArticlesInfo and execQuery", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [{ uri: "a1" }], totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
        const res = await searchArticles(er, { keywords: "OpenAI", count: 5 });
        expect(res).toMatchObject({ articles: { totalResults: 1 } });
    });

    it("iterateArticles accepts IteratorArguments including sortBy", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [{ uri: "a1" }], pages: 1, totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
        const seen: unknown[] = [];
        for await (const article of iterateArticles(er, { keywords: "x", maxItems: 3, sortBy: "date" })) {
            seen.push(article);
        }
        expect(seen).toHaveLength(1);
        expect(fetchMock).toHaveBeenCalled();
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({ keyword: "x" });
    });
});
