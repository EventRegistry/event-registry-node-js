import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { searchEvents, getEvent } from "../../src/helpers/events";

describe("helpers events", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("searchEvents builds QueryEvents + RequestEventsInfo and execQuery", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ events: { results: [{ uri: "e1" }], totalResults: 1 } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
        const res = await searchEvents(er, { keywords: "OpenAI", count: 5 });
        expect(res).toMatchObject({ events: { totalResults: 1 } });
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({
            action: "getEvents",
            resultType: "events",
            eventsCount: 5,
        });
    });

    it("getEvent builds QueryEvent + RequestEventInfo and execQuery", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ e1: { info: { uri: "e1" } } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
        const res = await getEvent(er, "e1");
        expect(res).toMatchObject({ e1: { info: { uri: "e1" } } });
    });
});
