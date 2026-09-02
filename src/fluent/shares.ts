import { EventRegistry } from "../eventRegistry";
import { ER } from "../types";
import { getTopSharedArticles, getTopSharedEvents } from "../helpers/shares";

export class SharesFluent {
    constructor(private readonly er: EventRegistry) {}

    articles(args: ER.DailyShares.Arguments = {}): Promise<ER.Response> {
        return getTopSharedArticles(this.er, args);
    }

    events(args: ER.DailyShares.Arguments = {}): Promise<ER.Response> {
        return getTopSharedEvents(this.er, args);
    }
}
