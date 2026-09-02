import { EventRegistry } from "../eventRegistry";
import { RequestEventsInfo } from "../queryEvents";
import { ReturnInfo } from "../returnInfo";
import { ER } from "../types";
import { Data } from "../data";
import { getEvent, iterateEvents, searchEvents } from "../helpers/events";

export class EventsFluent {
    constructor(private readonly er: EventRegistry) {}

    search(args: Omit<ER.QueryEvents.Arguments, "requestedResult"> = {}): EventsSearchBuilder {
        return new EventsSearchBuilder(this.er, args);
    }

    iterate(args: ER.QueryEvents.IteratorArguments = {}): AsyncIterable<Data.Event> {
        return iterateEvents(this.er, args);
    }

    get(eventUri: string, args: { returnInfo?: ReturnInfo } = {}): Promise<ER.Response> {
        return getEvent(this.er, eventUri, args);
    }
}

class EventsSearchBuilder {
    private infoOpts: ConstructorParameters<typeof RequestEventsInfo>[0] = {};

    constructor(
        private readonly er: EventRegistry,
        private readonly args: Omit<ER.QueryEvents.Arguments, "requestedResult">
    ) {}

    info(opts: ConstructorParameters<typeof RequestEventsInfo>[0] = {}): this {
        this.infoOpts = opts ?? {};
        return this;
    }

    exec(): Promise<ER.Response> {
        return searchEvents(this.er, { ...this.args, ...this.infoOpts });
    }
}
