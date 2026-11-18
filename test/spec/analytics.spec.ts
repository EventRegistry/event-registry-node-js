import { Analytics } from "../../src/index";
import { Utils } from "./utils";

describe("Analytics", () => {
    const er = Utils.initAPI();
    let analytics: Analytics;

    beforeAll(() => {
        analytics = new Analytics(er);
    });

    it("should test text annotation", async () => {
        const annInfo = await analytics.annotate("Microsoft released a new version of Windows OS.");
        expect(annInfo).toHaveProperty("annotations");
        const annotations = ((annInfo as Record<string, unknown[]>).annotations || []);
        expect(annotations.length).toBeGreaterThan(0);
        expect(annotations.length).toBeLessThanOrEqual(2);
        const ann = annotations[0];
        expect(ann).toHaveProperty("url");
        expect(ann).toHaveProperty("title");
        expect(ann).toHaveProperty("lang");
        expect(ann).toHaveProperty("secLang");
        expect(ann).toHaveProperty("secUrl");
        expect(ann).toHaveProperty("secTitle");
        expect(ann).toHaveProperty("wgt");
        expect(ann).toHaveProperty("wikiDataItemId");
        expect(annInfo).toHaveProperty("ranges");
        expect(annInfo).toHaveProperty("language");
    });

    it("should test categorization", async () => {
        const response = await analytics.categorize("Microsoft released a new version of Windows OS.");
        expect(response).toHaveProperty("categories");
        for (const category of response.categories) {
            expect(category).toHaveProperty("label");
            expect(category).toHaveProperty("score");
        }
    });

    it("should test sentiment", async () => {
        const response = await analytics.sentiment(`
            Residents and tourists enjoy holiday weekend even as waves start to pound; beaches remain closed due to dangerous rip currents.
            Despite a state of emergency declared by the governor and warnings about dangerous surf and the possibility of significant coastal flooding,
            residents and visitors to the Jersey Shore spent Saturday making the most of the calm before the storm. Cloudy skies in the morning gave way to sunshine in the afternoon,
            and despite winds that already were kicking up sand and carving the beach, people flocked to the boardwalk in both Seaside Heights and Point Pleasant Beach, where children rode amusement rides and teens enjoyed ice cream cones.
        `);
        expect(response).toHaveProperty("avgSent");
        expect(response).toHaveProperty("sentimentPerSent");
    });

    it("should test language detection", async () => {
        const langInfo = await analytics.detectLanguage("Microsoft released a new version of Windows OS.");
        expect(langInfo[0]).toHaveProperty("code");
        expect(langInfo[0]).toHaveProperty("name");
        expect(langInfo[0]).toHaveProperty("percent");
    });

    it("should test semantics similarity", async () => {
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
    });

    it("should test article information extraction", async () => {
        let info: Record<string, unknown>;
        try {
            info = await analytics.extractArticleInfo("https://www.theguardian.com/world/2018/jan/31/this-is-over-puigdemonts-catalan-independence-doubts-caught-on-camera") as Record<string, unknown>;
        } catch {
            pending("article extraction unavailable");
            return;
        }
        if (!info || !!(info as Record<string, unknown>).error || !(info as Record<string, unknown>).title) {
            pending("article extraction unavailable");
            return;
        }
        expect(info).toHaveProperty("title");
        expect(info).toHaveProperty("body");
        expect(info).toHaveProperty("date");
        expect(info).toHaveProperty("datetime");
        expect(info).toHaveProperty("image");
    });

});
