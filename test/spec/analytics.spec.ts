import * as _ from "lodash";
import { Analytics, sleep } from "../../src/index";
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

    it("should test article information extraction", async (done) => {
        const info = await analytics.extractArticleInfo("https://www.theguardian.com/world/2018/jan/31/this-is-over-puigdemonts-catalan-independence-doubts-caught-on-camera");
        expect(info).toHaveProperty("title");
        expect(info).toHaveProperty("body");
        expect(info).toHaveProperty("date");
        expect(info).toHaveProperty("datetime");
        expect(info).toHaveProperty("image");
        // there can be other additional properties available, depending on what is available in the article
        done();
    });

    it("should train topic", async (done) => {
        const response1 = await analytics.trainTopicCreateTopic("my topic");
        expect(response1).toHaveProperty("uri");
        const uri = response1["uri"];
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Facebook has removed 18 accounts and 52 pages associated with the Myanmar military, including the page of its commander-in-chief, after a UN report accused the armed forces of genocide and war crimes.");
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Emmanuel Macron’s climate commitment to “make this planet great again” has come under attack after his environment minister dramatically quit, saying the French president was not doing enough on climate and other environmental goals.");
        // tslint:disable-next-line:max-line-length
        await analytics.trainTopicAddDocument(uri, "Theresa May claimed that a no-deal Brexit “wouldn’t be the end of the world” as she sought to downplay a controversial warning made by Philip Hammond last week that it would cost £80bn in extra borrowing and inhibit long-term economic growth.");
        // finish training of the topic
        const response2 = await analytics.trainTopicFinishTraining(uri);
        expect(response2).toHaveProperty("topic");
        const topic1 = response2["topic"];
        expect(topic1).toHaveProperty("concepts");
        expect(_.size(_.get(topic1, "concepts", []))).toBeGreaterThan(0);
        expect(topic1).toHaveProperty("categories");
        expect(_.size(_.get(topic1, "categories", []))).toBeGreaterThan(0);
        // check that we can also get the topic later on
        const response3 = await analytics.trainTopicGetTrainedTopic(uri);
        expect(response3).toHaveProperty("topic");
        const topic2 = response3["topic"];
        expect(topic2).toHaveProperty("concepts");
        expect(_.size(_.get(topic2, "concepts", []))).toBeGreaterThan(0);
        expect(topic2).toHaveProperty("categories");
        expect(_.size(_.get(topic2, "categories", []))).toBeGreaterThan(0);
        done();
    });

    // TODO: Fails for no appearent reason.
    xit("should train topic on twitter", async (done) => {
        const response1 = await analytics.trainTopicOnTweets("@SeanEllis", {maxConcepts: 50, maxCategories: 20, maxTweets: 400});
        expect(response1).toHaveProperty("uri");
        const uri = response1["uri"];
        await sleep(5 * 1000);
        const response2 = await analytics.trainTopicGetTrainedTopic(uri);
        console.log(response2);
        expect(response2).toHaveProperty("topic");
        done();
    });

});
