import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("fluent articles", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("er.articles.search().info().exec()", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [], totalResults: 0 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const res = await er.articles.search({ keywords: "x" }).info({ count: 10 }).exec();
        expect(res).toHaveProperty("articles");
    });

    it("er.articles.iterate accepts sortBy", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ articles: { results: [{ uri: "a1" }], pages: 1, totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const seen: unknown[] = [];
        for await (const article of er.articles.iterate({ keywords: "x", maxItems: 3, sortBy: "date" })) {
            seen.push(article);
        }
        expect(seen).toHaveLength(1);
    });
});
