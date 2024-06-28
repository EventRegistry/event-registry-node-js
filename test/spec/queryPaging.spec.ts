import {
    ER,
    EventRegistry,
    QueryArticles,
    QueryArticlesIter,
    QueryEvents,
    QueryEventsIter,
    RequestArticlesInfo,
    RequestArticlesUriWgtList,
    RequestEventsInfo,
    RequestEventsUriWgtList
} from "../../src";
import { Utils } from "./utils";

const getUriList = (response: Record<string, ER.Results<ER.Article>>): string[] => (response.articles?.results ?? []).map((article) => article.uri) as string[];

const randommizePageRanges = (size: number, shuffle: boolean = false) => {
    const pages = Array.from({length: size}, (_, i) => i + 1);
    return shuffle ? pages.sort(() => Math.random() - 0.5) : pages;
}

describe("Query Paging", () => {
    const er = Utils.initAPI();
    const utils = new Utils();

    it("should test paging uri 1", async () => {
        let uriList1: string[] = [];
        const q1 = new QueryArticles({ sourceUri: "bbc.com" });
        q1.setRequestedResult(new RequestArticlesUriWgtList({page: 1, count: 1000}));
        const response1 = await er.execQuery(q1);
        uriList1 = [ ...uriList1, ...EventRegistry.getUriFromUriWgt((response1?.uriWgtList?.results ?? []) as string[])];

        const q2 = new QueryArticles({ sourceUri: "bbc.com" });
        q2.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 1000}));
        const response2 = await er.execQuery(q2);
        uriList1 = [ ...uriList1, ...EventRegistry.getUriFromUriWgt((response2?.uriWgtList?.results ?? []) as string[])];

        let uriList2: string[] = [];
        const q3 = new QueryArticles({ sourceUri: "bbc.com" });
        q3.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 1000}));
        const response3 = await er.execQuery(q3);
        uriList2 = [ ...uriList2, ...EventRegistry.getUriFromUriWgt((response3?.uriWgtList?.results ?? []) as string[])];

        const q4 = new QueryArticles({ sourceUri: "bbc.com" });
        q4.setRequestedResult(new RequestArticlesUriWgtList({page: 1, count: 1000}));
        const response4 = await er.execQuery(q4);
        uriList2 = [ ...uriList2, ...EventRegistry.getUriFromUriWgt((response4?.uriWgtList?.results ?? []) as string[])];

        uriList1.sort();
        uriList2.sort();
        expect(uriList1.length).toEqual(uriList2.length);
        for (let i = 0; i < uriList1.length; i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
    });

    it("should test paging articles 1", async () => {

        let uriList1: string[] = [];
        const q1 = new QueryArticles({ sourceUri: "bbc.com" });
        q1.setRequestedResult(new RequestArticlesInfo({page: 1, count: 100}));
        const response1 = await er.execQuery(q1) as Record<string, ER.Results<ER.Article>>;
        uriList1 = [ ...uriList1, ...getUriList(response1)];

        const q2 = new QueryArticles({ sourceUri: "bbc.com" });
        q2.setRequestedResult(new RequestArticlesInfo({page: 2, count: 100}));
        const response2 = await er.execQuery(q2) as Record<string, ER.Results<ER.Article>>;
        uriList1 = [ ...uriList1, ...getUriList(response2)];

        let uriList2: string[] = [];
        const q3 = new QueryArticles({ sourceUri: "bbc.com" });
        q3.setRequestedResult(new RequestArticlesInfo({page: 2, count: 100}));
        const response3 = await er.execQuery(q3) as Record<string, ER.Results<ER.Article>>;
        uriList2 = [ ...uriList2, ...getUriList(response3)];

        const q4 = new QueryArticles({ sourceUri: "bbc.com" });
        q4.setRequestedResult(new RequestArticlesInfo({page: 1, count: 100}));
        const response4 = await er.execQuery(q4) as Record<string, ER.Results<ER.Article>>;
        uriList2 = [ ...uriList2, ...getUriList(response4)];

        uriList1.sort();
        uriList2.sort();
        expect(uriList1.length).toEqual(uriList2.length);
        for (let i = 0; i < uriList1.length; i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
    });

    it("should test all pages articles 1", async () => {
        const q1 = new QueryArticles({ sourceUri: "bbc.com" });
        let page1 = 1;
        let uriList1: string[] = [];
        while (true) {
            q1.setRequestedResult(new RequestArticlesInfo({page: page1, count: 100}));
            const response = await er.execQuery(q1) as Record<string, ER.Results<ER.Article>>;
            const results = getUriList(response);
            uriList1 = [...uriList1, ...results];
            page1 += 1;
            if (results.length === 0) {
                break;
            }
        }

        const q2 = new QueryArticles({ sourceUri: "bbc.com" });
        let page2 = 1;
        let uriList2: string[] = [];
        while (true) {
            q2.setRequestedResult(new RequestArticlesInfo({page: page2, count: 100}));
            const response = await er.execQuery(q2) as Record<string, ER.Results<ER.Article>>;
            const results = getUriList(response);
            uriList2 = [...uriList2, ...results];
            page2 += 1;
            if (results.length === 0) {
                break;
            }
        }

        uriList1.sort();
        uriList2.sort();
        expect(uriList1.length).toEqual(uriList2.length);
        for (let i = 0; i < uriList1.length; i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
    });

    it("should test downloading of article pages", async () => {
        const iter = new QueryArticlesIter(er, { sourceUri: "bbc.com" });
        const count = await iter.count();
        let totArts1 = 0;
        let uriList1: string[] = [];
        const pages1 = randommizePageRanges(Math.ceil(count / 100) + 1, true);
        for (const page of pages1) {
            const q = new QueryArticles({ sourceUri: "bbc.com" });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            const totalResults = response?.articles?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const articles = (response?.articles?.results ?? []) as ER.Article[];
            uriList1 = [...uriList1, ...(articles.map((article) => article.uri) as string[])];
            expect(articles.length).toBeLessThanOrEqual(100);
            totArts1 += articles.length;
        }
        expect(uriList1.length).toEqual(count);
        expect(totArts1).toEqual(count);

        let totArts2 = 0;
        let uriList2: string[] = [];
        const pages2 = randommizePageRanges(Math.ceil(count / 100) + 1);
        for (const page of pages2) {
            const q = new QueryArticles({ sourceUri: "bbc.com" });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            const totalResults = response?.articles?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const articles = (response?.articles?.results ?? []) as ER.Article[];
            uriList2 = [...uriList2, ...(articles.map((article) => article.uri) as string[])];
            expect(articles.length).toBeLessThanOrEqual(100);
            totArts2 += articles.length;
        }
        expect(uriList2.length).toEqual(count);
        expect(totArts2).toEqual(count);
    });

    it("should test downloading of article uris", async () => {
        const conceptUri = await er.getConceptUri("Trump");
        const iter = new QueryArticlesIter(er, { conceptUri });
        const count = await iter.count();
        let uriList1: string[] = [];
        let totArts1 = 0;
        const pages1 = randommizePageRanges(Math.ceil(count / 10000) + 1, true);
        for (const page of pages1) {
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesUriWgtList({page: page, count: 10000}));
            const response = await er.execQuery(q);
            const totalResults = response?.uriWgtList?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const uriWgtList = (response?.uriWgtList?.results ?? []) as string[];
            uriList1 = [...uriList1, ...uriWgtList.map((uriWgt) => uriWgt.split(":")[0])];
            expect(uriWgtList.length).toBeLessThanOrEqual(10000);
            totArts1 += uriWgtList.length;
        }
        expect(uriList1.length).toEqual(count);
        expect(totArts1).toEqual(count);

        let uriList2: string[] = [];
        let totArts2 = 0;
        const pages2 = randommizePageRanges(Math.ceil(count / 10000) + 1);
        for (const page of pages2) {
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesUriWgtList({page: page, count: 10000}));
            const response = await er.execQuery(q);
            const totalResults = response?.uriWgtList?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const uriWgtList = (response?.uriWgtList?.results ?? []) as string[];
            uriList2 = [...uriList2, ...uriWgtList.map((uriWgt) => uriWgt.split(":")[0])];
            expect(uriWgtList.length).toBeLessThanOrEqual(10000);
            totArts2 += uriWgtList.length;
        }
        expect(uriList2.length).toEqual(count);
        expect(totArts2).toEqual(count);
    });

    describe("Downloading of articles", () => {
        let conceptUri: string;
        const lang: string = "ita";
        let count: number;

        beforeAll(async () => {
            conceptUri = await er.getConceptUri("Digital data");
            const iter = new QueryArticlesIter(er, { conceptUri, lang });
            count = await iter.count();
        });

        it("should test downloading of articles pt. 1", async () => {
            let uriList1: string[] = [];
            let totArts1 = 0;
            const pages1 = randommizePageRanges(Math.ceil(count / 100) + 1, true);
            for (const page of pages1) {
                const q = new QueryArticles({conceptUri, lang});
                q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
                const response = await er.execQuery(q);
                const totalResults = response?.articles?.totalResults ?? -1;
                expect(totalResults).toEqual(count);
                const articles = (response?.articles?.results ?? []) as ER.Article[];
                uriList1 = [...uriList1, ...(articles.map((article) => article.uri) as string[])];
                expect(articles.length).toBeLessThanOrEqual(100);
                totArts1 += articles.length;
            }
            expect(uriList1.length).toEqual(count);
            expect(totArts1).toEqual(count);
        });

        it("should test downloading of articles pt. 2", async () => {
            let uriList2: string[] = [];
            let totArts2 = 0;
            const pages2 = randommizePageRanges(Math.ceil(count / 100) + 1);
            for (const page of pages2) {
                const q = new QueryArticles({conceptUri, lang});
                q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
                const response = await er.execQuery(q);
                const totalResults = response?.articles?.totalResults ?? -1;
                expect(totalResults).toEqual(count);
                const articles = (response?.articles?.results ?? []) as ER.Article[];
                uriList2 = [...uriList2, ...(articles.map((article) => article.uri) as string[])];
                expect(articles.length).toBeLessThanOrEqual(100);
                totArts2 += articles.length;
            }
            expect(uriList2.length).toEqual(count);
            expect(totArts2).toEqual(count);
        });
    });

    it("should test downloading of event uris", async () => {
        const conceptUri = await er.getConceptUri("Trump");
        const iter = new QueryEventsIter(er, { conceptUri });
        const count = await iter.count();
        let uriList1: string[] = [];
        const pages1 = randommizePageRanges(Math.ceil(count / 1000) + 1, true);
        for (const page of pages1) {
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsUriWgtList({page: page, count: 1000}));
            const response = await er.execQuery(q);
            const totalResults = response?.uriWgtList?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const uriWgtList = (response?.uriWgtList?.results ?? []) as string[];
            uriList1 = [...uriList1, ...uriWgtList.map((uriWgt) => uriWgt.split(":")[0])];
            expect(uriWgtList.length).toBeLessThanOrEqual(1000);
        }
        expect(uriList1.length).toEqual(count);

        let uriList2: string[] = [];
        const pages2 = randommizePageRanges(Math.ceil(count / 1000) + 1);
        for (const page of pages2) {
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsUriWgtList({page: page, count: 1000}));
            const response = await er.execQuery(q);
            const totalResults = response?.uriWgtList?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const uriWgtList = (response?.uriWgtList?.results ?? []) as string[];
            uriList2 = [...uriList2, ...uriWgtList.map((uriWgt) => uriWgt.split(":")[0])];
            expect(uriWgtList.length).toBeLessThanOrEqual(1000);
        }
        expect(uriList2.length).toEqual(count);
    });

    it("should test downloading of events", async () => {
        const conceptUri = await er.getConceptUri("peace");
        const iter = new QueryEventsIter(er, { conceptUri });
        const count = await iter.count();
        let uriList1: string[] = [];
        const pages1 = randommizePageRanges(Math.ceil(count / 50) + 1, true);
        for (const page of pages1) {
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsInfo({page: page, count: 50}));
            const response = await er.execQuery(q);
            const totalResults = response?.events?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const events = (response?.events?.results ?? []) as ER.Event[];
            uriList1 = [...uriList1, ...events.map((event) => event.uri)];
            expect(events.length).toBeLessThanOrEqual(50);
        }
        expect(uriList1.length).toEqual(count);

        let uriList2: string[] = [];
        const pages2 = randommizePageRanges(Math.ceil(count / 50) + 1);
        for (const page of pages2) {
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsInfo({page: page, count: 50}));
            const response = await er.execQuery(q);
            const totalResults = response?.events?.totalResults ?? -1;
            expect(totalResults).toEqual(count);
            const events = (response?.events?.results ?? []) as ER.Event[];
            uriList2 = [...uriList2, ...events.map((event) => event.uri)];
            expect(events.length).toBeLessThanOrEqual(50);
        }
        expect(uriList2.length).toEqual(count);
    });

});
