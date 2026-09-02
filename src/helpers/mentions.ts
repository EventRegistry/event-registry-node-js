import { EventRegistry } from "../eventRegistry";
import { QueryMentions, QueryMentionsIter, RequestMentionsInfo } from "../queryMentions";
import { ER } from "../types";

/**
 * Build a `QueryMentions` + `RequestMentionsInfo` and execute it in one call.
 */
export async function searchMentions(
    er: EventRegistry,
    args: Omit<ER.QueryMentions.Arguments, "requestedResult">
        & Pick<ER.QueryMentions.RequestMentionsInfoArguments, "count" | "page" | "sortBy" | "sortByAsc" | "returnInfo"> = {}
): Promise<ER.Response> {
    const { count = 100, page, sortBy, sortByAsc, returnInfo, ...queryArgs } = args;
    const q = new QueryMentions(queryArgs);
    q.setRequestedResult(new RequestMentionsInfo({ count, page, sortBy, sortByAsc, returnInfo }));
    return er.execQuery(q);
}

/**
 * Async-iterate over all matching mentions, paging automatically.
 */
export function iterateMentions(
    er: EventRegistry,
    args: ER.QueryMentions.IteratorArguments = {}
): AsyncIterable<Record<string, unknown>> {
    return new QueryMentionsIter(er, args);
}
