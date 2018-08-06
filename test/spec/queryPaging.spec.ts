import * as _ from "lodash";
import { EventRegistry, QueryArticles, QueryArticlesIter, QueryEvents, QueryEventsIter, RequestArticlesInfo, RequestArticlesUriWgtList, RequestEventsInfo, RequestEventsUriWgtList } from "../../src";
import { Utils } from "./utils";

describe("Query Paging", () => {
    const er = Utils.initAPI();
    const utils = new Utils();

    it("should test paging uri 1", async (done) => {
        let uriList1 = [];
        const q1 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q1.setRequestedResult(new RequestArticlesUriWgtList({page: 1, count: 1000}));
        const response1 = await er.execQuery(q1);
        uriList1 = [ ...uriList1, ...EventRegistry.getUriFromUriWgt(_.get(response1, "uriWgtList.results", []))];

        const q2 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q2.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 1000}));
        const response2 = await er.execQuery(q2);
        uriList1 = [ ...uriList1, ...EventRegistry.getUriFromUriWgt(_.get(response2, "uriWgtList.results", []))];

        let uriList2 = [];
        const q3 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q3.setRequestedResult(new RequestArticlesUriWgtList({page: 2, count: 1000}));
        const response3 = await er.execQuery(q3);
        uriList2 = [ ...uriList2, ...EventRegistry.getUriFromUriWgt(_.get(response3, "uriWgtList.results", []))];

        const q4 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q4.setRequestedResult(new RequestArticlesUriWgtList({page: 1, count: 1000}));
        const response4 = await er.execQuery(q4);
        uriList2 = [ ...uriList2, ...EventRegistry.getUriFromUriWgt(_.get(response4, "uriWgtList.results", []))];

        uriList1 = _.sortBy(uriList1);
        uriList2 = _.sortBy(uriList2);
        expect(_.size(uriList1)).toEqual(_.size(uriList2));
        for (let i = 0; i < _.size(uriList1); i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
        done();
    });

    it("should test paging articles 1", async (done) => {
        let uriList1 = [];
        const q1 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q1.setRequestedResult(new RequestArticlesInfo({page: 1, count: 100}));
        const response1 = await er.execQuery(q1);
        uriList1 = [ ...uriList1, ..._.map(_.get(response1, "articles.results", []), "uri")];

        const q2 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q2.setRequestedResult(new RequestArticlesInfo({page: 2, count: 100}));
        const response2 = await er.execQuery(q2);
        uriList1 = [ ...uriList1, ..._.map(_.get(response2, "articles.results", []), "uri")];

        let uriList2 = [];
        const q3 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q3.setRequestedResult(new RequestArticlesInfo({page: 2, count: 100}));
        const response3 = await er.execQuery(q3);
        uriList2 = [ ...uriList2, ..._.map(_.get(response3, "articles.results", []), "uri")];

        const q4 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        q4.setRequestedResult(new RequestArticlesInfo({page: 1, count: 100}));
        const response4 = await er.execQuery(q4);
        uriList2 = [ ...uriList2, ..._.map(_.get(response4, "articles.results", []), "uri")];

        uriList1 = _.sortBy(uriList1);
        uriList2 = _.sortBy(uriList2);
        expect(_.size(uriList1)).toEqual(_.size(uriList2));
        for (let i = 0; i < _.size(uriList1); i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
        done();
    });

    it("should test all pages articles 1", async (done) => {
        const q1 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        let page1 = 1;
        let uriList1 = [];
        while (true) {
            q1.setRequestedResult(new RequestArticlesInfo({page: page1, count: 100}));
            const response = await er.execQuery(q1);
            const results = _.map(_.get(response, "articles.results", []), "uri");
            uriList1 = [...uriList1, results];
            page1 += 1;
            if (_.isEmpty(results)) {
                break;
            }
        }

        const q2 = new QueryArticles({ sourceUri: "bbc.co.uk" });
        let page2 = 1;
        let uriList2 = [];
        while (true) {
            q2.setRequestedResult(new RequestArticlesInfo({page: page2, count: 100}));
            const response = await er.execQuery(q2);
            const results = _.map(_.get(response, "articles.results", []), "uri");
            uriList2 = [...uriList2, results];
            page2 += 1;
            if (_.isEmpty(results)) {
                break;
            }
        }

        uriList1 = _.sortBy(uriList1);
        uriList2 = _.sortBy(uriList2);

        expect(_.size(uriList1)).toEqual(_.size(uriList2));
        for (let i = 0; i < _.size(uriList1); i++) {
            expect(uriList1[i]).toEqual(uriList2[i]);
        }
        done();
    });

    it("should test downloading of article pages", async (done) => {
        const iter = new QueryArticlesIter(er, { sourceUri: "bbc.co.uk" });
        const count = await iter.count();
        console.log(`Found ${count} articles`);
        let totArts1 = 0;
        let uriList1 = [];
        const pages1 = _.shuffle(_.range(1, _.ceil(count / 100) + 1));
        for (const page of pages1) {
            const q = new QueryArticles({ sourceUri: "bbc.co.uk" });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            expect(_.get(response, "articles.totalResults", -1)).toEqual(count);
            const articles = _.get(response, "articles.results", []);
            uriList1 = [...uriList1, ..._.map(articles, "uri")];
            expect(_.size(articles)).toBeLessThanOrEqual(100);
            totArts1 += _.size(articles);
        }
        expect(_.size(uriList1)).toEqual(count);
        expect(totArts1).toEqual(count);

        let totArts2 = 0;
        let uriList2 = [];
        const pages2 = _.range(1, _.ceil(count / 100) + 1);
        for (const page of pages2) {
            const q = new QueryArticles({ sourceUri: "bbc.co.uk" });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            expect(_.get(response, "articles.totalResults", -1)).toEqual(count);
            const articles = _.get(response, "articles.results", []);
            uriList2 = [...uriList2, ..._.map(articles, "uri")];
            expect(_.size(articles)).toBeLessThanOrEqual(100);
            totArts2 += _.size(articles);
        }
        expect(_.size(uriList2)).toEqual(count);
        expect(totArts2).toEqual(count);
        done();
    });

    it("should test downloading of article uris", async (done) => {
        const conceptUri = await er.getConceptUri("Trump");
        const iter = new QueryArticlesIter(er, { conceptUri });
        const count = await iter.count();
        console.log(`Found ${count} articles by uris\nDownloading page:`);
        let uriList1 = [];
        let totArts1 = 0;
        const pages1 = _.shuffle(_.range(1, _.ceil(count / 10000) + 1));
        for (const page of pages1) {
            console.log(`${page}, `);
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesUriWgtList({page: page, count: 10000}));
            const response = await er.execQuery(q);
            expect(_.get(response, "uriWgtList.totalResults", -1)).toEqual(count);
            const uriWgtList = _.get(response, "uriWgtList.results", []);
            uriList1 = [...uriList1, ..._.map(uriWgtList, (uriWgt) => _.first(_.split(uriWgt, ":")))];
            expect(_.size(uriWgtList)).toBeLessThanOrEqual(10000);
            totArts1 += _.size(uriWgtList);
        }
        expect(_.size(uriList1)).toEqual(count);
        expect(totArts1).toEqual(count);

        console.log(`Found ${count} articles by uris\nDownloading page:`);
        let uriList2 = [];
        let totArts2 = 0;
        const pages2 = _.range(1, _.ceil(count / 10000) + 1);
        for (const page of pages2) {
            console.log(`${page}, `);
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesUriWgtList({page: page, count: 10000}));
            const response = await er.execQuery(q);
            expect(_.get(response, "uriWgtList.totalResults", -1)).toEqual(count);
            const uriWgtList = _.get(response, "uriWgtList.results", []);
            uriList2 = [...uriList2, ..._.map(uriWgtList, (uriWgt) => _.first(_.split(uriWgt, ":")))];
            expect(_.size(uriWgtList)).toBeLessThanOrEqual(10000);
            totArts2 += _.size(uriWgtList);
        }
        expect(_.size(uriList2)).toEqual(count);
        expect(totArts2).toEqual(count);
        done();
    });

    it("should test downloading of articles", async (done) => {
        const conceptUri = await er.getConceptUri("peace");
        const iter = new QueryArticlesIter(er, { conceptUri });
        const count = await iter.count();
        console.log(`Found ${count} articles by uris\nDownloading page:`);
        let uriList1 = [];
        let totArts1 = 0;
        const pages1 = _.shuffle(_.range(1, _.ceil(count / 100) + 1));
        for (const page of pages1) {
            console.log(`${page}, `);
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            expect(_.get(response, "articles.totalResults", -1)).toEqual(count);
            const articles = _.get(response, "articles.results", []);
            uriList1 = [...uriList1, ..._.map(articles, "uri")];
            expect(_.size(articles)).toBeLessThanOrEqual(100);
            totArts1 += _.size(articles);
        }
        expect(_.size(uriList1)).toEqual(count);
        expect(totArts1).toEqual(count);

        console.log(`Found ${count} articles by uris\nDownloading page:`);
        let uriList2 = [];
        let totArts2 = 0;
        const pages2 = _.range(1, _.ceil(count / 100) + 1);
        for (const page of pages2) {
            console.log(`${page}, `);
            const q = new QueryArticles({ conceptUri });
            q.setRequestedResult(new RequestArticlesInfo({page: page, count: 100}));
            const response = await er.execQuery(q);
            expect(_.get(response, "articles.totalResults", -1)).toEqual(count);
            const articles = _.get(response, "articles.results", []);
            uriList2 = [...uriList2, ..._.map(articles, "uri")];
            expect(_.size(articles)).toBeLessThanOrEqual(100);
            totArts2 += _.size(articles);
        }
        expect(_.size(uriList2)).toEqual(count);
        expect(totArts2).toEqual(count);
        done();
    });

    it("should test downloading of event uris", async (done) => {
        const conceptUri = await er.getConceptUri("Trump");
        const iter = new QueryEventsIter(er, { conceptUri });
        const count = await iter.count();
        console.log(`Found ${count} events by uris\nDownloading page:`);
        let uriList1 = [];
        const pages1 = _.shuffle(_.range(1, _.ceil(count / 1000) + 1));
        for (const page of pages1) {
            console.log(`${page}, `);
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsUriWgtList({page: page, count: 1000}));
            const response = await er.execQuery(q);
            expect(_.get(response, "uriWgtList.totalResults", -1)).toEqual(count);
            const uriWgtList = _.get(response, "uriWgtList.results", []);
            uriList1 = [...uriList1, ..._.map(uriWgtList, (uriWgt) => _.first(_.split(uriWgt, ":")))];
            expect(_.size(uriWgtList)).toBeLessThanOrEqual(1000);
        }
        expect(_.size(uriList1)).toEqual(count);

        console.log(`Found ${count} events by uris\nDownloading page:`);
        let uriList2 = [];
        const pages2 = _.range(1, _.ceil(count / 1000) + 1);
        for (const page of pages2) {
            console.log(`${page}, `);
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsUriWgtList({page: page, count: 1000}));
            const response = await er.execQuery(q);
            expect(_.get(response, "uriWgtList.totalResults", -1)).toEqual(count);
            const uriWgtList = _.get(response, "uriWgtList.results", []);
            uriList2 = [...uriList2, ..._.map(uriWgtList, (uriWgt) => _.first(_.split(uriWgt, ":")))];
            expect(_.size(uriWgtList)).toBeLessThanOrEqual(1000);
        }
        expect(_.size(uriList2)).toEqual(count);
        done();
    });

    it("should test downloading of events", async (done) => {
        const conceptUri = await er.getConceptUri("peace");
        const iter = new QueryEventsIter(er, { conceptUri });
        const count = await iter.count();
        console.log(`Found ${count} events\nDownloading page:`);
        let uriList1 = [];
        const pages1 = _.shuffle(_.range(1, _.ceil(count / 50) + 1));
        for (const page of pages1) {
            console.log(`${page}, `);
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsInfo({page: page, count: 50}));
            const response = await er.execQuery(q);
            expect(_.get(response, "events.totalResults", -1)).toEqual(count);
            const events = _.get(response, "events.results", []);
            uriList1 = [...uriList1, ..._.map(events, "uri")];
            expect(_.size(events)).toBeLessThanOrEqual(50);
        }
        expect(_.size(uriList1)).toEqual(count);

        console.log(`Found ${count} events by uris\nDownloading page:`);
        let uriList2 = [];
        const pages2 = _.range(1, _.ceil(count / 50) + 1);
        for (const page of pages2) {
            console.log(`${page}, `);
            const q = new QueryEvents({ conceptUri });
            q.setRequestedResult(new RequestEventsInfo({page: page, count: 50}));
            const response = await er.execQuery(q);
            expect(_.get(response, "events.totalResults", -1)).toEqual(count);
            const events = _.get(response, "events.results", []);
            uriList2 = [...uriList2, ..._.map(events, "uri")];
            expect(_.size(events)).toBeLessThanOrEqual(50);
        }
        expect(_.size(uriList2)).toEqual(count);
        done();
    });

});
