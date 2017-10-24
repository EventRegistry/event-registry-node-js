import { Utils } from "./utils";

describe("Auto Suggest", () => {
    const er = Utils.initAPI();

    fit("should return suggestions for the provided concept", async () => {
        expect(await er.getConceptUri("Obama")).toContain("Barack_Obama");
    });
});
