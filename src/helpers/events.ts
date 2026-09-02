import { EventRegistry } from "../eventRegistry";
import { QueryEvents, QueryEventsIter, RequestEventsInfo } from "../queryEvents";
import { QueryEvent, RequestEventInfo } from "../queryEvent";
import { ReturnInfo } from "../returnInfo";
import { ER } from "../types";
import { Data } from "../data";

/**
 * Build a `QueryEvents` + `RequestEventsInfo` and execute it in one call.
 */
export async function searchEvents(
    er: EventRegistry,
    args: Omit<ER.QueryEvents.Arguments, "requestedResult">
        & Pick<ER.QueryEvents.RequestEventsInfoArguments, "count" | "page" | "sortBy" | "sortByAsc" | "returnInfo"> = {}
): Promise<ER.Response> {
    const { count = 50, page, sortBy, sortByAsc, returnInfo, ...queryArgs } = args;
    const q = new QueryEvents(queryArgs);
    q.setRequestedResult(new RequestEventsInfo({ count, page, sortBy, sortByAsc, returnInfo }));
    return er.execQuery(q);
}

/**
 * Async-iterate over all matching events, paging automatically.
 */
export function iterateEvents(
    er: EventRegistry,
    args: ER.QueryEvents.IteratorArguments = {}
): AsyncIterable<Data.Event> {
    return new QueryEventsIter(er, args);
}

/**
 * Fetch a single event by uri. `returnInfo` matches `RequestEventInfo`'s constructor argument.
 */
export async function getEvent(
    er: EventRegistry,
    eventUri: string,
    args: { returnInfo?: ReturnInfo } = {}
): Promise<ER.Response> {
    const q = new QueryEvent(eventUri);
    q.setRequestedResult(args.returnInfo ? new RequestEventInfo(args.returnInfo) : new RequestEventInfo());
    return er.execQuery(q);
}
