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
        const cats = await analytics.categorize("Microsoft released a new version of Windows OS.");
        expect(cats).toHaveProperty("dmoz");
        const dmoz = _.get(cats, "dmoz");
        expect(dmoz).toHaveProperty("categories");
        expect(dmoz).toHaveProperty("keywords");
        const cat = _.first(_.get(dmoz, "categories"));
        expect(cat).toHaveProperty("label");
        expect(cat).toHaveProperty("score");
        const kw = _.first(_.get(dmoz, "keywords"));
        expect(kw).toHaveProperty("keyword");
        expect(kw).toHaveProperty("wgt");
        done();
    });

    it("should test language detection", async (done) => {
        const langInfo = await analytics.detectLanguage("Microsoft released a new version of Windows OS.");
        expect(langInfo).toHaveProperty("reliable");
        expect(langInfo).toHaveProperty("textBytes");
        expect(langInfo).toHaveProperty("languages");
        expect(langInfo).toHaveProperty("chunks");
        done();
    });
});
