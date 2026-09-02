import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("fluent mentions", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("er.mentions.search().info().exec()", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ mentions: { results: [], totalResults: 0 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const res = await er.mentions.search({ keywords: "x" }).info({ count: 10 }).exec();
        expect(res).toHaveProperty("mentions");
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({
            action: "getMentions",
            resultType: "mentions",
            mentionsCount: 10,
        });
    });
});
