import {
    ArticleInfoFlags,
    BaseQuery,
    CombinedQuery,
    ComplexArticleQuery,
    QueryArticles,
    QueryArticlesIter,
    QueryItems,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Articles Complex", () => {
    const er = Utils.initAPI();
    const utils = new Utils();

    it("should test keywords (1)", () => {
        const baseQuery = new BaseQuery({keyword: "obama", keywordLoc: "title"});
        const cq1 = new ComplexArticleQuery(baseQuery);
        const artIter = QueryArticlesIter.initWithComplexQuery(er, cq1, {maxItems: 2000});
        artIter.execQuery((item) => {
            expect(utils.normalize(item?.title ?? "")).toContain("obama");
        });
    });

    it("should test keywords (2)", () => {
        const qStr = `
        {
            "$query": {
                "keyword": "obama", "keywordLoc": "title"
            }
        }
        `;
        const artIter = QueryArticlesIter.initWithComplexQuery(er, qStr, { maxItems: 2000 });
        artIter.execQuery((item) => {
            expect(utils.normalize(item?.title ?? "")).toContain("obama");
        });
    });

    it("should test keywords (3)", () => {
        const baseQuery = new BaseQuery({keyword: "home", lang: "eng", keywordLoc: "body"});
        const cq1 = new ComplexArticleQuery(baseQuery);
        const artIter = QueryArticlesIter.initWithComplexQuery(er, cq1, {returnInfo: utils.returnInfo, maxItems: 20});
        artIter.execQuery((item) => {
            expect(utils.normalize(item?.body ?? "")).toContain("home");
        });
    });

    it("should compare same results from keyword search (1)", async () => {
        const exclude = new BaseQuery({lang: QueryItems.OR(["eng", "deu"])});
        const baseQuery1 = new BaseQuery({keyword: QueryItems.AND(["obama", "trump"]), exclude });
        const cq1 = new ComplexArticleQuery(baseQuery1);
        const combinedQuery = CombinedQuery.AND([new BaseQuery({keyword: "obama"}), new BaseQuery({keyword: "trump"})], exclude);
        const cq2 = new ComplexArticleQuery(combinedQuery);

        const q = new QueryArticles({keywords: QueryItems.AND(["obama", "trump"]), ignoreLang: ["eng", "deu"]});

        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);
        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
        expect(listRes1?.totalResults).toEqual(listRes3?.totalResults);
    });

    it("should compare same results from keyword search (2)", async () => {
        const obamaUri = await er.getConceptUri("obama");
        const bbcUri = await er.getNewsSourceUri("bbc");
        const apUri = await er.getNewsSourceUri("associated press");
        const exclude = new BaseQuery({conceptUri: QueryItems.OR([obamaUri])});

        const baseQuery1 = new BaseQuery({sourceUri: QueryItems.OR([bbcUri, apUri]), exclude });
        const cq1 = new ComplexArticleQuery(baseQuery1);

        const combinedQuery = CombinedQuery.OR([
            new BaseQuery({sourceUri: bbcUri}),
            new BaseQuery({sourceUri: apUri}),
        ], exclude);
        const cq2 = new ComplexArticleQuery(combinedQuery);

        const q = new QueryArticles({sourceUri: [bbcUri, apUri], ignoreConceptUri: obamaUri});

        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);

        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
        expect(listRes1?.totalResults).toEqual(listRes3?.totalResults);
    });

    it("should compare same results from keyword search (3)", async () => {
        const exclude = new BaseQuery({categoryUri: await er.getCategoryUri("Business")});
        const baseQuery1 = new BaseQuery({dateStart: "2017-03-05", dateEnd: "2017-03-06", exclude});
        const cq1 = new ComplexArticleQuery(baseQuery1);

        const combinedQuery = CombinedQuery.AND([
            new BaseQuery({dateStart: "2017-03-05"}),
            new BaseQuery({dateEnd: "2017-03-06"}),
        ], exclude);
        const cq2 = new ComplexArticleQuery(combinedQuery);

        const q = new QueryArticles({dateStart: "2017-03-05", dateEnd: "2017-03-06", ignoreCategoryUri: await er.getCategoryUri("business")});

        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);

        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
        expect(listRes1?.totalResults).toEqual(listRes3?.totalResults);
    });

    it("should compare same results from keyword search (4)", async () => {
        const businessUri = await er.getCategoryUri("Business");
        const qStr = `
        {
            "$query": {
                "dateStart": "2017-02-05", "dateEnd": "2017-02-06",
                "$not": {
                    "categoryUri": "${businessUri}"
                }
            }
        }
        `;
        const q1 = QueryArticles.initWithComplexQuery(qStr);

        const q = new QueryArticles({dateStart: "2017-02-05", dateEnd: "2017-02-06", ignoreCategoryUri: businessUri});

        const listRes1 = await utils.getQueryUriListForQueryArticles(er, q1);
        const listRes2 = await utils.getQueryUriListForQueryArticles(er, q);

        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
    });

    it("should compare same results from keyword search (5)", async () => {
        const trumpUri = await er.getConceptUri("Trump");
        const obamaUri = await er.getConceptUri("Obama");
        const politicsUri = await er.getCategoryUri("politics");
        const qStr = `
        {
            "$query": {
                "$or": [
                    { "dateStart": "2017-02-05", "dateEnd": "2017-02-05" },
                    { "conceptUri": "${trumpUri}" },
                    { "categoryUri": "${politicsUri}" }
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
        const q1 = QueryArticles.initWithComplexQuery(qStr);

        const cq2 = new ComplexArticleQuery(CombinedQuery.OR([
            new BaseQuery({ dateStart: "2017-02-05", dateEnd: "2017-02-05" }),
            new BaseQuery({ conceptUri: trumpUri }),
            new BaseQuery({ categoryUri: politicsUri }),
        ], CombinedQuery.OR([
            new BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
            new BaseQuery({ conceptUri: obamaUri }),
        ])));

        const listRes1 = await utils.getQueryUriListForQueryArticles(er, q1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
    });

    it("should compare same results from keyword search (6)", async () => {
        const trumpUri = await er.getConceptUri("Trump");
        const obamaUri = await er.getConceptUri("Obama");
        const politicsUri = await er.getCategoryUri("politics");
        const merkelUri = await er.getConceptUri("merkel");
        const businessUri = await er.getCategoryUri("business");
        const qStr = `
        {
            "$query": {
                "$or": [
                    { "dateStart": "2017-02-05", "dateEnd": "2017-02-05" },
                    { "dateStart": "2017-02-04", "dateEnd": "2017-02-04" },
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
        const q1 = QueryArticles.initWithComplexQuery(qStr);

        const cq2 = new ComplexArticleQuery(CombinedQuery.OR([
            new BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
            new BaseQuery({ conceptUri: trumpUri }),
            new BaseQuery({ categoryUri: politicsUri }),
            CombinedQuery.AND([
                new BaseQuery({conceptUri: merkelUri}),
                new BaseQuery({categoryUri: businessUri}),
                ]),
        ], CombinedQuery.OR([
            new BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
            new BaseQuery({ conceptUri: obamaUri }),
        ])));

        const listRes1 = await utils.getQueryUriListForQueryArticles(er, q1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
    });

    it("should compare same results from keyword search (7)", async () => {
        const categoryUri = await er.getCategoryUri("Business");
        const cq1 = new ComplexArticleQuery(new BaseQuery({dateStart: "2016-03-05", dateEnd: "2017-03-06", exclude: new BaseQuery({categoryUri})}));
        const cq2 = new ComplexArticleQuery(CombinedQuery.AND([
            new BaseQuery({ dateStart: "2016-03-05", dateEnd: "2017-05-05" }),
            new BaseQuery({ dateStart: "2016-10-05" }),
            new BaseQuery({ dateEnd: "2017-04-05" }),
            new BaseQuery({ dateEnd: "2017-03-06" }),
        ], new BaseQuery({categoryUri})));
        const q = new QueryArticles({dateStart: "2016-03-05", dateEnd: "2017-03-06", ignoreCategoryUri: categoryUri});
        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);
        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);
        expect(listRes1?.totalResults).toEqual(listRes2?.totalResults);
        expect(listRes1?.totalResults).toEqual(listRes3?.totalResults);
    });

    it("should get valid content", async () => {
        const trumpUri = await er.getConceptUri("Trump");
        const obamaUri = await er.getConceptUri("Obama");
        const politicsUri = await er.getCategoryUri("politics");

        const cq = new ComplexArticleQuery(
            CombinedQuery.OR([
                new BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-05" }),
                new BaseQuery({ conceptUri: trumpUri }),
                new BaseQuery({ categoryUri: politicsUri }),
            ],
                CombinedQuery.OR([
                    new BaseQuery({ dateStart: "2017-02-04", dateEnd: "2017-02-04" }),
                    new BaseQuery({ conceptUri: obamaUri }),
                ],
                ),
            ),
        );

        const returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({concepts: true, categories: true})});

        const artIter = QueryArticlesIter.initWithComplexQuery(er, cq, { returnInfo, maxItems: 50 }) as QueryArticlesIter;
        artIter.execQuery((item) => {
            const concepts = item?.concepts ?? [];
            const hasConcept = concepts.find(({ uri }) => uri === trumpUri);
            const categories = item?.categories ?? [];
            const hasCategory = categories.find(({uri}) => uri.includes(politicsUri));
            const hasDate = (item?.date ?? "") === "2017-02-05";

            expect(hasConcept || hasCategory || hasDate).toBeTruthy();
            for (const {uri} of concepts) {
                expect(uri).not.toEqual(obamaUri);
            }
            expect((item?.date ?? "")).not.toEqual("2017-02-04");
        });
    });

});
