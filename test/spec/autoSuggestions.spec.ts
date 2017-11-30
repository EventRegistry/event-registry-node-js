import { Utils } from "./utils";

describe("Auto Suggest", () => {
    const er = Utils.initAPI();

    it("should return suggestions for the provided concept", async (done) => {
        expect(await er.getConceptUri("Obama")).toContain("Barack_Obama");
        done();
    });
});
