import { Utils } from "./utils";
import { TopicPage, ReturnInfo, ArticleInfoFlags, ConceptInfoFlags, ER } from "../../src";

describe("Topic Page", () => {
    const er = Utils.initAPI();

    async function createTopicPage() {
        const q = new TopicPage(er);
        await q.loadTopicPageFromER("f8f08a9c-3609-401c-a1e4-2ec00f458795");
        return q;
    }

    it("should get articles for topic page", async () => {
        const q = await createTopicPage();
        const uris: Set<string> = new Set();
        for (const page of Array.from({length: 19}, (_, i) => i + 1)) {
            const response = await q.getArticles({ page: page, dataType: ["news", "blog"], sortBy: "rel" }) as ER.SuccessfulResponse<ER.Article>;
            let rel: number = Number.MAX_SAFE_INTEGER;
            const articles = (response?.articles?.results ?? []) as ER.Article[];
            for (const {uri, wgt} of articles) {
                expect(wgt).toBeLessThanOrEqual(rel);
                rel = wgt as number;
                expect(uris.has(uri as string)).toBeFalsy();
                uris.add(uri as string);
            }
        }
    });

    it("should get events for topic page", async () => {
        const q = await createTopicPage();
        const uris: Set<string> = new Set();
        for (const page of Array.from({length: 19}, (_, i) => i + 1)) {
            const response = await q.getEvents({page: page, sortBy: "rel"}) as ER.SuccessfulResponse<ER.Event>;
            let rel = Number.MAX_SAFE_INTEGER;
            const events = (response?.events?.results ?? []) as ER.Event[];
            for (const {uri, wgt} of events) {
                expect(wgt).toBeLessThanOrEqual(rel);
                rel = wgt;
                expect(uris.has(uri)).toBeFalsy();
                uris.add(uri);
            }
        }
    });

    it("should create a new topic page", async () => {
        const topic = new TopicPage(er);
        const appleUri = await er.getConceptUri("apple");
        const msoftUri = await er.getConceptUri("microsoft");
        const iphoneUri = await er.getConceptUri("iphone");
        const businessUri = await er.getCategoryUri("business");
        topic.addConcept(appleUri, 50);
        topic.addConcept(msoftUri, 50, {required: true});
        topic.addConcept(iphoneUri, 50, {excluded: true});
        topic.addCategory(businessUri, 50, {required: true});
        const articleInfo = new ArticleInfoFlags({concepts: true, categories: true});
        const conceptInfo = new ConceptInfoFlags({maxConceptsPerType: 500});
        const returnInfo = new ReturnInfo({articleInfo, conceptInfo});
        for (const page of Array.from({length: 9}, (_, i) => i + 1)) {
            const response = await topic.getArticles({ page, returnInfo }) as ER.SuccessfulResponse<ER.Article>;
            const articles = (response?.articles?.results ?? []) as ER.Article[];
            for (const article of articles) {
                const { concepts = [], categories = [] } = article;
                let foundConcept = false;
                let foundCategory = false;
                for (const { uri } of concepts) {
                    expect(uri).not.toBe(iphoneUri);
                    if (msoftUri === uri) {
                        foundConcept = true;
                    }
                }
                for (const { uri } of categories) {
                    if (uri.startsWith(businessUri)) {
                        foundCategory = true;
                    }
                }
                expect(foundConcept).toBeTruthy();
                expect(foundCategory).toBeTruthy();
            }
        }
    });


});
