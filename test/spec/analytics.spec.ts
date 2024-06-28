import { Analytics, ER, sleep } from "../../src/index";
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
        expect(((annInfo as Record<string, unknown[]>).annotations || []).length).toEqual(2);
        const ann = ((annInfo as Record<string, unknown[]>).annotations || [])[0];
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
        const info = await analytics.extractArticleInfo("https://www.theguardian.com/world/2018/jan/31/this-is-over-puigdemonts-catalan-independence-doubts-caught-on-camera");
        expect(info).toHaveProperty("title");
        expect(info).toHaveProperty("body");
        expect(info).toHaveProperty("date");
        expect(info).toHaveProperty("datetime");
        expect(info).toHaveProperty("image");
    });

    xit("should train topic", async () => {
        const response1 = await analytics.trainTopicCreateTopic("my topic2");
        if (response1?.error) {
            if (parseInt(response1.error?.response?.status ?? "0") >= 500) {
                console.error(response1.error?.message);
                return;
            }
        }
        expect(response1).toHaveProperty("uri");
        const uri = response1["uri"] as string;
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Facebook has removed 18 accounts and 52 pages associated with the Myanmar military, including the page of its commander-in-chief, after a UN report accused the armed forces of genocide and war crimes.");
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Emmanuel Macron’s climate commitment to “make this planet great again” has come under attack after his environment minister dramatically quit, saying the French president was not doing enough on climate and other environmental goals.");
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Theresa May claimed that a no-deal Brexit “wouldn’t be the end of the world” as she sought to downplay a controversial warning made by Philip Hammond last week that it would cost £80bn in extra borrowing and inhibit long-term economic growth.");
        // check that we can also get the topic later on
        const response3 = await analytics.trainTopicGetTrainedTopic(uri);
        if (response3?.error) {
            if (parseInt(response3.error?.response?.status ?? "0") >= 500) {
                console.error(response3.error?.message);
                return;
            }
        }
        expect(response3).toHaveProperty("topic");
        const topic2 = response3["topic"] as ER.TopicPage;
        expect(topic2).toHaveProperty("concepts");
        expect((topic2.concepts || []).length).toBeGreaterThan(0);
        expect(topic2).toHaveProperty("categories");
        expect((topic2.categories || []).length).toBeGreaterThan(0);
    });

    xit("should train topic on twitter", async () => {
        const response1 = await analytics.trainTopicOnTweets("@SeanEllis", {maxConcepts: 50, maxCategories: 20, maxTweets: 400});
        if (response1?.error) {
            if (parseInt(response1.error?.response?.status ?? "0") >= 500) {
                console.error(response1.error?.message);
                return;
            }
        }
        expect(response1).toHaveProperty("uri");
        const uri = response1["uri"] as string;
        await sleep(5 * 1000);
        const response2 = await analytics.trainTopicGetTrainedTopic(uri);
        if (response2?.error) {
            if (parseInt(response2.error?.response?.status ?? "0") >= 500) {
                console.error(response2.error?.message);
                return;
            }
        }
        expect(response2).toHaveProperty("topic");
    });

});
