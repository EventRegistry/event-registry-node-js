import { EventRegistry } from "../eventRegistry";
import { QueryArticles, QueryArticlesIter, RequestArticlesInfo } from "../queryArticles";
import { QueryArticle, RequestArticleInfo } from "../queryArticle";
import { ReturnInfo } from "../returnInfo";
import { ER } from "../types";
import { Data } from "../data";

/**
 * Build a `QueryArticles` + `RequestArticlesInfo` and execute it in one call.
 */
export async function searchArticles(
    er: EventRegistry,
    args: Omit<ER.QueryArticles.Arguments, "requestedResult"> & { count?: number; page?: number; sortBy?: string; sortByAsc?: boolean; returnInfo?: ReturnInfo } = {}
): Promise<ER.Response> {
    const { count = 100, page, sortBy, sortByAsc, returnInfo, ...queryArgs } = args;
    const q = new QueryArticles(queryArgs);
    q.setRequestedResult(new RequestArticlesInfo({ count, page, sortBy, sortByAsc, returnInfo }));
    return er.execQuery(q);
}

/**
 * Async-iterate over all matching articles, paging automatically.
 */
export function iterateArticles(
    er: EventRegistry,
    args: ER.QueryArticles.IteratorArguments = {}
): AsyncIterable<Data.Article> {
    return new QueryArticlesIter(er, args);
}

/**
 * Fetch a single article by uri. `returnInfo` matches `RequestArticleInfo`'s constructor argument.
 */
export async function getArticle(
    er: EventRegistry,
    articleUri: string,
    args: { returnInfo?: ReturnInfo } = {}
): Promise<ER.Response> {
    const q = new QueryArticle(articleUri);
    q.setRequestedResult(args.returnInfo ? new RequestArticleInfo(args.returnInfo) : new RequestArticleInfo());
    return er.execQuery(q);
}
