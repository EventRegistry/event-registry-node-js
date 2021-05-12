import * as _ from "lodash";
import { Utils } from "./utils";

describe("Auto Suggest", () => {
    const er = Utils.initAPI();

    it("should return a concept", async (done) => {
        expect(await er.getConceptUri("Obama")).toContain("Barack_Obama");
        done();
    });

    it("should return a category", async (done) => {
        expect(await er.getCategoryUri("business")).toEqual("dmoz/Business");
        expect(await er.getCategoryUri("birding")).toEqual("dmoz/Recreation/Birding");
        done();
    });

    it("should return a news source", async (done) => {
        expect(await er.getNewsSourceUri("nytimes")).toEqual("nytimes.com");
        expect(await er.getNewsSourceUri("bbc")).toEqual("bbc.co.uk");
        done();
    });

    // Highly dependant on the database used.
    xit("should return a pr source", async (done) => {
        expect(await er.getNewsSourceUri("Business Wire")).toEqual("businesswire.com");
        expect(await er.getNewsSourceUri("dailypolitical.com")).toEqual("dailypolitical.com");
        done();
    });

    // Highly dependant on the database used.
    xit("should return a blog source", async (done) => {
        expect(await er.getNewsSourceUri("topix.com")).toEqual("topix.com");
        done();
    });

    it("should return a source from the specified place", async (done) => {
        const sources = await er.suggestSourcesAtPlace(await er.getConceptUri("New York City"));
        expect(_.size(sources)).toBeGreaterThan(0);
        done();
    });

    it("should return a location", async (done) => {
        expect(_.get(_.first(await er.suggestLocations("Washington")), "wikiUri")).toEqual("http://en.wikipedia.org/wiki/Washington_(state)");
        expect(_.get(_.first(await er.suggestLocations("London")), "wikiUri")).toEqual("http://en.wikipedia.org/wiki/London");
        done();
    });

    it("should return locations from the specified coordinates", async (done) => {
        const locations = await er.suggestLocationsAtCoordinate(38.893352, -77.093779, 300, {limitToCities: true});
        expect(_.size(locations)).toBeGreaterThan(0);
        done();
    });
});
