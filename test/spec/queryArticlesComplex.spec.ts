import * as _ from "lodash";
import {
    ArticleInfoFlags,
    ArticleMapper,
    BaseQuery,
    CombinedQuery,
    ComplexArticleQuery,
    QueryArticle,
    QueryArticles,
    QueryArticlesIter,
    QueryItems,
    RequestArticleInfo,
    ReturnInfo,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Articles Complex", () => {
    const er = Utils.initAPI();
    const utils = new Utils();

    it("should test keywords (1)", (done) => {
        const baseQuery = new BaseQuery({keyword: "obama", keywordLoc: "title"});
        const cq1 = new ComplexArticleQuery(baseQuery);
        const artIter = QueryArticlesIter.initWithComplexQuery(er, cq1, {maxItems: 2000});
        artIter.execQuery((items) => {
            _.each(items, (item) => {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("obama");
            });
        }, () => {
            done();
        });
    });

    it("should test keywords (2)", (done) => {
        const qStr = `
        {
            "$query": {
                "keyword": "obama", "keywordLoc": "title"
            }
        }
        `;
        const artIter = QueryArticlesIter.initWithComplexQuery(er, qStr, { maxItems: 2000 });
        artIter.execQuery((items) => {
            _.each(items, (item) => {
                expect(_.deburr(_.toLower(_.get(item, "title")))).toContain("obama");
            });
        }, () => {
            done();
        });
    });

    it("should test keywords (3)", (done) => {
        const baseQuery = new BaseQuery({keyword: "home", keywordLoc: "body"});
        const cq1 = new ComplexArticleQuery(baseQuery);
        const artIter = QueryArticlesIter.initWithComplexQuery(er, cq1, {returnInfo: utils.returnInfo, maxItems: 2000});
        artIter.execQuery((items, error) => {
            _.each(items, (item) => {
                expect(_.deburr(_.toLower(_.get(item, "body")))).toContain("home");
            });
        }, () => {
            done();
        });
    });

    it("should compare same results from keyword search (1)", async (done) => {
        const exclude = new BaseQuery({lang: QueryItems.OR(["eng", "deu"])});
        const baseQuery1 = new BaseQuery({keyword: QueryItems.AND(["obama", "trump"]), exclude });
        const cq1 = new ComplexArticleQuery(baseQuery1);
        const combinedQuery = CombinedQuery.AND([new BaseQuery({keyword: "obama"}), new BaseQuery({keyword: "trump"})], exclude);
        const cq2 = new ComplexArticleQuery(combinedQuery);

        const q = new QueryArticles({keywords: QueryItems.AND(["obama", "trump"]), ignoreLang: ["eng", "deu"]});

        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);

        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (2)", async (done) => {
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

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (3)", async (done) => {
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

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (4)", async (done) => {
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

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (5)", async (done) => {
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

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (6)", async (done) => {
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

        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        done();
    });

    it("should compare same results from keyword search (7)", async (done) => {
        const categoryUri = await er.getCategoryUri("Business");
        const cq1 = new ComplexArticleQuery(new BaseQuery({dateStart: "2016-03-05", dateEnd: "2017-03-06", exclude: new BaseQuery({categoryUri})}));
        const cq2 = new ComplexArticleQuery(CombinedQuery.AND([
            new BaseQuery({ dateStart: "2016-03-05", dateEnd: "2017-05-05" }),
            new BaseQuery({ dateStart: "2017-03-05" }),
            new BaseQuery({ dateStart: "2016-10-05" }),
            new BaseQuery({ dateEnd: "2017-04-05" }),
            new BaseQuery({ dateEnd: "2017-03-06" }),
        ], new BaseQuery({categoryUri: await er.getCategoryUri("Business")})));
        const q = new QueryArticles({dateStart: "2017-03-05", dateEnd: "2017-03-06", ignoreCategoryUri: categoryUri});
        const listRes1 = await utils.getArticlesQueryUriListForComplexQuery(er, cq1);
        const listRes2 = await utils.getArticlesQueryUriListForComplexQuery(er, cq2);
        const listRes3 = await utils.getQueryUriListForQueryArticles(er, q);
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes2, "totalResults"));
        expect(_.get(listRes1, "totalResults")).toEqual(_.get(listRes3, "totalResults"));
        done();
    });

    it("should get valid content", async (done) => {
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
        artIter.execQuery((items) => {
            _.each(items, (item) => {
                const hasConcept = _.find(_.get(item, "concepts", []), ({uri}) => uri === trumpUri);
                const hasCategory = _.find(_.get(item, "categories", []), ({uri}) => _.includes(uri, politicsUri));
                const hasDate = _.get(item, "date") === "2017-02-05";

                expect(hasConcept || hasCategory || hasDate).toBeTruthy(`Invalid article ${item.uri} that should not be in the results.`);

                _.each(_.get(item, "concepts", []), ({uri}) => {
                    expect(uri).not.toEqual(obamaUri);
                });
                expect(_.get(item, "date")).not.toEqual("2017-02-04");
            });
        }, () => {
            done();
        });
    });

});
