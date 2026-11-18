import { describe, expect, it } from "vitest";
import { QueryItems } from "../../src/base";
import { BaseQuery, CombinedQuery, ComplexArticleQuery, ComplexEventQuery, QueryCore } from "../../src/query";

describe("BaseQuery", () => {
    it("maps strings, QueryItems, dates and flags", () => {
        const q = new BaseQuery({
            keyword: QueryItems.OR(["a", "b"]),
            conceptUri: "c",
            categoryUri: "cat",
            sourceUri: QueryItems.AND(["s1", "s2"]),
            locationUri: "loc",
            lang: "eng",
            dateStart: "2026-01-01",
            dateEnd: new Date("2026-01-31T20:00:00Z"),
            dateMention: ["2026-02-01", "2026-02-02"],
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            categoryIncludeSub: false,
            keywordLoc: "title",
            minMaxArticlesInEvent: [5, 50],
        });
        expect(q.getQuery()).toEqual({
            keyword: { $or: ["a", "b"] },
            conceptUri: "c",
            categoryUri: "cat",
            sourceUri: { $and: ["s1", "s2"] },
            locationUri: "loc",
            lang: "eng",
            dateStart: "2026-01-01",
            dateEnd: "2026-01-31",
            dateMention: ["2026-02-01", "2026-02-02"],
            sourceLocationUri: "sl",
            sourceGroupUri: "sg",
            authorUri: "au",
            categoryIncludeSub: false,
            keywordLoc: "title",
            minArticlesInEvent: 5,
            maxArticlesInEvent: 50,
        });
    });

    it("omits defaults and encodes a single date mention", () => {
        expect(new BaseQuery().getQuery()).toEqual({});
        expect(new BaseQuery({ dateMention: "2026-03-04" }).getQuery()).toEqual({ dateMention: "2026-03-04" });
    });

    it("nests an excluded query under $not", () => {
        const q = new BaseQuery({ conceptUri: "c", exclude: new BaseQuery({ keyword: "k" }) });
        expect(q.getQuery()).toEqual({ conceptUri: "c", $not: { keyword: "k" } });
    });

    it("rejects invalid input", () => {
        const asArgs = (v: unknown) => v as ConstructorParameters<typeof BaseQuery>[0];
        expect(() => new BaseQuery(asArgs({ keyword: ["a", "b"] }))).toThrow(/unsupported type/);
        expect(() => new BaseQuery(asArgs({ minMaxArticlesInEvent: [1] }))).toThrow(/minMaxArticlesInEvent/);
        expect(() => new BaseQuery(asArgs({ exclude: { keyword: "k" } }))).toThrow(/exclude/);
    });
});

describe("CombinedQuery", () => {
    const a = new BaseQuery({ keyword: "a" });
    const b = new BaseQuery({ keyword: "b" });
    const notC = new BaseQuery({ keyword: "c" });

    it("builds nested $and / $or trees with $not", () => {
        const q = CombinedQuery.AND([a, CombinedQuery.OR([b, notC])], notC);
        expect(q.getQuery()).toEqual({
            $and: [{ keyword: "a" }, { $or: [{ keyword: "b" }, { keyword: "c" }] }],
            $not: { keyword: "c" },
        });
        expect(CombinedQuery.OR([a], b).getQuery()).toEqual({ $or: [{ keyword: "a" }], $not: { keyword: "b" } });
    });

    it.each([
        ["AND", CombinedQuery.AND],
        ["OR", CombinedQuery.OR],
    ] as const)("%s validates its arguments", (_name, combine) => {
        const bad = (v: unknown) => v as BaseQuery[];
        expect(() => combine(bad("x"))).toThrow(/not a list/);
        expect(() => combine([])).toThrow(/empty list/);
        expect(() => combine(bad([{ keyword: "a" }]))).toThrow(/item in the list/);
        expect(() => combine([a], { keyword: "c" } as unknown as BaseQuery)).toThrow(/exclude/);
    });
});

describe("ComplexArticleQuery", () => {
    const base = new BaseQuery({ conceptUri: "c" });

    it("has no $filter with default arguments", () => {
        expect(new ComplexArticleQuery(base).getQuery()).toEqual({ $query: { conceptUri: "c" } });
    });

    it("maps every non-default filter", () => {
        const q = new ComplexArticleQuery(base, {
            dataType: ["news", "blog"],
            minSentiment: -0.5,
            maxSentiment: 0.5,
            minSocialScore: 10,
            minFacebookShares: 20,
            startSourceRankPercentile: 10,
            endSourceRankPercentile: 50,
            isDuplicateFilter: "skipDuplicates",
            hasDuplicateFilter: "skipHasDuplicates",
            eventFilter: "skipArticlesWithoutEvent",
        });
        expect(q.getQuery()).toEqual({
            $query: { conceptUri: "c" },
            $filter: {
                dataType: ["news", "blog"],
                minSentiment: -0.5,
                maxSentiment: 0.5,
                minSocialScore: 10,
                minFacebookShares: 20,
                startSourceRankPercentile: 10,
                endSourceRankPercentile: 50,
                isDuplicate: "skipDuplicates",
                hasDuplicate: "skipHasDuplicates",
                hasEvent: "skipArticlesWithoutEvent",
            },
        });
    });

    it("rejects a query that is not a QueryCore", () => {
        expect(() => new ComplexArticleQuery({} as BaseQuery)).toThrow(/query parameter/);
    });
});

describe("ComplexEventQuery", () => {
    it("wraps the query and adds sentiment filters", () => {
        const base = new BaseQuery({ keyword: "k" });
        expect(new ComplexEventQuery(base).getQuery()).toEqual({ $query: { keyword: "k" } });
        expect(new ComplexEventQuery(base, { minSentiment: -0.3, maxSentiment: 0.7 }).getQuery()).toEqual({
            $query: { keyword: "k" },
            $filter: { minSentiment: -0.3, maxSentiment: 0.7 },
        });
        expect(() => new ComplexEventQuery({} as BaseQuery)).toThrow(/query parameter/);
    });

    it("setQueryParam writes raw keys", () => {
        const q: QueryCore = new ComplexEventQuery(new BaseQuery());
        q.setQueryParam("$custom", 1);
        expect(q.getQuery()).toMatchObject({ $custom: 1 });
    });
});
