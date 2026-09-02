import { describe, it, expect, vi, afterEach } from "vitest";
import { EventRegistry } from "../../src/eventRegistry";
import { detectLanguage as detectLanguageExport } from "../../src";
import { getMyTopicPages, loadTopicPage, createTopicPage } from "../../src/helpers/topicPages";
import { TopicPage } from "../../src/topicPage";
import {
    annotateText,
    categorizeText,
    analyzeSentiment,
    semanticSimilarity,
    detectLanguage,
    extractArticleInfo,
    ner,
    trainTopicOnTweets,
    trainTopicCreateTopic,
    trainTopicClearTopic,
    trainTopicAddDocument,
    trainTopicGetTrainedTopic
} from "../../src/helpers/analytics";
import { getEventForText } from "../../src/helpers/eventForText";
import {
    conceptUri,
    categoryUri,
    sourceUri,
    sourceGroupUri,
    locationUri,
    eventTypeUri,
    conceptClassUri,
    authorUri
} from "../../src/helpers/uri";

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

function bodyOf(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0) {
    const [, init] = fetchMock.mock.calls[callIndex] as [string, RequestInit];
    return JSON.parse(String(init.body));
}

function urlOf(fetchMock: ReturnType<typeof vi.fn>, callIndex = 0) {
    const [url] = fetchMock.mock.calls[callIndex] as [string, RequestInit];
    return url;
}

describe("helpers: topic pages", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("getMyTopicPages reads ownedTopicPages from the user profile", async () => {
        const fetchMock = stubFetch({ ownedTopicPages: [{ uri: "tp1" }] });
        const res = await getMyTopicPages(newEr());
        expect(res).toEqual([{ uri: "tp1" }]);
        expect(urlOf(fetchMock)).toContain("/api/v1/user/getUserProfile");
    });

    it("loadTopicPage loads a topic page definition by uri", async () => {
        const fetchMock = stubFetch({ topicPage: { maxDaysBack: 14 } });
        const res = await loadTopicPage(newEr(), "tp-uri");
        expect(res).toMatchObject({ maxDaysBack: 14 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTopicPageJson", uri: "tp-uri" });
    });

    it("createTopicPage returns an unbound TopicPage builder", () => {
        const page = createTopicPage(newEr());
        expect(page).toBeInstanceOf(TopicPage);
    });
});

describe("helpers: analytics", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("annotateText forwards custom parameters to /api/v1/annotate", async () => {
        const fetchMock = stubFetch({ entities: [] });
        await annotateText(newEr(), "hello world", ["eng"], { articleId: "a1" });
        expect(urlOf(fetchMock)).toContain("/api/v1/annotate");
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello world", lang: ["eng"], articleId: "a1" });
    });

    it("categorizeText posts text/taxonomy to /api/v1/categorize", async () => {
        const fetchMock = stubFetch({ categories: [] });
        await categorizeText(newEr(), "hello world", "news");
        expect(urlOf(fetchMock)).toContain("/api/v1/categorize");
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello world", taxonomy: "news" });
    });

    it("analyzeSentiment forwards all options to /api/v1/sentiment", async () => {
        const fetchMock = stubFetch({ avgSent: 0.1 });
        await analyzeSentiment(newEr(), "hello world", "rnn", 3, false);
        expect(urlOf(fetchMock)).toContain("/api/v1/sentiment");
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello world", method: "rnn", sentences: 3, returnSentences: false });
    });

    it("semanticSimilarity posts text1/text2 to /api/v1/semanticSimilarity", async () => {
        const fetchMock = stubFetch({ similarity: 0.5 });
        await semanticSimilarity(newEr(), "a", "b");
        expect(urlOf(fetchMock)).toContain("/api/v1/semanticSimilarity");
        expect(bodyOf(fetchMock)).toMatchObject({ text1: "a", text2: "b", distanceMeasure: "cosine" });
    });

    it("detectLanguage posts text to /api/v1/detectLanguage", async () => {
        const fetchMock = stubFetch({ language: "eng" });
        expect(detectLanguageExport).toBe(detectLanguage);
        await detectLanguage(newEr(), "hello world");
        expect(urlOf(fetchMock)).toContain("/api/v1/detectLanguage");
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello world" });
    });

    it("extractArticleInfo forwards proxy, headers, and cookies", async () => {
        const fetchMock = stubFetch({ title: "t" });
        await extractArticleInfo(
            newEr(),
            "https://example.com/a",
            "http://proxy.example",
            { "x-proxy-header": "header-value" },
            { session: "cookie-value" }
        );
        expect(urlOf(fetchMock)).toContain("/api/v1/extractArticleInfo");
        expect(bodyOf(fetchMock)).toMatchObject({ url: "https://example.com/a", proxyUrl: "http://proxy.example" });
        expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
            "x-proxy-header": "header-value",
            Cookie: "session=cookie-value;"
        });
    });

    it("ner posts text to /api/v1/ner", async () => {
        const fetchMock = stubFetch({ entities: [] });
        await ner(newEr(), "hello world");
        expect(urlOf(fetchMock)).toContain("/api/v1/ner");
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello world" });
    });

    it("trainTopicOnTweets posts arguments to /api/v1/trainTopicOnTwitter", async () => {
        const fetchMock = stubFetch({ uri: "topic-1" });
        await trainTopicOnTweets(newEr(), "#news", { maxTweets: 5 });
        expect(urlOf(fetchMock)).toContain("/api/v1/trainTopicOnTwitter");
        expect(bodyOf(fetchMock)).toMatchObject({ twitterQuery: "#news", maxTweets: 5 });
    });

    it("train topic helpers post their action to /api/v1/trainTopic", async () => {
        const fetchMock = stubFetch({ uri: "topic-1" });
        const er = newEr();
        await trainTopicCreateTopic(er, "topic");
        await trainTopicClearTopic(er, "topic-1");
        await trainTopicAddDocument(er, "topic-1", "document");
        await trainTopicGetTrainedTopic(er, "topic-1", { maxConcepts: 2 });
        expect(urlOf(fetchMock, 0)).toContain("/api/v1/trainTopic");
        expect(bodyOf(fetchMock, 0)).toMatchObject({ action: "createTopic", name: "topic" });
        expect(bodyOf(fetchMock, 1)).toMatchObject({ action: "clearTopic", uri: "topic-1" });
        expect(bodyOf(fetchMock, 2)).toMatchObject({ action: "addDocument", uri: "topic-1", text: "document" });
        expect(bodyOf(fetchMock, 3)).toMatchObject({ action: "getTrainedTopic", uri: "topic-1", maxConcepts: 2 });
    });
});

describe("helpers: eventForText", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("getEventForText posts text/lang/topClustersCount and returns topStories", async () => {
        const fetchMock = stubFetch({ topStories: [{ eventUri: "e1", cosSim: 0.5 }] });
        const res = await getEventForText(newEr(), "some text", "eng", 3);
        expect(res).toEqual([{ eventUri: "e1", cosSim: 0.5 }]);
        expect(bodyOf(fetchMock)).toMatchObject({ lang: "eng", text: "some text", topClustersCount: 3 });
    });
});

describe("helpers: remaining uri resolution", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("conceptUri resolves the first suggested concept uri", async () => {
        stubFetch([{ uri: "http://concept/1" }]);
        await expect(conceptUri(newEr(), "Obama")).resolves.toBe("http://concept/1");
    });

    it("conceptUri throws when no concept matches", async () => {
        stubFetch([]);
        await expect(conceptUri(newEr(), "unknown-thing")).rejects.toThrow(/No concept uri found/);
    });

    it("categoryUri resolves the first suggested category uri", async () => {
        stubFetch([{ uri: "dmoz/Business" }]);
        await expect(categoryUri(newEr(), "Business")).resolves.toBe("dmoz/Business");
    });

    it("categoryUri throws when no category matches", async () => {
        stubFetch([]);
        await expect(categoryUri(newEr(), "unknown")).rejects.toThrow(/No category uri found/);
    });

    it("sourceUri resolves the first suggested source uri", async () => {
        stubFetch([{ uri: "bbc.com" }]);
        await expect(sourceUri(newEr(), "bbc")).resolves.toBe("bbc.com");
    });

    it("sourceUri throws when no source matches", async () => {
        stubFetch([]);
        await expect(sourceUri(newEr(), "unknown")).rejects.toThrow(/No source uri found/);
    });

    it("sourceGroupUri resolves the first suggested source group uri", async () => {
        stubFetch([{ uri: "sg1" }]);
        await expect(sourceGroupUri(newEr(), "top sources")).resolves.toBe("sg1");
    });

    it("sourceGroupUri throws when no source group matches", async () => {
        stubFetch([]);
        await expect(sourceGroupUri(newEr(), "unknown")).rejects.toThrow(/No source group uri found/);
    });

    it("locationUri resolves the first suggested location wikiUri", async () => {
        stubFetch([{ wikiUri: "http://loc/1", type: "place" }]);
        await expect(locationUri(newEr(), "London")).resolves.toBe("http://loc/1");
    });

    it("locationUri throws when no location matches", async () => {
        stubFetch([]);
        await expect(locationUri(newEr(), "unknown")).rejects.toThrow(/No location uri found/);
    });

    it("eventTypeUri resolves the first suggested event type uri", async () => {
        stubFetch([{ uri: "et1" }]);
        await expect(eventTypeUri(newEr(), "merger")).resolves.toBe("et1");
    });

    it("eventTypeUri throws when no event type matches", async () => {
        stubFetch([]);
        await expect(eventTypeUri(newEr(), "unknown")).rejects.toThrow(/No event type uri found/);
    });

    it("conceptClassUri resolves the first suggested concept class uri", async () => {
        stubFetch([{ uri: "cc1" }]);
        await expect(conceptClassUri(newEr(), "person")).resolves.toBe("cc1");
    });

    it("conceptClassUri throws when no concept class matches", async () => {
        stubFetch([]);
        await expect(conceptClassUri(newEr(), "unknown")).rejects.toThrow(/No concept class uri found/);
    });

    it("authorUri resolves the first suggested author uri", async () => {
        stubFetch([{ uri: "au1" }]);
        await expect(authorUri(newEr(), "john doe")).resolves.toBe("au1");
    });

    it("authorUri throws when no author matches", async () => {
        stubFetch([]);
        await expect(authorUri(newEr(), "unknown")).rejects.toThrow(/No author uri found/);
    });
});

describe("fluent namespaces: topic pages, analytics, event-for-text, uris", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("er.topicPages.mine()", async () => {
        stubFetch({ ownedTopicPages: [{ uri: "tp1" }] });
        const er = newEr();
        await expect(er.topicPages.mine()).resolves.toEqual([{ uri: "tp1" }]);
    });

    it("er.topicPages.load()", async () => {
        const fetchMock = stubFetch({ topicPage: { maxDaysBack: 5 } });
        const er = newEr();
        const page = await er.topicPages.load("tp-uri");
        expect(page).toMatchObject({ maxDaysBack: 5 });
        expect(bodyOf(fetchMock)).toMatchObject({ action: "getTopicPageJson", uri: "tp-uri" });
    });

    it("er.topicPages.create()", () => {
        const er = newEr();
        expect(er.topicPages.create()).toBeInstanceOf(TopicPage);
    });

    it("er.analytics.annotate() forwards custom parameters", async () => {
        const fetchMock = stubFetch({ entities: [] });
        const er = newEr();
        await er.analytics.annotate("hello", ["eng"], { articleId: "a1" });
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello", lang: ["eng"], articleId: "a1" });
    });

    it("er.analytics.sentiment() forwards all options", async () => {
        const fetchMock = stubFetch({ avgSent: 0.2 });
        const er = newEr();
        await er.analytics.sentiment("hello", "rnn", 3, false);
        expect(bodyOf(fetchMock)).toMatchObject({ text: "hello", method: "rnn", sentences: 3, returnSentences: false });
    });

    it("er.analytics.extractArticleInfo() forwards proxy, headers, and cookies", async () => {
        const fetchMock = stubFetch({ title: "t" });
        const er = newEr();
        await er.analytics.extractArticleInfo(
            "https://example.com/a",
            "http://proxy.example",
            { "x-proxy-header": "header-value" },
            { session: "cookie-value" }
        );
        expect(bodyOf(fetchMock)).toMatchObject({ url: "https://example.com/a", proxyUrl: "http://proxy.example" });
        expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
            "x-proxy-header": "header-value",
            Cookie: "session=cookie-value;"
        });
    });

    it("er.analytics exposes remaining Analytics methods", async () => {
        const fetchMock = stubFetch({ uri: "topic-1" });
        const er = newEr();
        await er.analytics.ner("hello");
        await er.analytics.trainTopicOnTweets("#news", { maxTweets: 5 });
        await er.analytics.trainTopicCreateTopic("topic");
        await er.analytics.trainTopicClearTopic("topic-1");
        await er.analytics.trainTopicAddDocument("topic-1", "document");
        await er.analytics.trainTopicGetTrainedTopic("topic-1", { maxConcepts: 2 });
        expect(urlOf(fetchMock, 0)).toContain("/api/v1/ner");
        expect(urlOf(fetchMock, 1)).toContain("/api/v1/trainTopicOnTwitter");
        expect(bodyOf(fetchMock, 2)).toMatchObject({ action: "createTopic" });
        expect(bodyOf(fetchMock, 3)).toMatchObject({ action: "clearTopic" });
        expect(bodyOf(fetchMock, 4)).toMatchObject({ action: "addDocument" });
        expect(bodyOf(fetchMock, 5)).toMatchObject({ action: "getTrainedTopic" });
    });

    it("er.eventForText()", async () => {
        const fetchMock = stubFetch({ topStories: [{ eventUri: "e1" }] });
        const er = newEr();
        const res = await er.eventForText("some text");
        expect(res).toEqual([{ eventUri: "e1" }]);
        expect(bodyOf(fetchMock)).toMatchObject({ lang: "eng", text: "some text", topClustersCount: 5 });
    });

    it("er.concepts.uri()", async () => {
        stubFetch([{ uri: "http://concept/1" }]);
        const er = newEr();
        await expect(er.concepts.uri("Obama")).resolves.toBe("http://concept/1");
    });

    it("er.categories.uri()", async () => {
        stubFetch([{ uri: "dmoz/Business" }]);
        const er = newEr();
        await expect(er.categories.uri("Business")).resolves.toBe("dmoz/Business");
    });

    it("er.sources.uri()", async () => {
        stubFetch([{ uri: "bbc.com" }]);
        const er = newEr();
        await expect(er.sources.uri("bbc")).resolves.toBe("bbc.com");
    });

    it("er.sources.groupUri()", async () => {
        stubFetch([{ uri: "sg1" }]);
        const er = newEr();
        await expect(er.sources.groupUri("top sources")).resolves.toBe("sg1");
    });

    it("er.locations.uri()", async () => {
        stubFetch([{ wikiUri: "http://loc/1", type: "place" }]);
        const er = newEr();
        await expect(er.locations.uri("London")).resolves.toBe("http://loc/1");
    });

    it("er.eventTypes.uri()", async () => {
        stubFetch([{ uri: "et1" }]);
        const er = newEr();
        await expect(er.eventTypes.uri("merger")).resolves.toBe("et1");
    });

    it("er.conceptClasses.uri()", async () => {
        stubFetch([{ uri: "cc1" }]);
        const er = newEr();
        await expect(er.conceptClasses.uri("person")).resolves.toBe("cc1");
    });

    it("er.authors.uri()", async () => {
        stubFetch([{ uri: "au1" }]);
        const er = newEr();
        await expect(er.authors.uri("john doe")).resolves.toBe("au1");
    });
});
