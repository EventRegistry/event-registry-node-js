import * as _ from "lodash";
import { Utils } from "./utils";
import { TopicPage, ReturnInfo, ArticleInfoFlags, ConceptInfoFlags } from "../../src";

describe("Topic Page", () => {
    const er = Utils.initAPI();

    async function createTopicPage() {
        const q = new TopicPage(er);
        await q.loadTopicPageFromER("df793a2e-615a-4630-8632-bb117e64886f");
        return q;
    }

    it("should get articles for topic page", async (done) => {
        const q = await createTopicPage();
        const uris: Set<string> = new Set();
        for (const page of _.range(1, 20)) {
            const response = await q.getArticles({page: page, dataType: ["news", "blog"], sortBy: "rel"})
            let rel = Number.MAX_SAFE_INTEGER;
            for (const {uri, wgt} of _.get(response, "articles.results", [])) {
                expect(wgt).toBeLessThanOrEqual(rel);
                rel = wgt;
                expect(uris.has(uri)).toBeFalsy();
                uris.add(uri);
            }
        }
        done();
    });

    it("should get events for topic page", async (done) => {
        const q = await createTopicPage();
        const uris: Set<string> = new Set();
        for (const page of _.range(1, 20)) {
            const response = await q.getEvents({page: page, sortBy: "rel"})
            let rel = Number.MAX_SAFE_INTEGER;
            for (const {uri, wgt} of _.get(response, "events.results", [])) {
                expect(wgt).toBeLessThanOrEqual(rel);
                rel = wgt;
                expect(uris.has(uri)).toBeFalsy();
                uris.add(uri);
            }
        }
        done();
    });

    it("should create a new topic page", async (done) => {
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
        for (const page of _.range(1, 10)) {
            const response = await topic.getArticles({page, returnInfo});
            for (const {concepts = [], categories = []} of _.get(response, "articles.results", [])) {
                let foundConcept = false;
                let foundCategory = false;
                for (const { uri } of concepts) {
                    expect(uri).not.toBe(iphoneUri, "Found iphone in the article");
                    if (msoftUri === uri) {
                        foundConcept = true;
                    }
                }
                for (const { uri } of categories) {
                    if (_.startsWith(uri, businessUri)) {
                        foundCategory = true;
                    }
                }
                expect(foundConcept).toBeTruthy("Article did not have a required concept");
                expect(foundCategory).toBeTruthy("Article did not have a required category");
            }
        }
        done();
    });


});
