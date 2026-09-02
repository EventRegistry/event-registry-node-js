import { EventRegistry } from "../eventRegistry";
import { GetRecentArticles, GetRecentEvents } from "../recent";

/**
 * `GetRecentEvents`'s execute path is its own `getUpdates()` method (not `er.execQuery`).
 */
export async function getRecentEvents(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetRecentEvents>[1] = {}
): ReturnType<GetRecentEvents["getUpdates"]> {
    return new GetRecentEvents(er, args).getUpdates();
}

/**
 * `GetRecentArticles`'s execute path is its own `getUpdates()` method (not `er.execQuery`).
 */
export async function getRecentArticles(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetRecentArticles>[1] = {}
): ReturnType<GetRecentArticles["getUpdates"]> {
    return new GetRecentArticles(er, args).getUpdates();
}
