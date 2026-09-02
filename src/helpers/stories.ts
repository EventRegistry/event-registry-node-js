import { EventRegistry } from "../eventRegistry";
import { QueryStory, RequestStory, RequestStoryInfo } from "../queryStory";
import { ER } from "../types";

/**
 * Build a `QueryStory` + result request and execute it in one call.
 */
export async function getStory(
    er: EventRegistry,
    storyUriOrList: string | string[],
    requestStory: RequestStory = new RequestStoryInfo()
): Promise<ER.Response> {
    const q = new QueryStory(storyUriOrList);
    q.setRequestedResult(requestStory);
    return er.execQuery(q);
}
