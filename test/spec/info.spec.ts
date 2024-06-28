import {
    CategoryInfoFlags,
    ConceptInfoFlags,
    ER,
    GetCategoryInfo,
    GetConceptInfo,
    GetSourceInfo,
    ReturnInfo,
    SourceInfoFlags,
} from "../../src/index";
import { Utils } from "./utils";

describe("Info", () => {
    const er = Utils.initAPI();

    it("should return sources by uri", async () => {
        const sources = await er.suggestNewsSources("bbc", {count: 10});
        const uriOrUriList = (sources as Record<string, string>[]).map((source) => source.uri) as string[];
        const sourceInfo = new SourceInfoFlags({title: true, description: true, location: true, ranking: true});
        const returnInfo = new ReturnInfo({sourceInfo});
        const q = new GetSourceInfo({uriOrUriList, returnInfo});
        const response = await er.execQuery(q) as unknown as ER.Response<Record<string, Record<string, unknown>>>;
        expect(Object.keys(response).length).toBe(uriOrUriList.length);
        for (const item of Object.values(response)) {
            expect(item.hasOwnProperty("uri")).toBeTruthy();
            expect(item.hasOwnProperty("title")).toBeTruthy();
            expect(item.hasOwnProperty("description")).toBeTruthy();
            expect(item.hasOwnProperty("ranking")).toBeTruthy();
        }
    });

    it("should return concepts by uri", async () => {
        const concepts = await er.suggestConcepts("a", {count: 10});
        const uriOrUriList = (concepts as Record<string, string>[]).map((concept) => concept.uri) as string[];
        const conceptInfo = new ConceptInfoFlags(
            {
                type: "wiki",
                lang: ["deu", "slv"],
                label: true,
                synonyms: true,
                image: true,
                description: true,
                trendingScore: true,
            }
        );
        const returnInfo = new ReturnInfo({conceptInfo});
        const q = new GetConceptInfo({uriOrUriList, returnInfo});
        const response = await er.execQuery(q) as unknown as Record<string, unknown>[];
        expect(Object.keys(response).length).toBe(uriOrUriList.length);
        for (const item of Object.values(response)) {
            expect(item.hasOwnProperty("uri")).toBeTruthy();
            expect(item.hasOwnProperty("type")).toBeTruthy();
            expect(item.hasOwnProperty("label")).toBeTruthy();
            expect(item?.label.hasOwnProperty("deu")).toBeTruthy();
            expect(item?.label.hasOwnProperty("slv")).toBeTruthy();
            expect(item.hasOwnProperty("description")).toBeTruthy();
            expect(item.hasOwnProperty("image")).toBeTruthy();
            expect(item.hasOwnProperty("synonyms")).toBeTruthy();
            expect(item.hasOwnProperty("trendingScore")).toBeTruthy();
        }
    });

    it("should return categories", async () => {
        const categories = await er.suggestCategories("a", {count: 10}) as Record<string, string>[];
        const uriOrUriList = categories.map((category) => category.uri);
        const categoryInfo = new CategoryInfoFlags({ trendingScore: true });
        const returnInfo = new ReturnInfo({categoryInfo});
        const q = new GetCategoryInfo({uriOrUriList, returnInfo});
        const response = await er.execQuery(q) as unknown as Record<string, unknown>[];
        expect(Object.keys(response).length).toBe(uriOrUriList.length);
        for (const item of Object.values(response)) {
            if (item.hasOwnProperty("error")) break;
            expect(item.hasOwnProperty("uri")).toBeTruthy();
            expect(item.hasOwnProperty("trendingScore")).toBeTruthy();
        }
    });
});
