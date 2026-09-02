import { EventRegistry } from "../eventRegistry";
import { GetRecentArticles, GetRecentEvents } from "../recent";
import { getRecentArticles, getRecentEvents } from "../helpers/recent";

export class RecentFluent {
    constructor(private readonly er: EventRegistry) {}

    events(args: ConstructorParameters<typeof GetRecentEvents>[1] = {}): ReturnType<GetRecentEvents["getUpdates"]> {
        return getRecentEvents(this.er, args);
    }

    articles(args: ConstructorParameters<typeof GetRecentArticles>[1] = {}): ReturnType<GetRecentArticles["getUpdates"]> {
        return getRecentArticles(this.er, args);
    }
}
