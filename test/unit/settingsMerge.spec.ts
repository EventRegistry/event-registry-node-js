import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";

describe("settings/apiKey merge", () => {
    let settingsPath: string;

    beforeEach(() => {
        settingsPath = path.join(os.tmpdir(), `er-settings-${Date.now()}.json`);
    });

    afterEach(() => {
        if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
    });

    it("prefers constructor apiKey over settings", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ apiKey: "from-file" }));
        const er = new EventRegistry({ apiKey: "from-ctor", settingsFName: settingsPath, logging: false });
        expect(er.getApiKey()).toBe("from-ctor");
    });

    it("uses settings apiKey when constructor omits it", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ apiKey: "from-file" }));
        const er = new EventRegistry({ settingsFName: settingsPath, logging: false });
        expect(er.getApiKey()).toBe("from-file");
    });

    it("uses settings host when constructor omits host", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ host: "http://from-file" }));
        const er = new EventRegistry({ settingsFName: settingsPath, logging: false });
        expect(er.getHost()).toBe("http://from-file");
    });

    it("prefers constructor host over settings", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ host: "http://from-file" }));
        const er = new EventRegistry({ host: "http://from-ctor", settingsFName: settingsPath, logging: false });
        expect(er.getHost()).toBe("http://from-ctor");
    });

    it("uses settings hostAnalytics when constructor omits it", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ hostAnalytics: "http://analytics-file" }));
        const er = new EventRegistry({ settingsFName: settingsPath, logging: false });
        expect(er.getHostAnalytics()).toBe("http://analytics-file");
    });

    it("prefers constructor hostAnalytics over settings", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ hostAnalytics: "http://analytics-file" }));
        const er = new EventRegistry({ hostAnalytics: "http://analytics-ctor", settingsFName: settingsPath, logging: false });
        expect(er.getHostAnalytics()).toBe("http://analytics-ctor");
    });
});
