import * as _ from "lodash";
import { QueryArticles, QueryEvents, RequestArticlesInfo, RequestEventsInfo } from "../../src";
import { Utils } from "./utils";

describe("Return Info", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    it("should have a valid article", async (done) => {
        const q = new QueryArticles({keywords: "Obama", requestedResult: new RequestArticlesInfo({returnInfo: utils.returnInfo})});
        const response = await er.execQuery(q);
        const articles = _.get(response, "articles.results", []);
        for (const article of articles) {
            expect(article).toBeValidArticle();
        }
        done();
    });

    it("should have a valid event", async (done) => {
        const q = new QueryEvents({keywords: "Trump", requestedResult: new RequestEventsInfo({returnInfo: utils.returnInfo})});
        const response = await er.execQuery(q);
        const events = _.get(response, "events.results", []);
        for (const event of events) {
            expect(event).toBeValidEvent();
        }
        done();
    });

    it("should have a valid concept", async (done) => {
        const conceptUri = await er.getConceptUri("Ljubljana");
        const conceptInfo = await er.getConceptInfo(conceptUri, utils.returnInfo);
        expect(conceptInfo[conceptUri]).toBeValidConcept();
        done();
    });
});
