import { afterEach, describe, expect, it, vi } from "vitest";
import { erFetch } from "../../src/http";

describe("erFetch retries", () => {
    const stopStatusCodes = [204, 400, 401, 403];

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("does not retry on 401", async () => {
        let calls = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            calls += 1;
            return new Response("nope", { status: 401, statusText: "Unauthorized" });
        }));

        await expect(
            erFetch({ url: "https://example.test/retry", retry: -1, retryDelayMs: 1, stopStatusCodes })
        ).rejects.toBeDefined();
        expect(calls).toBe(1);
    });

    it("retries 500 until success when retry is -1", async () => {
        let calls = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            calls += 1;
            if (calls < 3) {
                return new Response("err", { status: 500, statusText: "Error" });
            }
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            });
        }));

        const res = await erFetch<{ ok: boolean }>({
            url: "https://example.test/retry",
            method: "GET",
            retry: -1,
            retryDelayMs: 1,
            stopStatusCodes,
        });
        expect(res.data).toEqual({ ok: true });
        expect(calls).toBe(3);
    });

    it("stops after one retry when retry is 1", async () => {
        let calls = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            calls += 1;
            return new Response("err", { status: 500, statusText: "Error" });
        }));

        await expect(
            erFetch({ url: "https://example.test/retry", method: "GET", retry: 1, retryDelayMs: 1, stopStatusCodes })
        ).rejects.toBeDefined();
        expect(calls).toBe(2);
    });

    it("does not retry when retry is 0", async () => {
        let calls = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            calls += 1;
            return new Response("err", { status: 500 });
        }));

        await expect(
            erFetch({ url: "https://example.test/retry", method: "GET", retry: 0, retryDelayMs: 1, stopStatusCodes })
        ).rejects.toBeDefined();
        expect(calls).toBe(1);
    });

    it("does not retry JSON.stringify failures even when retry is -1", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        const circular: Record<string, unknown> = {};
        circular.self = circular;

        await expect(
            erFetch({
                url: "https://example.test/retry",
                body: circular,
                retry: -1,
                retryDelayMs: 1,
                stopStatusCodes,
            })
        ).rejects.toThrow(/circular|Converting/i);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not retry JSON parse failures on HTTP 200 even when retry is -1", async () => {
        let calls = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            calls += 1;
            return new Response("<html>nope</html>", {
                status: 200,
                headers: { "content-type": "text/html" },
            });
        }));

        await expect(
            erFetch({
                url: "https://example.test/retry",
                method: "GET",
                retry: -1,
                retryDelayMs: 1,
                stopStatusCodes,
            })
        ).rejects.toBeDefined();
        expect(calls).toBe(1);
    });
});
