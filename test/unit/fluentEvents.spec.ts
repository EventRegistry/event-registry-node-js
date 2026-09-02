import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("fluent events", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("er.events.search().info().exec()", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ events: { results: [], totalResults: 0 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const res = await er.events.search({ keywords: "x" }).info({ count: 10 }).exec();
        expect(res).toHaveProperty("events");
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({
            action: "getEvents",
            resultType: "events",
            eventsCount: 10,
        });
    });

    it("er.events.get(uri)", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ e1: { info: { uri: "e1" } } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        const res = await er.events.get("e1");
        expect(res).toHaveProperty("e1");
    });
});
