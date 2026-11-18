import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

const newEr = (throwOnError?: boolean) =>
    new EventRegistry({ minDelayBetweenRequests: 0, settingsFName: "no-settings.json", throwOnError });

const stubFetch = (status: number, body: unknown) => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
};
const sentParams = (fetchMock: ReturnType<typeof stubFetch>) =>
    String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body ?? (fetchMock.mock.calls[0] as unknown as [string])[0]);

afterEach(() => vi.unstubAllGlobals());

describe("throwOnError", () => {
    const query = { path: "/api/v1/article/getArticles", getQueryParams: () => ({}) };

    it("resolves to { error } by default", async () => {
        stubFetch(400, { error: "bad query" });
        expect((await newEr().execQuery(query)).error).toContain("bad query");
    });

    it("throws when enabled", async () => {
        stubFetch(400, { error: "bad query" });
        await expect(newEr(true).execQuery(query)).rejects.toThrow(/bad query/);
    });
});

describe("suggesters accept positional and args-object forms", () => {
    it("suggestAuthors builds the same params either way", async () => {
        const positional = stubFetch(200, []);
        await newEr().suggestAuthors("jo", 2, 5);
        const a = sentParams(positional);
        const object = stubFetch(200, []);
        await newEr().suggestAuthors("jo", { page: 2, count: 5 });
        expect(sentParams(object)).toBe(a);
        expect(a).toContain("page");
    });

    it("rejects page <= 0 in both forms", async () => {
        stubFetch(200, []);
        await expect(newEr().suggestEventTypes("x", 0)).rejects.toThrow(/Page/);
        await expect(newEr().suggestIndustries("x", { page: 0 })).rejects.toThrow(/Page/);
    });

    it("suggestSourcesAtCoordinate takes a count or an args object", async () => {
        const positional = stubFetch(200, []);
        await newEr().suggestSourcesAtCoordinate(1, 2, 10, 7);
        const a = sentParams(positional);
        const object = stubFetch(200, []);
        await newEr().suggestSourcesAtCoordinate(1, 2, 10, { count: 7 });
        expect(sentParams(object)).toBe(a);
    });
});
