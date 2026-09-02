import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("EventRegistry jsonRequest uses erFetch policy", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("exposes Python-aligned stop status codes", () => {
        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        expect((er as unknown as { stopStatusCodes: number[] }).stopStatusCodes).toEqual([204, 400, 401, 403, 530]);
    });

    it("POSTs JSON to host with apiKey merged", async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        );
        vi.stubGlobal("fetch", fetchMock);

        const er = new EventRegistry({
            logging: false,
            minDelayBetweenRequests: 0,
            apiKey: "k",
            settingsFName: "no-settings.json",
        });
        await er.jsonRequest("/api/v1/test", { q: 1 });

        expect(fetchMock).toHaveBeenCalled();
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(String(url)).toBe("https://eventregistry.org/api/v1/test");
        expect(init.method).toBe("POST");
        expect(JSON.parse(String(init.body))).toMatchObject({ q: 1, apiKey: "k" });
    });

    it("stores response headers for case-insensitive lookups", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: {
                    "content-type": "application/json",
                    "x-ratelimit-limit": "100",
                    "x-ratelimit-remaining": "99",
                },
            })
        ));

        const er = new EventRegistry({ logging: false, minDelayBetweenRequests: 0, settingsFName: "no-settings.json" });
        await er.jsonRequest("/api/v1/test");

        expect(er.getLastHeader("X-RateLimit-Limit")).toBe("100");
        expect(er.getDailyAvailableRequests()).toBe(100);
        expect(er.getRemainingAvailableRequests()).toBe(99);
    });

    it("returns classic error data when a stop response fails", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response("bad request", { status: 400, statusText: "Bad Request" })
        ));

        const er = new EventRegistry({
            logging: false,
            minDelayBetweenRequests: 0,
            repeatFailedRequestCount: 0,
            settingsFName: "no-settings.json",
        });
        const response = await er.jsonRequest<{ error: string }>("/api/v1/test");

        expect(response.data.error).toBe("Bad Request");
        expect(response.status).toBe(0);
        expect(response.statusText).toBe("error");
    });

    it("spaces overlapping jsonRequest calls by minDelayBetweenRequests", async () => {
        const startedAt: number[] = [];
        vi.stubGlobal("fetch", vi.fn(async () => {
            startedAt.push(Date.now());
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }));
        const er = new EventRegistry({
            logging: false,
            minDelayBetweenRequests: 0.05,
            settingsFName: "no-settings.json",
        });
        await Promise.all([er.jsonRequest("/api/v1/a"), er.jsonRequest("/api/v1/b")]);
        expect(startedAt).toHaveLength(2);
        expect(startedAt[1] - startedAt[0]).toBeGreaterThanOrEqual(45);
    });

    it("releases the mutex if body serialization throws", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            })
        ));
        const er = new EventRegistry({
            logging: false,
            minDelayBetweenRequests: 0,
            settingsFName: "no-settings.json",
        });
        const circular: Record<string, unknown> = {};
        circular.self = circular;
        await er.jsonRequest("/api/v1/circular", circular);
        const ok = await er.jsonRequest("/api/v1/ok", { q: 1 });
        expect(ok.status).toBe(200);
    });

    it("throttles jsonRequestAnalytics with the same delay", async () => {
        const startedAt: number[] = [];
        vi.stubGlobal("fetch", vi.fn(async () => {
            startedAt.push(Date.now());
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }));
        const er = new EventRegistry({
            logging: false,
            minDelayBetweenRequests: 0.05,
            settingsFName: "no-settings.json",
        });
        await Promise.all([er.jsonRequestAnalytics("/a"), er.jsonRequestAnalytics("/b")]);
        expect(startedAt).toHaveLength(2);
        expect(startedAt[1] - startedAt[0]).toBeGreaterThanOrEqual(45);
    });
});
