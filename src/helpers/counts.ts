import { EventRegistry } from "../eventRegistry";
import { GetCounts, GetCountsEx } from "../counts";
import { ER } from "../types";

export async function getCounts(
    er: EventRegistry,
    uriOrUriList: string | string[],
    args: ER.Counts.Arguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetCounts(uriOrUriList, args));
}

export async function getCountsEx(
    er: EventRegistry,
    uriOrUriList: string | string[],
    args: ER.Counts.Arguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetCountsEx(uriOrUriList, args));
}
