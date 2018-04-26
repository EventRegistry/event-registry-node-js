import * as _ from "lodash";
import { Analytics } from "../../src/index";
import { Utils } from "./utils";

describe("Analytics", () => {
    const er = Utils.initAPI();
    let analytics;

    beforeAll(() => {
        analytics = new Analytics(er);
    });

    it("should test text annotation", async (done) => {
        const annInfo = await analytics.annotate("Microsoft released a new version of Windows OS.");
        expect(annInfo).toHaveProperty("annotations");
        expect(_.size(_.get(annInfo, "annotations"))).toEqual(2);
        const ann = _.first(_.get(annInfo, "annotations"));
        expect(ann).toHaveProperty("url");
        expect(ann).toHaveProperty("title");
        expect(ann).toHaveProperty("lang");
        expect(ann).toHaveProperty("secLang");
        expect(ann).toHaveProperty("secUrl");
        expect(ann).toHaveProperty("secTitle");
        expect(ann).toHaveProperty("wgt");
        expect(ann).toHaveProperty("wikiDataItemId");
        expect(annInfo).toHaveProperty("adverbs");
        expect(annInfo).toHaveProperty("adjectives");
        expect(annInfo).toHaveProperty("verbs");
        expect(annInfo).toHaveProperty("nouns");
        expect(annInfo).toHaveProperty("ranges");
        expect(annInfo).toHaveProperty("language");
        done();
    });

    it("should test categorization", async (done) => {
        const response = await analytics.categorize("Microsoft released a new version of Windows OS.");
        expect(response).toHaveProperty("categories");
        for (const category of response["categories"]) {
            expect(category).toHaveProperty("label");
            expect(category).toHaveProperty("score");
        }
        done();
    });

    it("should test sentiment", async (done) => {
        const response = await analytics.sentiment(`
            Residents and tourists enjoy holiday weekend even as waves start to pound; beaches remain closed due to dangerous rip currents.
            Despite a state of emergency declared by the governor and warnings about dangerous surf and the possibility of significant coastal flooding,
            residents and visitors to the Jersey Shore spent Saturday making the most of the calm before the storm. Cloudy skies in the morning gave way to sunshine in the afternoon,
            and despite winds that already were kicking up sand and carving the beach, people flocked to the boardwalk in both Seaside Heights and Point Pleasant Beach, where children rode amusement rides and teens enjoyed ice cream cones.
        `);
        expect(response).toHaveProperty("avgSent");
        expect(response).toHaveProperty("sentimentPerSent");
        done();
    });

    it("should test language detection", async (done) => {
        const langInfo = await analytics.detectLanguage("Microsoft released a new version of Windows OS.");
        expect(langInfo).toHaveProperty("languages");
        expect(langInfo["languages"][0]).toHaveProperty("code");
        expect(langInfo["languages"][0]).toHaveProperty("name");
        expect(langInfo["languages"][0]).toHaveProperty("percent");
        done();
    });

    it("should test semantics similarity", async (done) => {
        const doc1 = `
            The editor, Carrie Gracie, who joined the network 30 years ago, said she quit her position as China editor last week to protest pay inequality within the company.
            In the letter posted on her website, she said that she and other women had long suspected their male counterparts drew larger salaries and that BBC management had refused to acknowledge the problem.
        `;
        const doc2 = `
            Paukenschlag bei der britischen BBC: Die China-Expertin Carrie Gracie hat aus Protest gegen die illegale Gehaltskultur und damit verbundene Heimlichtuerei ihren Job bei dem öffentlich-rechtlichen Sender hingeworfen.
            Zwei ihrer männlichen Kollegen in vergleichbaren Positionen würden nachweislich wesentlich besser bezahlt.
        `;
        const info = await analytics.semanticSimilarity(doc1, doc2);
        expect(info).toHaveProperty("similarity");
        done();
    });

    it("should test semantics similarity", async (done) => {
        const info = await analytics.extractArticleInfo("https://www.theguardian.com/world/2018/jan/31/this-is-over-puigdemonts-catalan-independence-doubts-caught-on-camera");
        expect(info).toHaveProperty("title");
        expect(info).toHaveProperty("body");
        expect(info).toHaveProperty("date");
        expect(info).toHaveProperty("datetime");
        expect(info).toHaveProperty("image");
        // there can be other additional properties available, depending on what is available in the article
        done();
    });


});
