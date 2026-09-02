import { pathToFileURL } from "node:url";
import { ArticleInfoFlags, ArticleMapper, EventRegistry, QueryArticle, QueryArticles, RequestArticleInfo, RequestArticlesUriWgtList, ReturnInfo } from "eventregistry";

// examples that download information about the individual news articles

const er = new EventRegistry();

async function main(): Promise<void> {
    const q1 = new QueryArticle("247634888");
    console.info(await er.execQuery(q1));

    const artMapper = new ArticleMapper(er);
    const artUri = await artMapper.getArticleUri("http://www.mynet.com/haber/guncel/share-2058597-1");
    if (typeof artUri === "string") {
        const q2 = new QueryArticle(artUri);
        q2.setRequestedResult(new RequestArticleInfo());
        console.info(await er.execQuery(q2));
    }

    const conceptUri = await er.getConceptUri("Apple");
    const q3 = new QueryArticles({conceptUri});
    q3.setRequestedResult(new RequestArticlesUriWgtList());
    const response = await er.execQuery(q3);
    const uriWgtResults = response?.uriWgtList?.results;
    const articleUriList = EventRegistry.getUriFromUriWgt(
        Array.isArray(uriWgtResults) ? uriWgtResults.filter((item): item is string => typeof item === "string") : []
    );
    const q4 = new QueryArticle(articleUriList.slice(0, 5));
    const articleInfo = new ArticleInfoFlags({concepts: true, categories: true, location: true});
    q4.setRequestedResult(new RequestArticleInfo(new ReturnInfo({articleInfo})));
    console.info(await er.execQuery(q4));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
