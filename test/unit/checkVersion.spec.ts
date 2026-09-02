import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("checkVersion", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("logs when server version is newer", async () => {
        const er = new EventRegistry({ host: "https://example.test", logging: false, minDelayBetweenRequests: 0 });
        const fetchMock = vi.fn(async () => new Response("99.0.0", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
            "https://example.test/static/nodejsSDKVersion.txt",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("does not log when the client version is up to date", async () => {
        const er = new EventRegistry({ host: "https://example.test", logging: false, minDelayBetweenRequests: 0 });
        vi.stubGlobal("fetch", vi.fn(async () => new Response("10.0.0", { status: 200 })));
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).not.toHaveBeenCalled();
    });

    it("never throws when the version check request fails", async () => {
        const er = new EventRegistry({ host: "https://example.test", logging: false, minDelayBetweenRequests: 0 });
        vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network error"))));
        await expect(er.checkVersion()).resolves.toBeUndefined();
    });
});
