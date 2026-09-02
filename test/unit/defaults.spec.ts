import * as os from "os";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("EventRegistry defaults", () => {
    it("uses https hosts and python-aligned delay/retry", () => {
        const settingsPath = path.join(os.tmpdir(), `er-defaults-${Date.now()}.json`);
        const er = new EventRegistry({ logging: false, settingsFName: settingsPath });
        expect(er.getHost()).toBe("https://eventregistry.org");
        expect(er.getHostAnalytics()).toBe("https://analytics.eventregistry.org");
        expect(er.getMinDelayBetweenRequests()).toBe(0.5);
        expect(er.getRepeatFailedRequestCount()).toBe(-1);
    });

    it("allows overriding host to http", () => {
        const er = new EventRegistry({ host: "http://eventregistry.org", logging: false });
        expect(er.getHost()).toBe("http://eventregistry.org");
    });
});
