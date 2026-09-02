import { EventRegistry } from "../eventRegistry";
import { GetTopSharedArticles, GetTopSharedEvents } from "../dailyShares";
import { ER } from "../types";

export async function getTopSharedArticles(
    er: EventRegistry,
    args: ER.DailyShares.Arguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTopSharedArticles(args));
}

export async function getTopSharedEvents(
    er: EventRegistry,
    args: ER.DailyShares.Arguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTopSharedEvents(args));
}
