import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { ReturnInfo } from "../../src/returnInfo";
import { TopicPage } from "../../src/topicPage";

function makeEr(fetchMock: ReturnType<typeof vi.fn> = vi.fn()) {
    vi.stubGlobal("fetch", fetchMock);
    return new EventRegistry({
        logging: false,
        minDelayBetweenRequests: 0,
        repeatFailedRequestCount: 0,
        apiKey: "k",
        settingsFName: "no-settings.json",
    });
}

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function call(fetchMock: ReturnType<typeof vi.fn>, n = 0): { url: string; body: Record<string, unknown> } {
    const [url, init] = fetchMock.mock.calls[n] as [string, RequestInit];
    return { url, body: JSON.parse(String(init.body)) };
}

describe("TopicPage definition builder", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("starts from the default empty definition", () => {
        const def = new TopicPage(makeEr()).saveTopicPageDefinition();
        expect(def).toMatchObject({ maxDaysBack: 7, articleIsDuplicate: "skipDuplicates", concepts: [], dataType: ["news"] });
    });

    it("adds weighted items and clears them", () => {
        const tp = new TopicPage(makeEr());
        tp.addConcept("c1", 50, { label: "C", conceptType: "org", required: true });
        tp.addConcept("c2", 10);
        tp.addKeyword("kw", 20, { excluded: true });
        tp.addCategory("cat", 5);
        tp.addSource("src", 5, { excluded: true });
        tp.addSourceLocation("loc", 5);
        tp.addSourceGroup("grp", 5);
        tp.addLocation("place", 3);
        const def = tp.saveTopicPageDefinition();
        expect(def.concepts).toEqual([
            { uri: "c1", wgt: 50, required: true, excluded: false, label: "C", type: "org" },
            { uri: "c2", wgt: 10, required: false, excluded: false },
        ]);
        expect(def.keywords).toEqual([{ keyword: "kw", wgt: 20, required: false, excluded: true }]);
        expect(def.categories).toEqual([{ uri: "cat", wgt: 5, required: false, excluded: false }]);
        expect(def.sources).toEqual([{ uri: "src", wgt: 5, excluded: true }]);
        expect(def.sourceLocations).toEqual([{ uri: "loc", wgt: 5, excluded: false }]);
        expect(def.sourceGroups).toEqual([{ uri: "grp", wgt: 5, excluded: false }]);
        expect(def.locations).toEqual([{ uri: "place", wgt: 3 }]);

        tp.clearConcepts();
        tp.clearKeywords();
        tp.clearCategories();
        tp.clearSources();
        tp.clearSourceLocations();
        tp.clearSourceGroups();
        tp.clearLocations();
        const cleared = tp.saveTopicPageDefinition();
        for (const key of ["concepts", "keywords", "categories", "sources", "sourceLocations", "sourceGroups", "locations"] as const) {
            expect(cleared[key]).toEqual([]);
        }
    });

    it("rejects non-numeric weights and required+excluded concepts", () => {
        const tp = new TopicPage(makeEr());
        const bad = "1" as unknown as number;
        expect(() => tp.addConcept("c", bad)).toThrow(/Weight/);
        expect(() => tp.addConcept("c", 1, { required: true, excluded: true })).toThrow(/required and excluded/);
        expect(() => tp.addKeyword("k", bad)).toThrow(/Weight/);
        expect(() => tp.addCategory("c", bad)).toThrow(/Weight/);
        expect(() => tp.addSource("s", bad)).toThrow(/Weight/);
        expect(() => tp.addSourceLocation("s", bad)).toThrow(/Weight/);
        expect(() => tp.addSourceGroup("s", bad)).toThrow(/Weight/);
        expect(() => tp.addLocation("l", bad)).toThrow(/Weight/);
    });

    it("applies valid setter values and ignores invalid filter values", () => {
        const tp = new TopicPage(makeEr());
        tp.articleThreshold = 5;
        tp.articleThreshold = -1;
        tp.eventThreshold = 7;
        tp.articleIsDuplicateFilter = "keepAll";
        tp.articleIsDuplicateFilter = "nope" as "keepAll";
        tp.articleHasEventFilter = "skipArticlesWithoutEvent";
        tp.articleHasDuplicateFilter = "skipHasDuplicates";
        tp.dataTypes = ["news", "pr"];
        tp.maxDaysBack = 3;
        tp.languages = "eng";
        tp.restrictToSetConceptsAndKeywords = true;
        tp.restrictToSetCategories = true;
        tp.restrictToSetSources = true;
        tp.restrictToSetLocations = true;
        expect(tp.saveTopicPageDefinition()).toMatchObject({
            articleTreshWgt: 5,
            eventTreshWgt: 7,
            articleIsDuplicate: "keepAll",
            articleHasEvent: "skipArticlesWithoutEvent",
            articleHasDuplicate: "skipHasDuplicates",
            dataType: ["news", "pr"],
            maxDaysBack: 3,
            langs: ["eng"],
            restrictToSetConcepts: true,
            restrictToSetCategories: true,
            restrictToSetSources: true,
            restrictToSetLocations: true,
        });
    });

    it("validates setter input", () => {
        const tp = new TopicPage(makeEr());
        expect(() => { tp.maxDaysBack = -1; }).toThrow(/positive/);
        expect(() => { tp.maxDaysBack = 0; }).toThrow(RangeError);
        expect(() => { tp.languages = ["en"]; }).toThrow(/ISO3/);
        expect(() => { tp.restrictToSetConceptsAndKeywords = "yes" as unknown as boolean; }).toThrow(/boolean/);
        expect(() => { tp.restrictToSetCategories = 1 as unknown as boolean; }).toThrow(/boolean/);
        expect(() => { tp.restrictToSetSources = 1 as unknown as boolean; }).toThrow(/boolean/);
        expect(() => { tp.restrictToSetLocations = 1 as unknown as boolean; }).toThrow(/boolean/);
    });

    it("validates source rank percentiles", () => {
        const tp = new TopicPage(makeEr());
        expect(() => { tp.sourceRankStartPercentile = 95; }).toThrow(RangeError);
        expect(() => { tp.sourceRankStartPercentile = 15; }).toThrow(/multiple of 10/);
        expect(() => { tp.sourceRankEndPercentile = 5; }).toThrow(RangeError);
        expect(() => { tp.sourceRankEndPercentile = 55; }).toThrow(/multiple of 10/);
        tp.sourceRankStartPercentile = 20;
        tp.sourceRankEndPercentile = 80;
        expect(() => { tp.sourceRankStartPercentile = 80; }).toThrow(/smaller than/);
        expect(() => { tp.sourceRankEndPercentile = 20; }).toThrow(/smaller than/);
        expect(tp.saveTopicPageDefinition()).toMatchObject({ startSourceRankPercentile: 20, endSourceRankPercentile: 80 });
    });
});

describe("TopicPage loading and saving", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("round-trips a definition, including source rank limits, through an object and a file", () => {
        const source = new TopicPage(makeEr());
        source.addConcept("c1", 30);
        source.sourceRankStartPercentile = 10;
        source.sourceRankEndPercentile = 50;
        const def = structuredClone(source.saveTopicPageDefinition());

        const fromObject = new TopicPage(makeEr());
        fromObject.loadTopicPageFromDefinition(def);
        expect(fromObject.saveTopicPageDefinition()).toEqual(def);

        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "er-topic-"));
        const file = path.join(dir, "tp.json");
        try {
            source.saveTopicPageDefinitionToFile(file);
            const fromFile = new TopicPage(makeEr());
            fromFile.loadTopicPageFromFile(file);
            expect(fromFile.saveTopicPageDefinition()).toEqual(def);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("ignores definitions with missing or unknown keys and missing files", () => {
        const tp = new TopicPage(makeEr());
        const before = structuredClone(tp.saveTopicPageDefinition());
        tp.loadTopicPageFromDefinition({ concepts: [] });
        tp.loadTopicPageFromDefinition({ ...before, extra: 1 });
        tp.loadTopicPageFromFile(path.join(os.tmpdir(), "does-not-exist-er-topic.json"));
        expect(tp.saveTopicPageDefinition()).toEqual(before);
    });

    it("loadTopicPageFromER requests the definition and starts from a clean page", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ topicPage: { maxDaysBack: 3, keywords: [{ keyword: "k", wgt: 1 }] } }));
        const tp = new TopicPage(makeEr(fetchMock));
        tp.addConcept("stale", 10);
        const loaded = await tp.loadTopicPageFromER("tp-uri");
        expect(call(fetchMock).url).toMatch(/\/api\/v1\/topicPage$/);
        expect(call(fetchMock).body).toMatchObject({ action: "getTopicPageJson", uri: "tp-uri", includeTopicPageDefinition: true });
        expect(loaded.maxDaysBack).toBe(3);
        expect(loaded.keywords).toEqual([{ keyword: "k", wgt: 1 }]);
        expect(loaded.concepts).toEqual([]);
    });

    it("loadTopicPageFromER throws the API error", async () => {
        const tp = new TopicPage(makeEr(vi.fn(async () => jsonResponse({ error: "no such page" }))));
        await expect(tp.loadTopicPageFromER("x")).rejects.toThrow("no such page");
    });
});

describe("TopicPage results", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("getArticles sends the definition and paging", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ articles: { results: [{ uri: "a" }] } }));
        const tp = new TopicPage(makeEr(fetchMock));
        tp.addKeyword("k", 5);
        const res = await tp.getArticles({ page: 2, count: 10, sortBy: "date", returnInfo: new ReturnInfo(), dateStart: "2026-01-01" } as Parameters<TopicPage["getArticles"]>[0]);
        expect(res).toEqual({ articles: { results: [{ uri: "a" }] } });
        const { url, body } = call(fetchMock);
        expect(url).toMatch(/\/api\/v1\/article$/);
        expect(body).toMatchObject({
            action: "getArticlesForTopicPage",
            resultType: "articles",
            articlesPage: 2,
            articlesCount: 10,
            articlesSortBy: "date",
            articlesSortByAsc: false,
            dateStart: "2026-01-01",
        });
        expect(JSON.parse(String(body.topicPage)).keywords).toEqual([{ keyword: "k", wgt: 5, required: false, excluded: false }]);
    });

    it("getEvents sends the definition and paging", async () => {
        const fetchMock = vi.fn(async () => jsonResponse({ events: { results: [] } }));
        const tp = new TopicPage(makeEr(fetchMock));
        await tp.getEvents({ page: 3, count: 20 });
        const { url, body } = call(fetchMock);
        expect(url).toMatch(/\/api\/v1\/event$/);
        expect(body).toMatchObject({ action: "getEventsForTopicPage", resultType: "events", eventsPage: 3, eventsCount: 20, eventsSortBy: "rel" });
    });

    it("validates paging before any request", async () => {
        const fetchMock = vi.fn();
        const tp = new TopicPage(makeEr(fetchMock));
        await expect(tp.getArticles({ page: 0 })).rejects.toThrow(RangeError);
        await expect(tp.getArticles({ count: 101 })).rejects.toThrow(RangeError);
        await expect(tp.getEvents({ page: 0 })).rejects.toThrow(RangeError);
        await expect(tp.getEvents({ count: 51 })).rejects.toThrow(RangeError);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
