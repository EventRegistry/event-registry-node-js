import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("setExtraParams", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("merges extra params into jsonRequest body", async () => {
        const er = new EventRegistry({
            apiKey: "k",
            host: "https://example.test",
            minDelayBetweenRequests: 0,
            repeatFailedRequestCount: 0,
            logging: false
        });
        er.setExtraParams({ foo: "bar" });

        vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
            const data = JSON.parse(String(init.body));
            expect(data.foo).toBe("bar");
            expect(data.apiKey).toBe("k");
            return new Response(JSON.stringify({ availableTokens: 1, usedTokens: 0 }), { status: 200 });
        }));

        await er.getUsageInfo();
    });

    it("merges extra params into jsonRequestAnalytics body", async () => {
        const er = new EventRegistry({
            apiKey: "k",
            hostAnalytics: "https://analytics.example.test",
            minDelayBetweenRequests: 0,
            repeatFailedRequestCount: 0,
            logging: false
        });
        er.setExtraParams({ baz: "qux" });

        vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
            const data = JSON.parse(String(init.body));
            expect(data.baz).toBe("qux");
            expect(data.text).toBe("hello");
            expect(data.apiKey).toBe("k");
            return new Response(JSON.stringify({}), { status: 200 });
        }));

        await er.jsonRequestAnalytics("/api/v1/annotate", { text: "hello" });
    });

    it("config apiKey wins over extraParams apiKey", async () => {
        const er = new EventRegistry({
            apiKey: "real-key",
            host: "https://example.test",
            minDelayBetweenRequests: 0,
            repeatFailedRequestCount: 0,
            logging: false
        });
        er.setExtraParams({ apiKey: "override-key", foo: "bar" });

        vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
            const data = JSON.parse(String(init.body));
            expect(data.apiKey).toBe("real-key");
            expect(data.foo).toBe("bar");
            return new Response(JSON.stringify({ availableTokens: 1, usedTokens: 0 }), { status: 200 });
        }));

        await er.getUsageInfo();
    });

    it("setExtraParams(null) clears extra params", async () => {
        const er = new EventRegistry({
            apiKey: "k",
            host: "https://example.test",
            minDelayBetweenRequests: 0,
            repeatFailedRequestCount: 0,
            logging: false
        });
        er.setExtraParams({ foo: "bar" });
        er.setExtraParams(null);

        vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
            const data = JSON.parse(String(init.body));
            expect(data.foo).toBeUndefined();
            expect(data.apiKey).toBe("k");
            return new Response(JSON.stringify({ availableTokens: 1, usedTokens: 0 }), { status: 200 });
        }));

        await er.getUsageInfo();
    });

    it("throws TypeError for non-object params", () => {
        const er = new EventRegistry({ logging: false });
        expect(() => er.setExtraParams("bad" as any)).toThrowError(TypeError);
        expect(() => er.setExtraParams([] as any)).toThrowError(TypeError);
    });
});
