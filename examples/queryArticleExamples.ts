import { ArticleInfoFlags, ArticleMapper, EventRegistry, QueryArticle, QueryArticles, RequestArticleInfo, RequestArticlesUriWgtList, ReturnInfo } from "eventregistry";
import * as _ from "lodash";

// examples that download information about the individual news articles

const er = new EventRegistry();

// search article by uri
const q1 = new QueryArticle("247634888");
er.execQuery(q1).then((response) => {
    console.info(response);
});

// search article by url
// use ArticleMapper to map article URL to the URI (id) that is used by ER internally
const artMapper = new ArticleMapper(er);
// artMapper.getArticleUri("http://www.bbc.co.uk/news/world-europe-31763789#sa-ns_mchannel%3Drss%26ns_source%3DPublicRSS20-sa")
artMapper.getArticleUri("http://www.mynet.com/haber/guncel/share-2058597-1").then((artUri) => {
    const q2 = new QueryArticle(artUri);
    // get all info about the specified article
    q2.setRequestedResult(new RequestArticleInfo());
    return er.execQuery(q2);
});

// do regular article search, obtain a list of resulting article URIs and then ask for details about these articles
// first search for articles related to Apple
er.getConceptUri("Apple").then((conceptUri) => {
    const q3 = new QueryArticles({conceptUri});
    q3.setRequestedResult(new RequestArticlesUriWgtList());
    return er.execQuery(q3);
}).then((response) => {
    // take the list of article URIs that match the search criteria (i.e. ['641565713', '641559021', '641551446', '641025492', '641548675', ...])
    const articleUriList = EventRegistry.getUriFromUriWgt(_.get(response, "uriWgtList.results", []));
    // take first 5 article URIs and ask for all details about these articles
    const queryUris = _.take(articleUriList, 5) as string[];
    const q4 = new QueryArticle(queryUris);
    const articleInfo = new ArticleInfoFlags({concepts: true, categories: true, location: true});
    const returnInfo = new ReturnInfo({articleInfo});
    const requestArticleInfo = new RequestArticleInfo(returnInfo);
    q4.setRequestedResult(requestArticleInfo);
    return er.execQuery(q4);
});
