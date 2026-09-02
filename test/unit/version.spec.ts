import { describe, expect, it } from "vitest";
import { __version__ } from "../../src/version";

describe("package version", () => {
    it("is 10.0.0", () => {
        expect(__version__).toBe("10.0.0");
    });
});
