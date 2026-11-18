import { describe, expect, it } from "vitest";
import { QueryParamsBase } from "../../src/base";

const encode = QueryParamsBase.encodeDateTime;

describe("QueryParamsBase.encodeDateTime", () => {
    it("sends UTC without a zone suffix, like the Python SDK", () => {
        expect(encode(new Date("2026-01-01T10:00:00Z"))).toBe("2026-01-01T10:00:00");
        expect(encode(new Date("2026-01-01T10:00:00.250Z"))).toBe("2026-01-01T10:00:00.250");
        expect(encode("2026-01-01T12:00:00+02:00")).toBe("2026-01-01T10:00:00");
        expect(encode("2026-01-01T10:00:00Z")).toBe("2026-01-01T10:00:00");
    });

    it("treats a zoneless datetime string as UTC and passes it through", () => {
        expect(encode("2026-01-01T23:30:00")).toBe("2026-01-01T23:30:00");
        expect(encode("2026-01-01T23:30:00.123456")).toBe("2026-01-01T23:30:00.123456");
        expect(encode("2026-01-01T23:30:00", "YYYY-MM-DD")).toBe("2026-01-01");
    });

    it("formats dates and rejects garbage", () => {
        expect(encode("2026-01-01", "YYYY-MM-DD")).toBe("2026-01-01");
        expect(() => encode("not a date")).toThrow(/not recognizable/);
    });
});
