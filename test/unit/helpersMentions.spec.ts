import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { searchMentions } from "../../src/helpers/mentions";

describe("helpers mentions", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("searchMentions builds QueryMentions + RequestMentionsInfo and execQuery", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ mentions: { results: [{ uri: "m1" }], totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
        const res = await searchMentions(er, { keywords: "OpenAI", count: 5 });
        expect(res).toMatchObject({ mentions: { totalResults: 1 } });
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({
            action: "getMentions",
            resultType: "mentions",
            mentionsCount: 5,
        });
    });
});
