import { describe, expect, it } from "vitest";

describe("package exports", () => {
    it("loads via require", () => {
        const er = require("eventregistry");
        expect(er.EventRegistry).toBeDefined();
    });

    it("loads via dynamic import", async () => {
        const er = await import("eventregistry");
        expect(er.EventRegistry).toBeDefined();
    });
});
