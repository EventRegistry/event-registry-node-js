import { ER, QueryArticles, QueryEvents, RequestArticlesInfo, RequestEventsInfo } from "../../src";
import { Utils } from "./utils";

describe("Return Info", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    it("should have a valid article", async () => {
        const q = new QueryArticles({keywords: "Obama", requestedResult: new RequestArticlesInfo({returnInfo: utils.returnInfo})});
        const response = await er.execQuery(q) as ER.SuccessfulResponse<ER.Article>;
        const articles = (response?.articles?.results ?? []) as ER.Article[];
        for (const article of articles) {
            expect(article).toBeValidArticle();
        }
    });

    it("should have a valid event", async () => {
        const q = new QueryEvents({keywords: "Trump", requestedResult: new RequestEventsInfo({returnInfo: utils.returnInfo})});
        const response = await er.execQuery(q) as ER.SuccessfulResponse<ER.Event>;
        const events = (response?.events?.results ?? []) as ER.Event[];
        for (const event of events) {
            expect(event).toBeValidEvent();
        }
    });

    it("should have a valid concept", async () => {
        const conceptUri = await er.getConceptUri("Ljubljana");
        const conceptInfo = await er.getConceptInfo(conceptUri, utils.returnInfo) as Record<string, ER.Concept>;
        expect(conceptInfo[conceptUri]).toBeValidConcept();
    });
});
