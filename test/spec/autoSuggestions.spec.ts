import { Utils } from "./utils";

describe("Auto Suggest", () => {
    const er = Utils.initAPI();

    it("should return a concept", async () => {
        expect(await er.getConceptUri("Obama")).toContain("Barack_Obama");
    });

    it("should return a category", async () => {
        expect(await er.getCategoryUri("business")).toEqual("dmoz/Business");
        expect(await er.getCategoryUri("birding")).toEqual("dmoz/Recreation/Birding");
    });

    it("should return a news source", async () => {
        expect(await er.getNewsSourceUri("nytimes")).toEqual("nytimes.com");
        expect(await er.getNewsSourceUri("bbc")).toEqual("bbc.com");
    });

    // Highly dependant on the database used.
    xit("should return a pr source", async () => {
        expect(await er.getNewsSourceUri("Business Wire")).toEqual("businesswire.com");
        expect(await er.getNewsSourceUri("dailypolitical.com")).toEqual("dailypolitical.com");
    });

    // Highly dependant on the database used.
    xit("should return a blog source", async () => {
        expect(await er.getNewsSourceUri("topix.com")).toEqual("topix.com");
    });

    it("should return a source from the specified place", async () => {
        const sources = await er.suggestSourcesAtPlace(await er.getConceptUri("New York City")) as unknown[];
        expect(sources.length).toBeGreaterThan(0);
    });

    it("should return a location", async () => {
        const washingtonSuggestions = await er.suggestLocations("Washington");
        expect(washingtonSuggestions[0]?.wikiUri).toEqual("http://en.wikipedia.org/wiki/Washington_(state)");
        const londonSuggestions = await er.suggestLocations("London");
        expect(londonSuggestions[0]?.wikiUri).toEqual("http://en.wikipedia.org/wiki/London");
    });

    it("should return locations from the specified coordinates", async () => {
        const locations = await er.suggestLocationsAtCoordinate(38.893352, -77.093779, 300, {limitToCities: true}) as unknown[];
        expect(locations.length).toBeGreaterThan(0);
    });
});
