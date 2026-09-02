import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { LogLevel, Logger } from "../../src/logger";

describe("Logger per-instance", () => {
    it("allows setting logLevel on instance logger", () => {
        const er = new EventRegistry({ logging: false, settingsFName: "no-settings.json" });
        er.logger.logLevel = LogLevel.DEBUG;
        expect(er.logger.logLevel).toBe(LogLevel.DEBUG);
    });

    it("EventRegistry instances do not share logger file-transport config", () => {
        const er1 = new EventRegistry({ logging: false });
        const er2 = new EventRegistry({ logging: true });
        expect(er1.logger).not.toBe(er2.logger);
    });

    describe("logging:false", () => {
        let originalCwd: string;
        let tempDir: string;

        beforeEach(() => {
            originalCwd = process.cwd();
            tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "er-logger-"));
            process.chdir(tempDir);
        });

        afterEach(() => {
            process.chdir(originalCwd);
            fs.rmSync(tempDir, { recursive: true, force: true });
        });

        it("does not create logs/ when logging is false", () => {
            const logsPath = path.join(process.cwd(), "logs");
            expect(fs.existsSync(logsPath)).toBe(false);
            new EventRegistry({ logging: false });
            Logger.warn("static warn must not mkdir logs/");
            expect(fs.existsSync(logsPath)).toBe(false);
        });
    });
});
