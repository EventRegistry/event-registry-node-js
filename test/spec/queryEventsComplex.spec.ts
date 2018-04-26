import * as _ from "lodash";
import {
    BaseQuery,
    CombinedQuery,
    ComplexEventQuery,
    ConceptInfoFlags,
    EventInfoFlags,
    QueryEvents,
    QueryEventsIter,
    QueryItems,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Events Complex", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let conceptUris;
    let sourceUris;
    let categoryUri;

    beforeAll(async (done) => {
        conceptUris = {
            obama: await er.getConceptUri("obama"),
            trump: await er.getConceptUri("trump"),
        };
        sourceUris = {
            bbc: await er.getNewsSourceUri("bbc"),
            ap: await er.getNewsSourceUri("associated press"),
        };

        categoryUri = await er.getCategoryUri("business");
        done();
    });

    it("should compare same results (1)", async (done) => {
        const cq1 = new ComplexEventQuery(new BaseQuery({
            conceptUri: QueryItems.AND(_.values(conceptUris)),
            exclude: new BaseQuery({ lang: QueryItems.OR(["eng", "deu"]) }),
        }));
        const cq2 = new ComplexEventQuery(CombinedQuery.AND([
            new BaseQuery({ conceptUri: conceptUris.obama }),
            new BaseQuery({ conceptUri: conceptUris.trump }),
        ], new BaseQuery({ lang: QueryItems.OR(["eng", "deu"]) })));

        const q = new QueryEvents({conceptUri: QueryItems.AND(_.values(conceptUris)), ignoreLang: ["eng", "deu"]});

        const listRes1 = await utils.getEventsQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getEventsQueryUriListForComplexQuery(er, cq2);
        const listRes3 = await utils.getQueryUriListForQueryEvents(er, q);
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results (2)", async (done) => {
        const cq1 = new ComplexEventQuery(new BaseQuery({
            sourceUri: QueryItems.OR(_.values(sourceUris)),
            exclude: new BaseQuery({ conceptUri: QueryItems.OR([conceptUris.obama]) }),
        }));
        const cq2 = new ComplexEventQuery(CombinedQuery.OR([
            new BaseQuery({ sourceUri: sourceUris.bbc }),
            new BaseQuery({ sourceUri: sourceUris.ap }),
        ], new BaseQuery({ conceptUri: QueryItems.OR([conceptUris.obama]) })));

        const q = new QueryEvents({sourceUri: _.values(sourceUris), ignoreConceptUri: conceptUris.obama});

        const listRes1 = await utils.getEventsQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getEventsQueryUriListForComplexQuery(er, cq2);
        const listRes3 = await utils.getQueryUriListForQueryEvents(er, q);

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results (3)", async (done) => {
        const cq1 = new ComplexEventQuery(new BaseQuery({
            dateStart: "2017-02-05",
            dateEnd: "2017-02-06",
            exclude: new BaseQuery({ categoryUri }),
        }));
        const cq2 = new ComplexEventQuery(CombinedQuery.AND([
            new BaseQuery({ dateStart: "2017-02-05" }),
            new BaseQuery({ dateEnd: "2017-02-06" }),
        ], new BaseQuery({ categoryUri })));

        const q = new QueryEvents({dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: categoryUri});

        const listRes1 = await utils.getEventsQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getEventsQueryUriListForComplexQuery(er, cq2);
        const listRes3 = await utils.getQueryUriListForQueryEvents(er, q);

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results (4)", async (done) => {
        const cq1 = QueryEvents.initWithComplexQuery(`
            {
                "$query": {
                    "dateStart": "2017-02-05", "dateEnd": "2017-02-06",
                    "$not": {
                        "categoryUri": "${categoryUri}"
                    }
                }
            }
        `);

        const q = new QueryEvents({dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: categoryUri});

        const listRes1 = await utils.getQueryUriListForQueryEvents(er, cq1);
        const listRes2 = await utils.getQueryUriListForQueryEvents(er, q);

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        done();
    });

    it("should compare same results (5)", async (done) => {
        const politicsUri = await er.getCategoryUri("politics");
        const cq1 = QueryEvents.initWithComplexQuery(`
        {
            "$query": {
                "$or": [
                    { "dateStart": "2017-02-05", "dateEnd": "2017-02-05" },
                    { "conceptUri": "${conceptUris.trump}" },
                    { "categoryUri": "${politicsUri}" }
                ],
                "$not": {
                    "$or": [
                        { "dateStart": "2017-02-04", "dateEnd": "2017-02-04" },
                        { "conceptUri": "${conceptUris.obama}" }
                    ]
                }
            }
        }
        `);

        const cq2 = new ComplexEventQuery(CombinedQuery.OR([
            new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-05"}),
            new BaseQuery({conceptUri: conceptUris.trump}),
            new BaseQuery({categoryUri: politicsUri}),
        ], CombinedQuery.OR([
            new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-04"}),
            new BaseQuery({conceptUri: conceptUris.obama}),
        ]),
        ));

        const listRes1 = await utils.getQueryUriListForQueryEvents(er, cq1);
        const listRes2 = await utils.getEventsQueryUriListForComplexQuery(er, cq2);

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        done();
    });

    it("should get valid content", async (done) => {
        const politicsUri = await er.getCategoryUri("politics");
        const cq = new ComplexEventQuery(CombinedQuery.OR([
            new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-05"}),
            new BaseQuery({conceptUri: conceptUris.trump}),
            new BaseQuery({categoryUri: politicsUri}),
        ], CombinedQuery.OR([
            new BaseQuery({dateStart: "2017-02-04", dateEnd: "2017-02-04"}),
            new BaseQuery({conceptUri: conceptUris.obama}),
        ]),
        ));
        const returnInfo = new ReturnInfo({
            eventInfo: new EventInfoFlags({concepts: true, categories: true, stories: true }),
            conceptInfo: new ConceptInfoFlags({maxConceptsPerType: 100}),
        });
        const iter = QueryEventsIter.initWithComplexQuery(er, cq, {returnInfo, maxItems: 50});
        iter.execQuery((items) => {
            _.each(items, (item) => {
                const hasConcept = _.find(_.get(item, "concepts", []), ({uri}) => uri === conceptUris.trump);
                const hasCategory = _.find(_.get(item, "categories", []), ({uri}) => _.includes(uri, politicsUri));
                const hasDate = _.get(item, "eventDate") === "2017-02-05";

                expect(hasConcept || hasCategory || hasDate).toBeTruthy(`Invalid article ${item.uri} that should not be in the results.`);

                _.each(_.get(item, "concepts", []), ({uri}) => {
                    expect(uri).not.toEqual(conceptUris.obama);
                });
                expect(_.get(item, "eventDate")).not.toEqual("2017-02-04");
            });
        }, () => {
            done();
        });
    });
});
