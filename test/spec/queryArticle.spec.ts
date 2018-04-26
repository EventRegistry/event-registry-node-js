import * as _ from "lodash";
import {
    ArticleMapper,
    EventRegistry,
    QueryArticle,
    QueryArticles,
    RequestArticleInfo,
    RequestArticlesUriWgtList,
} from "../../src/index";
import { Utils } from "./utils";

xdescribe("Query Article", () => {
    const er = Utils.initAPI();
    const utils = new Utils();
    let query;

    beforeAll(async (done) => {
        const q = new QueryArticles({conceptUri: await er.getConceptUri("Obama")});
        const requestArticlesUriWgtList = new RequestArticlesUriWgtList({count: 10});
        q.setRequestedResult(requestArticlesUriWgtList);
        const response = await er.execQuery(q);
        query = new QueryArticle(EventRegistry.getUriFromUriWgt(_.get(response, "uriWgtList.results")));
        done();
    });

    it("should return articles", async (done) => {
        const requestArticleInfo = new RequestArticleInfo(utils.returnInfo);
        query.setRequestedResult(requestArticleInfo);
        const response = await er.execQuery(query);
        expect(_.size(response)).toBeGreaterThan(0, "Expected to get a list of more than 0 articles");
        _.each(response, (article) => {
            expect(article.info).toBeValidArticle();
        });
        const uris = _.map(response, (item) => _.get(item, "info.uri"));
        const urls = _.map(response, (item) => _.get(item, "info.url"));
        const uniqueUrls = _.uniq(urls);
        const mapper = new ArticleMapper(er);
        const mappedUris = await Promise.all(_.map(uniqueUrls, (url) => mapper.getArticleUri(url)));
        const q = new QueryArticle(_.compact(mappedUris));
        q.setRequestedResult(new RequestArticleInfo(utils.returnInfo));
        const res = await er.execQuery(q);
        _.each(res, (article) => {
            // it's possible that the article was removed from ER
            if (!_.has(article, "error")) {
                expect(article["info"]).toBeValidArticle();
            }
        });
        const q1 = new QueryArticle(uris);
        q1.setRequestedResult(new RequestArticleInfo(utils.returnInfo));
        const res1 = await er.execQuery(q1);
        expect(_.size(res1)).toBeGreaterThan(0, "Expected to get a list of more than 0 articles when searching by uris");
        _.each(res1, (article) => {
            // it's possible that the article was removed from ER
            if (!_.has(article, "error")) {
                expect(article["info"]).toBeValidArticle();
            }
        });
        done();
    });
});
