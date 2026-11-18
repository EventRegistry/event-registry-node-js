import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EventRegistry } from "../../src";

describe("settings file", () => {
    it("names the file when it is not valid JSON", () => {
        const file = join(mkdtempSync(join(tmpdir(), "er-settings-")), "bad.json");
        writeFileSync(file, "{ not json");
        expect(() => new EventRegistry({ settingsFName: file })).toThrow(file);
    });
});
