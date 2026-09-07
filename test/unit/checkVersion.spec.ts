import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

const HOST_VERSION_URL = "https://example.test/static/nodejsSDKVersion.txt";
const NPM_LATEST_URL = "https://registry.npmjs.org/eventregistry/latest";

const makeEr = () => new EventRegistry({
    host: "https://example.test",
    logging: false,
    minDelayBetweenRequests: 0,
    settingsFName: "no-settings.json",
});

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });

describe("checkVersion", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("logs when server version is newer", async () => {
        const er = makeEr();
        const fetchMock = vi.fn(async () => new Response("99.0.0", { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
            HOST_VERSION_URL,
            expect.objectContaining({ method: "GET" }),
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not log when the client version is up to date", async () => {
        const er = makeEr();
        vi.stubGlobal("fetch", vi.fn(async () => new Response("10.0.0", { status: 200 })));
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).not.toHaveBeenCalled();
    });

    it("never throws when the version check request fails", async () => {
        const er = makeEr();
        vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network error"))));
        await expect(er.checkVersion()).resolves.toBeUndefined();
    });

    it("falls back to the npm registry when the host version file is missing", async () => {
        const er = makeEr();
        const fetchMock = vi.fn(async (url: string) => {
            if (String(url) === HOST_VERSION_URL) {
                return new Response("Not Found", { status: 404, statusText: "Not Found" });
            }
            if (String(url) === NPM_LATEST_URL) {
                return jsonResponse({ version: "99.0.0" });
            }
            throw new Error(`unexpected url ${url}`);
        });
        vi.stubGlobal("fetch", fetchMock);
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledWith(
            NPM_LATEST_URL,
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("does not log when npm latest matches the client after a host 404", async () => {
        const er = makeEr();
        vi.stubGlobal("fetch", vi.fn(async (url: string) => {
            if (String(url) === HOST_VERSION_URL) {
                return new Response("Not Found", { status: 404, statusText: "Not Found" });
            }
            return jsonResponse({ version: "10.0.0" });
        }));
        const info = vi.spyOn(er.logger, "info");
        await er.checkVersion();
        expect(info).not.toHaveBeenCalled();
    });
});
