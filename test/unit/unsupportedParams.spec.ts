import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryArticles } from "../../src";

describe("unsupported parameter warning", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("names the owner and the unknown keys", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        new QueryArticles({ keywrods: "typo" } as never);
        const output = warn.mock.calls.map((call) => String(call[0])).join("\n");
        expect(output).toContain("QueryArticles: Unsupported parameters detected");
        expect(output).toContain("keywrods");
    });
});
