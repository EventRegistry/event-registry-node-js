import * as _ from "lodash";
import {
    CategoryInfoFlags,
    ConceptInfoFlags,
    GetCategoryInfo,
    GetConceptInfo,
    GetSourceInfo,
    ReturnInfo,
    SourceInfoFlags,
} from "../../src/index";
import { Utils } from "./utils";

describe("Info", () => {
    const er = Utils.initAPI();

    it("should return sources by uri", async (done) => {
        const sources = await er.suggestNewsSources("bbc", {count: 10});
        const sourceUriList = _.map(sources, "uri") as string[];
        const sourceInfoFlags = new SourceInfoFlags({title: true,
                                                     description: true,
                                                     location: true,
                                                     ranking: true,
                                                    });
        const returnInfo = new ReturnInfo({sourceInfo: sourceInfoFlags});
        const q = new GetSourceInfo({uriOrUriList: sourceUriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(sourceUriList), `Expected ${_.size(sourceUriList)} sources`);
        _.each(response, (item) => {
            // For some cases backend reports an error attached to a specific source (i.e. 'Provided uri is not valid')
            if (!_.has(item, "error")) {
                expect(_.has(item, "uri")).toBeTruthy(`Source uri is missing for ${JSON.stringify(item)}`);
                expect(_.has(item, "title")).toBeTruthy(`Source title is missing for ${JSON.stringify(item)}`);
                expect(_.has(item, "description")).toBeTruthy(`Source description is missing for ${JSON.stringify(item)}`);
                expect(_.has(item, "ranking")).toBeTruthy(`Source ranking is missing for ${JSON.stringify(item)}`);
            }
        });
        done();
    });

    it("should return concepts by uri", async (done) => {
        const concepts = await er.suggestConcepts("a", {count: 10});
        const uriList = _.map(concepts, "uri") as string[];
        const conceptInfoFlags = new ConceptInfoFlags({type: "wiki",
                                                       lang: ["deu", "slv"],
                                                       label: true,
                                                       synonyms: true,
                                                       image: true,
                                                       description: true,
                                                       trendingScore: true,
                                                      });
        const returnInfo = new ReturnInfo({conceptInfo: conceptInfoFlags});
        const q = new GetConceptInfo({uriOrUriList: uriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(uriList), `Expected ${_.size(uriList)} concepts`);
        _.each(response, (item) => {
            expect(_.has(item, "uri")).toBeTruthy("Concept uri is missing");
            expect(_.has(item, "type")).toBeTruthy("Concept type is missing");
            expect(_.has(item, "label")).toBeTruthy("Concept should have a label");
            expect(_.has(item, "label.deu")).toBeTruthy("Concept should have a label in german");
            expect(_.has(item, "label.slv")).toBeTruthy("Concept should have a label in slovene");
            expect(_.has(item, "description")).toBeTruthy("Concept should have a description");
            expect(_.has(item, "image")).toBeTruthy("Concept should have an image");
            expect(_.has(item, "synonyms")).toBeTruthy("Concept should have synonyms");
            expect(_.has(item, "trendingScore")).toBeTruthy("Concept should have trendingScore");
        });
        done();
    });

    it("should return categories", async (done) => {
        const categories = await er.suggestCategories("a", {count: 10});
        const uriList = _.map(categories, "uri") as string[];
        const categoryInfoFlags = new CategoryInfoFlags({ trendingScore: true });
        const returnInfo = new ReturnInfo({categoryInfo: categoryInfoFlags});
        const q = new GetCategoryInfo({uriOrUriList: uriList, returnInfo: returnInfo});
        const response = await er.execQuery(q);
        expect(_.size(response)).toBe(_.size(uriList), `Expected ${_.size(uriList)} categories`);
        _.each(response, (item) => {
            expect(_.has(item, "uri")).toBeTruthy("Category uri is missing");
            expect(_.has(item, "trendingScore")).toBeTruthy("Category trending score is missing");
        });
        done();
    });
});
