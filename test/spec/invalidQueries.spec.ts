import * as _ from "lodash";
import { QueryArticles } from "../../src";
import { Utils } from "./utils";

describe("Invalid queries", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    it("should test produce an error on an invalid query", async (done) => {
        const trumpUri = await er.getConceptUri("Trump");
        const obamaUri = await er.getConceptUri("Obama");
        const politicsUri = await er.getCategoryUri("politics");
        const merkelUri = await er.getConceptUri("merkel");
        const businessUri = await er.getCategoryUri("business");

        const qStr1 = `
            {
                "$query": {
                    "$or": [
                        { "dateStart": "2017-02-05", "dateEnd": "2017-02-05" },
                        { "conceptUri": "${trumpUri}" },
                        { "categoryUri": "${politicsUri}" },
                        {
                            "$and": [
                                { "conceptUri": "${merkelUri}" },
                                { "categoryUri": "${businessUri}" }
                            ]
                        }
                    ],
                    "$not": {
                        "$or": [
                            { "dateStart": "2017-02-04", "dateEnd": "2017-02-04" },
                            { "conceptUri": "${obamaUri}" }
                        ]
                    }
                }
            }
        `;
        const q1 = QueryArticles.initWithComplexQuery(qStr1);
        const response1 = await er.execQuery(q1);
        expect(_.has(response1, "error")).toBeFalsy();

        const qStr2 = `
            {
                "$query": {
                    "$or": [
                        { "conceptUri": "${trumpUri}" },
                        { "categoryUri": "${politicsUri}" }
                    ],
                    "$not": {
                        "$or": [
                        ]
                    }
                }
            }
        `;
        const q2 = new QueryArticles();
        q2.setVal("query", qStr2);
        const response2 = await er.execQuery(q2);
        expect(_.has(response2, "error")).toBeTruthy();

        const qStr3 = `
            {
                "$query": {
                    "$or": [
                        { "conceptUri": "${trumpUri}" },
                        { "categoryUri": "${politicsUri}" }
                    ],
                    "$not": {
                    }
                }
            }
        `;
        const q3 = new QueryArticles();
        q3.setVal("query", qStr3);
        const response3 = await er.execQuery(q3);
        expect(_.has(response3, "error")).toBeTruthy();

        const qStr4 = `
            {
                "$query": {
                    "$aaaaor": [
                        { "conceptUri": "${trumpUri}" },
                        { "categoryUri": "${politicsUri}" }
                    ],
                    "$not": {
                    }
                }
            }
        `;
        const q4 = new QueryArticles();
        q4.setVal("query", qStr4);
        const response4 = await er.execQuery(q4);
        expect(_.has(response4, "error")).toBeTruthy();

        const qStr5 = `
            {
                "$query": {
                    "$and": [
                    ],
                    "$not": {
                    }
                }
            }
        `;
        const q5 = new QueryArticles();
        q5.setVal("query", qStr5);
        const response5 = await er.execQuery(q5);
        expect(_.has(response5, "error")).toBeTruthy();

        const qStr6 = `
            {
                "$query": {
                    "$and": [
                    ]
                }
            }
        `;
        const q6 = new QueryArticles();
        q6.setVal("query", qStr6);
        const response6 = await er.execQuery(q6);
        expect(_.has(response6, "error")).toBeTruthy();

        const qStr7 = `
            {
                "$query": {
                    "$and": {}
                }
            }
        `;
        const q7 = new QueryArticles();
        q7.setVal("query", qStr7);
        const response7 = await er.execQuery(q7);
        expect(_.has(response7, "error")).toBeTruthy();

        const qStr8 = `
            {
                "$query": {
                }
            }
        `;
        const q8 = new QueryArticles();
        q8.setVal("query", qStr8);
        const response8 = await er.execQuery(q8);
        expect(_.has(response8, "error")).toBeTruthy();
        done();
    });
});
