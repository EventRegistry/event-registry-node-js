import {
    ArticleMapper,
    EventRegistry,
    ER,
    QueryArticle,
    QueryArticles,
    RequestArticleInfo,
    RequestArticlesUriWgtList,
} from "../../src/index";
import { Utils } from "./utils";

describe("Query Article", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query: QueryArticles;

    beforeAll(async () => {
        const q = new QueryArticles({conceptUri: await er.getConceptUri("Obama")});
        const requestArticlesUriWgtList = new RequestArticlesUriWgtList({count: 10});
        q.setRequestedResult(requestArticlesUriWgtList);
        const response = await er.execQuery(q);
        query = new QueryArticle(EventRegistry.getUriFromUriWgt(response?.uriWgtList?.results as string[]));
    });

    it("should return articles", async () => {
        const requestArticleInfo = new RequestArticleInfo(utils.returnInfo);
        query.setRequestedResult(requestArticleInfo);
        const response = await er.execQuery<Record<string, ER.Article>[]>(query) as Record<string, ER.Article>[];
        expect(Object.values(response).length).toBeGreaterThan(0);
        for (const article of Object.values(response)) {
            expect(article.info).toBeValidArticle();
        }
        const uris = Object.values(response).map((item) => item?.info?.uri) as string[];
        const urls = Object.values(response).map((item) => item?.info?.url) as string[];
        const uniqueUrls = [...(new Set(urls))] as string[];
        const mapper = new ArticleMapper(er);
        const mappedUris = await Promise.all(uniqueUrls.map((url) => mapper.getArticleUri(url)));
        if (mappedUris.filter(Boolean).length > 0) {
            const q = new QueryArticle(mappedUris.filter(Boolean));
            q.setRequestedResult(new RequestArticleInfo(utils.returnInfo));
            const res = await er.execQuery(q) as Record<string, ER.Article>[];
            for (const article of Object.values(res)) {
                // it's possible that the article was removed from ER
                if (!article?.error) {
                    expect(article["info"]).toBeValidArticle();
                }
            }
        }
        const q1 = new QueryArticle(uris);
        q1.setRequestedResult(new RequestArticleInfo(utils.returnInfo));
        const res1 = await er.execQuery(q1) as Record<string, ER.Article>[];
        expect(Object.values(res1).length).toBeGreaterThan(0);
        for (const article of Object.values(res1)) {
            // it's possible that the article was removed from ER
            if (!article?.error) {
                expect(article["info"]).toBeValidArticle();
            }
        }
    });
});
