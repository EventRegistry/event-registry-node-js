import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { getStory } from "../../src/helpers/stories";
import {
    getTrendingConcepts,
    getTrendingCategories,
    getTrendingCustomItems,
    getTrendingConceptGroups
} from "../../src/helpers/trends";
import { getCounts, getCountsEx } from "../../src/helpers/counts";
import { getTopSharedArticles, getTopSharedEvents } from "../../src/helpers/shares";
import { getRecentEvents, getRecentArticles } from "../../src/helpers/recent";
import { GetRecentEvents } from "../../src/recent";
import { getSourceInfo, getConceptInfo, getCategoryInfo, getSourceStats } from "../../src/helpers/info";

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}

function stubFetch(body: unknown) {
    const fetchMock = vi.fn(async () => jsonResponse(body));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

function newEr() {
    return new EventRegistry({ logging: false, minDelayBetweenRequests: 0, apiKey: "k", settingsFName: "no-settings.json" });
}

function bodyOf(fetchMock: ReturnType<typeof vi.fn>) {
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return JSON.parse(String(init.body));
}

describe("helpers secondary domains", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("getStory builds QueryStory + RequestStoryInfo and execQuery", async () => {
        const fetchMock = stubFetch({ s1: { info: { uri: "s1" } } });
        const res = await getStory(newEr(), "s1");
        expect(res).toMatchObject({ s1: { info: { uri: "s1" } } });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getStory", storyUri: "s1" });
    });

    it("getTrendingConcepts builds GetTrendingConcepts and execQuery", async () => {
        const fetchMock = stubFetch({ trends: [] });
        await getTrendingConcepts(newEr(), { count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingConcepts", conceptCount: 5 });
    });

    it("getTrendingCategories builds GetTrendingCategories and execQuery", async () => {
        const fetchMock = stubFetch({ trends: [] });
        await getTrendingCategories(newEr(), { count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingCategories", categoryCount: 5 });
    });

    it("getTrendingCustomItems builds GetTrendingCustomItems and execQuery", async () => {
        const fetchMock = stubFetch({ trends: [] });
        await getTrendingCustomItems(newEr(), { count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingCustom", conceptCount: 5 });
    });

    it("getTrendingConceptGroups builds GetTrendingConceptGroups and execQuery", async () => {
        const fetchMock = stubFetch({ trends: [] });
        await getTrendingConceptGroups(newEr(), { count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getConceptTrendGroups", conceptCount: 5 });
    });

    it("getCounts builds GetCounts and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getCounts(newEr(), "http://concept/1", { source: "news" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getCounts", uri: "http://concept/1" });
    });

    it("getCountsEx builds GetCountsEx and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getCountsEx(newEr(), "http://concept/1");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "GetCountsEx", uri: "http://concept/1" });
    });

    it("getTopSharedArticles builds GetTopSharedArticles and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getTopSharedArticles(newEr(), { date: "2020-01-01" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getArticles", resultType: "articles" });
    });

    it("getTopSharedEvents builds GetTopSharedEvents and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getTopSharedEvents(newEr(), { date: "2020-01-01" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getEvents", resultType: "events" });
    });

    it("getRecentEvents uses GetRecentEvents.getUpdates() execute path", async () => {
        stubFetch({ recentActivityEvents: { activity: [{ uri: "e1" }] } });
        const res = await getRecentEvents(newEr());
        expect(res).toEqual([{ uri: "e1" }]);
    });

    it("getRecentEvents returns an array when activity is missing", async () => {
        stubFetch({ recentActivityEvents: {} });
        const res = await getRecentEvents(newEr());
        expect(res).toEqual([]);
    });

    it("getRecentEvents copies newestUri onto the next poll", async () => {
        const fetchMock = stubFetch({
            recentActivityEvents: { activity: ["e1"], newestUri: { news: "e-last" } },
        });
        const recent = new GetRecentEvents(newEr());
        await recent.getUpdates();
        await recent.getUpdates();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        const secondBody = JSON.parse(String((fetchMock.mock.calls[1] as [string, RequestInit])[1].body));
        expect(secondBody.recentActivityEventsNews).toBe("e-last");
    });

    it("getRecentArticles uses GetRecentArticles.getUpdates() execute path", async () => {
        stubFetch({ recentActivityArticles: { activity: [{ uri: "a1" }], newestUri: {} } });
        const res = await getRecentArticles(newEr());
        expect(res).toEqual([{ uri: "a1" }]);
    });

    it("getSourceInfo builds GetSourceInfo and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getSourceInfo(newEr(), { uriOrUriList: "bbc.com" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "bbc.com" });
    });

    it("getConceptInfo builds GetConceptInfo and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getConceptInfo(newEr(), { uriOrUriList: "http://concept/1" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "http://concept/1" });
    });

    it("getCategoryInfo builds GetCategoryInfo and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getCategoryInfo(newEr(), { uriOrUriList: "dmoz/Business" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "dmoz/Business" });
    });

    it("getSourceStats builds GetSourceStats and execQuery", async () => {
        const fetchMock = stubFetch({});
        await getSourceStats(newEr(), "bbc.com");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getStats", uri: "bbc.com" });
    });
});

describe("fluent namespaces for secondary domains", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("er.stories.get()", async () => {
        const fetchMock = stubFetch({ s1: { info: { uri: "s1" } } });
        const er = newEr();
        await er.stories.get("s1");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getStory", storyUri: "s1" });
    });

    it("er.trends.concepts()", async () => {
        const fetchMock = stubFetch({ trends: [] });
        const er = newEr();
        await er.trends.concepts({ count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingConcepts", conceptCount: 5 });
    });

    it("er.counts.get()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.counts.get("http://concept/1");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getCounts", uri: "http://concept/1" });
    });

    it("er.shares.articles()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.shares.articles({ date: "2020-01-01" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getArticles", resultType: "articles" });
    });

    it("er.recent.events()", async () => {
        stubFetch({ recentActivityEvents: { activity: [{ uri: "e1" }] } });
        const er = newEr();
        const res = await er.recent.events();
        expect(res).toEqual([{ uri: "e1" }]);
    });

    it("er.info.source()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.info.source({ uriOrUriList: "bbc.com" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "bbc.com" });
    });

    it("er.trends.categories()", async () => {
        const fetchMock = stubFetch({ trends: [] });
        const er = newEr();
        await er.trends.categories({ count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingCategories", categoryCount: 5 });
    });

    it("er.trends.customItems()", async () => {
        const fetchMock = stubFetch({ trends: [] });
        const er = newEr();
        await er.trends.customItems({ count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTrendingCustom", conceptCount: 5 });
    });

    it("er.trends.conceptGroups()", async () => {
        const fetchMock = stubFetch({ trends: [] });
        const er = newEr();
        await er.trends.conceptGroups({ count: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getConceptTrendGroups", conceptCount: 5 });
    });

    it("er.counts.ex()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.counts.ex("http://concept/1");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "GetCountsEx", uri: "http://concept/1" });
    });

    it("er.shares.events()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.shares.events({ date: "2020-01-01" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getEvents", resultType: "events" });
    });

    it("er.recent.articles()", async () => {
        stubFetch({ recentActivityArticles: { activity: [{ uri: "a1" }], newestUri: {} } });
        const er = newEr();
        const res = await er.recent.articles();
        expect(res).toEqual([{ uri: "a1" }]);
    });

    it("er.info.concept()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.info.concept({ uriOrUriList: "http://concept/1" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "http://concept/1" });
    });

    it("er.info.category()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.info.category({ uriOrUriList: "dmoz/Business" });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getInfo", uri: "dmoz/Business" });
    });

    it("er.info.sourceStats()", async () => {
        const fetchMock = stubFetch({});
        const er = newEr();
        await er.info.sourceStats("bbc.com");
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getStats", uri: "bbc.com" });
    });
});
